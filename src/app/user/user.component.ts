import { Component, OnInit } from '@angular/core';
import { UserService } from '../auth/user.service';
import { AuthService } from '../auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirebaseUserModel } from '../entities/user.model';
import { NotificationService } from '../services/notification.service';
import { PostModel } from '../entities/post.model';
import { CommentModel } from '../entities/comment.model';
import { DatabasefireService } from '../services/databasefire.service';
import {Location} from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user',
  templateUrl: 'user.component.html',
  styleUrls: ['user.component.scss']
})
export class UserComponent implements OnInit{

  user: FirebaseUserModel = new FirebaseUserModel();
  profileForm: FormGroup;
  userLikedPosts: PostModel[] = [];
  userPosts: PostModel[] = [];
  userComments: CommentModel[] = [];
  orderCommentsByTimeAsc = false;
  orderPostsByTimeAsc = false;
  authSubscription: Subscription;
  likesSubscription: Subscription;
  postsSubscription: Subscription;
  commentsSubscription: Subscription;
  errorDelete = false;
  errorDeleteMsg: string = '';
  anonymous = 'Anonymous'

  constructor(
    public userService: UserService,
    public authService: AuthService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private notificationService: NotificationService,
    private databasefireService: DatabasefireService,
    private router: Router,
    private location: Location
  ) {

  }

  ngOnInit(): void {
    this.getUserData();
  }

  getUserData() {
    this.authSubscription = this.authService.currentUserObservable.subscribe(user => {
      if (user) {
        this.user = user;
        this.createForm(user.displayName);
        this.getUserLikedPosts();
        this.getUserPosts();
        this.getUserComments();
      } else {
        this.user = null;
      }
    }
  );
  }

  getUserLikedPosts() {
    this.likesSubscription = this.databasefireService.getPostsLikedByUser(this.user.id).subscribe(x => {
      this.userLikedPosts = x as PostModel[];
    })
  }

  getUserPosts() {
    this.postsSubscription = this.databasefireService.getPostsByUser(this.user.id).subscribe(x => {
      this.userPosts = x as PostModel[];
    });
  }

  getUserComments() {
    this.commentsSubscription = this.databasefireService.getCommentsByUser(this.user.id).subscribe(x => {
      this.userComments = x as CommentModel[];
    });
  }

  orderCommentsByDate() {
    if (this.orderCommentsByTimeAsc) { //newest first - filter je samo zato, ker najprej se ni bilo kategorije 'time'
      this.userComments = this.userComments.filter(a => a.time).sort((a, b) => {return b.time.seconds - a.time.seconds});
    } else { //oldest first
      this.userComments = this.userComments.filter(a => a.time).sort((a, b) => {return a.time.seconds - b.time.seconds});
    }
  }

  orderPostsByDate() {
    if (this.orderPostsByTimeAsc) { //newest first - filter je samo zato, ker najprej se ni bilo kategorije 'time'
      this.userPosts = this.userPosts.filter(a => a.time).sort((a, b) => {return b.time.seconds - a.time.seconds});
    } else { //oldest first
      this.userPosts = this.userPosts.filter(a => a.time).sort((a, b) => {return a.time.seconds - b.time.seconds});
    }
  }

  createForm(name) {
    this.profileForm = this.fb.group({
      name: [name, Validators.required ]
    });
  }

  save(value){
    if (value.name === this.user.displayName) { // preveri se, da das unique constraint..
      this.notificationService.showError('Error', 'New Name Must Be Different From The Current One');
      return;
    }

    // Fire Auth
    this.userService.updateCurrentUser(value)
      .then(res => {
        this.user.displayName = value.name || this.anonymous;
        this.notificationService.showSuccess('Success', 'Your Name Is Saved.');

        // Firestore
        this.databasefireService.updateUser(this.user.id, value.name || this.anonymous);
      }, err => {
        // console.log(err);
        this.notificationService.showError('Error', 'Your Name Is Not Saved.');
    })
  }

  selectPost(postId) {
    this.router.navigate(['/home/post', postId]);
  }

  deletePost(post) {
    this.databasefireService.deletePost(post.id).then(res => {
      this.notificationService.showSuccess('Success', 'Your post was deleted.');
    }, err => {
      this.notificationService.showError('Error', err.message);
    })
    this.databasefireService.deleteAllCommentsByPostId(post.id);
  }

  deleteComment(comment) {
    this.databasefireService.deleteComment(comment.id).then(res => {
      this.notificationService.showSuccess('Success', 'Your comment was deleted.');
    }, err => {
      this.notificationService.showError('Error', err.message);
    })
  }

  goBack() {
    this.location.back();
  }

  deleteAccount() {
    // Delete From Firestore
    this.databasefireService.deleteAllCommentsByUserId(this.user.id);
    this.databasefireService.deleteAllPostsByUserId(this.user.id);
    this.databasefireService.deleteUser(this.user.id);

    // Delete from Fire Auth
    this.userService.deleteCurrentUser()
    .then(res => {
      this.user = null;
      this.notificationService.showSuccess('Success', 'Your Account Has Been Deleted. You will be redericted to the home page now.');
      setTimeout(() => { location.reload(); }, 3000);
    }, err => {
      this.errorDelete = true;
      this.errorDeleteMsg = 'Your posts and comments have been deleted, but your account is still active.' + err.message;
      this.notificationService.showError('Error', 'Your Account Has Not Been Deleted.');
    })

  }

  ngOnDestroy(): void {
    this.authSubscription.unsubscribe();
    this.likesSubscription.unsubscribe();
    this.postsSubscription.unsubscribe();
    this.commentsSubscription.unsubscribe();
  }
}

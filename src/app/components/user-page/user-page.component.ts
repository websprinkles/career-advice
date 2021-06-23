import { Component, OnInit } from '@angular/core';
import { UserService } from '../../auth/user.service';
import { AuthService } from '../../auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '../../entities/user';
import { NotificationService } from '../../services/notification.service';
import { Post } from '../../entities/post';
import { Comment } from '../../entities/comment';
import { DatabasefireService } from '../../services/databasefire.service';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-page',
  templateUrl: 'user-page.component.html',
  styleUrls: ['user-page.component.scss'],
})
export class UserPageComponent implements OnInit {
  user: User = new User();
  profileForm: FormGroup;
  userLikedPosts: Post[] = [];
  userPosts: Post[] = [];
  userComments: Comment[] = [];
  orderCommentsByTimeAsc = false;
  orderPostsByTimeAsc = false;
  authSubscription: Subscription;
  likesSubscription: Subscription;
  postsSubscription: Subscription;
  commentsSubscription: Subscription;
  errorDelete = false;
  errorDeleteMsg = '';
  anonymous = 'Anonymous';

  constructor(
    public userService: UserService,
    public authService: AuthService,
    private fb: FormBuilder,
    private notificationService: NotificationService,
    private databasefireService: DatabasefireService,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.getUserData();
  }

  getUserData(): void {
    this.authSubscription = this.authService.currentUserObservable.subscribe(
      (user) => {
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

  getUserLikedPosts(): void {
    this.likesSubscription = this.databasefireService
      .getPostsLikedByUser(this.user.id)
      .subscribe((x) => {
        this.userLikedPosts = x as Post[];
      });
  }

  getUserPosts(): void {
    this.postsSubscription = this.databasefireService
      .getPostsByUser(this.user.id)
      .subscribe((x) => {
        this.userPosts = x as Post[];
      });
  }

  getUserComments(): void {
    this.commentsSubscription = this.databasefireService
      .getCommentsByUser(this.user.id)
      .subscribe((x) => {
        this.userComments = x as Comment[];
      });
  }

  orderCommentsByDate(): void {
    if (this.orderCommentsByTimeAsc) {
      // Newest first - filter je samo zato, ker najprej se ni bilo kategorije 'time'
      this.userComments = this.userComments
        .filter((a) => a.time)
        .sort((a, b) => {
          return b.time.seconds - a.time.seconds;
        });
    } else {
      this.userComments = this.userComments
        .filter((a) => a.time)
        .sort((a, b) => {
          return a.time.seconds - b.time.seconds;
        });
    }
  }

  orderPostsByDate(): void {
    if (this.orderPostsByTimeAsc) {
      // Newest first - filter je samo zato, ker najprej se ni bilo kategorije 'time'
      this.userPosts = this.userPosts
        .filter((a) => a.time)
        .sort((a, b) => {
          return b.time.seconds - a.time.seconds;
        });
    } else {
      this.userPosts = this.userPosts
        .filter((a) => a.time)
        .sort((a, b) => {
          return a.time.seconds - b.time.seconds;
        });
    }
  }

  createForm(name): void {
    this.profileForm = this.fb.group({
      name: [name, Validators.required],
    });
  }

  save(value): void {
    if (value.name === this.user.displayName) {
      this.notificationService.showError(
        'Error',
        'New Name Must Be Different From The Current One'
      );
      return;
    }

    // Fire Auth
    this.userService.updateCurrentUser(value).then(
      (res) => {
        this.user.displayName = value.name || this.anonymous;
        this.notificationService.showSuccess('Success', 'Your Name Is Saved.');

        // Firestore
        this.databasefireService.updateUser(
          this.user.id,
          value.name || this.anonymous
        );
      },
      (err) => {
        this.notificationService.showError('Error', 'Your Name Is Not Saved.');
      }
    );
  }

  selectPost(postId): void {
    this.router.navigate(['/home/post', postId]);
  }

  deletePost(post): void {
    this.databasefireService.deletePost(post.id).then(
      (res) => {
        this.notificationService.showSuccess(
          'Success',
          'Your post was deleted.'
        );
      },
      (err) => {
        this.notificationService.showError('Error', err.message);
      }
    );
    this.databasefireService.deleteAllCommentsByPostId(post.id);
  }

  deleteComment(comment): void {
    this.databasefireService.deleteComment(comment.id).then(
      (res) => {
        this.notificationService.showSuccess(
          'Success',
          'Your comment was deleted.'
        );
      },
      (err) => {
        this.notificationService.showError('Error', err.message);
      }
    );
  }

  goBack(): void {
    this.location.back();
  }

  deleteAccount(): void {
    // Delete From Firestore
    this.databasefireService.deleteAllCommentsByUserId(this.user.id);
    this.databasefireService.deleteAllPostsByUserId(this.user.id);
    this.databasefireService.deleteUser(this.user.id);

    // Delete from Fire Auth
    this.userService.deleteCurrentUser().then(
      (res) => {
        this.user = null;
        this.notificationService.showSuccess(
          'Success',
          'Your Account Has Been Deleted. You will be redericted to the home page now.'
        );
        setTimeout(() => {
          location.reload();
        }, 3000);
      },
      (err) => {
        this.errorDelete = true;
        this.errorDeleteMsg =
          'Your posts and comments have been deleted, but your account is still active.' +
          err.message;
        this.notificationService.showError(
          'Error',
          'Your Account Has Not Been Deleted.'
        );
      }
    );
  }

  ngOnDestroy(): void {
    this.authSubscription.unsubscribe();
    this.likesSubscription.unsubscribe();
    this.postsSubscription.unsubscribe();
    this.commentsSubscription.unsubscribe();
  }
}

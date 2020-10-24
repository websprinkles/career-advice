import { Component, OnInit } from '@angular/core';
import { SelectedService } from '../services/selected.service';
import { PostModel } from '../entities/post.model';
import { ActivatedRoute, Router } from '@angular/router';
import { DatabasefireService } from '../services/databasefire.service';
import { Validators, FormControl, FormGroup } from '@angular/forms';
import { CommentModel } from '../entities/comment.model';
import { AuthService } from '../auth/auth.service';
import { FirebaseUserModel } from '../entities/user.model';
import { NotificationService } from '../services/notification.service';
import { FilterService } from '../services/filter.service';
import { first } from 'rxjs/operators';
import { FilterParams } from '../entities/filterParams';
import { Subscription } from 'rxjs';
import {Location} from '@angular/common';

@Component({
  selector: 'app-post-detail',
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.scss']
})
export class PostDetailComponent implements OnInit {
  post: any;
  postId: any;
  addComment = false;
  viewComments = true;
  inputForm: FormGroup;
  comments: any;
  user: FirebaseUserModel;
  success = '';
  error = '';
  homePageQueryParams: FilterParams;
  filterSubscription: Subscription;
  authSubscription: Subscription;
  postsSubscription: Subscription;
  commentsSubscription: Subscription;

  constructor(
    private selectedService: SelectedService,
    private databasefireService: DatabasefireService,
    private route: ActivatedRoute,
    private router: Router,
    private databaseService: DatabasefireService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private filterService: FilterService,
    private activatedRoute: ActivatedRoute,
    private location: Location
  ) {
    this.postId = this.route.snapshot.params['id'];
  }

  ngOnInit() {
    this.initFormGroup();
    this.postsSubscription = this.databasefireService.getPost(this.postId)
      .subscribe(x => {
        this.post = x;
      }
    );

    this.getComments();
    this.getUserData();
    this.getHomeQueryParams();
  }

  getComments() {
    this.commentsSubscription = this.databasefireService.getCommentsByPostId(this.postId)
    .subscribe(x => {
      if (x) {
        this.comments = x;
      }
    }
   );
  }

  goHome() {
    this.router.navigate(['/home'], { queryParams: this.homePageQueryParams});
  }

  resetForm() {
    this.inputForm.reset();
  }

  initFormGroup() {
    this.inputForm = new FormGroup({
      userId: new FormControl(''),
      postId: new FormControl(''),
      name: new FormControl('Annonymous'), //pridobi iz baze..
      comment: new FormControl('', Validators.required)
    });
  }

  onSubmit() {
    this.setUserAndPostId();
    this.databaseService.addComment(this.inputForm.value).then(() => {
      this.notificationService.showSuccess('ADDED', 'Your comment was added.');
      this.addComment = false;
      this.resetForm();
    })
    .catch((error) => {
      this.notificationService.showSuccess('Your comment was not added.', error.message);
      this.addComment = false;
      this.resetForm();
    });

  }

  setUserAndPostId() {
    if (this.user && this.user.id) {
      this.inputForm.patchValue({
        userId: this.user.id,
      })
      this.inputForm.patchValue({
        name: this.user.displayName || 'Anonymous',
      })
    }
    if (this.post && this.post.id) {
      this.inputForm.patchValue({
        postId: this.post.id,
      })
    }
  }

  getUserData() {
    this.authSubscription = this.authService.currentUserObservable.subscribe(user => {
      if (user) {
        this.user = user;
      } else {
        this.user = null;
      }
    });
  }

  getHomeQueryParams() {
    this.filterSubscription = this.filterService.getLastQueryParams().pipe(
      first()
    ).subscribe(x =>
      this.homePageQueryParams = x
    )
  }

  ngOnDestroy(): void {
    this.postsSubscription.unsubscribe();
    this.authSubscription.unsubscribe();
    this.commentsSubscription.unsubscribe();
    this.filterSubscription.unsubscribe();
  }

}

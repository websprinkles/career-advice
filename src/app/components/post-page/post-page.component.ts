import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatabasefireService } from '../../services/databasefire.service';
import { Validators, FormControl, FormGroup } from '@angular/forms';
import { AuthService } from '../../auth/auth.service';
import { User } from '../../entities/user';
import { NotificationService } from '../../services/notification.service';
import { FilterService } from '../../services/filter.service';
import { first } from 'rxjs/operators';
import { Filters } from '../../entities/filters';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-post-page',
  templateUrl: './post-page.component.html',
  styleUrls: ['./post-page.component.scss'],
})

export class PostPageComponent implements OnInit {
  post: any;
  postId: any;
  addComment = false;
  viewComments = true;
  inputForm: FormGroup;
  comments: any;
  user: User;
  success = '';
  error = '';
  paramsId = 'id';
  homePageQueryParams: Filters;
  filterSubscription: Subscription;
  authSubscription: Subscription;
  postsSubscription: Subscription;
  commentsSubscription: Subscription;

  constructor(
    private databasefireService: DatabasefireService,
    private route: ActivatedRoute,
    private router: Router,
    private databaseService: DatabasefireService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private filterService: FilterService
  ) {
    this.postId = this.route.snapshot.params[this.paramsId];
  }

  ngOnInit(): void {
    this.initFormGroup();
    this.postsSubscription = this.databasefireService
      .getPost(this.postId)
      .subscribe((x) => {
        this.post = x;
      });

    this.getComments();
    this.getUserData();
    this.getHomeQueryParams();
  }

  getComments(): void {
    this.commentsSubscription = this.databasefireService
      .getCommentsByPostId(this.postId)
      .subscribe((x) => {
        if (x) {
          this.comments = x;
        }
      });
  }

  goHome(): void {
    this.router.navigate(['/home'], { queryParams: this.homePageQueryParams });
  }

  resetForm(): void {
    this.inputForm.reset();
  }

  initFormGroup(): void {
    this.inputForm = new FormGroup({
      userId: new FormControl(''),
      postId: new FormControl(''),
      name: new FormControl('Annonymous'),
      comment: new FormControl('', Validators.required),
    });
  }

  submitComment(): void {
    this.setUserAndPostId();
    this.databaseService
      .addComment(this.inputForm.value)
      .then(() => {
        this.notificationService.showSuccess(
          'ADDED',
          'Your comment was added.'
        );
        this.addComment = false;
        this.resetForm();
      })
      .catch((error) => {
        this.notificationService.showError(
          'Your comment was not added.',
          error.message
        );
        this.addComment = false;
        this.resetForm();
      });
  }

  setUserAndPostId(): void {
    if (this.user && this.user.id) {
      this.inputForm.patchValue({
        userId: this.user.id,
      });
      this.inputForm.patchValue({
        name: this.user.displayName || 'Anonymous',
      });
    }
    if (this.post && this.post.id) {
      this.inputForm.patchValue({
        postId: this.post.id,
      });
    }
  }

  getUserData(): void {
    this.authSubscription = this.authService.currentUserObservable.subscribe(
      (user) => {
        if (user) {
          this.user = user;
        } else {
          this.user = null;
        }
      }
    );
  }

  getHomeQueryParams(): void {
    this.filterSubscription = this.filterService
      .getLastQueryParams()
      .pipe(first())
      .subscribe((x) => (this.homePageQueryParams = x));
  }

  ngOnDestroy(): void {
    this.postsSubscription.unsubscribe();
    this.authSubscription.unsubscribe();
    this.commentsSubscription.unsubscribe();
    this.filterSubscription.unsubscribe();
  }
}

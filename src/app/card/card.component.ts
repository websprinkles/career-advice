import { Component, OnInit, Input} from '@angular/core';
import { PostModel } from '../entities/post.model';
import { TimeConverterService } from '../services/timeConverter.service';
import { AuthService } from '../auth/auth.service';
import { FirebaseUserModel } from '../entities/user.model';
import { DatabasefireService } from '../services/databasefire.service';
import { Router } from '@angular/router';
import { NotificationService } from '../services/notification.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {
  @Input() post: any;
  @Input() showBottomWidget: boolean;
  @Input() likesDisabled: boolean;
  isLogged = false;
  user: FirebaseUserModel;
  numberOfLikes = 0;
  likedByUser = false;
  displayReportDialog = false;
  inputForm: FormGroup;
  authSubscription: Subscription;

  constructor(
    private timeService: TimeConverterService,
    private authService: AuthService,
    private databasefireService: DatabasefireService,
    private notificationService: NotificationService
  ) { }

  ngOnInit() {
    this.getUserData();
    this.numberOfLikes = (this.post && this.post.likedBy) ? this.post.likedBy.length : 0;
    this.initFormGroup();
  }

  addLike() {
    if (!this.likesDisabled) { // da ne more unlike dat med svojim zavihkom like...
      if (this.user && !this.likedByUser) {
        this.databasefireService.addLike(this.post.id, this.user.id);
        this.numberOfLikes += 1;
        this.likedByUser = true;
      } else if (this.user && this.likedByUser) {
        this.databasefireService.removeLike(this.post.id, this.user.id);
        this.numberOfLikes -= 1;
        this.likedByUser = false;
      } else {
        this.notificationService.showInfo('Not logged in.', 'You must be login to like a post.');
      }
    }
  }

  getUserData() {
    this.authSubscription = this.authService.currentUserObservable.subscribe(user => {
      if (user) {
        this.isLogged = true;
        this.user = user;
        this.likedByUser = this.numberOfLikes ? this.post.likedBy.includes(this.user.id) : false;
      } else {
        this.user = null;
        this.isLogged = false;
        this.likedByUser = false;
      }
    });
  }

  onSubmit() {
    this.databasefireService.addReport(this.inputForm.value).then(res => {
      this.resetForm();
      this.notificationService.showInfo('Success', 'Report is submitted.');
    }, err => {
      this.resetForm();
      this.notificationService.showInfo('Something went wrong', 'Your report is not submitted. Please try again');
    }
    )
  }

  resetForm() {
    this.inputForm.reset();
  }

  showDialog() {
    if (this.isLogged) {
      this.displayReportDialog = true;
      this.inputForm.patchValue({
        postId: this.post.id,
      });
      this.inputForm.patchValue({
        userId: this.user.id,
      });
    } else {
      this.notificationService.showInfo('Not Logged In', 'You need to be log in to submit a report.');
    }
  }

  initFormGroup() {
    this.inputForm = new FormGroup({
      message: new FormControl('', Validators.required),
      postId: new FormControl('', Validators.required),
      userId: new FormControl('', Validators.required)
    });
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

}

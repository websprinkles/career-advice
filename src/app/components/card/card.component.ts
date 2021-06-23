import { Component, OnInit, Input } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { User } from '../../entities/user';
import { DatabasefireService } from '../../services/databasefire.service';
import { NotificationService } from '../../services/notification.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
})
export class CardComponent implements OnInit {
  @Input() post: any;
  @Input() showBottomWidget: boolean;
  @Input() likesDisabled: boolean;
  isLogged = false;
  user: User;
  numberOfLikes = 0;
  likedByUser = false;
  displayReportDialog = false;
  inputForm: FormGroup;
  authSubscription: Subscription;

  constructor(
    private authService: AuthService,
    private databasefireService: DatabasefireService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.getUserData();
    this.numberOfLikes =
      this.post && this.post.likedBy ? this.post.likedBy.length : 0;
    this.initFormGroup();
  }

  addLike(): void {
    if (!this.likesDisabled) {
      // Prevents from disliking a post in the 'liked posts' section
      if (this.user && !this.likedByUser) {
        this.databasefireService.addLike(this.post.id, this.user.id);
        this.numberOfLikes += 1;
        this.likedByUser = true;
      } else if (this.user && this.likedByUser) {
        this.databasefireService.removeLike(this.post.id, this.user.id);
        this.numberOfLikes -= 1;
        this.likedByUser = false;
      } else {
        this.notificationService.showError(
          'Not logged in.',
          'You must be login to like a post.'
        );
      }
    }
  }

  getUserData(): void {
    this.authSubscription = this.authService.currentUserObservable.subscribe(
      (user) => {
        if (user) {
          this.isLogged = true;
          this.user = user;
          this.likedByUser = this.numberOfLikes
            ? this.post.likedBy.includes(this.user.id)
            : false;
        } else {
          this.user = null;
          this.isLogged = false;
          this.likedByUser = false;
        }
      }
    );
  }

  onSubmit(): void {
    this.databasefireService.addReport(this.inputForm.value).then(
      (res) => {
        this.resetForm();
        this.notificationService.showInfo('Success', 'Report is submitted.');
      },
      (err) => {
        this.resetForm();
        this.notificationService.showError(
          'Something went wrong',
          'Your report is not submitted. Please try again'
        );
      }
    );
  }

  resetForm(): void {
    this.inputForm.reset();
  }

  showDialog(): void {
    if (this.isLogged) {
      this.displayReportDialog = true;
      this.inputForm.patchValue({
        postId: this.post.id,
      });
      this.inputForm.patchValue({
        userId: this.user.id,
      });
    } else {
      this.notificationService.showError(
        'Not Logged In',
        'You need to be log in to submit a report.'
      );
    }
  }

  initFormGroup(): void {
    this.inputForm = new FormGroup({
      message: new FormControl('', Validators.required),
      postId: new FormControl('', Validators.required),
      userId: new FormControl('', Validators.required),
    });
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
}

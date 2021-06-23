import { Component } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from '../../services/notification.service';
import { DatabasefireService } from '../../services/databasefire.service';

@Component({
  selector: 'app-login',
  templateUrl: 'login.component.html',
  styleUrls: ['login.component.scss'],
})
export class LoginComponent {
  loginForm: FormGroup;
  resetPasswordForm: FormGroup;
  errorMessage = '';
  successMessage = '';
  passwordReset = false;
  isNewUser = true;
  isPending = false;

  constructor(
    public authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private notificationService: NotificationService,
    private activatedRoute: ActivatedRoute,
    private databasefireService: DatabasefireService
  ) {
    this.createForm();
  }

  createForm(): void {
    this.loginForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
    });
    this.resetPasswordForm = this.fb.group({
      email: ['', Validators.required],
    });
  }

  tryFacebookLogin(): void {
    this.isPending = true;

    this.authService.doFacebookLogin().then(
      (res) => {
        this.isPending = false;
        const user = res.user;

        if (res.additionalUserInfo.isNewUser) {
          this.addUserToFirestore(user);
        }

        this.router
          .navigate([{ outlets: { modal: null } }], {
            queryParamsHandling: 'merge',
            relativeTo: this.activatedRoute.parent,
          })
          .then(() => {
            this.notificationService.showSuccess(
              'Logged In',
              'You are now logged in.'
            );
          });
        this.errorMessage = '';
      },
      (err) => {
        this.isPending = false;
        this.errorMessage = err.message;
        this.successMessage = '';
      }
    );
  }

  tryGoogleLogin(): void {
    this.isPending = true;

    this.authService.doGoogleLogin().then(
      (res) => {
        this.isPending = false;
        const user = res.user;

        if (res.additionalUserInfo.isNewUser) {
          this.addUserToFirestore(user);
        }

        this.router
          .navigate([{ outlets: { modal: null } }], {
            queryParamsHandling: 'merge',
            relativeTo: this.activatedRoute.parent,
          })
          .then(() => {
            this.notificationService.showSuccess(
              'Logged In',
              'You are now logged in.'
            );
          });

        this.errorMessage = '';
      },
      (err) => {
        this.isPending = false;
        this.errorMessage = err.message;
        this.successMessage = '';
      }
    );
  }

  tryLogin(value): void {
    this.isPending = true;

    this.authService.doLogin(value).then(
      (res) => {
        this.isPending = false;
        this.router
          .navigate([{ outlets: { modal: null } }], {
            queryParamsHandling: 'merge',
            relativeTo: this.activatedRoute.parent,
          })
          .then(() => {
            this.notificationService.showSuccess(
              'Logged In',
              'You are now logged in.'
            );
          });
        this.errorMessage = '';
      },
      (err) => {
        this.isPending = false;
        this.errorMessage = err.message;
        this.successMessage = '';
      }
    );
  }

  tryResendPassword(value): void {
    this.isPending = true;
    this.authService.sendPasswordResetEmail(value).then(
      (res) => {
        this.isPending = false;
        this.successMessage = 'Password was resend. Please check your e-mail.';
        this.errorMessage = '';
      },
      (err) => {
        this.successMessage = '';
        this.isPending = false;
        this.errorMessage = err.message;
      }
    );
  }

  navigateOut(): void {
    this.router.navigate([{ outlets: { modal: null } }], {
      queryParamsHandling: 'merge',
      relativeTo: this.activatedRoute.parent,
    });
  }

  addUserToFirestore(user): void {
    this.databasefireService.addUser({
      id: user.uid,
      displayName: user.displayName || 'Anonymous',
      email: user.email,
      provider: user.providerData[0].providerId,
    });
  }
}

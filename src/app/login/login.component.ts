import { Component } from '@angular/core';
import { AuthService } from '../auth/auth.service'
import { Router, Params, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from '../services/notification.service';
import { DatabasefireService } from '../services/databasefire.service';

@Component({
  selector: 'app-login',
  templateUrl: 'login.component.html',
  styleUrls: ['login.component.scss']
})
export class LoginComponent {

  loginForm: FormGroup;
  resetPasswordForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  passwordReset = false;
  isNewUser = true;

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

  createForm() {
    this.loginForm = this.fb.group({
      email: ['', Validators.required],
      password: ['',Validators.required]
    });
    this.resetPasswordForm = this.fb.group({
      email: ['', Validators.required]
    });
  }

  tryFacebookLogin(){
    this.authService.doFacebookLogin()
    .then(res => {
      let user = res.user;
      if (res.additionalUserInfo.isNewUser) {
        this.addUserToFirestore(user);
      }

      this.router.navigate([{outlets: {modal: null}}], { queryParamsHandling: 'merge', relativeTo: this.activatedRoute.parent}).then(()=>{
        this.notificationService.showSuccess('Logged In', 'You are now logged in.');
      });
    })
  }

  tryGoogleLogin(){
    this.authService.doGoogleLogin()
    .then(res => {
      let user = res.user;
      if (res.additionalUserInfo.isNewUser) {
        this.addUserToFirestore(user);
      }

      this.router.navigate([{outlets: {modal: null}}], { queryParamsHandling: 'merge', relativeTo: this.activatedRoute.parent}).then(()=>{
        this.notificationService.showSuccess('Logged In', 'You are now logged in.');
      });
    })
  }

  tryLogin(value){
    this.authService.doLogin(value)
    .then(res => {
      this.router.navigate([{outlets: {modal: null}}], { queryParamsHandling: 'merge', relativeTo: this.activatedRoute.parent}).then(()=>{
        this.notificationService.showSuccess('Logged In', 'You are now logged in.');
      });
    }, err => {
      // console.log(err);
      this.errorMessage = err.message;
    })
  }

  tryResendPassword(value){
    this.authService.sendPasswordResetEmail(value)
    .then(res => {
      this.successMessage = 'Password was resend. Please check your e-mail.'
    }, err => {
      // console.log(err);
      this.errorMessage = err.message;
    })
  }

  navigateOut() {
    this.router.navigate([{outlets: {modal: null}}], { queryParamsHandling: 'merge', relativeTo: this.activatedRoute.parent});
  }

  addUserToFirestore(user) {
    this.databasefireService.addUser({
      id: user.uid,
      displayName: user.displayName || 'Anonymous',
      email: user.email,
      provider: user.providerData[0].providerId
      //emailVerified: false //ali to res rabimo.. to lahko samo na back-endu preveris morda pri auth rules? preveri se kako je z gesli..
   });
  }

}

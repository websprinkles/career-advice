import { Component } from '@angular/core';
import { AuthService } from '../auth/auth.service'
import { Router, Params, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatabasefireService } from '../services/databasefire.service';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {

  registerForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  consentChecked = false;
  isPending = false;

  constructor(
    public authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private databasefireService: DatabasefireService,
    private activatedRoute: ActivatedRoute,
    private notificationService: NotificationService
  ) {
    this.createForm();
   }

   createForm() {
     this.registerForm = this.fb.group({
       email: ['', Validators.required ],
       password: ['',Validators.required]
     });
   }

   tryFacebookLogin(){
    this.isPending = true;
    this.authService.doFacebookLogin()
    .then(res => {

      this.isPending = false;
      let user = res.user;
      this.errorMessage = '';

      if (res.additionalUserInfo.isNewUser) {
        this.addUserToFirestore(user);
      }

      this.router.navigate([{outlets: {modal: null}}], { queryParamsHandling: 'merge', relativeTo: this.activatedRoute.parent}).then(()=>{
        this.notificationService.showSuccess('Logged In', 'You are now logged in.');
      });

    }, err => {

      this.isPending = false;
      this.errorMessage = err.message;
      this.successMessage = '';

    })
  }

  tryGoogleLogin(){
    this.isPending = true;
      this.authService.doGoogleLogin()
      .then(res => {

        this.isPending = false;
        let user = res.user;
        this.errorMessage = '';

        if (res.additionalUserInfo.isNewUser) {
          this.addUserToFirestore(user);
        }

        this.router.navigate([{outlets: {modal: null}}], { queryParamsHandling: 'merge', relativeTo: this.activatedRoute.parent}).then(()=>{
          this.notificationService.showSuccess('Logged In', 'You are now logged in.');
        });
      }, err => {

        this.isPending = false;
        this.errorMessage = err.message;
        this.successMessage = '';

      })
  }

   tryRegister(value){
      this.isPending = true;
      this.authService.doRegister(value)
      .then(res => {

        this.isPending = false;
        this.errorMessage = "";
        this.successMessage = "Your account has been created.";
        this.trySendEmailVerification();

        let user = res.user;
        this.addUserToFirestore(user);
      }, err => {
        this.isPending = false;
        this.errorMessage = err.message;
        this.successMessage = "";
      })
   }

   trySendEmailVerification() {
    this.isPending = true;
     this.authService.sendVerificationMail()
     .then(res => {

      this.isPending = false;
      this.errorMessage = "";
      this.successMessage = "Check your e-mail to verificate your account before logging in.";

    }, err => {

      this.isPending = false;
      this.errorMessage = err.message;
      this.successMessage = "";

    })
   }

  goHome() {
    this.router.navigateByUrl('/home');
  }

  addUserToFirestore(user) {
    this.databasefireService.addUser({
      id: user.uid,
      displayName: user.displayName || 'Anonymous',
      email: user.email,
      provider: user.providerData[0].providerId,
   });
  }

}

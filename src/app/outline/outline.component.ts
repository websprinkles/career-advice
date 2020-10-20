import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Location } from '@angular/common';
import { UserService } from '../auth/user.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { NotificationService } from '../services/notification.service';
import { filter} from 'rxjs/operators';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DatabasefireService } from '../services/databasefire.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-outline',
  templateUrl: './outline.component.html',
  styleUrls: ['./outline.component.scss']
})
export class OutlineComponent implements OnInit {

  isLogged = false;
  isRendered = false;
  user: any = null;
  isHomePage = true;
  posts:any;
  displayDialog = false;
  displayDialog2 = false;
  inputForm: FormGroup;
  displayTermsBanner = true;
  consentEnabled = false;
  authSubscription: Subscription;
  routerSubscription: Subscription;

  constructor(
    private authService: AuthService,
    public afAuth: AngularFireAuth,
    private router: Router,
    private notificationService: NotificationService,
    public activatedRoute: ActivatedRoute,
    private databasefireService: DatabasefireService
  ) {
    this.getCurrentUrl();
  }

  ngOnInit() {
    console.log('ng on init outline');
    this.getUserData();
    this.initFormGroup();
    this.checkIfConsentEnabled();
  }

  getCurrentUrl() {
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.isHomePage = !event.url.includes('user') && !event.url.includes('post') && !event.url.includes('legal');
    });
  }

  getUserData() {
    this.authSubscription = this.authService.currentUserObservable.subscribe(user => {
      if (user) {
        this.isLogged = true;
        this.user = user;
      } else {
        this.user = null;
        this.isLogged = false;
      }
    });
  }

  goToUserPage() {
    this.router.navigateByUrl('/home/user');
  }

  goToHomePage() {
    this.router.navigateByUrl('/home?category=0');
  }

  saveConsent() {
    let now = new Date();
    localStorage.setItem('consentEnabled', JSON.stringify(true));
    localStorage.setItem('consentEnabledOn', JSON.stringify(now));
    this.consentEnabled = true;
  }

  checkIfConsentEnabled() {
    let consentEnabled = JSON.parse(localStorage.getItem('consentEnabled'));
    let dateOfConsent = JSON.parse(localStorage.getItem('consentEnabledOn'))

    if (consentEnabled === true && dateOfConsent) {
      let then = new Date(dateOfConsent).valueOf();
      let now = new Date().valueOf();
      const diffTime = Math.abs(now - then) + 1;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 350) {
        localStorage.setItem('consentEnabled', JSON.stringify(true));
        this.consentEnabled = false;
      } else {
        this.consentEnabled = true;
      }
    } else {
      this.consentEnabled = false;
    }
  }

  logout(){
    this.authService.doLogout()
    .then((res) => {
      if (!this.router.url.includes('user')) {
        this.router.navigate([{outlets: {modal: null}}], {queryParamsHandling: 'merge', relativeTo: this.activatedRoute}).then(()=>{
          this.notificationService.showSuccess('Logged Out', 'You are now logged out.');
        });
      } else {
        this.router.navigate(['home']).then(()=>{
          this.notificationService.showSuccess('Logged Out', 'You are now logged out.');
        });
      }
      this.user = null;
      this.isLogged = false;
    }, (error) => {
      this.notificationService.showError('Logging Out was not successful', error.message);
    });
  }

  login() {
   this.router.navigate([{outlets: {modal: 'login'}}], {queryParamsHandling: 'merge', relativeTo: this.activatedRoute});
  }

  onSubmit() {
    if (this.user && this.user.id) {
      this.inputForm.patchValue({
        userId: this.user.id,
      });
    }

    this.databasefireService.addContactMail(this.inputForm.value).then(res => {
      this.resetForm();
      this.notificationService.showInfo('Success', 'Message was submitted.');
    }, (error) => {
      this.resetForm();
      this.notificationService.showError('Something went wrong.', error.message);
    });
  }

  resetForm() {
    this.inputForm.reset();
  }

  showDialog() {
    if (this.isLogged) {
      this.displayDialog = true;
    } else {
      this.displayDialog2 = true;
      //this.notificationService.showInfo('Not Logged In', 'You need to be log in to submit a message.');
    }
  }

  initFormGroup() {
    this.inputForm = new FormGroup({
      message: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      userId: new FormControl('')
    });
  }

  get email() { return this.inputForm.get('email'); }
  get message() { return this.inputForm.get('message'); }

  ngOnDestroy(): void {
    this.authSubscription.unsubscribe();
    this.routerSubscription.unsubscribe();
  }

}

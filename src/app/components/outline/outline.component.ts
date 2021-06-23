import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { NotificationService } from '../../services/notification.service';
import { filter } from 'rxjs/operators';
import {
  FormGroup,
  FormControl,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { DatabasefireService } from '../../services/databasefire.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-outline',
  templateUrl: './outline.component.html',
  styleUrls: ['./outline.component.scss'],
})
export class OutlineComponent implements OnInit {
  isLogged = false;
  isRendered = false;
  user: any = null;
  isHomePage = true;
  posts: any;
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

  ngOnInit(): void {
    this.getUserData();
    this.initFormGroup();
    this.checkIfConsentEnabled();
  }

  get email(): AbstractControl {
    return this.inputForm.get('email');
  }

  get message(): AbstractControl {
    return this.inputForm.get('message');
  }

  getCurrentUrl(): void {
    this.routerSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.isHomePage =
          !event.url.includes('user') &&
          !event.url.includes('post') &&
          !event.url.includes('legal');
      });
  }

  getUserData(): void {
    this.authSubscription = this.authService.currentUserObservable.subscribe(
      (user) => {
        if (user) {
          this.isLogged = true;
          this.user = user;
        } else {
          this.user = null;
          this.isLogged = false;
        }
      }
    );
  }

  goToUserPage(): void {
    if (this.isLogged && this.user) {
      this.router.navigateByUrl('/home/user');
    } else {
      this.login();
    }
  }

  goToHomePage(): void {
    this.router.navigateByUrl('/home?category=0');
  }

  saveConsent(): void {
    const now = new Date();
    localStorage.setItem('consentEnabled', JSON.stringify(true));
    localStorage.setItem('consentEnabledOn', JSON.stringify(now));
    this.consentEnabled = true;
  }

  checkIfConsentEnabled(): void {
    const consentEnabled = JSON.parse(localStorage.getItem('consentEnabled'));
    const dateOfConsent = JSON.parse(localStorage.getItem('consentEnabledOn'));

    if (consentEnabled === true && dateOfConsent) {
      const then = new Date(dateOfConsent).valueOf();
      const now = new Date().valueOf();
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

  logout(): void {
    this.authService.doLogout().then(
      (res) => {
        if (!this.router.url.includes('user')) {
          this.router
            .navigate([{ outlets: { modal: null } }], {
              queryParamsHandling: 'merge',
              relativeTo: this.activatedRoute,
            })
            .then(() => {
              this.notificationService.showSuccess(
                'Logged Out',
                'You are now logged out.'
              );
            });
        } else {
          this.router.navigate(['home']).then(() => {
            this.notificationService.showSuccess(
              'Logged Out',
              'You are now logged out.'
            );
          });
        }
        this.user = null;
        this.isLogged = false;
      },
      (error) => {
        this.notificationService.showError(
          'Logging Out was not successful',
          error.message
        );
      }
    );
  }

  login(): void {
    this.router.navigate([{ outlets: { modal: 'login' } }], {
      queryParamsHandling: 'merge',
      relativeTo: this.activatedRoute,
    });
  }

  sendContactMail(): void {
    if (this.user && this.user.id) {
      this.inputForm.patchValue({
        userId: this.user.id,
      });
    }

    this.databasefireService.addContactMail(this.inputForm.value).then(
      (res) => {
        this.resetForm();
        this.notificationService.showInfo('Success', 'Message was submitted.');
      },
      (error) => {
        this.resetForm();
        this.notificationService.showError(
          'Something went wrong.',
          error.message
        );
      }
    );
  }

  resetForm(): void {
    this.inputForm.reset();
  }

  showDialog(): void {
    if (this.isLogged) {
      this.displayDialog = true;
    } else {
      this.displayDialog2 = true;
    }
  }

  initFormGroup(): void {
    this.inputForm = new FormGroup({
      message: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      userId: new FormControl(''),
    });
  }

  ngOnDestroy(): void {
    this.authSubscription.unsubscribe();
    this.routerSubscription.unsubscribe();
  }
}

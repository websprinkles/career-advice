import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators
} from '@angular/forms';
import { DatabasefireService } from '../services/databasefire.service';
import { AuthService } from '../auth/auth.service';
import { FirebaseUserModel } from '../entities/user.model';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { GenerationsTo, GenerationsFrom, Categories } from '../entities/filterConstants';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-post-form',
  templateUrl: './post-form.component.html',
  styleUrls: ['./post-form.component.scss']
})
export class PostFormComponent implements OnInit {

  isLogged = false;
  user: FirebaseUserModel;
  displayDialog: boolean;
  inputForm: FormGroup;
  generationsTo = GenerationsTo;
  generationsFrom = GenerationsFrom;
  selectedGenerationTo = 1980;
  selectedGenerationFrom = 'Unknown';

  categories = Categories;
  selectedCategory = 'Unknown';
  authSubscription: Subscription;

  constructor(
    private databaseService: DatabasefireService,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.initFormGroup();
    this.getUserData();
  }

  get name() { return this.inputForm.get('name'); }
  get message() { return this.inputForm.get('message'); }

  onSubmit() {
    this.databaseService.addPost(this.inputForm.value).then(res => {
      this.resetForm();
      this.notificationService.showInfo('Success.', 'Your post is submitted.');
    }, err => {
      this.notificationService.showInfo('Something went wrong.', err.message);
      this.resetForm();
    }
    )
  }

  resetForm() {
    this.inputForm.reset({userId: 'null', name: 'Anonymous', fromGeneration: 'Unknown', toGeneration: 1980, message: '', category: 'Unknown'});
  }

  showDialog() {
    if (this.isLogged) {
      this.displayDialog = true;
      this.setFromUserProfile();
    } else {
      this.router.navigate(['/home', {outlets: {modal: ['login']}}], {queryParamsHandling: 'merge'});
    }
  }

  initFormGroup() {
    this.inputForm = new FormGroup({
      userId: new FormControl('null', Validators.required),
      name: new FormControl('Anonymous', Validators.required),
      fromGeneration: new FormControl('Unknown'),
      toGeneration: new FormControl(1980, Validators.required),
      message: new FormControl('', Validators.required),
      category: new FormControl('Unknown')
    });
  }

  getUserData() {
    this.authSubscription = this.authService.currentUserObservable.subscribe(user => {
      if (user) {
        this.isLogged = true;
        this.user = user;
        // console.log(this.user);
      } else {
        this.user = null;
        this.isLogged = false;
      }
    });
  }

  setFromUserProfile() {
    if (this.inputForm && this.user) {
      if (this.user.id) {
        this.inputForm.patchValue({
          userId: this.user.id,
        });
      }
      if (this.user.displayName) {
        this.inputForm.patchValue({
          name: this.user.displayName || 'Anonymous',
        });
      }
    }
  }

  ngOnDestroy(): void {
    this.authSubscription.unsubscribe();
  }

}
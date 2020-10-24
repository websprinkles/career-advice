import { Component, OnInit, Input } from '@angular/core';
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
import { NotificationService } from '../services/notification.service';
import { Categories } from '../entities/filterConstants';
import { FilterService } from '../services/filter.service';

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

  selectedCategory = -1;
  selectedSubcategory = -1;
  categories = Categories;
  subcategories = Categories.find(x => x.value === this.selectedCategory)?.children;
  authSubscription: Subscription;

  constructor(
    private databaseService: DatabasefireService,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService,
    private filterService: FilterService
  ) { }

  ngOnInit(): void {
    this.initFormGroup();
    this.getUserData();
  }

  get name() { return this.inputForm.get('name'); }
  get message() { return this.inputForm.get('message'); }
  get category() { return this.inputForm.get('category'); }
  get subcategory() { return this.inputForm.get('subcategory'); }
  get jobTitle() { return this.inputForm.get('jobTitle'); }

  onSubmit() {
    this.databaseService.addPost(this.inputForm.value).then(res => {

      let newPost = {
        id: '0',
        userId: '0',
        name: this.inputForm.value.name,
        jobTitle: this.inputForm.value.jobTitle,
        message: this.inputForm.value.message,
        category: this.inputForm.value.category,
        subcategory: this.inputForm.value.subcategory
      }
      this.filterService.changeNewPost(newPost);

      this.resetForm();
      this.displayDialog = false;
      this.notificationService.showInfo('Success.', 'Your post is submitted.');

    }, err => {

      this.notificationService.showInfo('Something went wrong.', err.message);

    });
  }

  resetForm() {
    this.inputForm.reset({userId: 'null', name: 'Anonymous', jobTitle: '', message: '', category: -1, subcategory: -1});
  }

  setSubcategories(category) {
    this.subcategories = Categories.find(x => x.value === category)?.children;
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
      jobTitle: new FormControl('', Validators.required),
      message: new FormControl('', Validators.required),
      category: new FormControl(-1, Validators.required),
      subcategory: new FormControl(-1, Validators.required)
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

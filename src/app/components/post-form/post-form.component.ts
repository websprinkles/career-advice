import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  AbstractControl
} from '@angular/forms';
import { DatabasefireService } from '../../services/databasefire.service';
import { AuthService } from '../../auth/auth.service';
import { User } from '../../entities/user';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../services/notification.service';
import { Categories } from '../../../assets/data/filterCategories';
import { FilterService } from '../../services/filter.service';

@Component({
  selector: 'app-post-form',
  templateUrl: './post-form.component.html',
  styleUrls: ['./post-form.component.scss']
})
export class PostFormComponent implements OnInit {

  isLogged = false;
  user: User;
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
    private filterService: FilterService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.initFormGroup();
    this.getUserData();
  }

  get name(): AbstractControl { return this.inputForm.get('name'); }
  get message(): AbstractControl { return this.inputForm.get('message'); }
  get category(): AbstractControl { return this.inputForm.get('category'); }
  get subcategory(): AbstractControl { return this.inputForm.get('subcategory'); }
  get jobTitle(): AbstractControl { return this.inputForm.get('jobTitle'); }

  onSubmit(): void {
    this.databaseService.addPost(this.inputForm.value).then(res => {

      this.filterService.addNewPost(true);
      this.resetForm();
      this.displayDialog = false;
      this.notificationService.showInfo('Success.', 'Your post is submitted.');

    }, err => {

      this.notificationService.showError('Something went wrong.', err.message);

    });
  }

  resetForm(): void {
    this.inputForm.reset({userId: 'null', name: 'Anonymous', jobTitle: '', message: '', category: -1, subcategory: -1});
  }

  setSubcategories(category): void {
    this.subcategories = Categories.find(x => x.value === category)?.children;
  }

  showDialog(): void {
    this.getQueryParamsAndSetValue();

    if (this.isLogged) {
      this.displayDialog = true;
      this.setFromUserProfile();
    } else {
      this.router.navigate(['/home', {outlets: {modal: ['login']}}], {queryParamsHandling: 'merge'});
    }
  }

  initFormGroup(): void {
    this.inputForm = new FormGroup({
      userId: new FormControl('null', Validators.required),
      name: new FormControl('Anonymous', Validators.required),
      jobTitle: new FormControl('', Validators.required),
      message: new FormControl('', Validators.required),
      category: new FormControl(-1, Validators.required),
      subcategory: new FormControl(-1, Validators.required)
    });
  }

  getUserData(): void {
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

  getQueryParamsAndSetValue(): void {
    if (this.route.snapshot.queryParams.category) {
      this.inputForm.patchValue({
        category: Number(this.route.snapshot.queryParams.category),
      });

      this.setSubcategories(Number(this.route.snapshot.queryParams.category));

      if (this.route.snapshot.queryParams.subcategory) {
        this.inputForm.patchValue({
          subcategory: Number(this.route.snapshot.queryParams.subcategory),
        });
      }
    }
  }

  setFromUserProfile(): void {
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

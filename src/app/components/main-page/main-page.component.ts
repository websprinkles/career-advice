import { Component, OnInit } from '@angular/core';
import { FilterService } from '../../services/filter.service';
import { DatabasefireService } from '../../services/databasefire.service';
import { Post } from '../../entities/post';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { Filters } from '../../entities/filters';
import { Categories } from '../../../assets/data/filterCategories';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent implements OnInit {
  selectedCategory = 0;
  selectedSubcategory = -1;

  categories = Categories;
  subcategories = Categories.find((x) => x.value === this.selectedCategory)
    .children;

  selectedJobTitle: string;
  filteredJobTitles: string[];

  displayModal = false;
  filled = false;
  posts: Post[];
  posts$: Observable<Post[]>;
  backupPosts: any;
  orderByTime = true;
  orderByLikesBool = false;
  transformedPosts: any;
  params: Filters;
  queryParamsSubscription: Subscription;
  postsSubscription: Subscription;
  newPostSubscription: Subscription;
  counter = 0;

  constructor(
    private filterService: FilterService,
    private databaseService: DatabasefireService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getPostsByFilter();
    this.listenForNewPost();
  }

  getPostsByFilter(): void {
    this.queryParamsSubscription = this.route.queryParams.subscribe(
      (params) => {
        if (params.newPost) {
          // Otherwise, counter is set to 0 at refreshing
          this.counter = Number(params.newPost) + 1;
        }

        if (
          params.category &&
          this.selectedCategory !== Number(params.category)
        ) {
          this.subcategories = Categories.find(
            (x) => x.value === Number(params.category)
          ).children;
          this.selectedSubcategory = null;
          this.selectedJobTitle = null;
        }

        this.selectedCategory = Number(params.category);
        this.selectedSubcategory = Number(params.subcategory);
        this.selectedJobTitle = params.jobTitle;

        this.params = {
          category: params.category,
          subcategory: params.subcategory,
          jobTitle: params.jobTitle,
        };

        this.postsSubscription = this.databaseService
          .getPosts()
          .pipe(first())
          .subscribe((x) => {
            if (x) {
              if (params.jobTitle) {
                this.posts = this.filterByTitle(params.jobTitle, x as Post[]);
              } else if (params.category && params.subcategory) {
                this.posts = (x as Post[]).filter(
                  (post) =>
                    post.category === Number(params.category) &&
                    post.subcategory === Number(params.subcategory)
                );
              } else if (params.category) {
                this.posts = (x as Post[]).filter(
                  (post) => post.category === Number(params.category)
                );
              } else {
                this.posts = x as Post[];
              }
            }
          });
      }
    );
  }

  listenForNewPost(): void {
    this.newPostSubscription = this.filterService
      .getNewPost()
      .subscribe((x) => {
        if (x) {
          this.newPostAdded();
        }
      });
  }

  navigate(event): void {
    this.router.navigate(['/home'], { queryParams: { jobTitle: '' } });
  }

  filterByTitle(query, posts): Post[] {
    const filtered: any[] = [];
    const jobTitles: string[] = [];

    for (let i = 0; i < posts?.length; i++) {
      const post = posts[i];
      if (post.jobTitle.toLowerCase().indexOf(query.toLowerCase()) !== -1) {
        filtered.push(post);
        if (!jobTitles.includes(post.jobTitle.toLowerCase())) {
          jobTitles.push(post.jobTitle.toLowerCase());
        }
      }
    }

    this.filteredJobTitles = jobTitles;
    return filtered;
  }

  selectCategory(options, category): void {
    const jobTitleExists = !!(
      this.selectedJobTitle || this.selectedJobTitle === ''
    );
    this.router.navigate(['/home'], {
      queryParams: { category: category.value, subcategory: null },
      queryParamsHandling: jobTitleExists ? null : 'merge',
    });
  }

  selectSubcategory(subcategory): void {
    const jobTitleExists = !!(
      this.selectedJobTitle || this.selectedJobTitle === ''
    );

    this.router.navigate(['/home'], {
      queryParams: { subcategory: subcategory.value },
      queryParamsHandling: jobTitleExists ? null : 'merge',
    });
  }

  filterJobTitle(event): void {
    const params = event.query || event.jobTitle || event;
    this.router.navigate(['/home'], { queryParams: { jobTitle: params } });
  }

  newPostAdded(): void {
    this.counter += 1;
    this.router.navigate(['/home'], {
      queryParams: { newPost: this.counter },
      queryParamsHandling: 'merge',
    });
  }

  selectPost(post): void {
    this.filterService.setLastQueryParams(this.params);
    this.router.navigate(['/home/post', post.id]);
  }

  ngOnDestroy(): void {
    this.queryParamsSubscription.unsubscribe();
    this.postsSubscription.unsubscribe();
    if (this.newPostSubscription) {
      this.newPostSubscription.unsubscribe();
    }
  }
}

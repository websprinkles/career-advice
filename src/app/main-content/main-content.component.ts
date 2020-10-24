import { Component, OnInit } from '@angular/core';
import { FilterService } from '../services/filter.service';
import { DatabasefireService } from '../services/databasefire.service';
import { PostModel } from '../entities/post.model';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { FilterParams } from '../entities/filterParams';
import { Categories } from '../entities/filterConstants';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-main-content',
  templateUrl: './main-content.component.html',
  styleUrls: ['./main-content.component.scss']
})
export class MainContentComponent implements OnInit {

  selectedCategory = 0;
  selectedSubcategory = -1;

  categories = Categories;
  subcategories = Categories.find(x => x.value === this.selectedCategory).children;

  selectedJobTitle: string;
  filteredJobTitles: string[];

  displayModal = false;
  filled = false;
  posts: PostModel[];
  posts$: Observable<PostModel[]>;
  backupPosts: any;
  orderByTime = true;
  orderByLikesBool = false;
  transformedPosts: any;
  params: FilterParams;
  queryParamsSubscription: Subscription;
  postsSubscription: Subscription;

  constructor(
    private filterService: FilterService,
    private databaseService: DatabasefireService,
    private route: ActivatedRoute,
    private router: Router) {
  }

  ngOnInit() {
    this.getPostsByFilter();
    this.listenForNewPost();
  }

  getPostsByFilter() {
    this.queryParamsSubscription = this.route.queryParams
      .subscribe(params => {

       if (params.category && this.selectedCategory !== Number(params.category)) {
          this.subcategories = Categories.find(x => x.value === Number(params.category)).children;
          this.selectedSubcategory = null;
          this.selectedJobTitle = null;
       }

       this.selectedCategory = Number(params.category);
       this.selectedSubcategory = Number(params.subcategory);
       this.selectedJobTitle = params.jobTitle;

        this.params = {category: params.category, subcategory: params.subcategory, jobTitle: params.jobTitle};

        this.postsSubscription = this.databaseService.getPosts()
          .pipe(first())
          .subscribe(x => {
            if (x) {
              if (params.jobTitle) {
                this.posts = this.filterByTitle(params.jobTitle, x as PostModel[]);
              } else if (params.category && params.subcategory) {
                this.posts = (x as PostModel[]).filter(x => x.category === Number(params.category) && x.subcategory === Number(params.subcategory));
              } else if (params.category) {
                this.posts = (x as PostModel[]).filter(x => x.category === Number(params.category));
              } else {
                this.posts = x as PostModel[];
              }
            }
        });
      }
    );
  }

  listenForNewPost() {
    this.filterService.getNewPost().subscribe(x => {
        if (x) {
          if (this.selectedCategory === x.category ||
              x.jobTitle.toLowerCase().indexOf(this.selectedJobTitle?.toLowerCase()) !== -1 ||
              this.router.url === '/home') {

            this.posts?.unshift(x as PostModel);

          }
        }
      }
    )
  }


  navigate(event) {
    this.router.navigate(['/home'], { queryParams: { jobTitle: '' }});
  }


  filterByTitle(query, posts) {

    let filtered: any[] = [];
    let jobTitles: string[] = [];

    for(let i = 0; i < posts?.length; i++) {
        let post = posts[i];
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

  selectCategory(options, category) {
    let jobTitleExists = !!(this.selectedJobTitle || this.selectedJobTitle === '');
    this.router.navigate(['/home'], { queryParams: { category: category.value, subcategory: null }, queryParamsHandling: jobTitleExists? null : 'merge' });
  }

  selectSubcategory(subcategory) {
    let jobTitleExists = !!(this.selectedJobTitle || this.selectedJobTitle === '');

    this.router.navigate(['/home'], { queryParams: { subcategory: subcategory.value }, queryParamsHandling: jobTitleExists ? null : 'merge' });
  }

  filterJobTitle(event) {
    let params = event.query || event.jobTitle || event;
    this.router.navigate(['/home'], { queryParams: { jobTitle: params }});
  }

  selectPost(post) {
    this.filterService.setLastQueryParams(this.params);
    this.router.navigate(['/home/post', post.id]);
  }

  ngOnDestroy(): void {
    this.queryParamsSubscription.unsubscribe();
    this.postsSubscription.unsubscribe();
  }

}

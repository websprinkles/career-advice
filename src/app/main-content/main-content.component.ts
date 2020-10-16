import { Component, OnInit } from '@angular/core';
import { FilterService } from '../services/filter.service';
import { DatabasefireService } from '../services/databasefire.service';
import { PostModel } from '../entities/post.model';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { FilterParams } from '../entities/filterParams';
import { Categories } from '../entities/filterConstants';

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

/*         this.postsSubscription = this.databaseService.getPostsByFilter(params.category, params.subcategory, params.jobTitle)
          .subscribe(x => {
            if (x) {
              this.posts = (x as PostModel[]).filter(x => x.jobTitle === params.jobTitle);
            //  this.orderByDate();
            }
        }); */
        this.postsSubscription = this.databaseService.getPosts()
          .subscribe(x => {
            if (x) {
              if (params.jobTitle) {
               // this.posts = (x as PostModel[]).filter(x => x.jobTitle === params.jobTitle);
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

/*   orderByDate() {
    if (this.orderByTime) {
      this.posts = this.posts.filter(a => a.time).sort((a, b) => {return b.time.seconds - a.time.seconds});
    } else {
     this.posts = this.posts.filter(a => a.likedBy).sort((a, b) => {return b.likedBy.length - a.likedBy.length});
    }
  } */

  navigate(event) {
    console.log(event);
    if (this.posts?.length === 0 && !event.query) {
      console.log('navigating');
     this.router.navigate(['/home'], { queryParams: { category: 0, subcategory: null}});
     //this.router.navigate(['/home'], { queryParams: { jobTitle: '' }});
    }
  }


  filterByTitle(query, posts) {
    //in a real application, make a request to a remote url with the query and return filtered results, for demo we filter at client side
    let filtered : any[] = [];
   // let query = event.query;
    for(let i = 0; i < posts?.length; i++) {
        let post = posts[i];
        if (post.jobTitle.toLowerCase().indexOf(query.toLowerCase()) == 0) {
            filtered.push(post);
        }
    }
    this.filteredJobTitles = filtered;

    return filtered;
  }

  selectCategory(options, category) {
    //console.log(options[0]?.value);
    console.log(this.selectedJobTitle);
    let jobTitleExists = !!(this.selectedJobTitle || this.selectedJobTitle === '');
    this.router.navigate(['/home'], { queryParams: { category: category.value, subcategory: null }, queryParamsHandling: jobTitleExists? null : 'merge' });
  }

  selectSubcategory(subcategory) {
    console.log(this.selectedCategory)
    let jobTitleExists = !!(this.selectedJobTitle || this.selectedJobTitle === '');
    //if (this.selectedCategory || this.selectedCategory === 0) {
      this.router.navigate(['/home'], { queryParams: { subcategory: subcategory.value }, queryParamsHandling: jobTitleExists ? null : 'merge' });
    //}
  }

  filterJobTitle(event) {
    //console.log(event.query);
    console.log(event);
    this.router.navigate(['/home'], { queryParams: { jobTitle: event.query || event.jobTitle }});
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

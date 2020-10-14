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

  selectedCategory = ['Architecture and Engineering']; //mat list sprejema select v array-u..
  selectedSubcategory = 'bla';

  categories = Categories;
  subcategories = Categories.find(x => x.value === this.selectedCategory[0]).children;

  displayModal = false;
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

       if (params.category && this.selectedCategory !== params.category) {
          this.subcategories = Categories.find(x => x.value === params.category).children;
       }

       this.selectedCategory = [params.category];
       this.selectedSubcategory = params.subcategory;
      this.params = {category: params.category, subcategory: params.subcategory};

        this.postsSubscription = this.databaseService.getPostsByFilter(params.category, params.subcategory)
          .subscribe(x => {
            if (x) {
              this.posts = x as PostModel[];
              this.orderByDate();
            }
        });
      }
    );
  }

  orderByDate() {
    if (this.orderByTime) {
      this.posts = this.posts.filter(a => a.time).sort((a, b) => {return b.time.seconds - a.time.seconds});
    } else {
     this.posts = this.posts.filter(a => a.likedBy).sort((a, b) => {return b.likedBy.length - a.likedBy.length});
    }
  }

  selectCategory(category) {
    this.router.navigate(['/home'], { queryParams: { category: category.value, subcategory: null }, queryParamsHandling: 'merge' });
  }

  selectSubcategory(subcategory) {
    this.router.navigate(['/home'], { queryParams: { subcategory: subcategory.value }, queryParamsHandling: 'merge' });
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

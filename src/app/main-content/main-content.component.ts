import { Component, OnInit } from '@angular/core';
import { FilterService } from '../services/filter.service';
import { DatabasefireService } from '../services/databasefire.service';
import { PostModel } from '../entities/post.model';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { FilterParams } from '../entities/filterParams';
import { Categories, CategoriesMain } from '../entities/filterConstants';

@Component({
  selector: 'app-main-content',
  templateUrl: './main-content.component.html',
  styleUrls: ['./main-content.component.scss']
})
export class MainContentComponent implements OnInit {

  categoriesMain = CategoriesMain;

  selectedCategory = 'Unknown';

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
        this.selectedCategory = params.category;
        this.params = {filterTo: params.filterTo, filterFrom: params.filterFrom, category: params.category};
        this.postsSubscription = this.databaseService.getPostsByFilter(params.filterTo, params.filterFrom, params.category)
          .subscribe(x => {
            if (x) {
              this.posts = x as PostModel[];
              this.orderByDate();
            }
        });
      }
    );
  }

  categoryChanged() {
    this.router.navigate(['/home'], { queryParams: { category: this.selectedCategory }, queryParamsHandling: 'merge' });
  }

  orderByDate() {
    if (this.orderByTime) { //newest first
      this.posts = this.posts.filter(a => a.time).sort((a, b) => {return b.time.seconds - a.time.seconds});
    } else { //order by likes
 //    this.backupPosts = JSON.parse(JSON.stringify(this.posts));
     this.posts = this.posts.filter(a => a.likedBy).sort((a, b) => {return b.likedBy.length - a.likedBy.length});
    }
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

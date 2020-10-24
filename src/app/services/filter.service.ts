import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { FilterParams } from '../entities/filterParams';
import { PostModel } from '../entities/post.model';

@Injectable({
  providedIn: 'root'
})


export class FilterService {

  private newPostSub: BehaviorSubject<PostModel>;
  private $newPostObservable: Observable<PostModel>;

  private queryParamsSub: BehaviorSubject<FilterParams>;
  private $queryParamsObservable: Observable<FilterParams>;

  constructor(private http: HttpClient) {
    this.newPostSub = new BehaviorSubject<PostModel>(null);
    this.$newPostObservable = this.newPostSub.asObservable();

    this.queryParamsSub = new BehaviorSubject<FilterParams>(null);
    this.$queryParamsObservable = this.queryParamsSub.asObservable();
  }

  public changeNewPost(f: PostModel) {
    this.newPostSub.next(f);
  }

  public getNewPost(): Observable<PostModel> {
    return this.$newPostObservable;
  }

  public setLastQueryParams(f: FilterParams) {
    this.queryParamsSub.next(f);
  }

  public getLastQueryParams(): Observable<FilterParams> {
    return this.$queryParamsObservable;
  }

}

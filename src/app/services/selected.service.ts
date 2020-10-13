import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { PostModel } from '../entities/post.model';

@Injectable({
  providedIn: 'root'
})
export class SelectedService {

  private postSub: BehaviorSubject<PostModel>;
  private $postObservable: Observable<PostModel>;

  constructor(private http: HttpClient) {
    this.postSub = new BehaviorSubject<PostModel>(null);
    this.$postObservable = this.postSub.asObservable();
  }

  public setSelectedPost(f: PostModel) {
    this.postSub.next(f);
  }

  public getSelectedPost(): Observable<PostModel> {
    return this.$postObservable;
  }
}

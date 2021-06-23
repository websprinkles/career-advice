import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject} from 'rxjs';
import { Filters } from '../entities/filters';

@Injectable({
  providedIn: 'root'
})

export class FilterService {

  private newPostSub: BehaviorSubject<boolean>;
  private $newPostObservable: Observable<boolean>;

  private queryParamsSub: BehaviorSubject<Filters>;
  private $queryParamsObservable: Observable<Filters>;

  constructor() {
    this.newPostSub = new BehaviorSubject<boolean>(null);
    this.$newPostObservable = this.newPostSub.asObservable();

    this.queryParamsSub = new BehaviorSubject<Filters>(null);
    this.$queryParamsObservable = this.queryParamsSub.asObservable();
  }

  public addNewPost(f: boolean): void {
    this.newPostSub.next(f);
  }

  public getNewPost(): Observable<boolean> {
    return this.$newPostObservable;
  }

  public setLastQueryParams(f: Filters): void {
    this.queryParamsSub.next(f);
  }

  public getLastQueryParams(): Observable<Filters> {
    return this.$queryParamsObservable;
  }

}

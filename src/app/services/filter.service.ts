import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { FilterParams } from '../entities/filterParams';

@Injectable({
  providedIn: 'root'
})


export class FilterService {

  private generationToSub: BehaviorSubject<number>;
  private $generationToObservable: Observable<number>;

  private queryParamsSub: BehaviorSubject<FilterParams>;
  private $queryParamsObservable: Observable<FilterParams>;

  constructor(private http: HttpClient) {
    this.generationToSub = new BehaviorSubject<number>(1990);
    this.$generationToObservable = this.generationToSub.asObservable();

    this.queryParamsSub = new BehaviorSubject<FilterParams>(null);
    this.$queryParamsObservable = this.queryParamsSub.asObservable();
  }

  public changeGenerationTo(f: number) {
    this.generationToSub.next(f);
  }

  public getGenerationTo(): Observable<number> {
    return this.$generationToObservable;
  }

  public setLastQueryParams(f: FilterParams) {
    this.queryParamsSub.next(f);
  }

  public getLastQueryParams(): Observable<FilterParams> {
    return this.$queryParamsObservable;
  }

}

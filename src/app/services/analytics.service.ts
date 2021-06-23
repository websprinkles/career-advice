import { Injectable } from '@angular/core';
import { AngularFireAnalytics } from '@angular/fire/analytics';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  constructor(private angularFireAnalytics: AngularFireAnalytics) {}

  public logEvent(eventName: string, eventParams?: { [key: string]: any }): void {
    if (!environment.production) {
      console.log(eventName, eventParams);
    }
    this.angularFireAnalytics.logEvent(eventName, eventParams);
  }
}

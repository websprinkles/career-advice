import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TimeConverterService {

constructor() { }

getTimeDifference(dateNow, datePast): string {
  let result = '';
  let d = Math.abs(dateNow - datePast) / 1000;
  let r = {};
  let s = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
      second: 1
  };

    const arr = Object.keys(s);
    for (let key of arr) {
        r[key] = Math.floor(d / s[key]);
        d -= r[key] * s[key];
        if (r[key] > 0) {
          if (r[key] === 1) {
            result = '1 ' + key + 'ago';
            break;
          } else {
            result = r[key] + ' ' + key + 's' + ' ago';
            break;
          }
        }
    };

    return result;
  }

}

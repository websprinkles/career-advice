import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Toast } from '../entities/toast';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  public toastToShow = new Subject<Toast>();

  constructor() { }

  showSuccess(summ: string, det: string) {
    this.toastToShow.next({
      severity: 'success',
      summary: summ,
      detail: det
    });
  }

  showInfo(summ: string, det: string) {
    this.toastToShow.next({
      severity: 'info',
      summary: summ,
      detail: det
    });
  }

  showError(summ: string, det: string) {
    this.toastToShow.next({
      severity: 'error',
      summary: summ,
      detail: det
    });
  }

}

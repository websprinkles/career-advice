import { Component, OnDestroy, OnInit } from '@angular/core';
import { NotificationService } from '../../services/notification.service';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
})
export class NotificationComponent implements OnInit, OnDestroy {
  notificationSubscription: Subscription;

  constructor(
    private notificationService: NotificationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.notificationSubscription =
      this.notificationService.toastToShow.subscribe((toast) =>
      {
        this.messageService.add(toast);
      });
  }

  ngOnDestroy(): void {
    this.notificationSubscription.unsubscribe();
  }
}

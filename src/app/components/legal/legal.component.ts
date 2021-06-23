import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-legal',
  templateUrl: './legal.component.html',
  styleUrls: ['./legal.component.scss']
})
export class LegalComponent implements OnInit {
  index = 0;
  paramsSubscription: Subscription;
  type = 'type';

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {
   }

  ngOnInit(): void {
    this.setIndex();
  }

  setIndex(): void {
    this.paramsSubscription = this.route.params
      .subscribe(params => {
        if (params && params[this.type]) {
          if (params[this.type] === 'terms') {
            this.index = 0;
          } else if (params[this.type] === 'privacy') {
            this.index = 1;
          } else if (params[this.type] === 'cookies') {
            this.index = 2;
          } else {
            this.index = 0;
          }
        }
    });
  }

  navigate(e): void {
    const selectedIndex = e.index;

    if (selectedIndex === 0) {
      this.router.navigate(['/home/legal', 'terms']);
    } else if (selectedIndex === 1) {
      this.router.navigate(['/home/legal', 'privacy']);
    } else {
      this.router.navigate(['/home/legal', 'cookies']);
    }
  }

  ngOnDestroy(): void {
    this.paramsSubscription.unsubscribe();
  }

}

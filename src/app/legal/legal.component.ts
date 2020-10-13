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

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {
   }

  ngOnInit() {
    this.setIndex();
  }

  setIndex() {
    this.paramsSubscription = this.route.params
      .subscribe(params => {
        if (params && params['type']) {
          if (params['type'] === 'terms') {
            this.index = 0;
          } else if (params['type'] === 'privacy') {
            this.index = 1;
          } else if (params['type'] === 'cookies') {
            this.index = 2;
          } else {
            this.index = 0;
          }
        }
    });
  }

  navigate(e) {
    let selectedIndex = e.index;

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

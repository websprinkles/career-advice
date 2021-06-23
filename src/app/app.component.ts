import { Component, AfterViewInit } from '@angular/core';
import { AngularFireAnalytics } from '@angular/fire/analytics';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements AfterViewInit {
  constructor(
    private fire: AngularFireAnalytics,
    private readonly titleService: Title,
    private readonly meta: Meta) {
      this.meta.addTag({ name: 'description', content: 'Career advice from people with experience. Read their stories and share what you have discovered on your professional journey.' });
      this.meta.addTag({ name: 'author', content: 'Web Sprinkles' });
      this.meta.addTag({ name: 'keywords', content: 'career, career advice, job, employment, tips, occupation' });
      this.titleService.setTitle('Career Tips');
  }

  title = 'careeradvice';

  ngAfterViewInit(): void {
    this.fire.logEvent('main_content', { visited: true });
  }
}

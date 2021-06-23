import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserPageComponent } from './components/user-page/user-page.component';
import { AuthGuard } from './auth/auth.guard';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { OutlineComponent } from './components/outline/outline.component';
import { MainPageComponent } from './components/main-page/main-page.component';
import { EmailGuard } from './auth/email.guard';
import { PostPageComponent } from './components/post-page/post-page.component';
import { LegalComponent } from './components/legal/legal.component';

const routes: Routes = [
  {
    path: 'home', component: OutlineComponent, children: [
      { path: 'login', component: LoginComponent, outlet: 'modal'},
      { path: 'register', component: RegisterComponent, outlet: 'modal'},
      { path: 'user', component: UserPageComponent, canActivate: [AuthGuard, EmailGuard]},
      { path: 'legal/:type', component: LegalComponent},
      { path: 'post/:id', component: PostPageComponent},
      { path: '', component: MainPageComponent}
    ]
  },
  { path: '', redirectTo: '/home', pathMatch: 'full' }, // redirect to 'first component'
  { path: '**', redirectTo: '/home' },  // Wildcard route for a 404 page
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserComponent } from './user/user.component';
import { AuthGuard } from './auth/auth.guard';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { OutlineComponent } from './outline/outline.component';
import { MainContentComponent } from './main-content/main-content.component';
import { EmailGuard } from './auth/email.guard';
import { PostDetailComponent } from './post-detail/post-detail.component';
import { LegalComponent } from './legal/legal.component';

const routes: Routes = [
  // { path: '', redirectTo: 'app', pathMatch: 'full' },
  {
    path: 'home', component: OutlineComponent, children: [
      { path: 'login', component: LoginComponent, outlet: 'modal'},
      { path: 'register', component: RegisterComponent, outlet: 'modal'},
      { path: 'user', component: UserComponent, canActivate: [AuthGuard, EmailGuard]},
      { path: 'legal/:type', component: LegalComponent},
      { path: 'post/:id', component: PostDetailComponent},
      { path: '', component: MainContentComponent}
    ]
  },
  { path: '', redirectTo: '/home?filterTo=1980', pathMatch: 'full' }, // redirect to `first-component`
  { path: '**', redirectTo: '/home?filterTo=1980' },  // Wildcard route for a 404 page
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  // imports: [RouterModule.forRoot(routes, { useHash: false })],
  exports: [RouterModule]
})
export class AppRoutingModule { }

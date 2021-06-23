import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { UserService } from '../auth/user.service';
import { take, map, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable()
export class EmailGuard implements CanActivate {
  constructor(
    public afAuth: AngularFireAuth,
    public userService: UserService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.afAuth.authState.pipe(
      take(1),
      map((auth) => auth && auth.emailVerified),
      tap((emailVerified) => {
        if (!emailVerified) {
          this.router.navigate(['/']);
        }
      })
    );
  }
}

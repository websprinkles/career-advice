import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../entities/user';

@Injectable()
export class AuthService {
  authState: any = null;

  constructor(public afAuth: AngularFireAuth) {}

  get currentUserObservable(): Observable<User> {
    return this.afAuth.authState.pipe(
      map((user) => {
        if (user) {
          return {
            id: user.uid,
            displayName: user.displayName,
            email: user.email,
            provider: user.providerData[0].providerId,
            emailVerified: user.emailVerified,
          };
        } else {
          return null;
        }
      })
    );
  }

  sendVerificationMail(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (firebase.auth().currentUser) {
        const actionCodeSettings = {
          // After email is verified, the user will be give the ability to go back
          // to the sign-in page.
          url: 'http://www.career-tips.org',
          handleCodeInApp: false,
        };
        firebase
          .auth()
          .currentUser.sendEmailVerification(actionCodeSettings)
          .then(
            (res) => {
              resolve(res);
            },
            (err) => {
              reject(err);
            }
          );
      } else {
        reject();
      }
    });
  }

  sendPasswordResetEmail(email): Promise<any> {
    return new Promise((resolve, reject) => {
      const actionCodeSettings = {
        // After email is verified, the user will be give the ability to go back
        // to the sign-in page.
        url: 'http://www.career-tips.org',
        handleCodeInApp: false,
      };
      firebase
        .auth()
        .sendPasswordResetEmail(email, actionCodeSettings)
        .then(
          (res) => {
            resolve(res);
          },
          (err) => {
            reject(err);
          }
        );
    });
  }

  doFacebookLogin(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const provider = new firebase.auth.FacebookAuthProvider();
      this.afAuth.signInWithPopup(provider).then(
        (res) => {
          resolve(res);
        },
        (err) => {
          reject(err);
        }
      );
    });
  }

  doGoogleLogin(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const provider = new firebase.auth.GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      this.afAuth.signInWithPopup(provider).then(
        (res) => {
          resolve(res);
        },
        (err) => {
          reject(err);
        }
      );
    });
  }

  doRegister(value): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      firebase
        .auth()
        .createUserWithEmailAndPassword(value.email, value.password)
        .then(
          (res) => {
            // User is signed-in by default, but needs to be checked first
            this.afAuth.signOut();
            resolve(res);
          },
          (err) => reject(err)
        );
    });
  }

  doLogin(value): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      firebase
        .auth()
        .signInWithEmailAndPassword(value.email, value.password)
        .then(
          (res) => {
            if (res.user.emailVerified) {
              resolve(res);
            } else {
              this.afAuth.signOut();
              this.sendVerificationMail();
              reject({
                message:
                  'Your email is not verified. Please check your e-mail to verify.',
              });
            }
          },
          (err) => reject(err)
        );
    });
  }

  doLogout(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (firebase.auth().currentUser) {
        this.afAuth.signOut();
        resolve({});
      } else {
        reject();
      }
    });
  }
}

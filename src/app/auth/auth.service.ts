import { Injectable } from "@angular/core";
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';
import { Observable, of } from 'rxjs';
import { NotificationService } from '../services/notification.service';
import { map } from 'rxjs/operators';
import { FirebaseUserModel } from '../entities/user.model';

@Injectable()
export class AuthService {

  authState: any = null;

  constructor(
   public afAuth: AngularFireAuth,
   private notificationService: NotificationService
  ) {
  }

  get currentUserObservable(): Observable<FirebaseUserModel> {
    return this.afAuth.authState.pipe(
      map(user => {
        if (user) {
          return {
            id: user.uid,
            displayName: user.displayName,
            email: user.email,
            provider: user.providerData[0].providerId,
            emailVerified: user.emailVerified
          }
        } else {
          return null;
        }
      })
    )
  }

  sendVerificationMail() {
    return new Promise((resolve, reject) => {
      if(firebase.auth().currentUser){
        let actionCodeSettings = {
          // After email is verified, the user will be give the ability to go back
          // to the sign-in page.
          url: 'http://www.timelyposts.com',
          handleCodeInApp: false
        };
        firebase.auth().currentUser.sendEmailVerification(actionCodeSettings)
        .then(res => {
          resolve(res);
        }, err => {
          reject(err);
        })
      }
      else{
        reject();
      }
    });
  }

  sendPasswordResetEmail(email) {
    return new Promise((resolve, reject) => {
      let actionCodeSettings = {
        // After email is verified, the user will be give the ability to go back
        // to the sign-in page.
        url: 'http://www.timelyposts.com',
        handleCodeInApp: false
      };
      firebase.auth().sendPasswordResetEmail(email, actionCodeSettings)
        .then(res => {
          resolve(res);
        }, err => {
         // console.log(err);
          reject(err);
        })
      });
  }


  doFacebookLogin(){
    return new Promise<any>((resolve, reject) => {
      let provider = new firebase.auth.FacebookAuthProvider();
      this.afAuth
      .signInWithPopup(provider)
      .then(res => {
        resolve(res);
      }, err => {
        // console.log(err);
        reject(err);
      })
    })
  }

  doGoogleLogin(){
    return new Promise<any>((resolve, reject) => {
      let provider = new firebase.auth.GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      this.afAuth
      .signInWithPopup(provider)
      .then(res => {
        resolve(res);
      }, err => {
        // console.log(err);
        reject(err);
      })
    })
  }

  doRegister(value){
    return new Promise<any>((resolve, reject) => {
      firebase.auth().createUserWithEmailAndPassword(value.email, value.password)
      .then(res => {
        this.afAuth.signOut(); // ker je na zacetku prijavljen..
        resolve(res);
      }, err => reject(err))
    })
  }

  doLogin(value){
    return new Promise<any>((resolve, reject) => {
      firebase.auth().signInWithEmailAndPassword(value.email, value.password)
      .then(res => {
          if (res.user.emailVerified) {
            resolve(res);
          } else {
            this.afAuth.signOut();
            this.sendVerificationMail();
            reject({message: 'Your email is not verified. Please check your e-mail to verify.'});
          }

      }, err => reject(err))
    })
  }

  doLogout(){
    return new Promise((resolve, reject) => {
      if(firebase.auth().currentUser){
        this.afAuth.signOut();
        resolve();
      }
      else{
        reject();
      }
    });
  }


}

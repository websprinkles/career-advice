import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';

@Injectable()
export class UserService {
  constructor(public db: AngularFirestore, public afAuth: AngularFireAuth) { }

  getCurrentUser(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          resolve(user);
        } else {
          reject('No user logged in');
        }
      });
    });
  }

  updateCurrentUser(value): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const user = firebase.auth().currentUser;
      user
        .updateProfile({
          displayName: value.name,
        })
        .then(
          (res) => {
            resolve(res);
          },
          (err) => reject(err)
        );
    });
  }

  deleteCurrentUser(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const user = firebase.auth().currentUser;
      user.delete().then(
        (res) => {
          resolve(res);
        },
        (err) => reject(err)
      );
    });
  }
}

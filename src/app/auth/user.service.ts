import { Injectable } from "@angular/core";
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';

@Injectable()
export class UserService {


  constructor(
   public db: AngularFirestore,
   public afAuth: AngularFireAuth
 ) {
 }

  getCurrentUser(){
    return new Promise<any>((resolve, reject) => {
      var user = firebase.auth().onAuthStateChanged(function(user){
        if (user) {
          resolve(user);
        } else {
          reject('No user logged in');
        }
      })
    })
  }

  updateCurrentUser(value){
    return new Promise<any>((resolve, reject) => {
      var user = firebase.auth().currentUser;
      user.updateProfile({
        displayName: value.name/* ,
        photoURL: user.photoURL */
      }).then(res => {
        resolve(res);
      }, err => reject(err))
    })
  }

  deleteCurrentUser() {
    return new Promise<any>((resolve, reject) => {
      var user = firebase.auth().currentUser;
      user.delete().then(res => {
        resolve(res);
      }, err => reject(err))
    })
  }



/*   updateUserMail(value: string){
    return new Promise<any>((resolve, reject) => {
      var user = firebase.auth().currentUser;
      user.updateEmail(value).then(res => {
        resolve(res);
      }, err => reject(err))
    })
  } */
}

import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentSnapshot, Action } from '@angular/fire/firestore';
import { FirebaseUserModel } from '../entities/user.model';
import { PostModel } from '../entities/post.model';
import { CommentModel }  from '../entities/comment.model';
import { ReportModel }  from '../entities/report.model';
import * as firebase from 'firebase/app';
import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import { ContactMailModel } from '../entities/contactMail.model';
import { LastMessageModel } from '../entities/lastMessage.model';

@Injectable({
  providedIn: 'root'
})
export class DatabasefireService {

  constructor(public db: AngularFirestore) {}

  getPosts(){
      return this.db.collection('posts', ref => {return ref.orderBy('time', 'desc')}).valueChanges()
  }

  getPostsByFilter(category = null, subcategory = null, jobTitle = null) {
    return this.db.collection('posts', ref => {
      let query : firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
      //if (jobTitle) { query = query.where('jobTitle', '==', jobTitle) };
      if (category && category !== -1) { query = query.where('category', '==', Number(category)) };
      if (subcategory  && subcategory !== -1) { query = query.where('subcategory', '==', Number(subcategory)) };
      return query;
    }).valueChanges()
  }

  getPostsOrderedByLikes(){
    return this.db.collection('posts', ref => {return ref.orderBy('name')}).valueChanges()
  }

  getUser(userId){
    return this.db.collection('users').doc(userId).valueChanges();
  }

  getPost(id) {
/*     console.log(this.db.collection('posts', ref => ref.where('id', '==', id)));
    return this.db.collection('posts', ref => ref.where('id', '==', id)).get(); */
    return this.db.collection('posts').doc(id).valueChanges();
  }

  deleteAllCommentsByPostId(postId) {
    let ref = this.db.collection('comments', ref => ref.where('postId', '==', postId));
    return ref.get().pipe(first()).subscribe((comments) => {
      comments.forEach((doc) => {
        doc.ref.delete();
      });
    });
  }

  deleteAllCommentsByUserId(userId) {
    let ref = this.db.collection('comments', ref => ref.where('userId', '==', userId));
    return ref.get().pipe(first()).subscribe((comments) => {
      comments.forEach((doc) => {
        doc.ref.delete();
      });
    });
  }

  deleteAllPostsByUserId(userId) {
    let ref = this.db.collection('posts', ref => ref.where('userId', '==', userId));
    return ref.get().pipe(first()).subscribe((posts) => {
      posts.forEach((doc) => {
        doc.ref.delete();
      });
    });
  }

  getCommentsByPostId(postId) {
     return this.db.collection('comments', ref => ref.where('postId', '==', postId).orderBy('time', 'desc')).valueChanges();
  }

  getPostsLikedByUser(userId) {
    //probaj se najprej orderby in potem where.
    return this.db.collection('posts', ref => ref.where('likedBy', 'array-contains', userId)).valueChanges();
  }

  getPostsByUser(userId) {
    //probaj se najprej orderby in potem where.
    return this.db.collection('posts', ref => ref.where('userId', '==', userId)).valueChanges();
  }

  getCommentsByUser(userId) {
    //probaj se najprej orderby in potem where.
    return this.db.collection('comments', ref => ref.where('userId', '==', userId)).valueChanges();
  }

  updateUser(userKey, name) {
    return this.db.collection('users').doc(userKey).update({
      displayName: name,
      lastMessage: firebase.firestore.FieldValue.serverTimestamp()
    });
  }

  deleteUser(userKey){
    return this.db.collection('users').doc(userKey).delete();
  }

  deletePost(id) {
    return this.db.collection('posts').doc(id).delete();
  }

  deleteComment(id) {
    return this.db.collection('comments').doc(id).delete();
  }

  getUsers(){
    //return this.db.collection('users').snapshotChanges();
    return this.db.collection('users').valueChanges();
  }

  searchUsers(searchValue){
    return this.db.collection('users',ref => ref.where('nameToSearch', '>=', searchValue)
      .where('nameToSearch', '<=', searchValue + '\uf8ff'))
      .snapshotChanges()
  }

/*   searchPostsByGenerationFrom(value){
    return this.db.collection('posts',ref => ref.orderBy('generationFrom').startAt(value)).snapshotChanges();
  }

  searchPostsByGenerationTo(value){
    return this.db.collection('posts',ref => ref.orderBy('generationTo').startAt(value)).snapshotChanges();
  } */

  getUserDoc(userId) {
    return this.db.collection('users').doc(userId).valueChanges();
  }

  removeLike(postId, userId) {
    let batch = this.db.firestore.batch();
    let userRef = this.db.collection("users").doc(userId).ref;

    batch.update(userRef, {
      lastMessage: firebase.firestore.FieldValue.serverTimestamp()
    });

    let postRef = this.db.collection('posts').doc(postId).ref;

    batch.update(postRef, {
      likedBy: firebase.firestore.FieldValue.arrayRemove(userId)
    });

    return batch.commit();
  }

  addLike(postId, userId) {
    let batch = this.db.firestore.batch();
    let userRef = this.db.collection("users").doc(userId).ref;

    batch.update(userRef, {
      lastMessage: firebase.firestore.FieldValue.serverTimestamp()
    });

    let postRef = this.db.collection('posts').doc(postId).ref;

    batch.update(postRef, {
      likedBy: firebase.firestore.FieldValue.arrayUnion(userId)
    });

    return batch.commit();
  }


  addUser(user: FirebaseUserModel){
    this.db.collection("users").doc(user.id).set({
      id: user.id,
      displayName: user.displayName || 'Anonymous',
      email: user.email,
      provider: user.provider,
     // emailVerified: false,
      time: firebase.firestore.FieldValue.serverTimestamp(),
      lastMessage: firebase.firestore.FieldValue.serverTimestamp()
    })

  }

  addPost(post: PostModel) {
    let batch = this.db.firestore.batch();
    let userRef = this.db.collection("users").doc(post.userId).ref;


    batch.update(userRef, {
      lastMessage: firebase.firestore.FieldValue.serverTimestamp()
    });

    let id = this.db.collection("posts").ref.doc().id;
    let postRef = this.db.collection('posts').doc(id).ref;

    batch.set(postRef, {
      id: id,
      userId: post.userId,
      time: firebase.firestore.FieldValue.serverTimestamp(),
      name: post.name,
      jobTitle: post.jobTitle,
      message: post.message,
      category: post.category,
      subcategory: post.subcategory,
      likedBy: []
    });

    return batch.commit();
  }

  addComment(comment: CommentModel){
    let batch = this.db.firestore.batch();
    let userRef = this.db.collection("users").doc(comment.userId).ref;


    batch.update(userRef, {
      lastMessage: firebase.firestore.FieldValue.serverTimestamp()
    });

    let id = this.db.collection("comments").ref.doc().id;
    let commentRef = this.db.collection('comments').doc(id).ref;

    batch.set(commentRef, {
      id: id,
      postId: comment.postId,
      userId: comment.userId,
      name: comment.name,
      comment: comment.comment,
      time: firebase.firestore.FieldValue.serverTimestamp()
    });

    return batch.commit();
  }

  addReport(report: ReportModel) {
    let batch = this.db.firestore.batch();
    let userRef = this.db.collection("users").doc(report.userId).ref;


    batch.update(userRef, {
      lastMessage: firebase.firestore.FieldValue.serverTimestamp()
    });

    let id = this.db.collection("reports").ref.doc().id;
    let reportRef = this.db.collection('reports').doc(id).ref;

    batch.set(reportRef, {
      id: id,
      postId: report.postId,
      userId: report.userId,
     // email: report.email,
      message: report.message,
      time: firebase.firestore.FieldValue.serverTimestamp()
    });

    return batch.commit();
  }

  addContactMail(contactMail: ContactMailModel) {
    let batch = this.db.firestore.batch();
    let userRef = this.db.collection("users").doc(contactMail.userId).ref;

    batch.update(userRef, {
      lastMessage: firebase.firestore.FieldValue.serverTimestamp()
    });

    let id = this.db.collection("contactMail").ref.doc().id;
    let contactMailRef = this.db.collection('contactMail').doc(id).ref;

    batch.set(contactMailRef, {
      id: id,
      userId: contactMail.userId,
      email: contactMail.email,
      message: contactMail.message,
      time: firebase.firestore.FieldValue.serverTimestamp()
    });

    return batch.commit();
  }
}

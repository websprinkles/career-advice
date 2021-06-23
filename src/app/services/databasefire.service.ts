import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { User } from '../entities/user';
import { Post } from '../entities/post';
import { Comment } from '../entities/comment';
import { Report } from '../entities/report';
import * as firebase from 'firebase/app';
import { first } from 'rxjs/operators';
import { Contact } from '../entities/contact';
import { Observable, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DatabasefireService {
  constructor(public db: AngularFirestore) {}

  getPosts(): Observable<any> {
    return this.db
      .collection('posts', (ref) => {
        return ref.orderBy('time', 'desc');
      })
      .valueChanges();
  }

  getPostsByFilter(category = null, subcategory = null, jobTitle = null): Observable<any>  {
    //not used, but working
    return this.db
      .collection('posts', (ref) => {
        let query:
          | firebase.firestore.CollectionReference
          | firebase.firestore.Query = ref;
        if (jobTitle) {
          query = query.where('jobTitle', '==', jobTitle);
        }
        if (category && category !== -1) {
          query = query.where('category', '==', Number(category));
        }
        if (subcategory && subcategory !== -1) {
          query = query.where('subcategory', '==', Number(subcategory));
        }
        return query;
      })
      .valueChanges();
  }

  getPostsOrderedByLikes(): Observable<any> {
    return this.db
      .collection('posts', (ref) => {
        return ref.orderBy('name');
      })
      .valueChanges();
  }

  getUser(userId): Observable<any> {
    return this.db.collection('users').doc(userId).valueChanges();
  }

  getPost(id): Observable<any>  {
    return this.db.collection('posts').doc(id).valueChanges();
  }

  deleteAllCommentsByPostId(postId): Subscription {
    const ref = this.db.collection('comments', (reference) =>
      reference.where('postId', '==', postId)
    );
    return ref
      .get()
      .pipe(first())
      .subscribe((comments) => {
        comments.forEach((doc) => {
          doc.ref.delete();
        });
      });
  }

  deleteAllCommentsByUserId(userId): Subscription  {
    const ref = this.db.collection('comments', (reference) =>
      reference.where('userId', '==', userId)
    );
    return ref
      .get()
      .pipe(first())
      .subscribe((comments) => {
        comments.forEach((doc) => {
          doc.ref.delete();
        });
      });
  }

  deleteAllPostsByUserId(userId): Subscription {
    const ref = this.db.collection('posts', (reference) =>
      reference.where('userId', '==', userId)
    );
    return ref
      .get()
      .pipe(first())
      .subscribe((posts) => {
        posts.forEach((doc) => {
          doc.ref.delete();
        });
      });
  }

  getCommentsByPostId(postId): Observable<any> {
    return this.db
      .collection('comments', (ref) =>
        ref.where('postId', '==', postId).orderBy('time', 'desc')
      )
      .valueChanges();
  }

  getPostsLikedByUser(userId): Observable<any> {
    return this.db
      .collection('posts', (ref) =>
        ref.where('likedBy', 'array-contains', userId)
      )
      .valueChanges();
  }

  getPostsByUser(userId): Observable<any> {
    return this.db
      .collection('posts', (ref) => ref.where('userId', '==', userId))
      .valueChanges();
  }

  getCommentsByUser(userId): Observable<any> {
    return this.db
      .collection('comments', (ref) => ref.where('userId', '==', userId))
      .valueChanges();
  }

  updateUser(userKey, name): Promise<any> {
    return this.db.collection('users').doc(userKey).update({
      displayName: name,
      lastMessage: firebase.firestore.FieldValue.serverTimestamp(),
    });
  }

  deleteUser(userKey): Promise<any> {
    return this.db.collection('users').doc(userKey).delete();
  }

  deletePost(id): Promise<any> {
    return this.db.collection('posts').doc(id).delete();
  }

  deleteComment(id): Promise<any> {
    return this.db.collection('comments').doc(id).delete();
  }

  getUsers(): Observable<any> {
    return this.db.collection('users').valueChanges();
  }

  searchUsers(searchValue): any {
    return this.db
      .collection('users', (ref) =>
        ref
          .where('nameToSearch', '>=', searchValue)
          .where('nameToSearch', '<=', searchValue + '\uf8ff')
      )
      .snapshotChanges();
  }

  getUserDoc(userId): Observable<any> {
    return this.db.collection('users').doc(userId).valueChanges();
  }

  removeLike(postId, userId): any {
    const batch = this.db.firestore.batch();
    const userRef = this.db.collection('users').doc(userId).ref;

    batch.update(userRef, {
      lastMessage: firebase.firestore.FieldValue.serverTimestamp(),
    });

    const postRef = this.db.collection('posts').doc(postId).ref;

    batch.update(postRef, {
      likedBy: firebase.firestore.FieldValue.arrayRemove(userId),
    });

    return batch.commit();
  }

  addLike(postId, userId): any {
    const batch = this.db.firestore.batch();
    const userRef = this.db.collection('users').doc(userId).ref;

    batch.update(userRef, {
      lastMessage: firebase.firestore.FieldValue.serverTimestamp(),
    });

    const postRef = this.db.collection('posts').doc(postId).ref;

    batch.update(postRef, {
      likedBy: firebase.firestore.FieldValue.arrayUnion(userId),
    });

    return batch.commit();
  }

  addUser(user: User): any {
    this.db
      .collection('users')
      .doc(user.id)
      .set({
        id: user.id,
        displayName: user.displayName || 'Anonymous',
        email: user.email,
        provider: user.provider,
        time: firebase.firestore.FieldValue.serverTimestamp(),
        lastMessage: firebase.firestore.FieldValue.serverTimestamp(),
      });
  }

  addPost(post: Post): any {
    const batch = this.db.firestore.batch();
    const userRef = this.db.collection('users').doc(post.userId).ref;

    batch.update(userRef, {
      lastMessage: firebase.firestore.FieldValue.serverTimestamp(),
    });

    const postId = this.db.collection('posts').ref.doc().id;
    const postRef = this.db.collection('posts').doc(postId).ref;

    batch.set(postRef, {
      id: postId,
      userId: post.userId,
      time: firebase.firestore.FieldValue.serverTimestamp(),
      name: post.name,
      jobTitle: post.jobTitle,
      message: post.message,
      category: post.category,
      subcategory: post.subcategory,
      likedBy: [],
    });

    return batch.commit();
  }

  addComment(comment: Comment): any {
    const batch = this.db.firestore.batch();
    const userRef = this.db.collection('users').doc(comment.userId).ref;

    batch.update(userRef, {
      lastMessage: firebase.firestore.FieldValue.serverTimestamp(),
    });

    const commentId = this.db.collection('comments').ref.doc().id;
    const commentRef = this.db.collection('comments').doc(commentId).ref;

    batch.set(commentRef, {
      id: commentId,
      postId: comment.postId,
      userId: comment.userId,
      name: comment.name,
      comment: comment.comment,
      time: firebase.firestore.FieldValue.serverTimestamp(),
    });

    return batch.commit();
  }

  addReport(report: Report): any {
    const batch = this.db.firestore.batch();
    const userRef = this.db.collection('users').doc(report.userId).ref;

    batch.update(userRef, {
      lastMessage: firebase.firestore.FieldValue.serverTimestamp(),
    });

    const reportId = this.db.collection('reports').ref.doc().id;
    const reportRef = this.db.collection('reports').doc(reportId).ref;

    batch.set(reportRef, {
      id: reportId,
      postId: report.postId,
      userId: report.userId,
      message: report.message,
      time: firebase.firestore.FieldValue.serverTimestamp(),
    });

    return batch.commit();
  }

  addContactMail(contact: Contact): any {
    const batch = this.db.firestore.batch();
    const userRef = this.db.collection('users').doc(contact.userId).ref;

    batch.update(userRef, {
      lastMessage: firebase.firestore.FieldValue.serverTimestamp(),
    });

    const contactId = this.db.collection('contactMail').ref.doc().id;
    const contactRef = this.db.collection('contactMail').doc(contactId).ref;

    batch.set(contactRef, {
      id: contactId,
      userId: contact.userId,
      email: contact.email,
      message: contact.message,
      time: firebase.firestore.FieldValue.serverTimestamp(),
    });

    return batch.commit();
  }
}

export class Comment {
  id?: string;
  postId: string;
  userId?: string;
  name: string;
  comment: string;
  time?: any;

   constructor() {
     this.id = '';
     this.postId = '';
     this.userId = '';
     this.name = '';
     this.comment = '';
     this.time = null;
   }
 }

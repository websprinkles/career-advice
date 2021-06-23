export class Report {
  message: string;
  time?: any;
  id?: string;
  postId: string;
  email?: string;
  userId: string;


   constructor(){
     this.postId = "";
     this.userId = "";
     this.email = '';
     this.message = '';
     this.time = null;
     this.id = '';
   }
 }

export class PostModel {
  name: string;
  message: string;
  category: string;
  subcategory: string;
  time?: any;
  id?: string;
  timeBetween?: string;
  likedBy?: string[];
  reportedBy?: string[];
  userId?: string;


   constructor(){
     this.name = "";
     this.message = '';
     this.category = '';
     this.subcategory = '';
     this.time = null;
     this.id = '';
     this.timeBetween = '';
     this.likedBy = [];
     this.reportedBy = [];
     this.userId = '';
   }
 }






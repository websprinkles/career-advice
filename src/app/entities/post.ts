export class Post {
  name: string;
  jobTitle: string;
  message: string;
  category: number;
  subcategory: number;
  time?: any;
  id?: string;
  timeBetween?: string;
  likedBy?: string[];
  reportedBy?: string[];
  userId?: string;


   constructor(){
     this.name = '';
     this.jobTitle = '';
     this.message = '';
     this.category = null;
     this.subcategory = null;
     this.time = null;
     this.id = '';
     this.timeBetween = '';
     this.likedBy = [];
     this.reportedBy = [];
     this.userId = '';
   }
 }






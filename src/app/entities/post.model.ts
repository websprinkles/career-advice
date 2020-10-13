export class PostModel {
  name: string;
  fromGeneration: number;
  toGeneration: number;
  message: string;
  category: string;
  time?: any;
  id?: string;
  timeBetween?: string;
  likedBy?: string[];
  reportedBy?: string[];
  userId?: string;


   constructor(){
     this.name = "";
     this.fromGeneration = 0;
     this.toGeneration = 1990;
     this.message = '';
     this.category = '';
     this.time = null;
     this.id = '';
     this.timeBetween = '';
     this.likedBy = [];
     this.reportedBy = [];
     this.userId = '';
   }
 }






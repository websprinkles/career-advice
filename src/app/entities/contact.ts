export class Contact {
  message: string;
  time?: any;
  id?: string;
  userId: string;
  email: string;


   constructor() {
     this.userId = '';
     this.email = '';
     this.message = '';
     this.time = null;
     this.id = '';
   }
 }

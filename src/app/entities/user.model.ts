export class FirebaseUserModel {
  id?: string;
  displayName: string;
  email: string;
  provider: string;
  emailVerified?: boolean;
  likes?: string[];
  time?: any;
  lastMessage?: any;


  constructor(){
    this.id = "";
    this.displayName = "";
    this.email = "";
    this.provider = "";
    this.emailVerified = false;
    this.likes = [];
    this.time = null;
    this.lastMessage = null;
  }
}

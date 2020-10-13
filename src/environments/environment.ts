// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firebase: { // ko gre zares, loocis to od frontenda.. na firebasu naredis se en projekt in te settingse das v environments.rpod.ts
    apiKey: "AIzaSyBgzJCvMPzGIXdZ6i8VQvJ1ykRRoQxV_Iw",
    authDomain: "timelyposts.firebaseapp.com",
    databaseURL: "https://timelyposts.firebaseio.com",
    projectId: "timelyposts",
    storageBucket: "timelyposts.appspot.com",
    messagingSenderId: "1078712457230",
    appId: "1:1078712457230:web:6c017d3f2aafd2b8fa445f",
    measurementId: "G-1YWVZ9VZVW"
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.

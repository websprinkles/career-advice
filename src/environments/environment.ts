// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firebase: { // ko gre zares, loocis to od frontenda.. na firebasu naredis se en projekt in te settingse das v environments.rpod.ts
    apiKey: "AIzaSyC_fHueRqqgz2gQIplboVcaFKuYN_yE47k",
    authDomain: "career-advice-b7b66.firebaseapp.com",
    databaseURL: "https://career-advice-b7b66.firebaseio.com",
    projectId: "career-advice-b7b66",
    storageBucket: "career-advice-b7b66.appspot.com",
    messagingSenderId: "1081350654755",
    appId: "1:1081350654755:web:c45fdb3ce7e3becf90da96",
    measurementId: "G-EZ91LS51NF"
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

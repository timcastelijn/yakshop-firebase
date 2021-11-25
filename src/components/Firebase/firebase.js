import app from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/database';
import 'firebase/compat/firestore';
import {g} from '../../globals.js';


// const config = {
//   apiKey: process.env.REACT_APP_API_KEY,
//   authDomain: process.env.REACT_APP_AUTH_DOMAIN,
//   databaseURL: process.env.REACT_APP_DATABASE_URL,
//   projectId: process.env.REACT_APP_PROJECT_ID,
//   storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
//   messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
// };

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const config = {
  apiKey: "AIzaSyBJ5sbWWO3lupAib6fINSOPpKSd0LuRhVc",
  authDomain: "builder-d0c31.firebaseapp.com",
  projectId: "builder-d0c31",
  // databaseURL:'https://builder-d0c31-default-rtdb.europe-west1.firebasedatabase.app',
  storageBucket: "builder-d0c31.appspot.com",
  messagingSenderId: "852801513128",
  appId: "1:852801513128:web:22880edca57ae9fa9fc49d",
  measurementId: "G-CGYLVZR26F"
};

class Firebase {
  constructor() {
    app.initializeApp(config);

    this.auth = app.auth();
    // this.db = app.database();

    this.db = app.firestore();

    g.firebase = this
  }

  // *** Auth API ***
  doCreateUserWithEmailAndPassword = (email, password) =>
    this.auth.createUserWithEmailAndPassword(email, password);

  doSignInWithEmailAndPassword = (email, password) =>
    this.auth.signInWithEmailAndPassword(email, password);

  doSignOut = () => this.auth.signOut();

  doPasswordReset = email => this.auth.sendPasswordResetEmail(email);

  doPasswordUpdate = password =>
    this.auth.currentUser.updatePassword(password);

  // *** Merge Auth and DB User API *** //
  onAuthUserListener = (next, fallback) =>
    this.auth.onAuthStateChanged(authUser => {
      if (authUser) {
        this.user(authUser.uid)
          // .once('value')
          .get()
          .then(snapshot => {
            const dbUser = snapshot.data();

            // default empty roles
            // console.log('onAuthUserListener', dbUser);

            if (!dbUser.roles) {
              dbUser.roles = {};
            }
            // merge auth and db user
            authUser = {
              uid: authUser.uid,
              email: authUser.email,
              ...dbUser,
            };
            next(authUser);
          });
      } else {
        fallback();
  } });


    // *** User API ***
    user = uid => this.db.doc(`users/${uid}`);
    users = () => this.db.collection('users');


    // *** models API ***
    model = uid => this.db.doc(`models/${uid}`);
    models = () => this.db.collection('models');

}

export default Firebase;

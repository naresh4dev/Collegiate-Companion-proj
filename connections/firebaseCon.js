const { initializeApp } = require("firebase/app");
const {getAuth} = require("firebase/auth");
const {getDatabase} = require("firebase/database");

const firebaseConfig = {

    apiKey: "AIzaSyACiOJ4bPvaP8_UvGcsMhR83JlM61xp5QE",
  
    authDomain: "collegiate-companion-24.firebaseapp.com",
  
    databaseURL: "https://collegiate-companion-24-default-rtdb.asia-southeast1.firebasedatabase.app",
  
    projectId: "collegiate-companion-24",
  
    storageBucket: "collegiate-companion-24.appspot.com",
  
    messagingSenderId: "1066184336878",
  
    appId: "1:1066184336878:web:fc7259d00856483334daff"
  
  };  

  const app = initializeApp(firebaseConfig);

const db  = getDatabase(app);

const auth = getAuth(app);



module.exports = {app,db,auth};
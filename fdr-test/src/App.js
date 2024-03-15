import React from "react";
import './App.css';
import firebase from 'firebase/compat/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, deleteUser, signInAnonymously, signInWithPopup, createUserWithEmailAndPassword, GoogleAuthProvider  } from "firebase/auth";
import { getFirestore, collection, getDocs, getDoc, doc, setDoc, updateDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import {db} from "./firebase-config";
import { Link, Outlet, useLocation, redirect } from 'react-router-dom';

const gp = new GoogleAuthProvider();
const auth = getAuth();

export default class App extends React.Component {
  constructor(props) {
      super(props);
      this.state = {
        rstate: false
      }
      this.emailInputRef = React.createRef();
      this.passwordRef = React.createRef();


  }
  componentDidMount() {
      console.log("wtf...");
  }
  google_auth = async () => {
      await signInWithPopup(auth, gp).then((res) => {
        const user = doc(db, `schools/1/users`, auth.currentUser.uid);
        setDoc(user, {
          name: res.user.displayName,
          email: res.user.email,
          verified: res.user.emailVerified,
          id: res.user.uid,
          role: "regular",
        }).then(() => console.log("written successfully"));
      })
  }
  emailpass_auth = () => {
    createUserWithEmailAndPassword(auth, email, pass).then((res) => {
      const docRef = doc(db, "schools/1/users", auth.currentUser.uid);
      setDoc(docRef, {
          name: uname,
          email: email,
          id: res.user.uid,
          verified: res.user.emailVerified,
      }).then(() => {console.log("written")}).catch(er => {console.log(er)})
  })
  .catch((er) => {
      console.log(er);
      switch(er.code) {
          case 'auth/email-already-in-use':
              console.log("the email is in use");
              break;
          default:
              console.log(er);
              break;
      }
  });
  }
  render() {
      return (
          <div className="landing">
            <button onClick={this.google_auth}>login and stuff</button>
          </div>
      )
  }
}

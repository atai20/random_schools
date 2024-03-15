import React, {Component} from "react";
import { Link } from "react-router-dom"; 
import firebase from 'firebase/compat/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, deleteUser, signInAnonymously, signInWithPopup, createUserWithEmailAndPassword, GoogleAuthProvider  } from "firebase/auth";
import { getFirestore, collection, getDocs, getDoc, doc, setDoc, updateDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import {db} from "./firebase-config";

async function setInfo(uname) {
    const greg = doc(db, "schools/1/users", "bob");
    await setDoc(greg, {
        clubs: ["math", "physics", "computer science"],
        id: "329054352",
        name:uname,
        role: "admin"
    });

}

export default class Landing extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          
        }
    }
    componentDidMount() {
        console.log("wtf...");
    }
    render() {
        return (
            <div className="landing">

            </div>
        );
    }
}
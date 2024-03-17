import React, {Component} from "react";
import { Link } from "react-router-dom"; 
import firebase from 'firebase/compat/app';
import { getFirestore, collection, getDocs, getDoc, doc, setDoc, updateDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import {getAuth,signOut} from "firebase/auth";
import {db} from "./firebase-config";


export default class Landing extends React.Component {
    constructor(props) {
        super(props);
        // this.state = {}
    }

    logout() {
        const auth = getAuth();
        signOut(auth).then(() => {
          this.setState({logged: false});
          window.location.reload();
        }).catch((error) => {console.log("no error")})
      }

    componentDidMount() {
        
    }



    render() {
        return (
            <div className="landing">
                <button onClick={this.logout}>logout landing</button>
            </div>
        );
    }
}
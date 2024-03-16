import React, {Component} from "react";
import { Link } from "react-router-dom"; 
import firebase from 'firebase/compat/app';
import { getFirestore, collection, getDocs, getDoc, doc, setDoc, updateDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import {db} from "./firebase-config";


export default class Landing extends React.Component {
    constructor(props) {
        super(props);
    }

    

    componentDidMount() {
        
    }



    render() {
        return (
            <div className="landing">
                
            </div>
        );
    }
}
import React, {useRef, useState, useEffect} from "react";
import { Link, useOutletContext } from "react-router-dom";
import "./styles/profiles.css";
import { getAuth, deleteUser, signOut } from "firebase/auth";
import { getFirestore, collection, getDocs, addDoc, query,getDoc, doc, setDoc, updateDoc, deleteDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase-config";
import { JSEncrypt } from 'jsencrypt';
import { getApp } from "firebase/app";
import {getStorage, ref, uploadBytesResumable, getDownloadURL} from "firebase/storage";

import NoCred from "../lose_social_credit.jpeg";
import GotCred from "../social-credit.jpg";

import "../App.css";

const storage = getStorage(getApp(), "gs://web-fdr-notification.appspot.com");
let arr = []; // DONT REMOVE THIS. USESTATE DOES NOT WORK LIKE YOU THINK
export default function Resultsform(props) {
    const userSearchRef = useRef("");
    const [searchResults, setSearchResults] = useState([]);
    const [school, setSchool] = useState("");
    const add_news_ref2 = useRef("");
    const text_news_ref2 = useRef("");



      const state_ctx_props = useOutletContext(); //all our data here basically

      const add_club = async() => {
        await setDoc(doc(db, `schools`, `${state_ctx_props.school_select}/clubs/${add_news_ref2.current.value}/posts/0`), {
          description: text_news_ref2.current.value
        });
        
    }

   
    
 

    async function schoolInfo() {
        const schoolRef = doc(db, `schools/${state_ctx_props.school_select}`);
        await getDoc(schoolRef).then((school_data) => {
          setSchool(school_data.data());
        });      
    }
 
 


    return (
        <div>

<div className="main-form">
<h1 className="text-primary">Add club</h1>
  <div className="form-row">
    <div className="form-group flex-column">
      <label htmlFor="inputEmail4" className="text-primary">Title</label>
      <input className="form-control" ref={add_news_ref2} id="inputEmail4" placeholder="Title"/>
      <label htmlFor="postbox" className="text-primary">description</label><br />
      <textarea ref={text_news_ref2} placeholder="Write here..." className="form-control"></textarea>
    </div>
</div>
  <div className="form-group">
    <div className="form-check">
      select an image for your club<br/>
      <input className="form-check-input" type="file" id="gridCheck"/>
    </div>
  </div>
  <button  className="btn btn-primary" onClick={add_club}>Sign in</button>

</div>
        </div>
        
    );
}

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
export default function Newsform(props) {
    const userSearchRef = useRef("");
    const [searchResults, setSearchResults] = useState([]);
    const [school, setSchool] = useState("");
    const add_news_ref2 = useRef("");
    const text_news_ref2 = useRef("");
    let imgs_t = [];
  

    const [img, setImg] = useState([]);


      const state_ctx_props = useOutletContext(); //all our data here basically
      async function uploadImage_news(e) {
        for(let i = 0; i < e.target.files.length; i++) {
            const storageRef = ref(storage, `images/${state_ctx_props.id}/${e.target.files[i].name}`);
            const uploadTask = uploadBytesResumable(storageRef, e.target.files[i]);
            await uploadTask.on('state_changed', (snap) => {
                if(snap.state === "running") {
                console.log(snap.state);
                }
            }, (err) => {
                console.log("error upload");
            }, () => {
                getDownloadURL(uploadTask.snapshot.ref).then((url) => {
                    imgs_t.push(url);
                })
            });
        }
        setImg(imgs_t);
    }
      const add_news = async() => {
        const docRef2 = await addDoc(collection(db, `schools/${state_ctx_props.school_select}/news`), {
            title: add_news_ref2.current.value,
          text: text_news_ref2.current.value,
          img:img,
          date: serverTimestamp()
        });
        add_news_ref2.current.value = "";
        text_news_ref2.current.value = "";
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
      <input className="form-check-input"onChange={uploadImage_news}  type="file" id="gridCheck"/>
    </div>
  </div>
  <button  className="btn btn-primary" onClick={add_news}>Sign in</button>

</div>
        </div>
        
    );
<<<<<<< Updated upstream
<<<<<<< Updated upstream
}
=======
=======
>>>>>>> Stashed changes
<<<<<<< HEAD
}
=======
}
>>>>>>> 760ece13dd06d09404edd3925a2e25b81586cf33
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes

import React, {useEffect, useRef, useState} from "react";
import { Link, Outlet, useOutletContext } from "react-router-dom"; 
import firebase from 'firebase/compat/app';
import { getApp } from "firebase/app";
import {getStorage, ref, uploadBytesResumable, getDownloadURL} from "firebase/storage";
import Rive, { useRive } from '@rive-app/react-canvas';
import { getFirestore, collection, getDocs, addDoc, query,getDoc, doc, setDoc, updateDoc, deleteDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import {getAuth,signOut} from "firebase/auth";
import {db} from "./firebase-config";
import Glogo from "./logo.svg";
import "./App.css";


const storage = getStorage(getApp(), "gs://web-fdr-notification.appspot.com");


function Landing() {
    const ctxprops = useOutletContext();
    const [clubdir, setClubdir] = useState([]);
    function logout() {
        const auth = getAuth();
        signOut(auth).then(() => {
          this.setState({logged: false});
          window.location.reload();
        }).catch((error) => {console.log("no error")})
    }
    async function getClubs() {
        const q = query(collection(db, `schools/${ctxprops.school_select}/clubs`));
        const g = await getDocs(q);
        let i_t = [];g.forEach(doc => {i_t.push({"club_data": doc.data(), "club_id": doc.id});})
        setClubdir(i_t);
    } 
    async function getConns() {

    }
    function drawingCanvas() {
        const canvas = document.querySelector(".canvas-connections");
        const ctx = canvas.getContext("2d");
        const img = document.getElementById("glogo");
        ctx.drawImage(img, 10, 10);
    }
    useEffect(() => {
        getClubs();
        drawingCanvas();
    }, []);
    return (
        <div className="landing">
            <img src={Glogo} width="50px" height="50px" id="glogo"/>
            <canvas className="canvas-connections">
                {clubdir ? clubdir.map((club_obj, i) => (
                        <a key={i} style={{textDecoration: 'underline', color: 'blue', cursor: 'pointer'}}>{club_obj.club_id}</a>
                )) : null}
            </canvas>
        </div>
    )
}

export default Landing;
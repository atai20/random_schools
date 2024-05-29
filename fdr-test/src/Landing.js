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
let conns_arr = [];

function Landing() {
    const ctxprops = useOutletContext();
    const [clubdir, setClubdir] = useState([]);
    const [school, setSchool] = useState("");
    function logout() {
        const auth = getAuth();
        signOut(auth).then(() => {
          this.setState({logged: false});
          window.location.reload();
        }).catch((error) => {console.log("no error")})
    }
    async function getClubs(school_number) {
        schoolInfo(school_number);
        const q = query(collection(db, `schools/${school_number}/clubs`));
        const g = await getDocs(q);
        let i_t = [];g.forEach(doc => {i_t.push({"club_data": doc.data(), "club_id": doc.id});});
        conns_arr.push(i_t);
    } 
    function drawingCanvas() {
        // console.log(conns_arr.flat());
        const canvas = document.querySelector(".canvas-connections");
        const ctx = canvas.getContext("2d");
        ctx.font = "10px Arial";
        // console.log(clubdir);
        conns_arr.flat().map((club_obj, i) => {
            // console.log(club_obj)
            ctx.fillText(school.name+"/"+club_obj.club_id,club_obj.club_data.element_position.x,club_obj.club_data.element_position.y);
            club_obj.club_data.connections.map((conn, j) => {
                console.log(conn);
                // // just draw the connections names and stuff, then draw sum lines lol
                
            })
            if(i+1 < clubdir.length) { //however, we can only have the set of connections
                    // ctx.fillText(conn, clubdir[i+1].club_data.element_position.x, clubdir[i+1].club_data.element_position.y);
                    ctx.beginPath();
                    ctx.moveTo(club_obj.club_data.element_position.x,club_obj.club_data.element_position.y);
                    ctx.lineTo(clubdir[i+1].club_data.element_position.x, clubdir[i+1].club_data.element_position.y);
                    ctx.strokeStyle = '#000';
                    ctx.stroke();
                }
            
        })
    }
    async function schoolInfo(school_number) {
        const schoolRef = doc(db, `schools/${school_number}`);
        await getDoc(schoolRef).then((school_data) => {
          setSchool(school_data.data());
        });

    }
    useEffect(() => {
        getClubs(1);
        getClubs(2);
    }, []);
    useEffect(() => {
        const canvas = document.querySelector(".canvas-connections");
        if(conns_arr.length > 0) {
            conns_arr.flat().map((club_obj, i) => {
                club_obj.club_data.element_position = {"x": Math.floor(Math.random()*(canvas.width-20)), "y": Math.floor(Math.random()*(canvas.height-20))};
            })
            drawingCanvas();
        }
    }, [school]);
    return (
        <div className="landing">
            <canvas className="canvas-connections">
            </canvas>
        </div>
    )
}

export default Landing;
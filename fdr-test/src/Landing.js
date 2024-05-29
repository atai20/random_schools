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
import "./FireLoad.css";

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
      
    async function getClubs(school_number, sname) {
        console.log(school_number, " : ", sname);
        const q = query(collection(db, `schools/${school_number}/clubs`));
        const g = await getDocs(q);
        let i_t = [];g.forEach(doc => {i_t.push({"club_data": doc.data(), "club_id": doc.id, "school_name": sname});});
        conns_arr.push(i_t);
        setClubdir(i_t);
    } 
    function connSearch(arr, searchKey) {
        return arr.flat().filter(obj => obj.school_name+"/"+obj.club_id === searchKey);
    }
    function drawingCanvas() {
        // console.log(conns_arr.flat());
        const canvas = document.querySelector(".canvas-connections");
        const ctx = canvas.getContext("2d");
        window.devicePixelRatio=4;
        var size = 1250;
        canvas.style.width = size + "px"; 
        canvas.style.height = size + "px"; 
        var scale = window.devicePixelRatio;  
        canvas.width = Math.floor(size * scale); 
        canvas.height = Math.floor(size * scale); 
        ctx.scale(scale, scale);

        ctx.font = "15px Arial";

        conns_arr.flat().map((club_obj, i) => {
            // console.log(club_obj)
            ctx.fillText(club_obj.school_name+"/"+club_obj.club_id,club_obj.club_data.element_position.x,club_obj.club_data.element_position.y);
            club_obj.club_data.connections.map((conn, j) => {
                if(conn !== "") {
                    let conn_obj = connSearch(conns_arr, conn);
                    if(conn_obj.length > 0 ) {
                        ctx.beginPath();
                        ctx.moveTo(club_obj.club_data.element_position.x,club_obj.club_data.element_position.y);
                        ctx.lineTo(conn_obj[0].club_data.element_position.x, conn_obj[0].club_data.element_position.y);
                        ctx.stroke();
                    }
                }
                
            })
        })
    }
    async function schoolInfo(school_number) {
        const schoolRef = doc(db, `schools/${school_number}`);
        await getDoc(schoolRef).then((school_data) => {
            // console.log(school_data);
            getClubs(school_number, school_data.data().name);
            setSchool(school_data.data().name);
        });
        // return school;
    }
    useEffect(() => {
        schoolInfo(1); //FDR
        schoolInfo(2); //Fake Stuyvesant
        
    }, []);
    useEffect(() => {
        const canvas = document.querySelector(".canvas-connections");
        // console.log(canvas);
        if(conns_arr.length > 0) {
            conns_arr.flat().map((club_obj, i) => {
                club_obj.club_data.element_position = {"x": Math.floor(Math.random()*(canvas.clientWidth-20)), "y": Math.floor(Math.random()*(canvas.clientHeight-20))};
            })
            drawingCanvas();
        } 
    },[school,clubdir])
    return (
        <div className="landing">
            <canvas className="canvas-connections">
            </canvas>
            {clubdir ? null : 
            <div class="container-animation">
            <div class="campfire-wrapper">
                <div class="tree-container-back">
                    <div class="tree-8"></div>
                    <div class="tree-9"></div>
                    <div class="tree-10"></div>
                </div>
                <div class="rock-container">
                    <div class="rock-big"></div>
                    <div class="rock-small">
                        <div class="rock-1"></div>
                        <div class="rock-2"></div>
                        <div class="rock-3"></div>
                        <div class="rock-4"></div>
                    </div>
                </div>
                <div class="smoke-container">
                    <svg className="smokey-smoke">
                    <path className="path-smoke" d="M 150 0 Q 200 100 100 250 C 0 450 120 400 50 600  " />
                </svg>
                    <div class="fire-container">
        
                        <div class="flame-1"></div>
                        <div class="flame-2"></div>
                        <div class="flame-3"></div>
                    </div>
                </div>
                <div class="tree-container-front">
                    <div class="tree-1"></div>
                    <div class="tree-2"></div>
                    <div class="tree-3"></div>
                    <div class="tree-4"></div>
                    <div class="tree-5"></div>
                    <div class="tree-6"></div>
                    <div class="tree-7"></div>
                </div>
            </div>
        </div>
            
            }
        </div>
    )
}

export default Landing;
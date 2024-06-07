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

import Tree from 'react-d3-tree';



const storage = getStorage(getApp(), "gs://web-fdr-notification.appspot.com");
let conns_arr = [];
let if_tr = false;
let na = "";
const orgChart = {
    name: 'You',
    children: [],
  };
  


  



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
     
        conns_arr.flat().map((club_obj, i) => {
            // console.log(club_obj)
            na = club_obj.club_id;
            orgChart["children"].push({name:na});
          
        });
       
        return(<div id="treeWrapper">
        <Tree data={orgChart} />
      </div>);
       
        
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

{drawingCanvas()}


<div class="card purple">
    <div class="rubik-mono-one-regular">
    <h1>Careers</h1>
</div>
<div class="varela-round-regular">
    <p>Here is a paragraph of text than</p><button className = "butt_on">Sign Up</button>
</div>
</div>
  <div class="card green">
    <div class="rubik-mono-one-regular">
    <h1>International students</h1>
</div>
<div class="varela-round-regular">
    <p>Here is a paragraph of text than</p>
<button className = "butt_on">Sign Up</button>
</div>
  </div>
<div class="card"><h2>Lethal company internship</h2>You will die like in 5 minutes</div>



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
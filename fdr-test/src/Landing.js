import React, {useEffect, useRef, useState, useCallback} from "react";
import { Link, Outlet, useOutletContext } from "react-router-dom"; 
import firebase from 'firebase/compat/app';
import { getApp } from "firebase/app";
import {getStorage, ref, uploadBytesResumable, getDownloadURL} from "firebase/storage";
import Rive, { useRive } from '@rive-app/react-canvas';
import { getFirestore, collection, getDocs, addDoc, query,getDoc, doc, setDoc, updateDoc, deleteDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import {getAuth,signOut} from "firebase/auth";
import {db} from "./firebase-config";
import Glogo from "./logo.svg";
import "reactflow/dist/style.css";
import "./App.css";
import "./FireLoad.css";
import "./Fire2d.scss";

// import Tree from 'react-d3-tree'; //we dont need tree structure: if clubs share multiple connections we will have inefficiency (repetition/infinite loop)
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
} from "reactflow";


const storage = getStorage(getApp(), "gs://web-fdr-notification.appspot.com");
let conns_arr = [];

let initialNodes = [];
let initialEdges = [];


function Landing() {
    const ctxprops = useOutletContext();
    const [clubdir, setClubdir] = useState([]);
    const [school, setSchool] = useState("");
    const [loaded, setLoaded] = useState(false);
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
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );
    function displayMap() {
        setLoaded(true);
    }
    useEffect(() => { //TODO: make more efficient!
        if(conns_arr.length > 0) {
            conns_arr.flat().map((club_obj, i) => { //O(n)
                initialNodes.push({
                    id: club_obj.school_name+"/"+club_obj.club_id, 
                    position: {x: Math.floor(Math.random()*(0.9*window.innerWidth)), y: Math.floor(Math.random()*(0.9*window.innerHeight))},
                    data: {label: club_obj.school_name+"/"+club_obj.club_id}
                });
                if(club_obj.club_data.connections.length>0) {
                    club_obj.club_data.connections.map((conn, j) => {
                        let conn_obj = connSearch(conns_arr, conn); //O(2n^2) total
                        if(conn_obj.length > 0 ) {
                            initialEdges.push({
                                id: 'e'+(club_obj.school_name+"/"+club_obj.club_id)+'-'+conn_obj[0].school_name+"/"+conn_obj[0].club_id,
                                source: club_obj.school_name+"/"+club_obj.club_id,
                                target: conn_obj[0].school_name+"/"+conn_obj[0].club_id,
                            })
                        }       
                    })
                }
            })
            displayMap();
        }
    },[school,clubdir]); //should execute when the states load
    return (
        <div className="landing">
            {loaded ? 
            <div style={{ width: "100%", height: "80vh" }}>
              <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              fitView
            >
              <Controls />
              <MiniMap />
              <Background gap={12} size={1} />
            </ReactFlow> </div> : 
            

<div className="fireloading-body-wrap">
    <h1 style={{fontSize: '50px', color: "#fff"}}>Map rendering...</h1>
    <div className="fireloading-2d">
    <div className="flames-2d">
        <div className="flame-2d"></div>
        <div className="flame-2d"></div>
        <div className="flame-2d"></div>
        <div className="flame-2d"></div>
    </div>
    </div>
</div>


            }
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
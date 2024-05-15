import React, {Component, useRef, useState} from "react";
import { Link, Outlet, useOutletContext } from "react-router-dom"; 
import firebase from 'firebase/compat/app';
import { getApp } from "firebase/app";
import {getStorage, ref, uploadBytesResumable, getDownloadURL} from "firebase/storage";
import Rive, { useRive } from '@rive-app/react-canvas';
import { getFirestore, collection, getDocs, addDoc, query,getDoc, doc, setDoc, updateDoc, deleteDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import {getAuth,signOut} from "firebase/auth";
import {db} from "./firebase-config";
import "./App.css";


const storage = getStorage(getApp(), "gs://web-fdr-notification.appspot.com");

const OutletProvider = ({children}) => {
    const ctx = useOutletContext();
    return typeof children === 'function' ? children(ctx) : children;
}
//
class Landing extends React.Component {
    constructor(props) {
        super(props);
        this.mynews_text = React.createRef();
        this.state = {
            showMe:true
        }
    }

    
    logout() {
        const auth = getAuth();
        signOut(auth).then(() => {
          this.setState({logged: false});
          window.location.reload();
        }).catch((error) => {console.log("no error")})
    }

    componentDidMount() {
        // getDoc()
    }

    
   
    //Main feed page
    render() {
        return (
            <div className="landing">
                <button onClick={this.logout} className="btn">logout landing</button>
            
          
                
                <OutletProvider>
                    {
                    
                    (outletCtxProps) => {
                        const [news_text, setNews] = useState([]);
                        let imgs_t = [];
                        let news_t = [];
                        const rive = useRive();
                       
                       
                    
                        // const ctxprops = useOutletContext();
                        const [img, setImg] = useState([]);
                        const add_news_ref = useRef("");
                        const text_news_ref = useRef("");
                       
                        const  dissapear = async() => {
                            this.setState({
                                showMe:false,
                                showMe2:true
                    
                            })      
                        }
                        const  dissapear2 = async() => {
                            this.setState({
                                showMe2:false,
                                showMe3:true
                    
                            })      
                        }
                        const  dissapear3 = async() => {
                            this.setState({
                                showMe3:false,
                                showMe4:true

                    
                            })      
                        }
                        const  dissapear_teach = async() => {
                            this.setState({
                                showMe4:false,
                                showMe_teach:true
                            })      
                        }
                        const  dissapear_stud = async() => {
                            this.setState({
                                showMe4:false,
                                showMe_stud:true
                            })      
                        }
                        const get_news = async() => {
                          const q = query(collection(db,`schools/${outletCtxProps.school_select}/news`));
                          const docsRef = await getDocs(q);
                          
                          docsRef.forEach(doc => {

                            news_t.push(doc.data())

                          });
                          setNews(news_t);
                        }
                        // get_news();
                        return (
                        
                        <div>
<div className="center_news">


 
 
 {this.state.showMe?
 <div class="d-flex">
  <div class="d-inline-block"><Rive  src='firey.riv'ref={rive} style={{height:"400px", width:"300px"}}/></div>
 <div class="d-inline-block"> 
 <div class="chat"  onClick={() => dissapear()}  >
    Hello! My name is Firey
    </div> 
    </div> 
    </div> 

   :null}
   
   {this.state.showMe2?
 <div class="d-flex">

    <div class="d-inline-block"><Rive src='firey_reg.riv' stateMachines='State Machine 1'style={{height:"400px", width:"300px"}}/></div>
   <div class="d-inline-block"> 
 <div class="chat"  onClick={() => dissapear2()}  >
    I hope you will get an amazing experience!
    </div> 
    </div> 
    </div> 
   :null}
    {this.state.showMe3?
     <div class="d-flex">
     <div class="d-inline-block"><Rive src='firey.riv' stateMachines='State Machine 1'style={{height:"400px", width:"300px"}}/></div>
    <div class="d-inline-block"> 
 <div class="chat"  onClick={() => dissapear3()}  >
    Let's set everything up
    </div> 
    </div> 
    </div> 

   :null}
    {this.state.showMe4?
     <div class="d-flex">

     <div class="d-inline-block"><Rive src='firey.riv' stateMachines='State Machine 1'style={{height:"400px", width:"300px"}}/></div>
    <div class="d-inline-block"> 
 <div class="chat"  >
    First of all are you a teacher or a student?
    </div> 
       <button id="my_teacher_b"class="btn shadow-none" onClick={() => dissapear_teach()}  >teacher</button>
    <button id="my_student_b"class="btn shadow-none" onClick={() => dissapear_stud()}  >student</button>
    </div> 
    </div> 
   :null}

{this.state.showMe_teach?
     <div class="d-flex">

     <div class="d-inline-block"><Rive src='firey_reg.riv' stateMachines='State Machine 3'style={{height:"400px", width:"300px"}}/></div>
    <div class="d-inline-block"> 
 <div class="chat">
    For what clubs are you a teacher?
    </div> 
    <div className="clubs_but">
    <button id="my_teacher_b"class="btn shadow-none" onClick={() => dissapear_teach()}  >Key Club</button>
    <button id="my_student_b"class="btn shadow-none" onClick={() => dissapear_stud()}  >Robotics club</button>
    <button id="my_teacher_b"class="btn shadow-none" onClick={() => dissapear_teach()}  >Key Club</button>
    <button id="my_student_b"class="btn shadow-none" onClick={() => dissapear_stud()}  >Robotics club</button>
    <button id="my_teacher_b"class="btn shadow-none" onClick={() => dissapear_teach()}  >Key Club</button>
    <button id="my_student_b"class="btn shadow-none" onClick={() => dissapear_stud()}  >Robotics club</button>
    </div>
    </div> 
    </div> 
   :null}

{this.state.showMe_stud?
     <div class="d-flex">

     <div class="d-inline-block"><Rive src='firey.riv' stateMachines='State Machine 1'style={{height:"400px", width:"300px"}}/></div>
    <div class="d-inline-block"> 
 <div class="chat"  >
    What clubs are you in?
    </div> 
    <div className="clubs_but">
    <button id="my_teacher_b"class="btn shadow-none" onClick={() => dissapear_teach()}  >Key Club</button>
    <button id="my_student_b"class="btn shadow-none" onClick={() => dissapear_stud()}  >Robotics club</button>
    <button id="my_teacher_b"class="btn shadow-none" onClick={() => dissapear_teach()}  >Key Club</button>
    <button id="my_student_b"class="btn shadow-none" onClick={() => dissapear_stud()}  >Robotics club</button>
    <button id="my_teacher_b"class="btn shadow-none" onClick={() => dissapear_teach()}  >Key Club</button>
    <button id="my_student_b"class="btn shadow-none" onClick={() => dissapear_stud()}  >Robotics club</button>
    </div>
    </div> 
    </div> 
   :null}
  
    
    </div>

                        </div>
                        );
                    }}
                </OutletProvider>
            </div>
        );
    }
}

export default Landing;
import React, {Component, useRef, useState} from "react";
import { Link, Outlet, useOutletContext } from "react-router-dom"; 
import firebase from 'firebase/compat/app';
import { getApp } from "firebase/app";
import {getStorage, ref, uploadBytesResumable, getDownloadURL} from "firebase/storage";
import { useRive } from '@rive-app/react-canvas';
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
                    {(outletCtxProps) => {
                        const [news_text, setNews] = useState([]);
                        let imgs_t = [];
                        let news_t = [];
                        const { rive, RiveComponent } = useRive({
                          src: 'firey.riv',
                          stateMachines: "State Machine 1",
                        autoplay: true,
                        });
                        // const ctxprops = useOutletContext();
                        const [img, setImg] = useState([]);
                        const add_news_ref = useRef("");
                        const text_news_ref = useRef("");
                     
                        const add_news = async() => {
                            const docRef2 = await addDoc(collection(db, `schools/${outletCtxProps.school_select}/news`), {
                                title: add_news_ref.current.value,
                              text: text_news_ref.current.value,
                              img:img,
                              date: serverTimestamp()
                            });
                            add_news_ref.current.value = "";
                            text_news_ref.current.value = "";
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
<div class="d-flex">
 <div class="d-inline-block"><RiveComponent style={{height:"400px", width:"300px"}}/></div>
 <div class="d-inline-block"> <div class="chat">
    Hello! My name is Firey
    </div> </div>
    </div>
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

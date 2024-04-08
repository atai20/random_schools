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
                        const ctxprops = useOutletContext();
                        const [img, setImg] = useState([]);
                        const add_news_ref = useRef("");
                        const text_news_ref = useRef("");
                        async function uploadImage(e) {
                          for(let i = 0; i < e.target.files.length; i++) {
                              const storageRef = ref(storage, `images/${ctxprops.id}/${e.target.files[i].name}`);
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

                        // console.log(outletCtxProps);
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
                        get_news();
                        return (
                        
                        <div>
<div class="d-flex">
 <div class="d-inline-block"><RiveComponent style={{height:"400px", width:"500px"}}/></div>
 <div class="d-inline-block"> <div class="chat">
    Hello! My name is Firey
    </div> </div>
</div>
{/* <form>
  <div class="form-row">
    <div class="form-group col-md-6">
      <label for="inputEmail4">Publish post or make a challenge</label>
      <input type="email" class="form-control" id="inputEmail4" placeholder="post description"/>
      
      <input type="checkbox" className="posttype_check" id="checker"/><label htmlFor="checker">challenge</label>
      <input type="email" class="form-control" id="inputEmail4" placeholder="due date *only for challenge"/>
    </div>
</div>
  <div class="form-group">
    <div class="form-check">
      <input class="form-check-input" type="checkbox" id="gridCheck"/>
      <label class="form-check-label" for="gridCheck">
        Check me out
      </label>
    </div>
  </div>
  <button className="submit-info" id="submit-info" onClick={this.create_post}>Submit</button>
</form>
<h1>write results for week</h1>
<form>
  <div class="form-row">
    <div class="form-group col-md-6">
      <label for="inputEmail4">Email</label>
      <input type="email" class="form-control" id="inputEmail4" placeholder="Email"/>
    </div>
</div>
  <div class="form-group">
    <div class="form-check">
      <input class="form-check-input" type="checkbox" id="gridCheck"/>
      <label class="form-check-label" for="gridCheck">
        Check me out
      </label>
    </div>
  </div>
  <button type="submit" class="btn btn-primary">Sign in</button>
</form>
<h1>Write results for month</h1>
<form>
  <div class="form-row">
    <div class="form-group col-md-6">
      <label for="inputEmail4">Email</label>
      <input type="email" class="form-control" id="inputEmail4" placeholder="Email"/>
    </div>
</div>
  <div class="form-group">
    <div class="form-check">
      <input class="form-check-input" type="checkbox" id="gridCheck"/>
      <label class="form-check-label" for="gridCheck">
        Check me out
      </label>
    </div>
  </div>
  <button type="submit" class="btn btn-primary" onClick={this.create_post}>Sign in</button>
</form> */}


{/* <h1>Add school</h1>
<form>
  <div class="form-row">
    <div class="form-group col-md-6">
      <label for="inputEmail4">school name</label>
      <input type="email" class="form-control" ref={this.mynews_text} id="inputEmail4" placeholder="Email"/>
    </div>
</div>
<div class="form-row">
    <div class="form-group col-md-6">
      <label for="inputEmail4">description</label>
      <input type="email" class="form-control" ref={this.mynews_text} id="inputEmail4" placeholder="Email"/>
    </div>
</div>
<div class="form-row">
    <div class="form-group col-md-6">
      <label for="inputEmail4">image</label>
      <input type="file" class="form-control" ref={this.mynews_text} src="img/img.png"  id="inputEmail4" placeholder="Email"/>
    </div>
</div>

  
  <button class="btn btn-primary" onClick={this.add_news}>Sign in</button>
</form>


<h1>Give out talent points: 20</h1>
<form>
<div class="form-row">
    <div class="form-group col-md-6">
      <label for="inputEmail4">Atai</label>
      <input type="email" class="form-control" id="inputEmail4" placeholder="number"/>
    </div>
</div>
<div class="form-row">
    <div class="form-group col-md-6">
      <label for="inputEmail4">Giliana</label>
      <input type="email" class="form-control" id="inputEmail4" placeholder="number"/>
    </div>
</div>
<div class="form-row">
    <div class="form-group col-md-6">
      <label for="inputEmail4">Sam</label>
      <input type="email" class="form-control" id="inputEmail4" placeholder="number"/>
    </div>
</div>
  
  <button type="submit" class="btn btn-primary" onClick={this.create_post}>Sign in</button>
</form> */}

                        </div>
                        );
                    }}
                </OutletProvider>
            </div>
        );
    }
}

export default Landing;
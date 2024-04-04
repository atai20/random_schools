import React, {Component, useRef, useState} from "react";
import { Link, Outlet, useOutletContext } from "react-router-dom"; 
import firebase from 'firebase/compat/app';
import { getFirestore, collection, getDocs, addDoc, query,getDoc, doc, setDoc, updateDoc, deleteDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import {getAuth,signOut} from "firebase/auth";
import {db} from "./firebase-config";
import "./App.css";

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
                <p className="text-primary">you made it...</p>
                <Link to={"/profile"} className="text-primary">go to ur profile</Link>
                
                <OutletProvider>
                    {(outletCtxProps) => {
                         const [news_text, setNews] = useState([]);
                        
                         let news_t = [];
 
 
                         const add_news_ref = useRef("");
                        const text_news_ref = useRef("");
                        console.log(outletCtxProps);
                        const add_news = async() => {
                            const docRef2 = await addDoc(collection(db, `schools/${outletCtxProps.school_select}/news`), {
                                title: add_news_ref.current.value,
                              text: text_news_ref.current.value,
            
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

<h1 className="text-primary">Add news</h1>
  <div className="form-row">
    <div className="form-group col-md-6">
      <label htmlFor="inputEmail4" className="text-primary">Title</label>
      <input className="form-control" ref={add_news_ref} id="inputEmail4" placeholder="Title"/>
      <label htmlFor="postbox" className="text-primary">Content</label><br />
      <textarea ref={text_news_ref} placeholder="Write here..." className="form-control"></textarea>
    </div>
</div>
  <div className="form-group">
    <div className="form-check">
      <input className="form-check-input" type="checkbox" id="gridCheck"/>
      <label className="form-check-label text-primary" for="gridCheck" >
        Check me out (what does this do?????)
      </label>
    </div>
  </div>
  <button  class="btn btn-primary" onClick={add_news}>Sign in</button>

  {news_text.map((data) => (
 <div>

   {data.title}<br></br>
 {data.text}

 </div>

))}

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
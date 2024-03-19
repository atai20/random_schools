import React, {Component, useRef} from "react";
import { Link, Outlet, useOutletContext } from "react-router-dom"; 
import firebase from 'firebase/compat/app';
import { getFirestore, collection, getDocs, addDoc, getDoc, doc, setDoc, updateDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import {getAuth,signOut} from "firebase/auth";
import {db} from "./firebase-config";

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
                <button onClick={this.logout}>logout landing</button>
                <p>you made it...</p>
                <Link to={"/profile"}>go to ur profile</Link>
                
                <OutletProvider>
                    {(outletCtxProps) => {
                        const add_news_ref = useRef("");
                        console.log(outletCtxProps);
                        const add_news = async() => {
                            const node = add_news_ref.current.value;
                            const docRef2 = await addDoc(collection(db, `schools/${outletCtxProps.school_select}/news`), {
                              text: node.toString(),
                              date: "01/01/01"
                            });
                        }
                        return (
                        
                        <div>

<form>
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
</form>

<h1>Add news</h1>

  <div class="form-row">
    <div class="form-group col-md-6">
      <label for="inputEmail4">Email</label>
      <input type="email" class="form-control" ref={add_news_ref} id="inputEmail4" placeholder="Email"/>
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
  <button  class="btn btn-primary" onClick={add_news}>Sign in</button>



<h1>Add school</h1>
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
</form>

                        </div>
                        
                        );
                    }}
                </OutletProvider>
            </div>
        );
    }
}

export default Landing;
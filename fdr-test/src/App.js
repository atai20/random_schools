import React from "react";
import './App.css';
import firebase from 'firebase/compat/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, deleteUser, signInAnonymously, signInWithPopup, createUserWithEmailAndPassword, GoogleAuthProvider  } from "firebase/auth";
import { getFirestore, collection, getDocs, getDoc, doc, setDoc, updateDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import {db} from "./firebase-config";
import { Link, Outlet, useLocation, redirect } from 'react-router-dom';
import Defaultpfp from "./default.png";
import Megamind from "./megamind.webp";

const gp = new GoogleAuthProvider();
const auth = getAuth();

export default class App extends React.Component {
  constructor(props) {
      super(props);
      this.state = {
        loaded: false,
      }
      this.emailInputRef = React.createRef();
      this.passwordRef = React.createRef();
      this.emaillog = React.createRef();
      this.passlog = React.createRef();
      this.getuname = React.createRef();
      this.getosis = React.createRef();
      // this.getclubs 
  }
  logout() {
    const auth = getAuth();
    signOut(auth).then(() => {
      this.setState({logged: false});
      window.location.reload();
    }).catch((error) => {console.log("no error")})
  }
  google_auth = async () => {
      await signInWithPopup(auth, gp).then((res) => {
        const user = doc(db, `schools/1/users`, auth.currentUser.uid);
        setDoc(user, {
          name: res.user.displayName,
          email: res.user.email,
          verified: res.user.emailVerified,
          id: res.user.uid,
          role: "regular",
          osis: null,
          clubs: [],
        }).then(() => console.log("written successfully")).catch((error) => {
          switch(error) {
            case "auth/popup-closed-by-user":
              console.log("no error");
              break;
            default:
              break;
          }
        });
      })
      this.setState({logged: true});
  }


  emailpass_auth = async (email,pass) => {
    await createUserWithEmailAndPassword(auth, email, pass).then((res) => {
      const docRef = doc(db, "schools/1/users", auth.currentUser.uid);
      setDoc(docRef, {
          email: email,
          id: res.user.uid,
          verified: res.user.emailVerified,
          role: "regular",
          name: null,
          osis: null,
          clubs: [],
      }).then(() => {console.log("written")}).catch(er => {console.log(er)});
      this.setState({logged: true});
  }).catch((er) => {
      console.log(er);
      switch(er.code) {
          case 'auth/email-already-in-use':
              console.log("the email is in use");
              break;
          case 'auth/weak-password':
            console.log("NOOOOOOOOOOOOOO goofy ass weak ass lookin password");
          default:
              console.log(er);
              break;
      }
  });
  }

  manLogin = async(email, pass) => {
    const auth = getAuth();
    await signInWithEmailAndPassword(auth, email, pass).then((res) => {
      console.log("success log in");
      this.setState({logged: true});
    })
  }

  anon_login = async () => {
    const auth = getAuth();
    await signInAnonymously(auth);
  }

  componentDidMount() {
    this.setState({loaded: true});
    const auth = getAuth();
    onAuthStateChanged(auth, user => {
      if(!user) {
        this.setState({
          logged: false,
        })
      } else {
        this.setState({
          logged: true,
          username: user.displayName || null,
          osis: null,
          email: user.email,
          id: user.uid,
          pfp: user.photoURL || Defaultpfp,
        });
        //rolesw update
        const current_user = doc(db, "schools/1/users", auth.currentUser.uid);
        let fill_data = getDoc(current_user).then((data) => {
          this.setState({role: data.data().role, clubs: data.data().clubs});
        });
      }
    });
  }


  updateUserInfo = () => {
    const checkboxes = document.querySelectorAll(".clubcheck");
    let clubsArr = [];
    for(let i = 0; i < checkboxes.length; i++) {
      if(checkboxes[i].value) {
        clubsArr.push(checkboxes[i].id.toString());
      }
    }
    const docRef = doc(db, "schools/1/users", this.state.id);
    updateDoc(docRef, {
      username:( this.getuname !== null ? this.getuname.current.value : this.state.username ),
      osis: this.getosis.current.value, //encrypted of course,
      clubs: clubsArr,
    });
    this.setState({
      username: this.getuname.current.value,
      osis: this.getosis.current.value, //encrypted of course,
      clubs: clubsArr,
    })
  }
  


  render() {
    if(this.state.loaded) {
      if(!this.state.logged) {
        return (
          <div className="register">
            <button onClick={this.google_auth}>glogo login with google</button>
            <input type="email" name="email" id="email" ref={this.emailInputRef} />
            <input type="password" name="password" id="pass" ref={this.passwordRef} />
            <button onClick={() => this.emailpass_auth(this.emailInputRef.current.value,this.passwordRef.current.value)}>register</button>
            <button onClick={this.anon_login}>become anon</button>
  
            <h3>woah another login</h3>
            <input type="email" ref={this.emaillog} />
            <input type="password" ref={this.passlog} />
            <button onClick={() => this.manLogin(this.emaillog.current.value,this.passlog.current.value)}>login riht now</button>
          </div>
        );
      } else {
        console.log(this.state.clubs);
        return (
          <div className="landing">
            <nav>
              TODO navbar
            </nav>
            <Outlet />
            <p>i am: {this.state.username !== null ? this.state.username : "anon"}</p>
            <img src={this.state.pfp} width={200} height={200} />
            <button onClick={this.logout}>logout</button>
        
            {(this.state.clubs) ?
            (this.state.clubs.length === 0) ? 
            (
            <div id="popup-questions">
                <div>BUT FIRST OSOME QUESTIONS!!</div>
                {this.state.username === null && this.state.osis === null ? (
                <div>
                    <p>what is name bruh</p>
                    <input type="text" placeholder="name" />
                </div>
                ) : null}
                <p>what is your osis numbre (student id) hint : check your id card or smth</p>
                <input type="text" placeholder="osis" ref={this.getosis} />
                <p>clubs you in???</p>
                {/* <select> */}
                <input type="checkbox" className="clubcheck" id="math" /><label for="math">Math</label>
                <input type="checkbox" className="clubcheck" id="CS" /><label for="math">Computer scientce</label>
                <input type="checkbox" className="clubcheck" id="key" /><label for="math">key club</label>
                <input type="checkbox" className="clubcheck" id="robotics" /><label for="math">robitcs</label>
                <input type="checkbox" className="clubcheck" id="physics" /><label for="math">physics</label>
                {/* </select> */}
                {/* <img src={Megamind} width={500} height={500} /> */}
                <button className="submit-info" id="submit-info" onClick={this.updateUserInfo}>Submit</button>
            </div>
            )
            : 
            <p>all questions have been anwered</p>
            : null}
          </div>
        )
      }
    }  
  }
}

/* 
TODO:
- indicate if registering or logging in
  -- names, ids, which school u go to, clubs, avatar, ...
- account page
  -- scores (CCP social credit), calendar of events, challenges, news & announcements of club 
- main page: posts for everyone by admins, voting system
- help page
  -- each month a big challenge, each week a small task (social credit)
- status updates: changing roles via email

posts and articles for newcomers
*/

import React from "react";
import './App.css';
import firebase from 'firebase/compat/app';
import { getApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, deleteUser, signInAnonymously, signInWithPopup, createUserWithEmailAndPassword, GoogleAuthProvider, sendEmailVerification  } from "firebase/auth";
import { getFirestore, collection, getDocs, getDoc, doc, setDoc, updateDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import {db} from "./firebase-config";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { Link, Outlet, useLocation, redirect } from 'react-router-dom';
import Defaultpfp from "./default.png";
import Megamind from "./megamind.webp";

const gp = new GoogleAuthProvider();
const auth = getAuth();
const storage = getStorage(getApp(), "gs://web-fdr-notification.appspot.com");

let avatar_fileref = "";
const schools_ref = collection(db, "schools");

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
        const user = doc(db, `users`, auth.currentUser.uid);
        getDoc(user).then((docsnap) => {
          if(!docsnap.exists()) {
            setDoc(user, {
              name: res.user.displayName,
              email: res.user.email,
              verified: res.user.emailVerified,
              id: res.user.uid,
              role: "regular",
              osis: null,
              clubs: [],
              pfp: res.user.photoURL || Defaultpfp,
              school: 0
            });
            this.setState({logged: true});
            this.fetchData();
          } else {
            this.setState({logged: true});
            this.fetchData();
          }
        })
      }).catch((err) => {
        // switch(err.code) {
        //   case 'auth/'
        // }
      })
  }


  emailpass_auth = async (email,pass) => {
    await createUserWithEmailAndPassword(auth, email, pass).then((res) => {
      const docRef = doc(db, `users`, auth.currentUser.uid);
      setDoc(docRef, {
          email: email,
          id: res.user.uid,
          verified: res.user.emailVerified,
          role: "regular",
          name: null,
          osis: null,
          clubs: [],
          pfp: res.user.photoURL || Defaultpfp,
          school: 0,
      }).then(() => {console.log("written")}).catch(er => {console.log(er)});
      this.setState({logged: true});
  }).catch((er) => {
      // console.log(er);
      const span_element = document.getElementById("spanning-error");
      if(span_element) {
        switch(er.code) {
          case 'auth/email-already-in-use':
              span_element.innerHTML = `<h1 style="color: red;">sus (email in use)</h1>`
              break;
          case 'auth/weak-password':
            span_element.innerHTML = `<h1 style="color: red;">NOOOOOOOOOOOOOO goofy ass weak ass lookin password</h1>`
          default:
              console.log(er);
              break;
        }
      }
  });
  }

  manLogin = async(email, pass) => {
    const auth = getAuth();
    await signInWithEmailAndPassword(auth, email, pass).then((res) => {
      console.log("success log in");
      this.setState({logged: true});
      this.fetchData();
    }).catch((err) => {
      if(document.getElementById("spanning-error")) {
        switch(err.code) {
          case 'auth/invalid-credential':
            document.getElementById("spanning-error").innerHTML = `<h1 style="color: red;">goofy ahh password and email</h1>` //might change later (google innterHTML vulnerabilities)
            break;
          default:
            break;
        }
      }
    });
  }

  anon_login = async () => {
    const auth = getAuth();
    await signInAnonymously(auth);
  }


  fetchData = async () => {
    await getDoc(doc(db, `users`, auth.currentUser.uid)).then((data) => {
      if(data.exists()) {
        this.setState({
          role: data.data().role,
          clubs: data.data().clubs,
          username: data.data().name,
          osis: data.data().osis,
          email: data.data().email,
          id: data.data().id,
          pfp: data.data().pfp,
          verified: data.data().verified,
          school_select: data.data().school,
        });
      } 
    });
  }

  async componentDidMount() {
    this.setState({loaded: true});
    const auth = getAuth();
    onAuthStateChanged(auth, user => {
      if(!user) {
        this.setState({
          logged: false,
        });
      } else { //TODO: fix the state update and stuff
        this.setState({
          logged: true,
        });
        this.fetchData();
      }
    });
  }

  handleSchoolSelection(e){
    this.setState({
      school_select: e.target.value,
    })
  }
  handleImage = (event) => {
    const storageRef = ref(storage, `images/${this.state.id}/${event.target.files[0].name}`);
    const uploadTask = uploadBytesResumable(storageRef, event.target.files[0]);
    uploadTask.on('state_changed', (snap) => {
      if(snap.state === "running") {
        console.log(snap.state);
      }
    }, (err) => {
      console.log("error upload");
    }, () => {
      getDownloadURL(uploadTask.snapshot.ref).then((url) => {
        this.setState({pfp: url});
      })
    });
  }

  updateUserInfo = () => {
    console.log(this.state.school_select);
    const checkboxes = document.querySelectorAll(".clubcheck");
    let clubsArr = [];
    for(let i = 0; i < checkboxes.length; i++) {
      if(checkboxes[i].checked) {
        clubsArr.push(checkboxes[i].id.toString());
      }
    }

    const docRef = doc(db, `users`, this.state.id);
    updateDoc(docRef, {
      name:( this.state.username !== null ? this.state.username : this.getuname.current.value ),
      osis: this.getosis.current.value, 
      clubs: clubsArr,
      pfp: this.state.pfp,
      school: parseInt((this.state.school_select)),
    });
    this.setState({
      loaded: true,
    });
    setTimeout(() => {window.location.reload()}, 3000);
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

            <span id="spanning-error"></span>

          </div>
        );
      } else {
        console.log(this.state);
        return (
          <div>
             <nav class="navbar navbar-expand-lg navbar-light bg-light">
  <a class="navbar-brand" href="#"><img class="nav-logo" src={require('./main_pub/logo_text.png')}/></a>
  <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
    <span class="navbar-toggler-icon"></span>
  </button>

  <div class="collapse navbar-collapse" id="navbarSupportedContent">
    <ul class="navbar-nav mr-auto">
      <li class="nav-item active">
        <a class="nav-link" href="#">Home <span class="sr-only">(current)</span></a>
      </li>
      <li class="nav-item">
        <a class="nav-link" href="#">Clubs</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" href="#">School</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" href="#">Calendar</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" href="#">Portfolio</a>
      </li>

    </ul>
    <form class="form-inline my-2 my-lg-0">
      <input class="form-control mr-sm-2" type="search" placeholder="Search" aria-label="Search"/>
      <button class="btn btn-outline-success my-2 my-sm-0" type="submit">Search</button>
      <a href="#"><img class ="nav-avatar" src={this.state.pfp}/></a>
      <span class="nav-talents">{this.state.talents}</span>
      <img class ="nav-coin" src={require('./main_pub/star.png')}/>
    </form>
  </div>
</nav>
{this.state.clubs ? 
            this.state.username !== null && this.state.osis !== null && this.state.clubs.length !== 0 ?
            (
              <Outlet context={this.state} />
            
            )
            :
            <div>
              <p>i am: {this.state.username}</p>
              <img src={this.state.pfp} width={200} height={200} />
              <button onClick={this.logout}>logout</button>
        
            {(this.state.clubs) ?
            (this.state.clubs.length === 1) ? 
            (
            <div id="popup-questions">
                <div>BUT FIRST OSOME QUESTIONS!!</div>
                <p>what opp (school) u a part of??</p>
                <select value={this.state.school} onChange={this.handleSchoolSelection.bind(this)} id="school_select" >
                  <option value={1}>FDR (the OG ngl)</option>
                  <option value={2}>use api to get other school stuff ig idk</option>  
                </select>
                <br />
                {this.state.username === null && this.state.osis === null ? (
                <div>
                    <p>what is name bruh</p>
                    <input type="text" placeholder="name" ref={this.getuname} />
                </div>
                ) : null}
                <p>what is your osis numbre (student id) hint : check your id card or smth</p>
                <input type="text" placeholder="osis" ref={this.getosis} />
                <p>clubs you in???</p>
                {/* <select> */}
                <input type="checkbox" className="clubcheck" id="math" /><label htmlFor="math">Math</label>
                <input type="checkbox" className="clubcheck" id="CS" /><label htmlFor="CS">Computer scientce</label>
                <input type="checkbox" className="clubcheck" id="key" /><label htmlFor="key">key club</label>
                <input type="checkbox" className="clubcheck" id="robotics" /><label htmlFor="robotics">robitcs</label>
                <input type="checkbox" className="clubcheck" id="physics" /><label htmlFor="physics">physics</label>

                <p>upload image (or use default idc)</p>
                <input type="file" id="avatar_upload" name="avatar" accept="image/png, image/jpeg" onChange={this.handleImage} />             

                <button className="submit-info" id="submit-info" onClick={this.updateUserInfo}>Submit</button>
            </div>
            )
            : 
            <div>
            {this.show_posts()}
            <div class="tatar"></div>
            <p>all questions have been anwered</p>
<h1>Upload posts</h1>

</div>
            : <button onClick={this.logout}>logout 1</button>}

             
            </div>
            : <button onClick={this.logout}>logout 2</button>}
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


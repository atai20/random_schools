import React, {useEffect} from "react";
import './App.css';
import firebase from 'firebase/compat/app';
import { getApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, deleteUser, signInAnonymously, signInWithPopup, createUserWithEmailAndPassword, GoogleAuthProvider, sendEmailVerification  } from "firebase/auth";
import { getFirestore, collection, getDocs, getDoc, doc, setDoc, updateDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import {db} from "./firebase-config";
import Rive, { useRive } from '@rive-app/react-canvas';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { Link, Outlet, useLocation, redirect } from 'react-router-dom';
import Defaultpfp from "./default.png";
import Glogo from "./glogo.png";
import { JSEncrypt } from "jsencrypt";  

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
        showMe:true,
        showMe2:false
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
              school: 0,
              talents: 0,
              theme: "light"
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
    if(this.checkPassword(pass)) {
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
            talents: 0,
            theme: "light",
        }).then(() => {console.log("written");
        sendEmailVerification(auth.currentUser).then(() => {
          // updateDoc(docRef, {
          //   verified: true,
          // })
        })
      }).catch(er => {console.log(er)});
        this.setState({logged: true});
    }).catch((er) => {
        const span_element = document.getElementById("spanning-error");
        if(span_element) {
          switch(er.code) {
            case 'auth/email-already-in-use':
                span_element.innerHTML = `<h1 style="color: red;">Email already in use</h1>`
                break;
            case 'auth/weak-password':
              span_element.innerHTML = `<h1 style="color: red;">Weak password detected</h1>`
            default:
                console.log(er);
                break;
          }
        }
    });
    }
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
            document.getElementById("spanning-error").innerHTML = `<h1 style="color: red;">wrong pass or email</h1>` //might change later (google innterHTML vulnerabilities)
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
          talents: data.data().talents,
          theme: data.data().theme,
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

  encrypt(msg) {
    const encrypt = new JSEncrypt();
    encrypt.setPublicKey(process.env.REACT_APP_RSA_PUBLIC_KEY);
    return encrypt.encrypt(JSON.stringify(msg));
  }

  updateUserInfo = () => {
    // console.log(this.state.school_select);
    const checkboxes = document.querySelectorAll(".clubcheck");
    let clubsArr = [];
    for(let i = 0; i < checkboxes.length; i++) {
      if(checkboxes[i].checked) {
        clubsArr.push(checkboxes[i].id.toString());
      }
    }
    if(this.getosis.current.value.length > 0 && this.getuname.current.value.length > 0) {
      if((/^\d+$/.test(this.getosis.current.value))) {
        const docRef = doc(db, `users`, this.state.id);
        updateDoc(docRef, {
          name:( this.state.username !== null ? this.state.username : this.getuname.current.value ),
          osis: this.encrypt(this.getosis.current.value), 
          clubs: clubsArr,
          pfp: this.state.pfp,
          school: parseInt((this.state.school_select)),
        });
        this.setState({
          loaded: true,
        });
        setTimeout(() => {window.location.reload()}, 3000);
      } else {
        alert("incorrect format");
      }
    } else {
      alert("error");
    }
    
  }

  checkPassword(pass_string) { // for registration
    let b3 = true;
    if(pass_string.toLowerCase() === pass_string) {
      alert("A password is required to have at least one upper case");
      b3 = false;
      throw "custom_auth/require-uppercase";
    }
    const digit = /[0-9]/;
    if(!digit.test(pass_string)) {
      alert("requires at least one number");
      b3 = false;
      throw "custom_auth/require-number";
    }
    const format = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
    if(!format.test(pass_string)) {
      b3 = false;
      alert("it is required to have at least one special character");
      throw "custom_auth/require-special-char";
    }
    return b3;
  }


  render() {
   
    // this.checkPassword("123456U@");
    if(this.state.loaded) {
      if(!this.state.logged) {
     
        return (
          
          <div className="register ctext-primary">
            <div className="overlay">
              <div className="modal_register">
                <h3>Register</h3>
                <input className="form-control mr-sm-2" type="email" name="email" id="email" ref={this.emailInputRef} placeholder="Email" />
                <input className="form-control mr-sm-2" type="password" name="password" id="pass" ref={this.passwordRef} placeholder="Password" />
                <button className="btn btn-outline-success my-2 my-sm-0 ctext-primary" onClick={() => this.emailpass_auth(this.emailInputRef.current.value,this.passwordRef.current.value)}>Register</button>
                <br />
                <br />
                <h3>Login</h3>
                <input className="form-control mr-sm-2" type="email" ref={this.emaillog} placeholder="Email"/>
                <input className="form-control mr-sm-2" type="password" ref={this.passlog} placeholder="Password" />
                <button className="btn btn-outline-success my-2 my-sm-0" onClick={() => this.manLogin(this.emaillog.current.value,this.passlog.current.value)}>Login</button><br />
                <span>OR</span><br />
                <button onClick={this.google_auth} className="glogo"><img src={Glogo} width={50} height={50}/> login with google</button>
                <br />
                <br />
                <br />
                <p>OR</p>
                {/* <button className="btn btn-outline-success my-2 my-sm-0" onClick={this.anon_login}>Become anon</button> */}

                <span id="spanning-error"></span>
              </div>
            </div>
            <form>
  <div class="form-row">
    <div class="form-group col-md-6">
      <label for="inputEmail4">Email</label>
      <input type="email" class="form-control" id="inputEmail4" placeholder="Email"/>
    </div>
    <div class="form-group col-md-6">
      <label for="inputPassword4">Password</label>
      <input type="password" class="form-control" id="inputPassword4" placeholder="Password"/>
    </div>
  </div>
  <div class="form-group">
    <label for="inputAddress">Address</label>
    <input type="text" class="form-control" id="inputAddress" placeholder="1234 Main St"/>
  </div>
  <div class="form-group">
    <label for="inputAddress2">Address 2</label>
    <input type="text" class="form-control" id="inputAddress2" placeholder="Apartment, studio, or floor"/>
  </div>
  <div class="form-row">
    <div class="form-group col-md-6">
      <label for="inputCity">City</label>
      <input type="text" class="form-control" id="inputCity"/>
    </div>
    <div class="form-group col-md-4">
      <label for="inputState">State</label>
      <select id="inputState" class="form-control">
        <option selected>Choose...</option>
        <option>...</option>
      </select>
    </div>
    <div class="form-group col-md-2">
      <label for="inputZip">Zip</label>
      <input type="text" class="form-control" id="inputZip"/>
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
          </div>
        );
      } else {
        const dissapear = async() => {
  
          this.setState({
              showMe:false,
              showMe2:true
        
          })      
        }
        const dissapear2 = async() => {
          this.setState({
              showMe2:false,
              showMe3:true
        
          })      
        }
        const dissapear3 = async() => {
          this.setState({
              showMe3:false,
              showMe4:true
        
        
          })      
        }
        const dissapear_teach = async() => {
          this.setState({
              showMe4:false,
              showMe_teach:true
          })      
        }
        const dissapear_stud = async() => {
          this.setState({
              showMe4:false,
              showMe_stud:true
          })      
        }
        return (
          
          <div>
                             <link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,678;1,678&display=swap" rel="stylesheet"></link>         <nav className="navbar navbar-expand-lg navbar-light custom">
  <a className="navbar-brand" href="#"><img class="nav-logo" src={require('./main_pub/logo_text.png')}/></a>
  <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
    <span className="navbar-toggler-icon"></span>
  </button>

  <div className="collapse navbar-collapse" id="navbarSupportedContent">
    <ul className="navbar-nav mr-auto">
      <li className="nav-item active">
        <Link className="nav-link" to={"/"}><div className="nunito-header">Home</div> <span className="sr-only">(current)</span></Link>
      </li>
      <li className="nav-item">
        <Link className="nav-link" to={"/clubs"}>Clubs</Link>
      </li>
      <li className="nav-item">
      <Link className="nav-link" to={"/schools"}>School</Link>
      </li>
      <li className="nav-item">
      <Link className="nav-link" to={"/calendar"}>Calendar</Link>
      </li>
      <li className="nav-item">
      <Link className="nav-link" to={"/about"}>About</Link>
      </li>
      <li className="nav-item">
        <Link className="nav-link" to={"/profile"}>Profile</Link>
      </li>

    </ul>
    <form classNameName="form-inline my-2 my-lg-0">
    
    
      <span className="nav-talents">{this.state.talents}</span>
      <img className ="nav-coin" src={require('./main_pub/star.png')}/>
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
            (this.state.clubs.length === 0) ? 
            (
            <div id="popup-questions" className="ctext-primary">
                <div>BUT FIRST OSOME QUESTIONS!!</div>
                {this.state.showMe?
 <div class="d-flex">
  <div class="d-inline-block"><Rive  src='firey.riv' style={{height:"400px", width:"300px"}}/></div>
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
                <p>what opp (school) u a part of??</p>
                <select onChange={this.handleSchoolSelection.bind(this)} id="school_select" >
                  <option value={0}></option>
                  <option value={1}>FDR (the OG ngl)</option>
                  <option value={2}>use api to get other school stuff ig idk</option>  
                </select>
                <br />
                {document.getElementById("school_select") ?
                document.getElementById("school_select").value !== 0 ? (
                  <div>
                    {this.state.username === null && this.state.osis === null ? (
                    <div>
                        <p>Name</p>
                        <input type="text" placeholder="name" ref={this.getuname} />
                    </div>
                    ) : null}
                    <p>OSIS</p>
                    <input type="text" placeholder="osis" ref={this.getosis} />
                    <p>clubs you in???</p>
                    {/* <select> */}
                    <input type="checkbox" className="clubcheck" id="math" /><label htmlFor="math">Math</label>
                    <input type="checkbox" className="clubcheck" id="CS" /><label htmlFor="CS">Computer scientce</label>
                    <input type="checkbox" className="clubcheck" id="key" /><label htmlFor="key">key club</label>
                    <input type="checkbox" className="clubcheck" id="robotics" /><label htmlFor="robotics">robitcs</label>
                    <input type="checkbox" className="clubcheck" id="physics" /><label htmlFor="physics">physics</label>
    
                    <p>upload image (or use default)</p>
                    <input type="file" id="avatar_upload" name="avatar" accept="image/png, image/jpeg" onChange={this.handleImage} />             
    
                    <button className="submit-info" id="submit-info" onClick={this.updateUserInfo}>Submit</button>
                  </div>
                ) : null : null}
            </div>
            )
            : 
            <div>
            <div class="tatar"></div>
            <p>all questions have been anwered</p>
<h1>Upload posts</h1>

</div>
            : <button onClick={this.logout}>logout 1</button>}
            </div>
            : <button onClick={this.logout}>logout 2</button> /*insert thousand yard stare */}
          </div>
        )
      }
    } else {
      <div>
        <h1>Loading...</h1>
      </div>
    }  
  }
}

/* 
TODO:
- indicate if registering or logging in     DONE
  -- names, ids, which school u go to, clubs, avatar, ...
- account page                                                    
  -- scores (CCP social credit), calendar of events, challenges, news & announcements of club 
- main page: posts for everyone by admins, voting system
- help page
  -- each month a big challenge, each week a small task (social credit)
- status updates: changing roles via email

posts and articles for newcomers


password checks:
    At least 12 characters long or more
    >= 1 uppercase 
    >= 1 numbers
    >= 1 symbols
*/


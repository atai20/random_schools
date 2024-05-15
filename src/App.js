import React, {useEffect} from "react";
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
import './App.css';

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
        currentSlide: 0,
      }

      this.emailInputRef = React.createRef();
      this.passwordRef = React.createRef();
      this.emaillog = React.createRef();
      this.passlog = React.createRef();
      this.getuname = React.createRef("");
      this.getosis = React.createRef("");


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

  async handleSchoolSelection(e) {
    await this.setState({
      school_select: e.target.value,
    });
    document.getElementById("school_select").value = e.target.value;
    // console.log(this.state);
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
    const checkboxes = document.querySelectorAll(".clubcheck");
    let clubsArr = [];
    for(let i = 0; i < checkboxes.length; i++) {
      if(checkboxes[i].checked) {
        clubsArr.push(checkboxes[i].id.toString());
      }
    }
    // console.log(clubsArr);
    if(parseInt((this.state.school_select)) > 0) {
      const docRef = doc(db, `users`, this.state.id);
      updateDoc(docRef, {
        name:( this.state.username !== null ? this.state.username : this.state.uname_ref_t),
        osis: this.encrypt(this.state.osis_t), 
        clubs: clubsArr,
        pfp: this.state.pfp,
        school: parseInt((this.state.school_select)),
        role: this.state.role,
      });
      this.setState({
        loaded: true,
      });
      // setTimeout(() => {window.location.reload()}, 3000);
      
    } else {
      alert(this.state.school_select);
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
  nextSlide() {
    if(this.getuname.current!== null && this.getuname.current.value.replace(/ /g, '') !== "" ) {
      this.setState({
        uname_ref_t: this.getuname.current.value,
        currentSlide: this.state.currentSlide + 1,
      })
    } else {
      if(this.getosis.current !== null && this.getosis.current.value.length > 0 ) {
        if(this.getosis.current.value.length === 9 && (/^\d+$/.test(this.getosis.current.value))) {
          this.setState({
            osis_t: this.getosis.current.value,
            currentSlide: this.state.currentSlide + 1,
          });
        } else {
          alert("enter proepr osis")  
        }
      } else {
        this.setState({
          currentSlide: this.state.currentSlide + 1,
        });
      }
    }
    
  }
  prevSlide() {
    this.setState({
      currentSlide: this.state.currentSlide - 1,
    })
  }
  makeAlert(value) {
    alert(value);
  }
  setUserRole(value) {
    if(value === "student") {
      this.setState({
        role: "regular",
        currentSlide: this.state.currentSlide + 1
      })
    } else {
      this.setState({
        role: "teacher",
        currentSlide: this.state.currentSlide + 1,
      })
    }
  }

  render() {
    function InitAnim(props) {
      return (
        <div>
        <p>{props.text}</p>
      </div>
      )
    }
    function QuestionTS(props) {
      return (
        <div>
          <p>{props.question}</p>
          <button onClick={() => props.setUserPosition("twonnyoneteacher")}>Teacher</button>
          <button onClick={() => props.setUserPosition("student")}>Student</button>
        </div>
      )
    }
    function QuestionSchool(props) {
      return (<div>
        <p>what school are you attending?</p>
          <select onChange={(e) => props.schoolSelector(e)} id="school_select">
            <option value={0}></option>
            <option value={1}>FDR</option>
            <option value={2}>Lagrange James</option>  
          </select>
      </div>)
    }
    const InputRequired = React.forwardRef((props,ref) => {
      if(props.type === "text") {
        return (
          <div>
            <input type={props.type} placeholder={props.placeholder} ref={ref}  />
          </div>)
      } else{
        return (
          <div>
            {props.clubs.map((club,i) => (
              <div>
                <input type={props.type} className={props.necessaryClass} id={club} /><label htmlFor={club}>{props.clubs[i]}</label><br />
              </div>
            ))}
            <button onClick={props.finalStep}>Submit</button>
          </div>
        )
      }
    })

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
          </div>
        );
      } else {
        const steps = [
          {
            'jsx': <InitAnim text="hello im on fire" />,
            'position': 'right',
          },
          {
            'jsx': <InitAnim text="get started or sum shii" />,
            'position': 'right',
          },
          {
            'jsx': <QuestionTS question="Student or teacher?" setUserPosition={this.setUserRole.bind(this)} />,
          },
          {
            'jsx': <QuestionSchool schoolSelector={this.handleSchoolSelection.bind(this)} />
          },
          {
            'jsx': <InputRequired type="text" placeholder="Name..." ref={this.getuname} />
          },
          {
            'jsx': <InputRequired type="text" placeholder="OSIS" ref={this.getosis} />
          },
          {
            'jsx': <InputRequired type="checkbox" necessaryClass="clubcheck" clubs={["math", "physics", "CS", "robotics", "key"]} finalStep={this.updateUserInfo.bind(this)} />
          }
        ]
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
        <Link className="nav-link ctext-primary" to={"/"}><div className="nunito-header">Home</div> <span className="sr-only">(current)</span></Link>
      </li>
      <li className="nav-item">
        <Link className="nav-link ctext-primary" to={"/clubs"}>Clubs</Link>
      </li>
      <li className="nav-item">
      <Link className="nav-link ctext-primary" to={"/schools"}>School</Link>
      </li>
      <li className="nav-item">
      <Link className="nav-link ctext-primary" to={"/calendar"}>Calendar</Link>
      </li>
      <li className="nav-item">
      <Link className="nav-link ctext-primary" to={"/about"}>About</Link>
      </li>
      <li className="nav-item">
        <Link className="nav-link ctext-primary" to={"/profile"}>Profile</Link>
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
                <div className="d-flex">
                <div className="d-inline-block riv-anim" ><Rive src='firey.riv' style={{height:"400px", width:"300px"}}/></div>
                <div className="d-inline-block">
                <div className="chat" id="firey-chat" >
                  {this.state.currentSlide < steps.length ? 
                  <div>
                  <div>{steps[this.state.currentSlide].jsx}</div>
                  {this.state.currentSlide > 0  ? 
                  <div>
                    <button onClick={this.prevSlide.bind(this)}>Previous</button>
                    <button onClick={this.nextSlide.bind(this)}>Next</button>
                  </div>
                
                : <button onClick={this.nextSlide.bind(this)}>Next</button>}
                </div>:
                null}
                </div>
                </div>
                </div>

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

- main page: voting system
- status updates: changing roles via email

*/


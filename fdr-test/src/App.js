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
import Transplogo from "./transplogo.webp";
import { JSEncrypt } from "jsencrypt"; 
import $ from 'jquery'; 

import "./Appc.scss";
import './App.css';
import "./FireLoad.css";

const gp = new GoogleAuthProvider();
const auth = getAuth();
const storage = getStorage(getApp(), "gs://web-fdr-notification.appspot.com");

let avatar_fileref = "";
const schools_ref = collection(db, "schools");
let glob_sub = [];

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

      this.subject_set_ref = React.createRef();
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
          subjects: data.data().subjects ? data.data().subjects : null
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
        fetch("https://data.cityofnewyork.us/resource/8b6c-7uty.json", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          }
        }).then((resp) => resp.json()).then(data => {
          this.setState({all_schools_data: data})
        } )
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
    console.log(this.state.subject_set);
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
        subjects: this.state.subject_set
      });
      this.setState({
        loaded: true,
      });
      // setTimeout(() => {window.location.reload()}, 3000);
      
    } else {
      alert(this.state.school_select);
    }
    this.setState({loaded: false, all_schools_data: []}); //EMPTY IT BECAUSE 442 freakin elements
    setTimeout(() => {
      window.location.reload();
      this.setState({loaded: true})
    }, 3000);
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
          alert("enter proepr osis");
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
  subjectInjection() {
    let iz_t=[];
    const d = document.querySelectorAll(".subject_check");
    for(let i=0; i < d.length; i++) {
      if(d[i].checked) {
        iz_t.push(d[i].id.toString());
      }
    }
    this.setState({subject_set: iz_t, 
      currentSlide: this.state.currentSlide + 1})
  }

  render() {
    const inputField = document.querySelector('.chosen-value');
      const dropdown = document.querySelector('.value-list');
      if(inputField !== null && dropdown !== null) {
        const dropdownArray = [... document.querySelectorAll('li')];
      console.log(typeof dropdownArray)
      dropdown.classList.toggle('open');
        
      } 
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
          <button className="btn-white" onClick={() => props.setUserPosition("twonnyoneteacher")}>Teacher</button>
          <button className="btn-white" onClick={() => props.setUserPosition("student")}>Student</button>
        </div>
      )
    }
    function QuestionSchool(props) {
      
      
      return (<div>
        <p>what school are you attending?</p>
          <select onChange={(e) => props.schoolSelector(e)} id="school_select">
            <option value={0}></option>
            {props.schoolData && props.schoolData.map((schools, index) => (
              <option value={index}>{schools.school_name}</option>
            ))}
            {/* <option value={1}>FDR</option>
            <option value={2}>Lagrange James</option>   */}
          </select>
      </div>)
      
    }
    const InputRequired = React.forwardRef((props,ref) => {
      if(props.type === "text") {
        return (
          <div>
            <p>{props.header}</p>
            <input type={props.type} placeholder={props.placeholder} ref={ref}  />
          </div>)
      } else if(props.necessaryClass === "subject_check") {
        // props.subjectInject(props.clubs);
        return (
            <div >
              <p>{props.header}</p>
              {props.clubs.map((subject,i) => (
                <div >
                  <input type={props.type} className={props.necessaryClass} id={subject}/>
                  {/* <button type={props.type} className={props.necessaryClass} class="btn" id={subject} onClick={(e) => props.subjectInject(e)}>{subject}</button> */}
                  <label htmlFor={subject}>{subject}</label><br />
                </div>
              ))}
              <button className="btn btn-success" onClick={props.subjectInject}>Save</button>
            </div>
        )
      } else {
        
        return (
          <div>
            <p>{props.header}</p>
            {props.clubs.map((club,i) => (
              <div>
                <input type={props.type} className={props.necessaryClass} id={club}  /><label htmlFor={club}>{props.clubs[i]}</label><br />
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
          <div className="register" >
            <div className="overlay">
              <div className="modal_register">
                <h3>Register</h3>
                <div className="register-group">
                  <input className="register-inp" required type="email" autoComplete="off" name="email" id="email" ref={this.emailInputRef} />
                  <label className="register-label">Email</label>
                  
                </div>
                <div className="register-group">
                <input className="register-inp" type="password" name="password" id="pass" ref={this.passwordRef} required autoComplete="off" />
                  <label className="register-label">Password</label>
                </div>

                <button 
                className="register_button_official" 
                onClick={() => this.emailpass_auth(this.emailInputRef.current.value,this.passwordRef.current.value)}>
                 <p> Register</p></button>
                <br />
                <br />
                <h3>Login</h3>
                <div className="register-group">
                  <input className="register-inp" type="email" ref={this.emaillog} placeholder="Email" required autoComplete="off"/>
                  <label className="register-label">Email</label>
              </div>
              <div className="register-group">
                  <input className="register-inp" type="password" ref={this.passlog} placeholder="Password" required autoComplete="off" />
                  <label className="register-label">Password</label>
                </div>
                <button className="animated-button" 
                onClick={() => this.manLogin(this.emaillog.current.value,this.passlog.current.value)}>
                  <svg viewBox="0 0 24 24" class="arr-2" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"
    ></path>
  </svg>
  <span class="text">Login</span>
  <span class="circle"></span>
  <svg viewBox="0 0 24 24" class="arr-1" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"
    ></path>
  </svg>
                  </button><br />
                <span>OR</span><br />
                <button onClick={this.google_auth} className="glogo"><img src={Transplogo} width={20} height={20}/> login with google</button>
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
            'jsx': <InitAnim text="hello im on fire (send help)" />,
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
            'jsx': <QuestionSchool schoolSelector={this.handleSchoolSelection.bind(this)} schoolData={this.state.all_schools_data} />
          },
          {
            'jsx': <InputRequired header="ur name?" type="text" placeholder="Name..." ref={this.getuname} />
          },
          {
            'jsx': this.state.role === "regular" ? <InputRequired header="what is osis" type="text" placeholder="OSIS" ref={this.getosis} /> : 
            <InputRequired header="what class u teach?" type="checkbox" 
            necessaryClass="subject_check" 
            clubs={["math", "physics", "CS", "robotics", "english", "history"]} 
            subjectInject={this.subjectInjection.bind(this)} />,
              //fetch dis from opendata eventually <InputRequired header="what class u teach?" type="checkbox" necessaryClass="subject_check" clubs={["math", "physics", "CS", "robotics", "english", "history"]} subjectInject={this.subjectInjection.bind(this)} />,
          },
          {
            'jsx': <InputRequired header="what clubs u in?" type="checkbox" necessaryClass="clubcheck" clubs={["math", "physics", "CS", "robotics", "key"]} finalStep={this.updateUserInfo.bind(this)} />
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
{/* {console.log(this.state)} */}
          {this.state.clubs ? 
            this.state.username !== null && this.state.osis !== null && this.state.clubs.length !== 0 ?
            (
              <div>
                
                <Outlet context={this.state} />
              </div>
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
                <div className="d-inline-block riv-anim" >
                  {/* {console.log(this.state.role)} */}
                  {this.state.role === "teacher" ? 
                  <Rive src='firey_reg.riv' style={{height: "400px", width: "300px"}} />
                  : null
                }
                {this.state.role === "regular" ? 
                <Rive src='firey.riv' style={{height:"400px", width:"300px"}}/> : null}
                </div>
                <div className="d-inline-block">
                <div className="chat" id="firey-chat" >
                  {this.state.currentSlide < steps.length ? 
                  <div>
                  <div>{steps[this.state.currentSlide].jsx}</div>
                  {this.state.currentSlide > 0 ? 
                  <div>
                    <button className="prevslidebtn"  onClick={this.prevSlide.bind(this)}>Previous</button>
                    <button className="nextslidebtn" onClick={this.nextSlide.bind(this)}>Next</button>
                  </div>
                
                : <button className="nextslidebtn" onClick={this.nextSlide.bind(this)}>Next</button>} {/**<button onClick={this.nextSlide.bind(this)}>Next</button> */}
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
            : 
            
            <div class="container-animation">
            <button onClick={this.logout}>logout 2</button>
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
    } else {
      <div className="ctext-primary"> 
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


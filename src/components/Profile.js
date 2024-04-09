import React, {useRef, useState, useEffect} from "react";
import { Link, useOutletContext } from "react-router-dom";
import "./styles/profiles.css";
import { getAuth, deleteUser, signOut } from "firebase/auth";
import { doc, deleteDoc, getDocs, getDoc, updateDoc, query, where, collection } from "firebase/firestore";
import { db } from "../firebase-config";
import { JSEncrypt } from 'jsencrypt';
import { getApp } from "firebase/app";
import {getStorage, ref, uploadBytesResumable, getDownloadURL} from "firebase/storage";



import "../App.css";

const storage = getStorage(getApp(), "gs://web-fdr-notification.appspot.com");
let arr = []; // DONT REMOVE THIS. USESTATE DOES NOT WORK LIKE YOU THINK
export default function Profile(props) {
    const userSearchRef = useRef("");
    const [searchResults, setSearchResults] = useState([]);
    const [school, setSchool] = useState("");

    function logout() {
        const auth = getAuth();
        signOut(auth).then(() => {
          this.setState({logged: false});
          window.location.reload();
        }).catch((error) => {console.log("no error")})
      }
    async function deleteAccount() {
        const auth = getAuth();
        await deleteDoc(doc(db, "users", auth.currentUser.uid));
        deleteUser(auth.currentUser).then(() => {
            logout();
        });
    }
    const state_ctx_props = useOutletContext(); //all our data here basically
    function decrypt(msg) {
        const decrypt = new JSEncrypt();
        decrypt.setPrivateKey(process.env.REACT_APP_RSA_PRIVATE_KEY);
        return decrypt.decrypt(msg);
    }
    function handleImage(event) {
        const storageRef = ref(storage, `images/${state_ctx_props.id}/${event.target.files[0].name}`);
        const uploadTask = uploadBytesResumable(storageRef, event.target.files[0]);
        uploadTask.on('state_changed', (snap) => {
          if(snap.state === "running") {
            console.log(snap.state);
          }
        }, (err) => {
          console.log("error upload");
        }, () => {
          getDownloadURL(uploadTask.snapshot.ref).then((url) => {
            updateDoc(doc(db, "users", state_ctx_props.id), {
                pfp: url,
            });
            state_ctx_props.pfp = url;
          });
        });
    }

    async function findUser(e) {
      console.log("clicked");
        const q = query(collection(db, "users"), where("name", "==", userSearchRef.current.value));
        const querySnapShot = await getDocs(q);
        querySnapShot.forEach(doc => {
            arr.push({
              "osis": decrypt(doc.data().osis),
              "name": doc.data().name,
              "email": doc.data().email,
              "talents": doc.data().talents,
              "id": doc.data().id
          })
        });
        setSearchResults(arr);
    }
    function resetSearch() {
      userSearchRef.current.value = "";
      arr = [];
      setSearchResults([]);
    }
    async function talentsManage(target_id, talents_count, index) {
      await updateDoc(doc(db, "users", target_id), {
        "talents": (searchResults[index].talents += talents_count)
      })
    }
    async function schoolInfo() {
        const schoolRef = doc(db, `schools/${state_ctx_props.school_select}`);
        await getDoc(schoolRef).then((school_data) => {
          setSchool(school_data.data());
        });      
    }
    async function themeHandler(e) {
      const userRef = doc(db, 'users', state_ctx_props.id);
      console.log(e.target.value)
      await updateDoc(userRef, {
        theme: e.target.value,
      });
      document.body.setAttribute("data-theme", e.target.value.toLowerCase());
    }
    useEffect(() => {
      document.body.setAttribute("data-theme", state_ctx_props.theme.toLowerCase());
      schoolInfo();
    },[]);


    return (
        <div className="profile">
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous"/>
          <script src="https://code.jquery.com/jquery-3.2.1.slim.min.js" integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN" crossorigin="anonymous"></script>
          <script src="https://cdn.jsdelivr.net/npm/popper.js@1.12.9/dist/umd/popper.min.js" integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q" crossorigin="anonymous"></script>
          <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/js/bootstrap.min.js" integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl" crossorigin="anonymous"></script>
          <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.5.0/font/bootstrap-icons.css" rel="stylesheet" />
        
          <link href="css/styles.css" rel="stylesheet" />

    <div className="container py-5"> 
      <div className="row">
        <div className="col-lg-4">
          <div className="card mb-4">
            <div className="card-body text-center">
            <img className="rounded-circle img-fluid" id="avatar_acc"src={state_ctx_props.pfp} />
              <h5 className="my-3">{state_ctx_props.username}</h5>
              <p className="mb-1 theme-text">Student</p>
              {state_ctx_props.verified ? 
              <p>Status: verified</p>: <p>Status: not verified</p>}
              <div className="d-flex justify-content-center mb-2">
              </div>
            </div>
          </div>
      
        </div>


        <div className="col-lg-8">
          <div className="card mb-4">
            <div className="card-body">
              <div className="row">
                <div className="col-sm-3">
                  <p className="mb-0">Full Name</p>
                </div>
                <div className="col-sm-9">
                  <p className="mb-0 theme-text">{state_ctx_props.username}</p>
                </div>
              </div>
              
              <div className="row">
                <div className="col-sm-3">
                  <p className="mb-0">Status</p>
                </div>
                <div className="col-sm-9">
                  <p className="mb-0 theme-text">{state_ctx_props.role}</p>
                </div>
              </div>
              
              <div className="row">
                <div className="col-sm-3">
                  <p className="mb-0">Clubs</p>
                </div>
                <div className="col-sm-9">
                  <p className="mb-0 theme-text">{state_ctx_props.clubs.map((club, index) => (
                    <li key={index}>{club}</li>
                ))}</p>
                </div>
              </div>
              
              <div className="row">
                <div className="col-sm-3">
                  <p className="mb-0">School</p>
                </div>
                <div className="col-sm-9">
                  <p className="mb-0 theme-text">{school.name}</p>
                </div>
              </div>
              
         
            </div>
          </div>
          <div className="row">
            <div className="col-md-6">
              <div className="card mb-4 mb-md-0">
                <div className="card-body">
                  <p className="mb-4"><span className="font-italic me-1 ctext-primary"></span> You don't yet have any projects or challenges!
                  </p>
            
                </div>
              </div>
            </div>
           
          </div>
        </div>
      </div>
      <div className="settings">
                <h4>Settings</h4>
                <select onChange={themeHandler} defaultValue={state_ctx_props.theme}>
                  <option id="light-theme">Light theme</option>
                  <option id="dark-theme">Dark theme</option>
                  <option id="night-theme">Night theme</option>
                  <option id="summer-theme">Summer theme</option>
                </select>
                <p>Update Profile Image: <input type="file" accept="image/png, image/jpeg" onChange={handleImage} /> </p>
                {state_ctx_props.role === "site_admin" ? (
                    <div>
                      
                        <input ref={userSearchRef} type="text" className="form-control" placeholder="Find user" />
                        <button onClick={findUser} className="btn">Find user</button>
                        <button onClick={resetSearch} className="btn">Clear </button>
                        {searchResults.length !== 0 ? 
                        <div> 
                            {searchResults.map((user, index) => {
                              return (
                                <div>
                                    <p>{user.osis}</p>
                                    <button onClick={() => talentsManage(user.id, 21, index)} className="btn">Give Cred</button>
                                    <button onClick={() => talentsManage(user.id, -21, index)} className="btn">Lose Cred</button>
                                    <hr />
                                </div>
                            )} )}
                        </div>
                        : <p>arr is empoly</p>} {/* / */}
                    </div>
                ) : null}
                <button onClick={logout} className="btn">Logout</button>
            </div>

    </div>
        </div>
        
    );
}
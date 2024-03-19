import React, {useRef, useState} from "react";
import { Link, useOutletContext } from "react-router-dom";
import "./styles/profiles.css";
import { getAuth, deleteUser, signOut } from "firebase/auth";
import { doc, deleteDoc, getDocs, setDoc, updateDoc, query, where, collection } from "firebase/firestore";
import { db } from "../firebase-config";
import { JSEncrypt } from 'jsencrypt';
import { getApp } from "firebase/app";
import {getStorage, ref, uploadBytesResumable, getDownloadURL} from "firebase/storage";

import NoCred from "../lose_social_credit.jpeg";
import GotCred from "../social-credit.jpg";

const storage = getStorage(getApp(), "gs://web-fdr-notification.appspot.com");
let arr = [];
export default function Profile(props) {
    const userSearchRef = useRef("");
    const [searchResults, setSearchResults] = useState([]);
    const [image, setImage] = useState(0);

    function logout() {
        const auth = getAuth();
        signOut(auth).then(() => {
          this.setState({logged: false});
          window.location.reload();
        }).catch((error) => {console.log("no error")})
      }
    async function deleteAccount() {
        const auth = getAuth();
        // logout();
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
        const q = query(collection(db, "users"), where("name", "==", userSearchRef.current.value));
        const querySnapShot = await getDocs(q);
        querySnapShot.forEach(doc => {
            arr.push({
                "name": doc.data().name,
                "osis": decrypt(doc.data().osis),
                "role": doc.data().role,
                "talents": doc.data().talents,
                "id": doc.data().id
            });
        });
        console.log(arr);
        setSearchResults(arr);
    }
    function resetSearch() {
        userSearchRef.current.value = "";
        arr = [];
        setSearchResults([]);
    }
    async function talentsManage(target_id, talents_count, index) {
        if(talents_count < 0) {
            setImage(1);
        } else {
            setImage(2);
        }
        await updateDoc(doc(db, "users", target_id), {
            "talents": (searchResults[index].talents += talents_count)
        });
    }

    return (
        <div className="profile">
            <img src={state_ctx_props.pfp} /><h2>{state_ctx_props.username}</h2>
            <div className="user-info">
                <h4>Student information</h4>
                <p>OSIS: {decrypt()}</p>
                <p>Email: {state_ctx_props.email}</p>
                <p>Status: {state_ctx_props.role}</p>
                <p>Clubs: </p>
                {state_ctx_props.clubs.map((club, index) => (
                    <li key={index}>{club}</li>
                ))}
                <p>Social Credit (tokens): {state_ctx_props.talents} </p>
            </div>
            <div className="settings">
                <h4>Settings</h4>
                <p>Update Profile Image: <input type="file" accept="image/png, image/jpeg" onChange={handleImage} /> </p>
                {state_ctx_props.role === "site_admin" ? (
                    <div>
                        <h1>Give some social credit</h1>
                        <input ref={userSearchRef} type="text" className="form-control" placeholder="Find user" /><button onClick={resetSearch}>Clear</button>
                        <button onClick={findUser}>Find user</button>
                        {searchResults.length !== 0 ? 
                        <div> 
                            {searchResults.map((user, index) => (
                                <div>
                                    <p>{user.osis}</p>
                                    <button onClick={() => talentsManage(user.id, 21, index)}>Give Cred</button>
                                    <button onClick={() => talentsManage(user.id, -21, index)}>Lose Cred</button>
                                    <hr />
                                </div>
                            ))}
                        </div>
                        : <p>arr is empoly</p>}
                        {image === 1 ? 
                        <img src={NoCred} width={200} height={200} />
                        : null}
                        {image === 2 ? 
                        <img src={GotCred} width={200} height={200} />
                        : null}
                    </div>
                ) : null}
                <button onClick={logout}>Logout</button>
            </div>
        </div>
    );
}

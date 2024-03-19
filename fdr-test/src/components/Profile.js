import React from "react";
import { Link, useOutletContext } from "react-router-dom";
import "./styles/profiles.css";
import { getAuth, deleteUser, signOut } from "firebase/auth";
import { doc, deleteDoc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase-config";
import { JSEncrypt } from 'jsencrypt';
import { getApp } from "firebase/app";
import {getStorage, ref, uploadBytesResumable, getDownloadURL} from "firebase/storage";

import NoCred from "../lose_social_credit.jpeg";
import GotCred from "../social-credit.jpg";

const storage = getStorage(getApp(), "gs://web-fdr-notification.appspot.com");
export default function Profile(props) {

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
    function decrypt() {
        const decrypt = new JSEncrypt();
        decrypt.setPrivateKey(process.env.REACT_APP_RSA_PRIVATE_KEY);
        return decrypt.decrypt(state_ctx_props.osis);
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
                <img src={NoCred} />
                <img src={GotCred} />
            </div>
            <div className="settings">
                <h4>Settings</h4>
                <p>Update Profile Image: <input type="file" accept="image/png, image/jpeg" onChange={handleImage} /> </p>
                <button onClick={logout}>Logout</button>
            </div>
        </div>
    );
}
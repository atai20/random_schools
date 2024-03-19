import React from "react";
import { Link, useOutletContext } from "react-router-dom";
import "./styles/profiles.css";
import { getAuth, deleteUser, signOut } from "firebase/auth";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase-config";
import { JSEncrypt } from 'jsencrypt';

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

    return (
        <div className="profile">
            <p>this the profile page</p>
            <p>your avatar image:</p>
            <img src={state_ctx_props.pfp} className="avatar_profile" />
            <p>your name: {state_ctx_props.username}</p>
            <p>your id: {state_ctx_props.id}</p>
            <p>your email: {state_ctx_props.email}</p>
            <p>your role: {state_ctx_props.role}</p>
            <p>your osis: {decrypt()}</p>
            {/* <p>yo club: {state_ctx_props.clubs[0]}</p> */}
            {state_ctx_props.clubs.map((club, index) => {
                return (<li key={index}>your clubs::: {index}: {club}</li>)
            })}
            <button onClick={logout}>liogout normally</button>
            <button onClick={deleteAccount}>Danger zone: delete account</button>
        </div>
    );
}
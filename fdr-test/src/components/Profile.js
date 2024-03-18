import React from "react";
import { Link, useOutletContext } from "react-router-dom";
import "./styles/profiles.css";
import { getAuth, deleteUser, signOut } from "firebase/auth";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase-config";

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
    return (
        <div className="profile">
            <p>this the profile page</p>
            <p>your avatar image:</p>
            <img src={state_ctx_props.pfp} className="avatar_profile" />
            <p>your name: {state_ctx_props.username}</p>
            <p>your id: {state_ctx_props.id}</p>
            <p>your email: {state_ctx_props.email}</p>
            <p>your role: {state_ctx_props.role}</p>
            <p>your osis: {state_ctx_props.osis}</p>
            <button onClick={deleteAccount}>Danger zone: delete account</button>
        </div>
    );
}
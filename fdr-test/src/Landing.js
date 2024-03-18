import React, {Component} from "react";
import { Link, Outlet, useOutletContext } from "react-router-dom"; 
import firebase from 'firebase/compat/app';
import { getFirestore, collection, getDocs, getDoc, doc, setDoc, updateDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import {getAuth,signOut} from "firebase/auth";
import {db} from "./firebase-config";

const OutletProvider = ({children}) => {
    const ctx = useOutletContext();
    return typeof children === 'function' ? children(ctx) : children;
}

class Landing extends React.Component {
    constructor(props) {
        super(props);
    }

    logout() {
        const auth = getAuth();
        signOut(auth).then(() => {
          this.setState({logged: false});
          window.location.reload();
        }).catch((error) => {console.log("no error")})
      }

    componentDidMount() {
        console.log("landed");
    }
    render() {
        return (
            <div className="landing">
                <button onClick={this.logout}>logout landing</button>
                <p>you made it...</p>
                <OutletProvider>
                    {(outletCtxProps) => {
                        console.log(outletCtxProps);
                    }}
                </OutletProvider>
                {/* <p>{this.state.username}</p> */}
            </div>
        );
    }
}

export default Landing;
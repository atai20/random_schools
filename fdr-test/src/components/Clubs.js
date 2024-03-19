import React, {useState, useEffect} from "react";
import { Link, useOutletContext } from "react-router-dom";
import { getAuth, deleteUser, signOut } from "firebase/auth";
import { doc, deleteDoc, getDoc, setDoc, updateDoc, query, where, collection, getDocs } from "firebase/firestore";
import { db } from "../firebase-config";
import { JSEncrypt } from 'jsencrypt';
import { getApp } from "firebase/app";
import {getStorage, ref, uploadBytesResumable, getDownloadURL} from "firebase/storage";

export default function Clubs() {
    const ctxprops = useOutletContext();
    const [posts, setPosts] = useState([]);
    const [id, setId] = useState("");

    async function getPosts() {
        const clubs_arr = collection(db, `schools/${ctxprops.school_select}/clubs`); 
        const q = query(clubs_arr);
        const snap = await getDocs(q);
        snap.forEach(doc => {
            setId(doc.id);
            setPosts(doc.data().posts);
        });
        
    }
    useEffect(() => {
        for(let i = 0; i < ctxprops.length; i++) {
            
        }
    }, []);

    return (
        <div className="clubs-page">
            <p>view</p>
            {posts.map((post, index) => {
                if(post.type === "regular") {
                    console.log(post);
                    console.log(id);
                }
            })}
        </div>
    )
}
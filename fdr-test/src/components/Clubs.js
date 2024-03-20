import React, {useState, useEffect} from "react";
import { Link, useOutletContext } from "react-router-dom";
import { getAuth, deleteUser, signOut } from "firebase/auth";
import { doc, deleteDoc, getDoc, setDoc, updateDoc, query, where, collection, getDocs } from "firebase/firestore";
import { db } from "../firebase-config";
import { JSEncrypt } from 'jsencrypt';
import { getApp } from "firebase/app";
import {getStorage, ref, uploadBytesResumable, getDownloadURL} from "firebase/storage";
import "./styles/profiles.css";


export default function Clubs() {
    const ctxprops = useOutletContext();
    const [posts, setPosts] = useState([]);
    const [challenge, setChallenge] = useState([]);
    const [check, setCheck] = useState(false);
    let posts_t = [];

    async function getPosts() {
        const clubs_arr = collection(db, `schools/${ctxprops.school_select}/clubs`); 
        const q = query(clubs_arr);
        const snap = await getDocs(q);
        snap.forEach(doc => {
            if(ctxprops.clubs.includes(doc.id)) {
                setPosts(doc.data().posts);
            } else {
                doc.data().posts.map((post) => {
                    if(post.type === "challenge") {
                        console.log("this should also be visible: ", post);
                        posts_t.push(post);
                    }
                })
            }
        });
        setChallenge(posts_t);
        posts_t = [];
        // console.log(challenge)
    }
    function showCalendar() {
        if(document.getElementById("challenge-checkbox")) {
            if(document.getElementById("challenge-checkbox").checked) {
                setCheck(true);
            } else {
                setCheck(false);
            }
        }
    }

    useEffect(() => {
        getPosts();
    }, []);


    return (
        <div className="clubs-page">
            <button data-toggle="modal" data-target="#makepost">Make new Post</button>
            <div className="override-flex">
            <div id="makepost" className="modal" tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Make post</h5>
                  <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div className="modal-body">
                  <label>Title</label>
                  <input type="text" className="form-control" placeholder="title" />
                  <label>Content</label>
                  <textarea className="form-control" placeholder="write here..."></textarea>
                  <input type="checkbox" id="challenge-checkbox" onChange={showCalendar} /><label htmlFor="challenge-checkbox">Challenge</label>
                  {check ?
                  <div>
                    <input type="date" />
                  </div>
                  : null}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-primary">Save changes</button>
                  <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                </div>
              </div>
            </div>
          </div>
            </div>


            <div className="flexdisp">
            {posts.map((post, index) => {
                return (
                <div className="standard-post" key={index}>
                    <p>author: {post.author}</p>
                    <p>published: {post.date}</p>
                    {post.type === "challenge" ?
                    <p>due date: {post.due_date}</p> 
                    :null}
                    <p>text: {post.text}</p>
                </div>
                );
            })}
            {challenge.map((c, i) => (
                <div className="challenge" key={i}>
                    <p>author: {c.author}</p>
                    <p>text: {c.text}</p>
                    <p>published: {c.date}</p>
                    <p>due date: {c.due_date}</p>
                </div>
            ))}
            </div>
        </div>
    )
}
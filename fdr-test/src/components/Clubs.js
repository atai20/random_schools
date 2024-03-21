import React, {useState, useEffect, useRef} from "react";
import { Link, useOutletContext } from "react-router-dom";
import { getAuth, deleteUser, signOut } from "firebase/auth";
import { doc, deleteDoc, getDoc, setDoc, updateDoc, query, where, collection, getDocs, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase-config";
import { JSEncrypt } from 'jsencrypt';
import { getApp } from "firebase/app";
import {getStorage, ref, uploadBytesResumable, getDownloadURL} from "firebase/storage";
import "./styles/profiles.css";
import { FaPlus } from "react-icons/fa";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const storage = getStorage(getApp(), "gs://web-fdr-notification.appspot.com");
let clubo = "";

export default function Clubs() {
    const current_date = new Date();
    const ctxprops = useOutletContext();
    const [selposts, setPosts] = useState([]);
    const [challenge, setChallenge] = useState([]);
    const [check, setCheck] = useState(false);
    const [date, setDate] = useState("");
    const [img, setImg] = useState(null);
    const titleRef = useRef("");
    const contentRef = useRef("");
    let challenges_t = [];
    let posts_t = [];

    async function getPosts() {
        const clubs_arr = collection(db, `schools/${ctxprops.school_select}/clubs`); 
        const q = query(clubs_arr);
        const snap = await getDocs(q);
        snap.forEach(doc => {
            if(ctxprops.clubs.includes(doc.id)) {
                posts_t.push(doc.data().posts);
            } else {
                doc.data().posts.map((post) => {
                    if(post.type === "challenge") {
                        console.log("this should also be visible: ", post);
                        challenges_t.push(post);
                    }
                })
            }
        });
        setPosts(posts_t);
        setChallenge(challenges_t);
        posts_t = [];
        challenges_t = [];
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
    function getDate(e) {
        setDate(e.target.value);
    }
    function uploadImage(e) {
        const storageRef = ref(storage, `images/${ctxprops.id}/${e.target.files[0].name}`);
        const uploadTask = uploadBytesResumable(storageRef, e.target.files[0]);
        uploadTask.on('state_changed', (snap) => {
            if(snap.state === "running") {
              console.log(snap.state);
            }
          }, (err) => {
            console.log("error upload");
          }, () => {
            getDownloadURL(uploadTask.snapshot.ref).then((url) => {
              setImg(url);
            })
          });
    }
    async function mkPost() {
        const button_target = document.querySelector(".btnpost");
        const clubsArr = document.querySelectorAll(".posttoclub");
        for(let i = 0; i < clubsArr.length; i++) {
            if(clubsArr[i].checked) {
                selposts.push(
                    {
                        "author": ctxprops.username,
                        "date": `${current_date.getFullYear()}-${(current_date.getMonth()+1) < 10 ? "0"+(current_date.getMonth()+1).toString() : current_date.getMonth()}-${current_date.getDate()}`,
                        "img": img,
                        "text": contentRef.current.value,
                        "title": titleRef.current.value,
                        "type": (check ? "challenge" : "regular"),
                        "due_date": (check ? date : null ),
                        "from_club": "club?????"
                    }
                )
                const reify = selposts.map((post) => post.map((p) => p));
                await updateDoc(doc(db, `schools/${ctxprops.school_select}/clubs/${clubsArr[i].id.toString()}`), {
                    posts: reify
                })
               
                // console.log();
            }
        }
        button_target.textContent ="Posting...";
        setTimeout(() => {
            window.location.reload();
        }, 3000);
        
    }

    useEffect(() => {
        getPosts();
        console.log(selposts);
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
                  <input type="text" className="form-control" placeholder="title" ref={titleRef} />
                  <label>Content</label>
                  <textarea ref={contentRef} className="form-control" placeholder="write here..."></textarea>
                  <input type="file" onChange={uploadImage} className="form-control" />
                  <label>Post to</label>
                  {ctxprops.clubs.map((club, index) => (
                    <div><input key={index} type="checkbox" className="posttoclub" id={club} /><label>{club}</label></div>
                  ))}
                  <input type="checkbox" id="challenge-checkbox" onChange={showCalendar} /><label htmlFor="challenge-checkbox">Challenge</label>
                  {check ?
                  <div>
                    <input type="date" onChange={getDate} />
                  </div>
                  : null}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btnpost" onClick={mkPost}><FaPlus /> Post</button>
                  <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                </div>
              </div>
            </div>
          </div>
            </div>


            <div className="flexdisp">
            {selposts.map((post_arr, index) => {
                return ( // bruh react be like...
                    <div>
                    {post_arr.map((post, i) => (
                        <div className="standard-post" key={index}>
                            <p>from club: {post.club_origin}</p>
                            <p>author: {post.author}</p>
                                <p>published: {post.date}</p>
                                {post.type === "challenge" ?
                                <p>due date: {post.due_date}</p> 
                                :null}
                            {post.img ? 
                                <img src={post.img} width={300} height={200} />
                            : null}
                                <p>text: {post.text}</p>
                        </div>
                    ))}
                    </div>
                )
                // post_arr.map((post, i) => {
                //     return (
                //         
                //         );
                // })
            })}
            {challenge.map((c, i) => (
                <div className="challenge" key={i}>
                    <p>author: {c.author}</p>
                    <p>text: {c.text}</p>
                    {c.img !== "" && c.img !== null && c.img !== "img/img" ?
                    <img src={c.img} width={300} height={200} />
                    : null}
                    <p>published: {c.date}</p>
                    <p>due date: {c.due_date}</p>
                </div>
            ))}
            </div>
        </div>
    )
}
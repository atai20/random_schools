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
import { GoKebabHorizontal } from "react-icons/go";

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
        button_target.textContent ="Posting...";
        const clubsArr = document.querySelectorAll(".posttoclub");
        if(contentRef.current.value !== "" && titleRef.current.value !== "") {
            for(let i = 0; i < clubsArr.length; i++) {
                if(clubsArr[i].checked) {
                    selposts[i].push(
                        {
                            "author": ctxprops.username,
                            "date": `${current_date.getFullYear()}-${(current_date.getMonth()+1) < 10 ? "0"+(current_date.getMonth()+1).toString() : current_date.getMonth()}-${current_date.getDate()}`,
                            "img": img,
                            "text": contentRef.current.value,
                            "title": titleRef.current.value,
                            "type": (check ? "challenge" : "regular"),
                            "due_date": (check ? date : null ),
                            "from_club": clubsArr[i].id
                        }
                    )
                    if(selposts.length !== 0) {
                        const reify = selposts[i].map(post => post);
                        await updateDoc(doc(db,`schools/${ctxprops.school_select}/clubs/${clubsArr[i].id.toString()}`), {
                            posts: reify,
                        })
                    }
                }
            }
        }
        setTimeout(() => {window.location.reload();},3000);    
    }
    async function editPost() {
        console.log("edit the stuff i guess");
    }
    async function deletePost(postId) { //e.g postid-math:0,0
        console.log(selposts);
        const club_name = postId.substring(7,postId.indexOf(":"));
        const club_index = postId.substring(postId.indexOf(":")+1, postId.indexOf(","));
        const inner_index = postId.substring(postId.indexOf(",")+1);
        selposts[parseInt(club_index)].splice(parseInt(inner_index), 1)
        await updateDoc(doc(db, `schools/${ctxprops.school_select}/clubs/${club_name}`), {
            posts: selposts[parseInt(club_index)]
        });
        getPosts();
    }

    useEffect(() => {
        getPosts();
    }, []);
    const [toggle, setToggle] = useState("");
    const indToggle = (e) => {
        if(toggle === e.target.id) {
            setToggle("");
        } else {
            setToggle(e.target.id);
        }
    }


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
                  {Array.from(ctxprops.clubs).sort().map((club, index) => ( //clubs need to be alphabetically ordered to sync with firebase
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
                    <div key={index}>
                        {post_arr.map((post, i) => {
                            return (
                                <div>
                                {post.from_club !== undefined ?
                                 <div className="standard-post" id={"postid-"+post.from_club.toString()+":"+index.toString()+","+i.toString()} key={i}>
                                 <div className="btn-options"><GoKebabHorizontal id={"btnid-"+index.toString()+":"+i.toString()} onClick={indToggle} /></div>
                                     {toggle === ("btnid-"+index.toString()+":"+i.toString()) ? 
                                     <div className="dropdown-custom">
                                         <button className="btn btnpost" onClick={editPost}>Edit post</button><br />
                                         {ctxprops.role === "site_admin" ? 
                                         <div>
                                         <button className="btn btn-danger deletebtn" onClick={()=>deletePost("postid-"+post.from_club.toString()+":"+index.toString()+","+i.toString())}>Delete</button>
                                         </div>
                                     :null}
                                     </div>
                                     : null}
                                 <p>from club: {post.from_club}</p>
                                 <p>author: {post.author}</p>
                                     <p>published: {post.date}</p>
                                     {post.type === "challenge" ?
                                     <p>due date: {post.due_date}</p> 
                                     :null}
                                 <p>title: {post.title}</p>
                                 {post.img && post.img !== "img/img" ? 
                                     <img src={post.img} className="imgofpost" />
                                 : null}
                                     <p>text: {post.text}</p>
                             </div>
                                : null}
                                
                                </div>
                            )
                        })}
                    </div>
                );
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
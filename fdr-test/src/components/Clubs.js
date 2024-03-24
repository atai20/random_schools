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
import { FaEllipsisH } from "react-icons/fa";
import { CiCircleCheck } from "react-icons/ci";

const storage = getStorage(getApp(), "gs://web-fdr-notification.appspot.com");
let clubo = "";
var Latex = require('react-latex');

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
                            "author_id": ctxprops.id,
                            "author_pfp": ctxprops.pfp,
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
    const [editId, setEditId] = useState("");
    async function editPost(postId) {
        const club_index = parseInt(postId.substring(7, postId.indexOf(":")));
        const inner_index = parseInt(postId.substring(postId.indexOf(":")+1));
        titleRef.current.value = selposts[club_index][inner_index].title;
        contentRef.current.value = selposts[club_index][inner_index].text;
        setEditId(club_index.toString()+":"+inner_index.toString());
    }
    async function sendEdit() {
        console.log("sending edit");
        const club_index = parseInt(editId.substring(0,editId.indexOf(":")));
        const inner_index = parseInt(editId.substring(editId.indexOf(":")+1));

        selposts[club_index][inner_index]["title"] = titleRef.current.value;
        selposts[club_index][inner_index]["text"] = contentRef.current.value;
        selposts[club_index][inner_index]["img"] = img;
        // console.log(selposts[club_index][inner_index]["img"]);
        // console.log(selposts[club_index][inner_index]["from_club"])
        await updateDoc(doc(db, `schools/${ctxprops.school_select}/clubs/${selposts[club_index][inner_index]["from_club"]}`), {
            posts: selposts[parseInt(club_index)]
        });
        setTimeout(() => {
            window.location.reload();
        },3000);
    }
    async function deletePost(postId) { //e.g postid-math:0,0
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
            <button className="btn btnpost" data-toggle="modal" data-target="#makepost">Make new Post</button>
            {/* <h3><Latex displayMode={true}>$$(3\times 4) \div (5-3)$$</Latex></h3> */}
            <link href="//maxcdn.bootstrapcdn.com/bootstrap/4.1.1/css/bootstrap.min.css" rel="stylesheet" id="bootstrap-css"/>
            <script src="//maxcdn.bootstrapcdn.com/bootstrap/4.1.1/js/bootstrap.min.js"></script>
            <script src="//cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
            <link href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet" integrity="sha384-wvfXpqpZZVQGK6TAh5PVlGOfQNHSoD2xbE+QkPxCAFlNEevoEH3Sl0sibVcOQVnN" crossorigin="anonymous"/>
            <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="anonymous"></script>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.3/umd/popper.min.js" integrity="sha384-ZMP7rVo3mIykV+2+9J3UJ46jBk0WLaUAdn689aCwoqbBJiSnjAK/l8WvCWPIPm49" crossorigin="anonymous"></script>
            <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.min.js" integrity="sha384-ChfqqxuZUCnJSK3+MXmPNIyE6ZbWh2IMqE241rYiqJxyMiZ6OW/JmZQ5stwEULTy" crossorigin="anonymous"></script>
        
            <nav class="navbar navbar-light bg-white">
                    <a href="#" class="navbar-brand">Bootsbook</a>
                    <form class="form-inline">
                        <div class="input-group">
                            <input type="text" class="form-control" aria-label="Recipient's username" aria-describedby="button-addon2"/>
                            <div class="input-group-append">
                                <button class="btn btn-outline-primary" type="button" id="button-addon2">
                                    <i class="fa fa-search"></i>
                                </button>
                            </div>
                        </div>
                    </form>
                </nav>


    <div class="container-fluid gedf-wrapper">
        <div class="row">
            <div class="col-md-3">
                <div class="card">
                    <div class="card-body">
                        <div class="h5">@LeeCross</div>
                        <div class="h7 text-muted">Fullname : Miracles Lee Cross</div>
                        <div class="h7">Developer of web applications, JavaScript, PHP, Java, Python, Ruby, Java, Node.js,
                            etc.
                        </div>
                    </div>
                    <ul class="list-group list-group-flush">
                        <li class="list-group-item">
                            <div class="h6 text-muted">Followers</div>
                            <div class="h5">5.2342</div>
                        </li>
                        <li class="list-group-item">
                            <div class="h6 text-muted">Following</div>
                            <div class="h5">6758</div>
                        </li>
                        <li class="list-group-item">Vestibulum at eros</li>
                    </ul>
                </div>
            </div>
            <div class="col-md-6 gedf-main">     
                          
            {selposts.map((post_arr, index) => { // in future we can probably flatten the array for displaying purposes
                return ( // bruh react be like...
                    <div key={index}>
                    {post_arr.map((post, i) => (
                       <div className="card gedf-card" id={"postid-"+index.toString()+":"+i.toString()}>
                       <div className="card-header">
                           <div className="d-flex justify-content-between align-items-center">
                        <div key={i} className="d-flex justify-content-between align-items-center">
                            {ctxprops.role === "site_admin" || ctxprops.id === post.author_id ? 
                            <div className="dropdown">
                                <button className="btn btn-link dropdown-toggle" id={"btnid-"+index.toString()+":"+i.toString()} onClick={indToggle} > {/*gedf-drop1  data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"*/}
                                    <FaEllipsisH className="svg-menu" id={"btnid-"+index.toString()+":"+i.toString()} onClick={indToggle} />
                                </button>
                                {toggle === ("btnid-"+index.toString()+":"+i.toString()) ? 
                                <div className="dropdown dropdown-menu-right">
                                    <div className="h6 dropdown-header">Configuration</div>
                                    <button className="dropdown-item" data-toggle="modal" data-target="#editpost" onClick={() => editPost("postid-"+index.toString()+":"+i.toString())}>Edit</button>
                                    <button className="warning-hover" onClick={()=>deletePost("postid-"+post.from_club.toString()+":"+index.toString()+","+i.toString())}>Delete</button>
                                </div>
                                : null}
                            </div>
                            : null}
                            <div class="mr-2">
                                <img className="rounded-circle" width="45" src={post.author_pfp} alt=""/>
                            </div>
                            <div className="ml-2">  
                            <div className="h5 m-0">{post.author}</div>
                                    <div className="h7 text-muted">From {post.from_club} club</div>
                            </div>
                        </div>
                        </div>
            </div>
            <div className="card-body">
                        <div className="text-muted h7 mb-2"> <i className="fa fa-clock-o"></i>{post.date}
                                     {post.type === "challenge" ?
                                     <p>due date: {post.due_date}</p> 
                                     :null}</div>
                                      <a className="card-link" href="#">
                            <h5 className="card-title">{post.title}</h5>
                        </a>
                             {post.img && post.img !== "img/img" ? 
                                     <img src={post.img} className="imgofpost" />
                                 : null}
                        <p className="card-text">
                        {post.text}
                        </p>
                    </div>
                    <div className="card-footer">
                        <a href="#" className="card-link"><i className="fa fa-gittip"></i> Like</a>
                        <a href="#" className="card-link"><i className="fa fa-comment"></i> Comment</a>
                        <a href="#" className="card-link"><i className="fa fa-mail-forward"></i> Share</a>
                    </div>
            </div>   
                    ))}
                    </div>
                )
            })}
                <div className="card gedf-card">
                    <div className="card-header">
                        <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex justify-content-between align-items-center">
                                <div className="mr-2">
                                    <img className="rounded-circle" width="45" src="https://picsum.photos/50/50" alt=""/>
                                </div>
                                <div className="ml-2">
                                    <div className="h5 m-0">@LeeCross</div>
                                    <div className="h7 text-muted">Miracles Lee Cross</div>
                                </div>
                            </div>
                            <div>
                                <div className="dropdown">
                                    <button className="btn btn-link dropdown-toggle" type="button" id="gedf-drop1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                        <i className="fa fa-ellipsis-h"></i>
                                    </button>
                                    <div className="dropdown-menu dropdown-menu-right" aria-labelledby="gedf-drop1">
                                        <div className="h6 dropdown-header">Configuration</div>
                                        <a className="dropdown-item" href="#">Save</a>
                                        <a className="dropdown-item" href="#">Hide</a>
                                        <a className="dropdown-item" href="#">Report</a>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                    <div className="card-body">
                        <div className="text-muted h7 mb-2"> <i className="fa fa-clock-o"></i>10 min ago</div>
                        <a className="card-link" href="#">
                            <h5 className="card-title">That's how it all should look like</h5>
                        </a>

                        <p className="card-text">
                            Yep exactly like that
                        </p>
                    </div>
                    <div className="card-footer">
                        <a href="#" className="card-link"><i className="fa fa-gittip"></i> Like</a>
                        <a href="#" className="card-link"><i className="fa fa-comment"></i> Comment</a>
                        <a href="#" className="card-link"><i className="fa fa-mail-forward"></i> Share</a>
                    </div>
                </div>
            </div>
            <div className="col-md-3">
                <div className="card gedf-card">
                    <div className="card-body">
                        <h5 className="card-title">Card title</h5>
                        <h6 className="card-subtitle mb-2 text-muted">Card subtitle</h6>
                        <p className="card-text">Some quick example text to build on the card title and make up the bulk of the
                            card's content.</p>
                        <a href="#" className="card-link">Card link</a>
                        <a href="#" className="card-link">Another link</a>
                    </div>
                </div>
                <div className="card gedf-card">
                        <div className="card-body">
                            <h5 className="card-title">Card title</h5>
                            <h6 className="card-subtitle mb-2 text-muted">Card subtitle</h6>
                            <p className="card-text">Some quick example text to build on the card title and make up the bulk of the
                                card's content.</p>
                            <a href="#" className="card-link">Card link</a>
                            <a href="#" className="card-link">Another link</a>
                        </div>
                    </div>
            </div>
        </div>
    </div>
            
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
                  <button type="button" className="btn btnpost" onClick={mkPost}><FaPlus className="faplus" /> Post</button>
                  <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                </div>
              </div>
            </div>
          </div>
          <div id="editpost" className="modal" tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit post</h5>
                  <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div className="modal-body">
                  <label>Title</label>
                  <input type="text" className="form-control" placeholder="title" ref={titleRef} />
                  <label>Content</label>
                  <textarea ref={contentRef} className="form-control" placeholder="write here..."></textarea>
                  <label>Replace Image</label>
                  <input type="file" accept="img/png, img/jpeg" onChange={uploadImage} className="form-control"  />
                  {check ?
                  <div>
                    <input type="date" onChange={getDate} />
                  </div>
                  : null}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btnpost"  onClick={sendEdit}><CiCircleCheck className="svg-menu" />Make edit</button>
                  <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                </div>
              </div>
            </div>
          </div>
            </div>


        </div>
    )
}
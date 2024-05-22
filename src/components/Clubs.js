import React, {useState, useEffect, useRef} from "react";
import firebase from 'firebase/compat/app'; 
import { Link, useOutletContext, useNavigate } from "react-router-dom";
import { getAuth, deleteUser, signOut } from "firebase/auth";
import { doc, deleteDoc, getDoc, addDoc, updateDoc, query, where, collection, getDocs, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase-config";
import { JSEncrypt } from 'jsencrypt';
import { getApp } from "firebase/app";
import {getStorage, ref, uploadBytesResumable, getDownloadURL} from "firebase/storage";
import { FaPlus } from "react-icons/fa";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { GoKebabHorizontal } from "react-icons/go";
import { FaEllipsisH } from "react-icons/fa";
import { CiCircleCheck } from "react-icons/ci";
import { FaVoteYea } from "react-icons/fa";
import "./styles/profiles.css";
import "../App.css";

const storage = getStorage(getApp(), "gs://web-fdr-notification.appspot.com");
let clubo = "";
var Latex = require('react-latex');

export default function Clubs() {
    const pass = useNavigate();
    const ctxprops = useOutletContext();
    const [selposts, setPosts] = useState([]);
    const [challenge, setChallenge] = useState([]);
    const [check, setCheck] = useState(false);
    const [img, setImg] = useState([]);
    const titleRef = useRef("");
    const contentRef = useRef("");
    const titleEditRef = useRef("");
    const contentEditRef = useRef("");
    const [polls, setPolls] = useState([]);
    let challenges_t = [];
    let posts_t = [];
    let imgs_t = [];
    let polls_t = [];


    async function getPosts() {
        const clubs_arr = collection(db, `schools/${ctxprops.school_select}/clubs`); 
        const q = query(clubs_arr);
        const snap = await getDocs(q);
        snap.forEach(doc => {
            // console.log(doc.data());
            posts_t.push({posts_data: doc.data(), postid: doc.id});
        });
        console.log(posts_t);
        setPosts(posts_t);
        setChallenge(challenges_t);
        posts_t = [];
        challenges_t = [];
        const qt_pi = query(collection(db, "challenges"));
        const snap_t = await getDocs(qt_pi);
        snap_t.forEach(poll => {if(poll.data().type === "poll") {
            let obj_t = {};
            obj_t.data = poll.data();
            obj_t.pollid = poll.id;
            polls_t.push(obj_t);
        }});
        // console.log(polls_t);
        setPolls(polls_t);
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
    async function uploadImage(e) {
        for(let i = 0; i < e.target.files.length; i++) {
            const storageRef = ref(storage, `images/${ctxprops.id}/${e.target.files[i].name}`);
            const uploadTask = uploadBytesResumable(storageRef, e.target.files[i]);
            await uploadTask.on('state_changed', (snap) => {
                if(snap.state === "running") {
                console.log(snap.state);
                }
            }, (err) => {
                console.log("error upload");
            }, () => {
                getDownloadURL(uploadTask.snapshot.ref).then((url) => {
                    imgs_t.push(url);
                })
            });
        }
        setImg(imgs_t);
    }
    // const postdateref = useRef();
    const [datetime, setDatetime] = useState('gg');

    async function mkPost() {
        // console.log(img);
        const button_target = document.querySelectorAll(".btnpost")[1];
        button_target.textContent = "Posting...";
        const clubsArr = document.querySelectorAll(".posttoclub");
        if(contentRef.current.value !== "" && titleRef.current.value !== "") {
            if(!check) {
                for(let i = 0; i < clubsArr.length; i++) {
                    if(clubsArr[i].checked) {
                        await addDoc(collection(db, `schools/${ctxprops.school_select}/clubs`), {
                            "author": ctxprops.username,
                            "author_id": ctxprops.id,
                            "author_pfp": ctxprops.pfp,
                            "date": getCurrentTime(),//${current_date.getFullYear()}-${(current_date.getMonth()+1) < 10 ? "0"+(current_date.getMonth()+1).toString() : current_date.getMonth()}-${current_date.getDate()}
                            "img": img,
                            "text": contentRef.current.value,
                            "title": titleRef.current.value,
                            "type": (check ? "challenge" : "regular"),
                            "due_date": (check ? convertToPOSIX() : null ),
                            "from_club": clubsArr[i].id,
                            "origin": `${ctxprops.school_select}/${clubsArr[i].id}`,
                        })

                        // if(selposts.length !== 0) {
                        //     const reify = selposts[i].post_data.map(post => post);
                        //     await updateDoc(doc(db,`schools/${ctxprops.school_select}/clubs/${clubsArr[i].id.toString()}`), {
                        //         posts: reify,
                        //     })
                        // }
                    }
                }
            } else { //send to challegnes collection for easier
                await addDoc(collection(db,"challenges"), {
                    "content": contentRef.current.value,
                    "title": titleRef.current.value,
                    "due_date": convertToPOSIX(datetime),
                    "origin": `${ctxprops.school_select}/${clubsArr[0].id.toString()}`, //TODO: fix this so that its from the proper club or smth
                    "status": "active",
                    "submissions": [],
                })
            }
        } else {
            console.log(contentRef.current.value);
            console.log(titleRef.current.value);
        }
        // setTimeout(() => {getPosts(); },3000);    
    }
    const [editId, setEditId] = useState("");
    async function editPost(postId) {
        // console.log(postId);
        const post_index_id = postId.substring(postId.indexOf("-")+1,postId.indexOf(":"));
        const post_id_r = postId.substring(postId.indexOf(":")+1);        
        titleEditRef.current.value = selposts[parseInt(post_index_id)].posts_data.title;
        contentEditRef.current.value = selposts[parseInt(post_index_id)].posts_data.text;
        setEditId({pir: post_id_r, pii: post_index_id});
    }
    async function sendEdit() {
        document.getElementById("editor").innerText = 'updating...';
        selposts[parseInt(editId.pii)].posts_data.title = titleEditRef.current.value;
        selposts[parseInt(editId.pii)].posts_data.text = contentEditRef.current.value;
        if(img.length !== 0) {
            selposts[parseInt(editId.pii)].posts_data.img = img; //ONE
        }
        await updateDoc(doc(db, `schools/${ctxprops.school_select}/clubs/${editId.pir}`), {
            "title": titleEditRef.current.value,
            "text": contentEditRef.current.value,
            "img": selposts[parseInt(editId.pii)].posts_data.img
        });
        setTimeout(() => {
            getPosts();
        },3000);
    }
    async function deletePost(postId) {
        selposts.splice(parseInt(postId.substring(postId.indexOf("-")+1,postId.indexOf(":"))), 1);
        await deleteDoc(doc(db, `schools/${ctxprops.school_select}/clubs/${postId.substring(postId.indexOf(":")+1)}`))
        getPosts();
    }

    useEffect(() => { 
        document.body.setAttribute("data-theme", ctxprops.theme.toLowerCase())
        getPosts();
        getChallenges();
    }, []);
    const [toggle, setToggle] = useState("");
    const indToggle = (e) => {
        if(toggle === e.target.id) {
            setToggle("");
        } else {
            setToggle(e.target.id);
        }
    }
    function getCurrentTime() {
        var b = new Date();
        return (b.getTime() - b.getMilliseconds()) / 1000;
    }
    function convertToPOSIX(input) {
        //date as in the usestate
        console.log(input);
        var future = new Date(input.replace(/-/g,'/').replace('T',' '));
        return (future.getTime() - future.getMilliseconds()) / 1000;
    }
    function convertFromPOSIX(unix_timestamp) {
        var eps = new Date(unix_timestamp*1000);
        return eps.toLocaleDateString("en-US")
        // eps.toLocaleString('en-US', { timeZone: 'America/New_York' });
        // return (eps.getFullYear() + "-" + (parseInt(eps.getMonth())+1) + "-" + (parseInt(eps.getDate())));
    }

    
    function min_s(x, y, z) {
		if (x <= y && x <= z) return x;
		if (y <= x && y <= z) return y;
		return z;
	}
    function distance_metric(a,b) { //similarity of words and phrases (levenshtein algo, the most efficient)
        let cost;
		let m = a.length;
		let n = b.length;
		if(m < n) {
			var c = a; a = b; b = c;
			var o = m; m = n; n = o;
		}
		var r = []; r[0] = [];
		for(let c = 0; c < n + 1; ++c) {
			r[0][c] = c;
		}
		for(let i = 1; i < m + 1; ++i) {
			r[i] = []; r[i][0] = i;
			for ( var j = 1; j < n + 1; ++j ) {
				cost = a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1;
				r[i][j] = min_s( r[i-1][j] + 1, r[i][j-1] + 1, r[i-1][j-1] + cost );
			}
		}
		return r[r.length-1][r[0].length-1];
    }
    const [filter, setFilter] = useState([]);
    const searchRef= useRef();
    async function findPost(e) {
        setFilter([]);
        const club_filter = /\[(.*?)\]/i;
        const club = searchRef.current.value.match(club_filter);
        //check that the club is in club list of course
        if(club !== null) {
            let post_filter = [];
            const mod = searchRef.current.value.replace(club_filter, '');
            await getDoc(doc(db, `schools/${ctxprops.school_select}/clubs/${club[1]}`)).then((p) => {
                for(const post of p.data().posts) {
                    if(distance_metric(post.title, mod) < (post.title.length) || distance_metric(post.text, mod) < post.text.length) {
                        console.log((post.title.length) - distance_metric(post.title, mod), " vs ", distance_metric(post.title, mod));
                        console.log((post.text.length) - distance_metric(post.text, mod), " vs ", distance_metric(post.text, mod));
                        post_filter.push(post);
                    } else {
                        console.log(distance_metric(post.title, mod));
                        console.log(distance_metric(post.text, mod));
                    }
                }
            });
            // console.log(post_filter);
            setFilter(post_filter);
            post_filter = [];
        }
    }
    const [g_c, setG_c] = useState([]);
    async function getChallenges() {
        let challenges_t = [];
        const q = query(collection(db, "challenges"));
        const gd = await getDocs(q);
        gd.forEach((document) => {
            if((getCurrentTime() - parseInt(document.data().due_date)) > 0) {
                // deleteDoc(doc(db, "challenges", document.id));
                console.log("expiring")
            }
            challenges_t.push({chal_data: document.data(), challenge_id: document.id});
        });
        setG_c(challenges_t);
        console.log(challenges_t);

        challenges_t = [];
    }
    async function updateChallengesWithPostID(challenge_id, post_id) { //so far it will only work for one hashtag
        // console.log(post_id)
        let nc = challenge_id.filter(c => c !== null);
        let obj_target = g_c.find(o => o.challenge_id === nc[0]);
        if(obj_target !== undefined) {
            if(!(obj_target.chal_data.submissions.includes(post_id))) { //wtf why this dumass javascript not working
                obj_target.chal_data.submissions.push(post_id);
                await updateDoc(doc(db, `challenges/${nc[0]}`), {
                    "submissions": obj_target.chal_data.submissions,
                })
            } else {
                // console.log(obj_target.chal_data.submissions.includes("KCiweuB3owmSZ5NgroNu"));
            }
            
        }
    }

    const pollRef = useRef();
    const polloptsref = useRef();
    let [ets, setEts] = useState([]);
    const pollDateRef = useRef();
    function pollingInputs() { //for some bullshit reason it cannot update within the render, it must be outside
        console.log(polloptsref.current.value);
        setEts([...Array(parseInt(polloptsref.current.value)).keys()]);
    }
    async function mkPoll() { //sending it to challenges cuz it needs appear on calendar
        const inps = document.querySelectorAll(".option-poll-input");
        let ets_t = [];
        for(const inp of inps) {
            ets_t.push({opt: inp.value, votes: 0});
        }
        await addDoc(collection(db, "challenges"), {
            "title": pollRef.current.value,
            "options": ets_t,
            "due_date": convertToPOSIX(pollDateRef.current.value),
            "origin": null,
            "content": null,
            "status": "active",
            "type": "poll",
            "answeredBy": [],
        });
    }
    async function updatePoll(event,a,options,o,poll_id) {
        o.votes += 1;
        event.target.innerText = `${o.opt}:${o.votes}`;
        a.push(ctxprops.id);
        await updateDoc(doc(db, `challenges/${poll_id}`), {
            options: options,
            answeredBy: a
        });
        setTimeout(()=>{window.location.reload()},3000);
    }
    async function udt(e) {
        await setDatetime(e.target.value);
    }

    // console.log(/\B#([A-Za-z0-9]{2,})(?![~!@#$%^&*()=+_`\-\|\\/'\[\]\{\}]|[?.,]*\w)/i.test("hello world #aplangexam"));
    // console.log("hello world #aplangexam".match(/\B#([A-Za-z0-9]{2,})(?![~!@#$%^&*()=+_`\-\|\\/'\[\]\{\}]|[?.,]*\w)/i));
    const regexLatexBlock = /\$\$.*\$\$/i;
    // console.log(regexLatexBlock.test("here is math: $$ \oint_{C}\mathbf{F}d\mathbf{r} $$"));
    return (
        <div className="clubs-page">
            <button className="btn btnpost" data-toggle="modal" data-target="#makepost">Make new Post</button>
            <button className="btn btnpost" data-toggle="modal" data-target="#pollpost">Create New poll</button>
        
            <nav className="navbar cinline-nav"> {/*navbar-light bg-white */}
                    <a href="#" className="navbar-brand"></a>
                    <form className="form-inline">
                        <div className="input-group">
                            <input type="text" className="form-control" aria-label="Recipient's username" aria-describedby="button-addon2" ref={searchRef} />
                            <div className="input-group-append">
                                <button className="btn btn-outline-primary" type="button" id="button-addon2" onClick={findPost}>
                                    <i className="fa fa-search"></i>
                                </button>
                            </div>
                        </div>
                    </form>
                </nav>



            <div class="container-fluid gedf-wrapper">
                <div class="row">
                    <div className="col-md-6 gedf-main">
                    {polls.map((poll,index) => (
                        <div className="card gedf-card poll_div">
                            <h2>{poll.data.title}</h2>
                            <h5>Expires: {convertFromPOSIX(poll.data.due_date)}</h5>
                            {poll.data.answeredBy.includes(ctxprops.id) ? 
                            poll.data.options.map(opt => (
                                <div><FaVoteYea style={{width: '13px', height: '13px'}} /><p className="ctext-primary">
                                    {opt.opt}:{opt.votes}
                                </p></div>))
                        : poll.data.options.map(opt => (
                            <button onClick={(e) => {updatePoll(e,poll.data.answeredBy,poll.data.options,opt,poll.pollid)}} className="btn wbtn">
                                {opt.opt}
                            </button>))}
                            
                        </div>
                    ))}
                          
                    {filter.length === 0 ? selposts.map((post_obj, index) => { // in future we can probably flatten the array for displaying purposes
                        return ( // bruh react be like...
                            <div>
                            <div className="card gedf-card" id={"postid-"+post_obj.postid}>
                            <div className="card-header">
                                <div className="d-flex justify-content-between align-items-center">
                                <div key={index} className="d-flex justify-content-between align-items-center">
                                    {ctxprops.role === "site_admin" || ctxprops.id === post_obj.posts_data.author_id ? 
                                    <div className="dropdown">
                                        <button className=" cbtn btn-link dropdown-toggle" id={"btnid-"+index.toString()+":"+post_obj.postid} onClick={indToggle} > 
                                            <FaEllipsisH className="svg-menu" id={"btnid-"+index.toString()+":"+post_obj.postid} onClick={indToggle} />
                                        </button>
                                        {toggle === ("btnid-"+index.toString()+":"+post_obj.postid) ? 
                                        <div className="dropdown dropdown-menu-right">
                                            <div className="h6 dropdown-header">Configuration</div>
                                            <button className="dropdown-item btnedit" data-toggle="modal" data-target="#editpost" onClick={() => editPost("postid-"+index.toString()+":"+post_obj.postid)}>Edit</button>
                                            <button className="warning-hover" onClick={()=>deletePost("postid-"+index.toString()+":"+post_obj.postid)}>Delete</button>
                                        </div>
                                        : null}
                                    </div>
                                    : null}
                                    <div class="mr-2">
                                        <img className="rounded-circle" width="45" src={post_obj.posts_data.author_pfp} alt=""/>
                                    </div>
                                    <div className="ml-2">  
                                    <div className="h5 m-0">{post_obj.posts_data.author}</div>
                                        <div className="h7">From {post_obj.posts_data.from_club} club</div>
                                    </div>
                                </div>
                                </div>
                            </div>
                            <div className="card-body cbg">
                                <div className="cmute-text h7 mb-2"> <i className="fa fa-clock-o"></i>{convertFromPOSIX(post_obj.posts_data.date)}
                                    {/* {post.type === "challenge" ?
                                        <p>due date: {convertFromPOSIX(post.due_date)}</p> 
                                        :null} */}
                                </div>
                                <a className="card-link" href="#"><h5 className="card-title">{post_obj.posts_data.title}</h5></a>
                                
                                <div>
                                {typeof post_obj.posts_data.img === "object" && post_obj.posts_data.img.length > 1 ? 
                                <div id="carouselExampleControls" class="carousel slide" data-bs-interval="false" data-interval="false">
                                    <div className="carousel-inner">
                                        {post_obj.posts_data.img.map((image, ii) => {
                                            if(ii === 0) {
                                                return (<div className="carousel-item active">
                                                    <img src={image} className="imgofpost d-block w-100" />
                                                </div>)
                                            } else {
                                                return (<div className="carousel-item">
                                                <img src={image} className="imgofpost d-block w-100" />
                                            </div>)
                                            }
                                        })}
                                    </div>
                                    <a className="carousel-control-prev" href="#carouselExampleControls" role="button" data-slide="prev">
                                        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                                        <span className="sr-only">Previous</span>
                                    </a>
                                    <a className="carousel-control-next" href="#carouselExampleControls" role="button" data-slide="next">
                                        <span className="carousel-control-next-icon" aria-hidden="true"></span>
                                        <span className="sr-only">Next</span>
                                    </a>
                                </div>
                                : null}
                                {post_obj.posts_data.img.length === 1 ? 
                                <img src={post_obj.posts_data.img[0]} className="imgofpost d-block w-100" />
                            :null}
                                {!(typeof post_obj.posts_data.img === "object") ? 
                                <img src={post_obj.posts_data.img} className="imgofpost" />
                            : null}
                                </div>                                
                                <p className="card-text"> {/**coudl possilby shorten by latexing here and writing only a single condition for hashes */}
                                { /\B#([A-Za-z0-9]{2,})(?![~!@#$%^&*()=+_`\-\|\\/'\[\]\{\}]|[?.,]*\w)/i.test(post_obj.posts_data.text) && regexLatexBlock.test(post_obj.posts_data.text.replace(/\n/g, '')) ? 
                                <div>
                                        <div><Latex displayMode={true}>{post_obj.posts_data.text.replace(/\B#([A-Za-z0-9]{2,})(?![~!@#$%^&*()=+_`\-\|\\/'\[\]\{\}]|[?.,]*\w)/i, '')}</Latex></div>
                                        {/* {console.log(post_obj.posts_data.text.replace(/\B#([A-Za-z0-9]{2,})(?![~!@#$%^&*()=+_`\-\|\\/'\[\]\{\}]|[?.,]*\w)/i))} */}
                                {/*  */}
                                    {post_obj.posts_data.text.match(/\B#([A-Za-z0-9]{2,})(?![~!@#$%^&*()=+_`\-\|\\/'\[\]\{\}]|[?.,]*\w)/i).map((hash,i) => {
                                            // console.log(i);
                                        if(i %2===0) {
                                            if(!g_c.map(c => c.chal_data.title.replace(/ /g, '') === hash.substring(1)).every((val,i,arr) => val === arr[0])) {

                                                updateChallengesWithPostID((g_c.map(c => c.chal_data.title.replace(/ /g, '') === hash.substring(1) ? c.challenge_id : null)), post_obj.postid);
                                            return (
                                                <div>
                                                    <span style={{color: '#72bcd4',cursor:'pointer'}} onClick={() => {pass(`/submissions`, {state: 
                                                        {header: hash, 
                                                        challenge_data: (g_c.map(c => c.chal_data.title.replace(/ /g, '') === hash.substring(1) ? c.chal_data : null)), 
                                                        school_select: ctxprops.school_select,
                                                        }}) }}>{hash}</span>
                                                    </div>
                                            )
                                            } else {
                                               console.log("fake hash detected")
                                                return (
                                                    <div>
                                                    <span style={{color: '#D74C4C',cursor:'not-allowed'}}>{hash}</span>
                                                    </div>
                                                )
                                            }
                                        }
                                        
                                })}
                                    
                                </div>   
                            : regexLatexBlock.test(post_obj.posts_data.text.replace(/\n/g, '')) ? 
                                <div>
                                    <p>there is only latex</p>
                                   <Latex displayMode={true}>{post_obj.posts_data.text.replace(/\n/g, '').match(regexLatexBlock)[0]}</Latex>
                                </div>
                            : /\B#([A-Za-z0-9]{2,})(?![~!@#$%^&*()=+_`\-\|\\/'\[\]\{\}]|[?.,]*\w)/i.test(post_obj.posts_data.text) ?
                            <div>
                                <div>
                                        <p>there is hash tonl;y</p>
                                        {post_obj.posts_data.text.replace(/\B#([A-Za-z0-9]{2,})(?![~!@#$%^&*()=+_`\-\|\\/'\[\]\{\}]|[?.,]*\w)/i, '').replace(regexLatexBlock, '')}
                                        {/* <div><Latex displayMode={true}>{post_obj.posts_data.text}</Latex></div> */}
                                        {post_obj.posts_data.text.match(/\B#([A-Za-z0-9]{2,})(?![~!@#$%^&*()=+_`\-\|\\/'\[\]\{\}]|[?.,]*\w)/i).map((hash,i) => {
                                            // console.log(i);
                                        if(i %2===0) {
                                            if(!g_c.map(c => c.chal_data.title.replace(/ /g, '') === hash.substring(1)).every((val,i,arr) => val === arr[0])) {

                                                updateChallengesWithPostID((g_c.map(c => c.chal_data.title.replace(/ /g, '') === hash.substring(1) ? c.challenge_id : null)), post_obj.postid);
                                            return (
                                                <div>
                                                    <span style={{color: '#72bcd4',cursor:'pointer'}} onClick={() => {pass(`/submissions`, {state: 
                                                        {header: hash, 
                                                        challenge_data: (g_c.map(c => c.chal_data.title.replace(/ /g, '') === hash.substring(1) ? c.chal_data : null)), 
                                                        school_select: ctxprops.school_select,
                                                        }}) }}>{hash}</span>
                                                    </div>
                                            )
                                            } else {
                                               console.log("fake hash detected")
                                                return (
                                                    <div>
                                                    <span style={{color: '#D74C4C',cursor:'not-allowed'}}>{hash}</span>
                                                    </div>
                                                )
                                            }
                                        }
                                        
                                })}</div>
                            </div>
                        
                        : <p>ther is none!!!!!!!!</p>}
                                </p>
                            </div>
                            <div className="card-footer">
                            </div>
                        </div>   
                            
                    </div>
                    )
                    }) : 
                    <div>
                        {filter.map(post => (
                            <p>{post.author_id}</p>
                        ))}
                    </div>}
             
            </div>
        </div>
    </div>
            
            <div className="override-flex">
            <div id="makepost" className="modal " tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content cmodal-content cmodal">
                <div className="modal-header">
                  <h5 className="modal-title cmodal-title">Make post</h5>
                  <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div className="modal-body">
                  <label className="ctext-primary">Title</label>
                  <input type="text" className="form-control" placeholder="title" ref={titleRef} />
                  <label className="ctext-primary">Content</label>
                  <textarea ref={contentRef} className="form-control" placeholder="write here..."></textarea>
                  <input type="file" onChange={uploadImage} className="form-control" multiple />
                  <label className="ctext-primary">Post to</label>
                  {Array.from(ctxprops.clubs).sort().map((club, index) => ( //clubs need to be alphabetically ordered to sync with firebase
                    <div className="ctext-primary"><input key={index} type="checkbox" className="posttoclub" id={club} /><label>{club}</label></div>
                  ))}
                  <input type="checkbox" id="challenge-checkbox" onChange={showCalendar} /><label className="ctext-primary" htmlFor="challenge-checkbox">Challenge</label>
                  {check ?
                  <div>
                    <input type="datetime-local" className="challenge_datetimelocal" value={datetime || "1970-01-01T08:30"} onChange={(e)=>udt(e)}/>
                  </div>
                  : null}
                  
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btnpost" onClick={mkPost}><FaPlus className="faplus" /> Post</button>
                  <button type="button" className="btn" data-dismiss="modal">Close</button>
                </div>
              </div>
            </div>
          </div>
          <div id="editpost" className="modal" tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content cmodal ">   
                <div className="modal-header">
                  <h5 className="modal-title cmodal-title">Edit post</h5>
                  <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div className="modal-body">
                  <label className="ctext-primary">Title</label>
                  <input type="text" className="form-control" placeholder="title" ref={titleEditRef} />
                  <label className="ctext-primary">Content</label>
                  <textarea ref={contentEditRef} className="form-control" placeholder="write here..."></textarea>
                  <label className="ctext-primary">Replace Image</label>
                  <input type="file" accept="img/png, img/jpeg" onChange={uploadImage} className="form-control"  />
                  {check ?
                  <div>
                    <input type="date" /> {/*fix later ig */}
                  </div>
                  : null}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btnpost" id="editor" onClick={sendEdit}><CiCircleCheck className="svg-menu" />Make edit</button>
                  <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                </div>
              </div>
            </div>
          </div>


          <div id="pollpost" className="modal" tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content cmodal ">   
                <div className="modal-header">
                  <h5 className="modal-title cmodal-title">Create Poll</h5>
                  <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div className="modal-body">
                    <input type="text" placeholder="Enter question/title..." className="form-control" ref={pollRef} />
                    <label htmlFor="poll-date">When will it expire?</label><input type="datetime-local" id="poll-date" ref={pollDateRef} /> <br />
                    <label htmlFor="number_of_opts">How many options?</label> <input type="number" min="1" className="form-control" id="number_of_opts" ref={polloptsref} />
                    <button onClick={pollingInputs}>confirm</button>
                    {ets.map(i => (
                        <ol>
                            <li><input type="text" placeholder="option..." className="form-control option-poll-input" key={i} /></li>
                        </ol>
                    ))}
                 
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btnpost" id="poller" onClick={mkPoll}><CiCircleCheck className="svg-menu" />Create poll</button>
                  <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                </div>
              </div>
            </div>
          </div>

            </div>
        </div>
    )
}

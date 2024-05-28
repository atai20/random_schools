import React, {useState, useEffect} from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { db } from "../firebase-config";
import { doc, deleteDoc, getDoc, addDoc, updateDoc, query, where, collection, getDocs, serverTimestamp, documentId } from "firebase/firestore";
import $ from 'jquery';
import { FaCheck } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";

import "../App.css";

export default function Submissions(props) {
    const loc = useLocation();
    const [refPost, setRefPost] = useState([]);
    // console.log(loc.state);
    async function getRefPosts() {
        let nc = loc.state.challenge_data.filter(c => c !== null);
        const q = query(collection(db, `schools/${loc.state.school_select}/posts`), where(documentId(), 'in', nc[0].submissions));
        const q_g = await getDocs(q);
        let rp_t = [];
        q_g.forEach(element => {
            rp_t.push({"pdata": element.data(), "pid": element.id});
        });
        setRefPost(rp_t);
    }
    useEffect(() => {
        getRefPosts(); //ummmm get challenge posts
        // $("sub-select").val()
    },[]);
    async function updatePostSubmissionStatus(accept, post_id) {
        await updateDoc(doc(db, `schools/${loc.state.school_select}/posts/${post_id}`), {
            "accepted": accept
        })
    }
    return (
        <div className="ctext-primary center-text">
          <h1 className="newsreader-title">{loc.state.header}</h1>

            <div className="mini-view-grid">

          {refPost.map(post => (
                <div className="mini-view-card">
                    {loc.state.challenge_data.filter(c => c !== null)[0].creator === loc.state.uid ? 
                        <div>
                            <button className="btn btn-success" onClick={() => updatePostSubmissionStatus(true, post.pid)}><FaCheck /></button>
                            <button className="btn btn-danger" onClick={() => updatePostSubmissionStatus(false, post.pid)}><RxCross2 /></button>
                        </div>
                    :null}
                    <p>{post.pdata.title}</p><br/>
                    <p>{post.pdata.text}</p>
                    <div>
                    {typeof post.pdata.img === "object" && post.pdata.img.length > 1 ? 
                    <div id="carouselExampleControls" class="carousel slide" data-bs-interval="false" data-interval="false">
                        <div className="carousel-inner">
                            {post.pdata.img.map((image, ii) => {
                                if(ii === 0) {
                                    return (<div className="carousel-item active">
                                        <img style={{width: 'auto', height: 'auto'}} src={image} className="imgofpost d-block w-100" />
                                    </div>)
                                } else {
                                    return (<div className="carousel-item">
                                    <img src={image} style={{width: 'auto', height: 'auto'}} className="imgofpost d-block w-100" />
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
                    {post.pdata.img.length === 1 ? 
                    <img src={post.pdata.img[0]} className="imgofpost d-block w-100" style={{width: 'auto', height: 'auto'}}  />
                :null}
                    {!(typeof post.pdata.img === "object") ? 
                    <img src={post.pdata.img} className="imgofpost" style={{width: 'auto', height: 'auto'}} />
                : null}
                    </div>  
                </div>
          ))}
            </div>

        </div>
    )
}
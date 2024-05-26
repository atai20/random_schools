import React, {useState, useEffect} from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { db } from "../firebase-config";
import { doc, deleteDoc, getDoc, addDoc, updateDoc, query, where, collection, getDocs, serverTimestamp, documentId } from "firebase/firestore";
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
            rp_t.push(element.data());
        });
        setRefPost(rp_t);
    }
    useEffect(() => {
        getRefPosts(); //ummmm get challenge posts
    },[]);
    // console.log(refPost);
    return (
        <div className="ctext-primary center-text">
          <h1 className="newsreader-title">{loc.state.header}</h1>
        
          {loc.state.challenge_data.map(challenge => {
            if(challenge !== null) {
                if(loc.state.uid === challenge.creator) {
                    console.log("gotem")
                }
            }
          })}
            <div className="mini-view-grid">

          {refPost.map(post => (
                <div className="mini-view-card">
                    <p>{post.title}</p><br/>
                    <p>{post.text}</p>
                    <div>
                    {typeof post.img === "object" && post.img.length > 1 ? 
                    <div id="carouselExampleControls" class="carousel slide" data-bs-interval="false" data-interval="false">
                        <div className="carousel-inner">
                            {post.img.map((image, ii) => {
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
                    {post.img.length === 1 ? 
                    <img src={post.img[0]} className="imgofpost d-block w-100" style={{width: 'auto', height: 'auto'}}  />
                :null}
                    {!(typeof post.img === "object") ? 
                    <img src={post.img} className="imgofpost" style={{width: 'auto', height: 'auto'}} />
                : null}
                    </div>  
                </div>
          ))}
            </div>

        </div>
    )
}
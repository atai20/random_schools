import React, {useRef, useState, useEffect} from "react";
import "./news_files/css.css";
import "./news_files/blog.css";
import "./news_files/bootstrap.min.css";
import { Link, useNavigate,  Outlet, useOutletContext } from "react-router-dom"; 
import { getFirestore, collection, getDocs,orderBy, limit,  addDoc, query,getDoc, doc, setDoc, updateDoc, deleteDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase-config";
import { JSEncrypt } from 'jsencrypt';
import { getApp } from "firebase/app";
import {getStorage, ref, uploadBytesResumable, getDownloadURL} from "firebase/storage";
import NewsTemplate from "./NewsTemplate";


const storage = getStorage(getApp(), "gs://web-fdr-notification.appspot.com");
let arr = []; // DONT REMOVE THIS. USESTATE DOES NOT WORK LIKE YOU THINK
const OutletProvider = ({children}) => {
  const ctx = useOutletContext();
  return typeof children === 'function' ? children(ctx) : children;
}


export default function Schools(props) {
  const pass= useNavigate();
  const state_ctx_props = useOutletContext();
  const [school, setSchool] = useState("");
  const [news_text, setNews] = useState([]);
  let news_t = [];
  const get_news = async() => {
    const q = query(collection(db,`schools/${state_ctx_props.school_select}/news`), limit(2));
    const docsRef = await getDocs(q);
    
    docsRef.forEach(doc => {

      news_t.push(doc.data())

    });
    setNews(news_t);
  }
  function convertFromPOSIX(unix_timestamp) {
    var eps = new Date(unix_timestamp*1000);
    return (eps.getFullYear() + "-" + (parseInt(eps.getMonth())+1) + "-" + eps.getDate());
  }
  async function schoolInfo() {
    const schoolRef = doc(db, `schools/${state_ctx_props.school_select}`);
    
    await getDoc(schoolRef).then((school_data) => {
      setSchool(school_data.data());
    });      
  }
  
  useEffect(() => {
    document.body.setAttribute("data-theme", state_ctx_props.theme.toLowerCase());
    schoolInfo();
    get_news();
  },[]);

    return (
        <div className="schools_main ctext-primary">
    <div class="container">
      <header class="blog-header py-3">
        <div class="row flex-nowrap justify-content-between align-items-center">
          <div class="col-4 pt-1">
         
          </div>
          <div class="col-4 text-center">
            <a class="blog-header-logo ctext-primary" href="#"> {school.name} news</a>
          </div>
          <div class="col-4 d-flex justify-content-end align-items-center">
            <a class="text-muted ctext-primary" href="#">
            </a>
            
          </div>
        </div>
      </header>

      <div class="nav-scroller py-1 mb-2">
        <nav className="nav d-flex justify-content-between" style={{background: 'none'}}>
        </nav>
      </div>

      <div class="jumbotron p-3 p-md-5 text-white rounded bg-dark" className="news_head">
       
        <div class="col-md-6 px-0" className="news_head_grad">
          <h1 id="article"class="display-4 font-italic">{school.name}'s moto</h1>
          <p class="lead my-3">{school.description}</p>
          
          <p class="lead mb-0"></p>
    
        </div>
      </div>

      <div class="row mb-2">
        {news_text.map((data) => (
        <div class="col-md-6 text-block">
          <div class="card flex-md-row mb-4 box-shadow h-md-250">
            <div class="card-body d-flex flex-column align-items-start">
              <strong class="d-inline-block mb-2 text-success">New</strong>
    <div>
    <h3 id="article"class="mb-0">
    <a class="ctext-primary" href="#">{data.title}</a>

    </h3>
 
 <div class="mb-1 text-muted">{convertFromPOSIX(data.date)}</div>

 <p className="card-text mb-auto" id="news_desc">{data.text}</p>

 <button onClick={() => {pass("/newsdisplay", {state: {title: data.title, content: data.text}})}}>Read more</button>
                </div>
            </div>
            {data.img.map((image, ii) => {
              if(ii === 0) {
                  return (<div className="carousel-item active" background={image}>
                      <img style={{height:"100"}}src={image} className="imgofpost d-block w-100" />
                  </div>)
              }
            })}
          </div>
        </div>
))

}
</div>
    </div>
    <script src="news_files/jquery-3.2.1.slim.min.js" integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN" crossorigin="anonymous"></script>
    <script src="news_files/popper.min.js"></script>
    <script src="news_files/bootstrap.min.js"></script>
    <script src="news_files/holder.min.js"></script>
</div>
    )
}

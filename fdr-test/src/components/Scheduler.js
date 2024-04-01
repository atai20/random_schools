import Calendar from 'react-calendar';
import React, { useContext, useState,useEffect, useRef } from 'react';
import { db } from "../firebase-config";
import { getFirestore, collection, getDocs, getDoc, doc, setDoc, updateDoc, deleteDoc, onSnapshot, query } from "firebase/firestore";
import "../App.css";
import { Link, useOutletContext } from "react-router-dom";


let challenges_t = [];
function Scheduler() {
    const ctxprops = useOutletContext();
    const [challenge, setChallenge] = useState([]);
    const [cbtn, setCbtn] = useState("");
    const [school, setSchool] = useState("");

    function getCurrentTime() {
      const time_t = new Date();
      return (time_t.getTime() - time_t.getMilliseconds()) / 1000; 
    }
    const [currdate, setCurrDate] = useState(getCurrentTime());
    const [display, setDisplay] = useState("");

    async function getChallenges() {
      const q = query(collection(db, "challenges"));
      const gd = await getDocs(q);
      gd.forEach((doc) => {
        challenges_t.push(doc.data());
      });
      setChallenge(challenges_t);
    }
    async function schoolInfo() {
      const schoolRef = doc(db, `schools/${ctxprops.school_select}`);
      await getDoc(schoolRef).then((school_data) => {
        setSchool(school_data.data());
      });      
    }
    useEffect(() => {
      document.body.setAttribute("data-theme", ctxprops.theme.toLowerCase());
      getChallenges();
      schoolInfo();
    },[]);
    function convertFromPOSIX(unix_timestamp) {
      var eps = new Date(unix_timestamp*1000);
      return (eps.getFullYear() + "-" + (parseInt(eps.getMonth())+1) + "-" + (parseInt(eps.getDate())+1)); //+1 to getDate to adjust to GMT otherwise EST
    }
    function convertToPOSIX(dateobj) {
      var future = new Date(dateobj);
      return (future.getTime() - future.getMilliseconds()) / 1000;
    }

    // const [toggle, setToggle] = useState("");
    const [currChallenge, setCurrChallenge] = useState([]);
    function challengeDate(value, event) {
      for(const c of challenge) {
        if(convertFromPOSIX(c.due_date) === (value.getFullYear()+"-"+(parseInt(value.getMonth())+1)+"-"+(parseInt(value.getDate())))) {
          setCurrChallenge([]);
          setCurrChallenge(currChallenge => [...currChallenge, {"title": c.title, "content": c.content, "origin": c.origin, "offsetleft": event.target.offsetLeft, "offsettop": event.target.offsetTop}]);
        } 
      }
      
    }
    function displaceRelative(ev) {
      ev.target.classList.add("date_click_active_custom");
    }
    

    return (
      <div className='calendar-main'>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous"/>
          <script src="https://code.jquery.com/jquery-3.2.1.slim.min.js" integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN" crossorigin="anonymous"></script>
          <script src="https://cdn.jsdelivr.net/npm/popper.js@1.12.9/dist/umd/popper.min.js" integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q" crossorigin="anonymous"></script>
          <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/js/bootstrap.min.js" integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl" crossorigin="anonymous"></script>
          <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.5.0/font/bootstrap-icons.css" rel="stylesheet" />
        
          <link href="css/styles.css" rel="stylesheet" />
        <h1 className='text-center ctext-primary'>Calendar</h1>
        <div className='calendar-container' >
          <Calendar onChange={(v,e) => {setCurrDate(v);challengeDate(v,e);setCbtn(v)}} className="ctext-primary" />

          {cbtn !== "" ? 
          <div className='render-challenge-temp' >
            {currChallenge.length !== 0 ? 
            <div>
              {currChallenge.map((t_c) => (
                <div className='render-challenge' id="challenge-display" style={{left: t_c.offsetleft, top: (t_c.offsettop+20)}}>
                  <p className='ctext-primary'>{t_c.title}</p>
                  <p className='ctext-primary'>{t_c.content}</p>
                  <p className='ctext-primary'>{t_c.origin.replace(`${ctxprops.school_select}`, `${school.name}`)}</p>
                  <button onClick={() => setCurrChallenge([])} className='btn'>Close</button>
                </div>
              ))}
            </div>
            :null}
          </div>
          :null}
          
        <p className='text-center ctext-primary'>
          <span className='bold'>Selected Date:</span>
          {/* {currdate.getDate()} bruh */}
        </p>
        </div>
        <div className='leaderboard ctext-primary'>Leaderboard and stuff</div>
    </div>
    );
  }
  
  export default Scheduler;
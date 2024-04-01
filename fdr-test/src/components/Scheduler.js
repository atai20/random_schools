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
    // const currentBtn = useRef("");
    const [cbtn, setCbtn] = useState("");

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
    useEffect(() => {
      document.body.setAttribute("data-theme", ctxprops.theme.toLowerCase());
      getChallenges();
      // setDate();
    },[]);
    function convertFromPOSIX(unix_timestamp) {
      var eps = new Date(unix_timestamp*1000);
      return (eps.getFullYear() + "-" + (parseInt(eps.getMonth())+1) + "-" + (parseInt(eps.getDate())+1)); //+1 to getDate to adjust to GMT otherwise EST
    }
    function convertToPOSIX(dateobj) {
      //date as in the usestate
      var future = new Date(dateobj);
      return (future.getTime() - future.getMilliseconds()) / 1000;
    }

    const [toggle, setToggle] = useState("");
    const [currChallenge, setCurrChallenge] = useState([]);
    function challengeDate(value) {
      for(const c of challenge) {
        if(convertFromPOSIX(c.due_date) === (value.getFullYear()+"-"+(parseInt(value.getMonth())+1)+"-"+(parseInt(value.getDate())))) {
          if(toggle === value.getDate().toString()) {
            setToggle("");
            setCurrChallenge([]);
          } else {
            setToggle(value.getDate().toString());
            setCurrChallenge([]);
            setCurrChallenge(currChallenge => [...currChallenge, {"title": c.title, "content": c.content, "origin": c.origin}]);
          }
        } 
      }
    }
    // console.log(currChallenge);

    return (
      <div className='calendar-main'>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous"/>
          <script src="https://code.jquery.com/jquery-3.2.1.slim.min.js" integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN" crossorigin="anonymous"></script>
          <script src="https://cdn.jsdelivr.net/npm/popper.js@1.12.9/dist/umd/popper.min.js" integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q" crossorigin="anonymous"></script>
          <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/js/bootstrap.min.js" integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl" crossorigin="anonymous"></script>
          <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.5.0/font/bootstrap-icons.css" rel="stylesheet" />
        
          <link href="css/styles.css" rel="stylesheet" />
        <h1 className='text-center ctext-primary'>Calendar</h1>
        <div className='calendar-container' style={{position: 'relative'}} >
          <Calendar onChange={(v,e) => {setCurrDate(v);challengeDate(v);setCbtn(v)}} className="ctext-primary" />

          {cbtn !== "" ? 
          <div className='render-challenge-temp' >
            {toggle === cbtn.getDate().toString() ? 
            <div className='render-challenge' style={{position: 'relative'}}>
              {currChallenge.map((t_c) => (
                <div>
                  <p className='ctext-primary'>{t_c.title}</p>
                  <p className='ctext-primary'>{t_c.content}</p>
                  <p className='ctext-primary'>{t_c.origin}</p>
                  <button onClick={() => setCurrChallenge([])}>Close</button>
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
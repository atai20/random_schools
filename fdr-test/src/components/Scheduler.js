import Calendar from 'react-calendar';
import React, { useContext, useState,useEffect, useRef } from 'react';
import { db } from "../firebase-config";
import { getFirestore, collection, getDocs, getDoc, doc, setDoc, updateDoc, deleteDoc, onSnapshot, query } from "firebase/firestore";
import "../App.css";
import { Link, useOutletContext } from "react-router-dom";

import { GoDotFill } from "react-icons/go";


let challenges_t = [];
function Scheduler() {
    const ctxprops = useOutletContext();
    const [challenge, setChallenge] = useState([]);
    const [cbtn, setCbtn] = useState("");
    const [school, setSchool] = useState("");
    const [board, setBoard] = useState([]);

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
      challenges_t = [];
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
      fetchAllUsers();
    },[]);
    function convertFromPOSIX(unix_timestamp) {
      var eps = new Date(unix_timestamp*1000);
      return (eps.getFullYear() + "-" + (parseInt(eps.getMonth())+1) + "-" + (parseInt(eps.getDate())+1)); //+1 to getDate to adjust to GMT otherwise EST
    }
    function convertToPOSIX(dateobj) {
      var future = new Date(dateobj);
      return (future.getTime() - future.getMilliseconds()) / 1000;
    }

    const [currChallenge, setCurrChallenge] = useState([]);
    function challengeDate(value, event) { //yes it renders twice. will go away after npm build
      let dub_t = [];
      for(const c of challenge) {
        if(convertFromPOSIX(c.due_date) === (value.getFullYear()+"-"+(parseInt(value.getMonth())+1)+"-"+(parseInt(value.getDate())))) {
          dub_t.push({"title": c.title, "content": c.content, "origin": c.origin, "status": c.status, "offsetleft": event.target.offsetLeft, "offsettop": event.target.offsetTop});
        } 
      }
      setCurrChallenge(dub_t);
      dub_t = [];
    }
    function displaceRelative(ev) {
      ev.target.classList.add("date_click_active_custom");
    }

    async function fetchAllUsers() {
      const q = query(collection(db, "users"));
      const gd = await getDocs(q);
      let token_t = [];
      gd.forEach((t) => {
        token_t.push({"talents": t.data().talents, "name": t.data().name});
      });
      token_t.sort(function(a,b) {
        return b.talents - a.talents;
      })
      setBoard(token_t);
      console.log(board);
    }
    

    return (
      <div className='calendar-main'>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous"/>
          <script src="https://code.jquery.com/jquery-3.2.1.slim.min.js" integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN" crossorigin="anonymous"></script>
          <script src="https://cdn.jsdelivr.net/npm/popper.js@1.12.9/dist/umd/popper.min.js" integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q" crossorigin="anonymous"></script>
          <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/js/bootstrap.min.js" integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl" crossorigin="anonymous"></script>
          <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.5.0/font/bootstrap-icons.css" rel="stylesheet" />
     
          <link href="css/styles.css" rel="stylesheet" />
<<<<<<< Updated upstream
        <h1 className='text-center ctext-primary'>Calendar</h1>
        <div className='calendar-container' style={{width: '100%', height: 'auto'}} >
          <Calendar onChange={(v,e) => {setCurrDate(v);challengeDate(v,e);setCbtn(v)}} className="ctext-primary" />
=======
        <h1 className='text-center ctext-primary'><div className='nunito-all'>Challenges and plans</div></h1>
        <div className='nunito-all'>*Select the date to see if there is a challange for the day</div>
        <div className='calendar-container' >
          <Calendar onChange={(v,e) => {setCurrDate(v);challengeDate(v,e);setCbtn(v)}} className="ctext-primary"/>
>>>>>>> Stashed changes

          {cbtn !== "" ? 
          <div className='render-challenge-temp' >
            {currChallenge.length !== 0 ? 
            <div>
              {currChallenge.map((t_c) => (
                <div className='render-challenge' id="challenge-display" style={{left: t_c.offsetleft, top: (t_c.offsettop+20)}}>
                  {/* <p className='ctext-primary'>{t_c.title}</p> */}
                  {t_c.status === "active" ?
                  <span style={{fill: "#34eb77", color: "#34eb77"}}><GoDotFill style={{ width: '20px', height: '20px'}} /></span> 
                  : t_c.status === "in_review" ? 
                  <span style={{fill: "#eba21c", color: "#eba21c"}}><GoDotFill style={{ width: '20px', height: '20px'}} /></span> 
                : 
                <span style={{fill: "#eb1c1c", color: "#eb1c1c"}}><GoDotFill style={{ width: '20px', height: '20px'}} /></span> 
                
                }
                  <p className='ctext-primary'>{t_c.title}</p>
                  <p className='ctext-primary'>{t_c.content}</p>
                  <p className='ctext-primary'>{t_c.origin.replace(`${ctxprops.school_select}`, `${school.name}`)}</p>
                  
                </div>
              ))}
              <button onClick={() => setCurrChallenge([])} className='btn'>Close</button>
            </div>
            :null}
          </div>
          :null}
          
        <p className='text-center ctext-primary'>
          <span className='bold'>Selected Date:</span>
          {/* {currdate.getDate()} bruh */}
        </p>
        </div>
        <div className='leaderboard ctext-primary'>Leaderboard and stuff
<<<<<<< Updated upstream
        {board.map((obj, index) => {
          if(index === 0) {
            return (
              <div className='ctext-primary card leaderboard-display first-placer'>
            <h3>{index+1} <span>name: {obj.name}</span> <span className='ctext-primary score-span'>score: {obj.talents}</span></h3>
          </div>
            );
          } else if(index % 2 === 0) {
            return (
              <div className='ctext-primary card leaderboard-display even'>
                <h3>{index+1} <span>name: {obj.name}</span> <span className='ctext-primary score-span'>score: {obj.talents}</span></h3>
              </div>
            )
          } else {
            return (
              <div className='ctext-primary card leaderboard-display odd'>
            
            <h3>{index+1} <span>name: {obj.name}</span> <span className='ctext-primary score-span'>score: {obj.talents}</span></h3>
          </div>
            )
          }
        })}
=======
        <table class="table" id="leaders">
  <thead class="thead-dark">
    <tr>
      <th scope="col" className='name_col1'>Name</th>
      <th scope="col" className='name_col2'>Score</th>
    </tr>
  </thead>
  <tbody>
        {board.map((obj) => (
         
         <tr>
         <td>{obj.name}</td>
         <td>{obj.talents}</td>
       </tr>
        ))}
        </tbody>
</table>
>>>>>>> Stashed changes
        
        </div>
    </div>
    );
  }
  
  export default Scheduler;
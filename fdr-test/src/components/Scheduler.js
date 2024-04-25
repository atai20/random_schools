import Calendar from 'react-calendar';
import React, { useContext, useState,useEffect, useRef } from 'react';
import { db } from "../firebase-config";
import { getFirestore, collection, getDocs, getDoc, doc, setDoc, updateDoc, deleteDoc, onSnapshot, query } from "firebase/firestore";
import { Link, useOutletContext } from "react-router-dom";

import { GoDotFill } from "react-icons/go";
import Latex from 'react-latex';
import "../App.css";


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
      gd.forEach((document) => {
        if((getCurrentTime() - parseInt(document.data().due_date)) > 0) {
          deleteDoc(doc(db, "challenges", document.id));
        }

        challenges_t.push(document.data());
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
      getDoc(doc(db, `users/${ctxprops.id}`)).then((u_d) => document.body.setAttribute("data-theme", u_d.data().theme.toLowerCase()));
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
    function challengeDate(value, event) { 
      // console.log(event.target)
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

    function DetStatus(props) {
      // console.log(props.d);
      // if(convertToPOSIX(props.d) === )
      for(const c of challenge) {
        if(convertFromPOSIX(c.due_date) === (props.d.getFullYear()+"-"+(parseInt(props.d.getMonth())+1)+"-"+(parseInt(props.d.getDate()))) ) {
          return (
            <div>
              {c.status === "active" ?
            <span title="active" style={{fill: "#34eb77", color: "#34eb77"}}><GoDotFill style={{ width: '20px', height: '20px'}} /></span> 
            : c.status === "in_review" ? 
            <span title="in review" style={{fill: "#eba21c", color: "#eba21c"}}><GoDotFill style={{ width: '20px', height: '20px'}} /></span> 
          : 
          <span title="not taking anymore answers" style={{fill: "#eb1c1c", color: "#eb1c1c"}}><GoDotFill style={{ width: '20px', height: '20px'}} /></span> 
          
          }
            </div>
          )
        }
      }
    }

    return (
      <div className='calendar-main'>
        {/* <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous"/>
          <script src="https://code.jquery.com/jquery-3.2.1.slim.min.js" integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN" crossorigin="anonymous"></script>
          <script src="https://cdn.jsdelivr.net/npm/popper.js@1.12.9/dist/umd/popper.min.js" integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q" crossorigin="anonymous"></script>
          <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/js/bootstrap.min.js" integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl" crossorigin="anonymous"></script>
          <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.5.0/font/bootstrap-icons.css" rel="stylesheet" />
     
          <link href="css/styles.css" rel="stylesheet" /> */}
        <h1 className='text-center ctext-primary'>Calendar</h1>
        <div className='calendar-container' style={{width: '100%', height: 'auto'}} >
          {/* <Calendar onChange={(v,e) => {setCurrDate(v);challengeDate(v,e);setCbtn(v)}} className="ctext-primary" /> */}


        <h1 className='text-center ctext-primary'><div className='nunito-all'>Challenges and plans</div></h1>
        <div className='nunito-all'>*Select the date to see if there is a challange for the day</div>
        <div className='calendar-container' >
          <Calendar onChange={(v,e) => {setCurrDate(v);challengeDate(v,e);setCbtn(v)}} className="maincal ctext-primary" tileContent={({ date, view }) => <DetStatus d={date} v={view} />} />


          {cbtn !== "" ? 
          <div className='render-challenge-temp' >
            {currChallenge.length !== 0 ? 
            <div>
              {currChallenge.map((t_c) => (
                <div className='render-challenge' id="challenge-display" style={{position: 'absolute', left: t_c.offsetleft, top: (t_c.offsettop+100)}}>
                  {/* <p className='ctext-primary'>{t_c.title}</p> */}
                  {t_c.status === "active" ?
                  <span title="active" style={{fill: "#34eb77", color: "#34eb77"}}><GoDotFill style={{ width: '20px', height: '20px'}} /></span> 
                  : t_c.status === "in_review" ? 
                  <span title="in review" style={{fill: "#eba21c", color: "#eba21c"}}><GoDotFill style={{ width: '20px', height: '20px'}} /></span> 
                : 
                <span title="not taking anymore answers" style={{fill: "#eb1c1c", color: "#eb1c1c"}}><GoDotFill style={{ width: '20px', height: '20px'}} /></span> 
                
                }
                  <p className='ctext-primary'>{t_c.title}</p>
                  <p className='ctext-primary'><Latex displayMode={true}>{t_c.content}</Latex></p>
                  <p className='ctext-primary'>{t_c.origin.replace(`${ctxprops.school_select}`, `${school.name}`)}</p>
                  
                </div>
              ))}
              <button onClick={() => setCurrChallenge([])} className='cbtn btn' style={{position: 'absolute'}}>Close</button>
            </div>
            :null}
          </div>
          :null}
        </div>
        <div className='leaderboard-display ctext-primary'>Leaderboard


        <table className="table" id="leaders">
  <thead className="thead-dark">
    <tr>
      <th scope="col" className='name_col1'>Name</th>
      <th scope="col" className='name_col2'>Score</th>
    </tr>
  </thead>
  <tbody>
        {board.map((obj) => (
         
         <tr>
         <td className='ctext-primary'>{obj.name}</td>
         <td className='ctext-primary'>{obj.talents}</td>
       </tr>
        ))}
        </tbody>
</table>

        </div>
        
    </div>
    </div>
    );
  }
export default Scheduler;
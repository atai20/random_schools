import React, {useState, useEffect} from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import "../App.css";

export default function NewsTemplate(props) {
    const loc = useLocation();
    console.log(loc.state);
    return (
        <div className="ctext-primary center-text">
          <h1 className="newsreader-title">{loc.state.header}</h1>
          {loc.state.challenge_data.map(challenge => {
            if(challenge !== null) {
                return (<div>{challenge.content}</div>);
            }
          })}
          {/* <p className="newsreaser-content">{loc.state.challenge_data[0].content}</p> */}

        </div>
    )
}
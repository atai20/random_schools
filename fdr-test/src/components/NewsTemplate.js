import React, {useState, useEffect} from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import "../App.css";

export default function NewsTemplate(props) {
    const loc = useLocation();
    
    return (
        <div className="ctext-primary center-text">
          <h1 className="newsreader-title">{loc.state.title}</h1>
          <p className="newsreaser-content">{loc.state.content}</p>
        </div>
    )
}
import { useParams, useLocation } from "react-router-dom";
import "../App.css";

export default function NewsTemplate(props) {
    // const {state} = props.location;
    const loc = useLocation();
    return (
        <div className="ctext-primary center-text">eehpowepasfregw
            <h1>{loc.state.title}</h1>
            <p>{loc.state.content}</p>
        </div>
    )
}
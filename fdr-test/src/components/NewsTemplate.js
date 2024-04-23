import { useParams, useLocation } from "react-router-dom";

export default function NewsTemplate(props) {
    // const {state} = props.location;
    const loc = useLocation();
    return (
        <div>eehpowepasfregw
            <h1>{loc.state.title}</h1>
        </div>
    )
}
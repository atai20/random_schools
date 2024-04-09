import Calendar from 'react-calendar';
import App from './../App';
import { useState } from 'react';
import { useRive } from '@rive-app/react-canvas';
import { getFirestore, collection, getDocs, getDoc, doc, setDoc, updateDoc, deleteDoc, onSnapshot } from "firebase/firestore";


export default function Intro() {
    const { rive, RiveComponent } = useRive({
      src: 'firey.riv',
      stateMachines: "State Machine 1",
    autoplay: true,
    });
  
    return (
   

<div class="d-flex">
 <div class="d-inline-block"><RiveComponent style={{height:"400px", width:"500px"}}/></div>
 <div class="d-inline-block"> <div class="chat">
    Hello everyone! I'm Firey!
    </div> </div>
</div>


    );
  }
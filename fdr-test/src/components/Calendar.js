import Calendar from 'react-calendar';
import App from './App';
import { getFirestore, collection, getDocs, getDoc, doc, setDoc, updateDoc, deleteDoc, onSnapshot } from "firebase/firestore";

export default class Calendar extends App {
    constructor(props) {
        super(props);
        // this.state = {}
    }
    show_posts() {
       

      }
    render() {
        
        return (
            
            <div className='app'>
      <h1 className='text-center'>React Calendar</h1>
      <div className='calendar-container'>
        <Calendar onChange={setDate} value={date} />
      </div>
      <p className='text-center'>
        <span className='bold'>Selected Date:</span>{' '}
        {date.toDateString()}
      </p>
    </div>

            
        );
    }
}
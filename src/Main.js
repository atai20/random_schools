import App from './App';
import { getFirestore, collection, getDocs, getDoc, doc, setDoc, updateDoc, deleteDoc, onSnapshot } from "firebase/firestore";

export default class Main extends App {
    constructor(props) {
        super(props);
        // this.state = {}
    }
    show_posts() {
       

      }
    render() {
        
        return (
            
            <div>
              <p>i am: {this.state.username}</p>
              <img src={this.state.pfp} width={200} height={200} />
              clubs {this.state.clubs}
              <button onClick={this.logout}>logout</button>
              {this.show_posts}
            </div>

            
        );
    }
}
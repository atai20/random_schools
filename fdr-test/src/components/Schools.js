import React, {useRef, useState, useEffect} from "react";
import "./news_files/css.css";
import "./news_files/blog.css";
import "./news_files/bootstrap.min.css";
import { Link, Outlet, useOutletContext } from "react-router-dom"; 
import { getFirestore, collection, getDocs,orderBy, limit,  addDoc, query,getDoc, doc, setDoc, updateDoc, deleteDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase-config";
import { JSEncrypt } from 'jsencrypt';
import { getApp } from "firebase/app";
import {getStorage, ref, uploadBytesResumable, getDownloadURL} from "firebase/storage";


const storage = getStorage(getApp(), "gs://web-fdr-notification.appspot.com");
let arr = []; // DONT REMOVE THIS. USESTATE DOES NOT WORK LIKE YOU THINK



const OutletProvider = ({children}) => {
  const ctx = useOutletContext();
 
  
  return typeof children === 'function' ? children(ctx) : children;
}



export default function Schools(props) {

    

   
  const state_ctx_props = useOutletContext(); 
 
  const [school, setSchool] = useState("");
  const [news_text, setNews] = useState([]);
  let news_t = [];
  const get_news = async() => {
    const q = query(collection(db,`schools/${state_ctx_props.school_select}/news`), limit(2));
    const docsRef = await getDocs(q);
    
    docsRef.forEach(doc => {

      news_t.push(doc.data())

    });
    setNews(news_t);
  }
  function convertFromPOSIX(unix_timestamp) {
    var eps = new Date(unix_timestamp*1000);
    return (eps.getFullYear() + "-" + (parseInt(eps.getMonth())+1) + "-" + eps.getDate());
}
  get_news();
  async function schoolInfo() {
    
    const schoolRef = doc(db, `schools/${state_ctx_props.school_select}`);
    
    await getDoc(schoolRef).then((school_data) => {
      setSchool(school_data.data());
    });      
  }
  
  useEffect(() => {
    document.body.setAttribute("data-theme", state_ctx_props.theme.toLowerCase());
    schoolInfo();
  },[]);

    return (
      
        <div>
<OutletProvider>
                    {
                    (outletCtxProps) => {
                     
                      
                
                        
 

                         
                         
                        


              
                        return (
                        
                        <div>

{/* <form>
  <div class="form-row">
    <div class="form-group col-md-6">
      <label for="inputEmail4">Publish post or make a challenge</label>
      <input type="email" class="form-control" id="inputEmail4" placeholder="post description"/>
      
      <input type="checkbox" className="posttype_check" id="checker"/><label htmlFor="checker">challenge</label>
      <input type="email" class="form-control" id="inputEmail4" placeholder="due date *only for challenge"/>
    </div>
</div>
  <div class="form-group">
    <div class="form-check">
      <input class="form-check-input" type="checkbox" id="gridCheck"/>
      <label class="form-check-label" for="gridCheck">
        Check me out
      </label>
    </div>
  </div>
  <button className="submit-info" id="submit-info" onClick={this.create_post}>Submit</button>
</form>
<h1>write results for week</h1>
<form>
  <div class="form-row">
    <div class="form-group col-md-6">
      <label for="inputEmail4">Email</label>
      <input type="email" class="form-control" id="inputEmail4" placeholder="Email"/>
    </div>
</div>
  <div class="form-group">
    <div class="form-check">
      <input class="form-check-input" type="checkbox" id="gridCheck"/>
      <label class="form-check-label" for="gridCheck">
        Check me out
      </label>
    </div>
  </div>
  <button type="submit" class="btn btn-primary">Sign in</button>
</form>
<h1>Write results for month</h1>
<form>
  <div class="form-row">
    <div class="form-group col-md-6">
      <label for="inputEmail4">Email</label>
      <input type="email" class="form-control" id="inputEmail4" placeholder="Email"/>
    </div>
</div>
  <div class="form-group">
    <div class="form-check">
      <input class="form-check-input" type="checkbox" id="gridCheck"/>
      <label class="form-check-label" for="gridCheck">
        Check me out
      </label>
    </div>
  </div>
  <button type="submit" class="btn btn-primary" onClick={this.create_post}>Sign in</button>
</form> */}



  

{/* <h1>Add school</h1>
<form>
  <div class="form-row">
    <div class="form-group col-md-6">
      <label for="inputEmail4">school name</label>
      <input type="email" class="form-control" ref={this.mynews_text} id="inputEmail4" placeholder="Email"/>
    </div>
</div>
<div class="form-row">
    <div class="form-group col-md-6">
      <label for="inputEmail4">description</label>
      <input type="email" class="form-control" ref={this.mynews_text} id="inputEmail4" placeholder="Email"/>
    </div>
</div>
<div class="form-row">
    <div class="form-group col-md-6">
      <label for="inputEmail4">image</label>
      <input type="file" class="form-control" ref={this.mynews_text} src="img/img.png"  id="inputEmail4" placeholder="Email"/>
    </div>
</div>

  
  <button class="btn btn-primary" onClick={this.add_news}>Sign in</button>
</form>


<h1>Give out talent points: 20</h1>
<form>
<div class="form-row">
    <div class="form-group col-md-6">
      <label for="inputEmail4">Atai</label>
      <input type="email" class="form-control" id="inputEmail4" placeholder="number"/>
    </div>
</div>
<div class="form-row">
    <div class="form-group col-md-6">
      <label for="inputEmail4">Giliana</label>
      <input type="email" class="form-control" id="inputEmail4" placeholder="number"/>
    </div>
</div>
<div class="form-row">
    <div class="form-group col-md-6">
      <label for="inputEmail4">Sam</label>
      <input type="email" class="form-control" id="inputEmail4" placeholder="number"/>
    </div>
</div>
  
  <button type="submit" class="btn btn-primary" onClick={this.create_post}>Sign in</button>
</form> */}

                        </div>
                        );
                    }}
               

<html lang="en">
    <head>

    <link rel="icon" href="https://getbootstrap.com/docs/4.0/assets/img/favicons/favicon.ico"/>

    <title>Blog Template for Bootstrap</title>

  

  </head>

  <body>

    <div class="container">
      <header class="blog-header py-3">
        <div class="row flex-nowrap justify-content-between align-items-center">
          <div class="col-4 pt-1">
            <a class="text-muted" href="#">Subscribe</a>
          </div>
          <div class="col-4 text-center">
            <a class="blog-header-logo text-dark" href="#"> {school.name} news</a>
          </div>
          <div class="col-4 d-flex justify-content-end align-items-center">
            <a class="text-muted" href="#">
              <svg xmlns="http://www.w3.org/2000/svg" id="search_ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mx-3"><circle cx="10.5" cy="10.5" r="7.5"></circle><line x1="21" y1="21" x2="15.8" y2="15.8"></line></svg>
            </a>
            
          </div>
        </div>
      </header>

      <div class="nav-scroller py-1 mb-2">
        <nav class="nav d-flex justify-content-between">
          <a class="p-2 text-muted" href="#">World</a>
          <a class="p-2 text-muted" href="#">U.S.</a>
          <a class="p-2 text-muted" href="#">Technology</a>
          <a class="p-2 text-muted" href="#">Design</a>
          <a class="p-2 text-muted" href="#">Culture</a>
          <a class="p-2 text-muted" href="#">Business</a>
          <a class="p-2 text-muted" href="#">Politics</a>
          <a class="p-2 text-muted" href="#">Opinion</a>
          <a class="p-2 text-muted" href="#">Science</a>
          <a class="p-2 text-muted" href="#">Health</a>
          <a class="p-2 text-muted" href="#">Style</a>
          <a class="p-2 text-muted" href="#">Travel</a>
        </nav>
      </div>

      <div class="jumbotron p-3 p-md-5 text-white rounded bg-dark">
        <div class="col-md-6 px-0">
          <h1 id="article"class="display-4 font-italic">{school.name}'s moto</h1>
          <p class="lead my-3">{school.description}</p>
          <p class="lead mb-0"><a href="#" class="text-white font-weight-bold">Continue reading...</a></p>
        </div>
      </div>

      <div class="row mb-2">
        {news_text.map((data) => (
        <div class="col-md-6">
          <div class="card flex-md-row mb-4 box-shadow h-md-250">
            <div class="card-body d-flex flex-column align-items-start">
              <strong class="d-inline-block mb-2 text-success">New</strong>
              
            
  
  


  
    <div>
    <h3 id="article"class="mb-0">
    <a class="text-dark" href="#">{data.title}</a>

    </h3>
 
 <div class="mb-1 text-muted">{convertFromPOSIX(data.date)}</div>

 <p class="card-text mb-auto">{data.text}</p>
                
                </div>
 

  
                
                
       

              <a href="#">Continue reading</a>
            </div>
            <img class="card-img-right flex-auto d-none d-md-block" data-src="holder.js/200x250?theme=thumb" alt="Thumbnail [200x250]"  src="data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22200%22%20height%3D%22250%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20200%20250%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_18e95d8936c%20text%20%7B%20fill%3A%23eceeef%3Bfont-weight%3Abold%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A13pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_18e95d8936c%22%3E%3Crect%20width%3D%22200%22%20height%3D%22250%22%20fill%3D%22%2355595c%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%2256.21666717529297%22%20y%3D%22130.4%22%3EThumbnail%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E" data-holder-rendered="true"/>
          </div>
        </div>


))

}



      </div>
    </div>

    <main role="main" class="container">
      <div class="row">
        <div class="col-md-8 blog-main">
          <h3 id="article"class="pb-3 mb-4 font-italic border-bottom">
            From the Firehose
          </h3>

          <div class="blog-post">
            <h2 id="article"class="blog-post-title">Sample blog post</h2>
            <p class="blog-post-meta">January 1, 2014 by <a href="#">Mark</a></p>

            <p>This blog post shows a few different types of content 
that's supported and styled with Bootstrap. Basic typography, images, 
and code are all supported.</p>
            <hr/>
            <p>Cum sociis natoque penatibus et magnis <a href="#">dis parturient montes</a>,
 nascetur ridiculus mus. Aenean eu leo quam. Pellentesque ornare sem 
lacinia quam venenatis vestibulum. Sed posuere consectetur est at 
lobortis. Cras mattis consectetur purus sit amet fermentum.</p>
            <blockquote>
              <p>Curabitur blandit tempus porttitor. <strong>Nullam quis risus eget urna mollis</strong> ornare vel eu leo. Nullam id dolor id nibh ultricies vehicula ut id elit.</p>
            </blockquote>
            <p>Etiam porta <em>sem malesuada magna</em> mollis euismod. Cras mattis consectetur purus sit amet fermentum. Aenean lacinia bibendum nulla sed consectetur.</p>
            <h2 id="article">Heading</h2>
            <p>Vivamus sagittis lacus vel augue laoreet rutrum faucibus 
dolor auctor. Duis mollis, est non commodo luctus, nisi erat porttitor 
ligula, eget lacinia odio sem nec elit. Morbi leo risus, porta ac 
consectetur ac, vestibulum at eros.</p>
            <h3 id="article">Sub-heading</h3>
            <p>Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.</p>
            <pre><code>Example code block</code></pre>
            <p>Aenean lacinia bibendum nulla sed consectetur. Etiam 
porta sem malesuada magna mollis euismod. Fusce dapibus, tellus ac 
cursus commodo, tortor mauris condimentum nibh, ut fermentum massa.</p>
            <h3 id="article">Sub-heading</h3>
            <p>Cum sociis natoque penatibus et magnis dis parturient 
montes, nascetur ridiculus mus. Aenean lacinia bibendum nulla sed 
consectetur. Etiam porta sem malesuada magna mollis euismod. Fusce 
dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut 
fermentum massa justo sit amet risus.</p>
            <ul>
              <li>Praesent commodo cursus magna, vel scelerisque nisl consectetur et.</li>
              <li>Donec id elit non mi porta gravida at eget metus.</li>
              <li>Nulla vitae elit libero, a pharetra augue.</li>
            </ul>
            <p>Donec ullamcorper nulla non metus auctor fringilla. Nulla vitae elit libero, a pharetra augue.</p>
            <ol>
              <li>Vestibulum id ligula porta felis euismod semper.</li>
              <li>Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.</li>
              <li>Maecenas sed diam eget risus varius blandit sit amet non magna.</li>
            </ol>
            <p>Cras mattis consectetur purus sit amet fermentum. Sed posuere consectetur est at lobortis.</p>
          </div>

          <div class="blog-post">
            <h2 id="article"class="blog-post-title">Another blog post</h2>
            <p class="blog-post-meta">December 23, 2013 by <a href="#">Jacob</a></p>

            <p>Cum sociis natoque penatibus et magnis <a href="#">dis parturient montes</a>,
 nascetur ridiculus mus. Aenean eu leo quam. Pellentesque ornare sem 
lacinia quam venenatis vestibulum. Sed posuere consectetur est at 
lobortis. Cras mattis consectetur purus sit amet fermentum.</p>
            <blockquote>
              <p>Curabitur blandit tempus porttitor. <strong>Nullam quis risus eget urna mollis</strong> ornare vel eu leo. Nullam id dolor id nibh ultricies vehicula ut id elit.</p>
            </blockquote>
            <p>Etiam porta <em>sem malesuada magna</em> mollis euismod. Cras mattis consectetur purus sit amet fermentum. Aenean lacinia bibendum nulla sed consectetur.</p>
            <p>Vivamus sagittis lacus vel augue laoreet rutrum faucibus 
dolor auctor. Duis mollis, est non commodo luctus, nisi erat porttitor 
ligula, eget lacinia odio sem nec elit. Morbi leo risus, porta ac 
consectetur ac, vestibulum at eros.</p>
          </div>

          <div class="blog-post">
            <h2 id="article" class="blog-post-title">New feature</h2>
            <p class="blog-post-meta">December 14, 2013 by <a href="#">Chris</a></p>

            <p>Cum sociis natoque penatibus et magnis dis parturient 
montes, nascetur ridiculus mus. Aenean lacinia bibendum nulla sed 
consectetur. Etiam porta sem malesuada magna mollis euismod. Fusce 
dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut 
fermentum massa justo sit amet risus.</p>
            <ul>
              <li>Praesent commodo cursus magna, vel scelerisque nisl consectetur et.</li>
              <li>Donec id elit non mi porta gravida at eget metus.</li>
              <li>Nulla vitae elit libero, a pharetra augue.</li>
            </ul>
            <p>Etiam porta <em>sem malesuada magna</em> mollis euismod. Cras mattis consectetur purus sit amet fermentum. Aenean lacinia bibendum nulla sed consectetur.</p>
            <p>Donec ullamcorper nulla non metus auctor fringilla. Nulla vitae elit libero, a pharetra augue.</p>
          </div>

          <nav class="blog-pagination">
            <a class="btn btn-outline-primary" href="#">Older</a>
            <a class="btn btn-outline-secondary disabled" href="#">Newer</a>
          </nav>

        </div>

        <aside class="col-md-4 blog-sidebar">
          <div class="p-3 mb-3 bg-light rounded">
            <h4 id="article" class="font-italic">About</h4>
            <p class="mb-0">Etiam porta <em>sem malesuada magna</em> mollis euismod. Cras mattis consectetur purus sit amet fermentum. Aenean lacinia bibendum nulla sed consectetur.</p>
          </div>

          <div class="p-3">
            <h4 id="article" class="font-italic">Archives</h4>
            <ol class="list-unstyled mb-0">
              <li><a href="#">March 2014</a></li>
              <li><a href="#">February 2014</a></li>
              <li><a href="#">January 2014</a></li>
              <li><a href="#">December 2013</a></li>
              <li><a href="#">November 2013</a></li>
              <li><a href="#">October 2013</a></li>
              <li><a href="#">September 2013</a></li>
              <li><a href="#">August 2013</a></li>
              <li><a href="#">July 2013</a></li>
              <li><a href="#">June 2013</a></li>
              <li><a href="#">May 2013</a></li>
              <li><a href="#">April 2013</a></li>
            </ol>
          </div>

          <div class="p-3">
            <h4 id="article" class="font-italic">Elsewhere</h4>
            <ol class="list-unstyled">
              <li><a href="#">GitHub</a></li>
              <li><a href="#">Twitter</a></li>
              <li><a href="#">Facebook</a></li>
            </ol>
          </div>
        </aside>

      </div>

    </main>

    <footer class="blog-footer">
      <p>Blog template built for <a href="https://getbootstrap.com/">Bootstrap</a> by <a href="https://twitter.com/mdo">@mdo</a>.</p>
      <p>
        <a href="#">Back to top</a>
      </p>
    </footer>


    <script src="news_files/jquery-3.2.1.slim.min.js" integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN" crossorigin="anonymous"></script>
    <script src="news_files/popper.min.js"></script>
    <script src="news_files/bootstrap.min.js"></script>
    <script src="news_files/holder.min.js"></script>
  
  



    
</body>


</html>
</OutletProvider>

        </div>
    )
}
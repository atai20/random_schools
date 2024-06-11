import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorRoute from './ErrorRoute';
import Schools from "./components/Schools";
import Landing from "./Landing";
import About from "./components/About";
import Profile from "./components/Profile";
import Clubs from "./components/Clubs";
import Intro from "./components/Intro";
import Map from "./components/Map";


import NewsTemplate from './components/NewsTemplate';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Scheduler from './components/Scheduler';
import Resultsform from './components/Resultsform';
import Schoolsform from './components/Schoolsform';
import Submissions from './components/Submissions';
// import Clubform from './components/Clubform';
import Newsform from './components/Newsform';
import 'intro.js/introjs.css';
import './index.css';
import  Nsfw  from './components/Nsfw';

const root = ReactDOM.createRoot(document.getElementById('root'));

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorRoute />,
    children: [
      {
        path: "/",
        element: <Landing />,
      },
      {
        path: "newsdisplay",
        element: <NewsTemplate  />
      },
      {
        path: "/schools",
        element: <Schools />,
      },
      {
        path: "/profile",
        element: <Profile />
      },
      {
        path: "/clubs",
        element: <Clubs />,
      },
      {
        path: "/formnews",
        element: <Newsform />,
      },
      {
        path: "/formresults",
        element: <Resultsform />,
      },
      {
        path: "/formschools",
        element: <Schoolsform />,
      },
      {
        path: "/calendar",
        element: <Scheduler />,
      },
      {
        path: "/about",
        element: <About />,
      }
      ,
      {
        path: "/intro",
        element: <Intro />,
      },
      {
        path: "/submissions",
        element: <Submissions />
      }
      ,
      {
        path: "/nsfw",
        element: <Nsfw />
      },
	{
	path:"/map",
	element: <Map />
	},
    ]
  },
]);

root.render(
    <RouterProvider router={router} />
);

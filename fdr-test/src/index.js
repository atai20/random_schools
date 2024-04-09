import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import ErrorRoute from './ErrorRoute';
import Schools from "./components/Schools";
import Landing from "./Landing";
import About from "./components/About";
import Profile from "./components/Profile";
import Clubs from "./components/Clubs";
import Intro from "./components/Intro";
import Cookie from "./components/Cookie";
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Scheduler from './components/Scheduler';

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
        path: "/calendar",
        element: <Scheduler />,
      },
      {
        path: "/cookie",
        element: <Cookie />,
      },
      {
        path: "/about",
        element: <About />,
      }
      ,
      {
        path: "/intro",
        element: <Intro />,
      }
    ]
  },
]);

root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
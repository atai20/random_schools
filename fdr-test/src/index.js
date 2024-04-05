import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import ErrorRoute from './ErrorRoute';
import Schools from "./components/Schools";
import Landing from "./Landing";
import About from "./components/About";
import Profile from "./components/Profile";
import Clubs from "./components/Clubs";
import Intro from "./components/Intro";
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

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

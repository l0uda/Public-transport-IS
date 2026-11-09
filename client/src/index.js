import React,{ useState } from 'react';
import ReactDOM from 'react-dom';
import "./App.css"

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/home";
import Navigation from "./components/navigation";
import Account from "./components/account";
import Edit from "./components/edit";
import ErrorBoundary from "./components/errorBoundary";


// let modes = ["UNREGISTERED","USER","CREW","CONVEYOR","ADMIN"]
const ViewSetup = () => {

  const [view, setView] = useState("UNREGISTERED");
  
  console.log("ROOT: ",view)

  return (
    <Router>
    <Navigation view={view} setView={setView}/>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/edit" element={<Edit view={view}/>} />
      <Route path="/account" element={<Account view={view} setView={setView}/>} />
    </Routes>
  </Router>
  )
}

ReactDOM.render(
  <ErrorBoundary>
    <ViewSetup />
  </ErrorBoundary>,
  document.getElementById('root')
);

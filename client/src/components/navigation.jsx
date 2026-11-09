import React,{useEffect} from 'react';
import { NavLink } from "react-router-dom";
import { getToken } from "../services/userControl"

function NormalNavigation() {
  return (
    <ul className="navbar-nav ml-auto">
      <li className="nav-item">
        <NavLink className="nav-link" to="/account">
          Účet
        </NavLink>
      </li>
    </ul>
  )
}

class PrivilegedNavigation extends React.Component {
  render() {

    return (
      <ul className="navbar-nav ml-auto">
        <li className="nav-item">
          <NavLink className="nav-link" to="/edit">
            Manager
          </NavLink>
        </li>  
        <li className="nav-item">
          <NavLink className="nav-link" to="/account">
            Účet
          </NavLink>
        </li>
      </ul>
    )
  }
}

const SelectMode = (props) =>{
    
    // useEffect(() => {
    //   props.setView("CONVEYOR")
    // });

    if(props.view === "UNREGISTERED" || props.view === "USER"){
      return <NormalNavigation />
    } else {
      return <PrivilegedNavigation />
  }
}

const Navigation = (props) => {  
  const view = props.view;
  const setView = props.setView;
  const token = getToken();
  if (token) {
    if(token.type.localeCompare("admin") === 0){
      setView("ADMIN");
    } else if (token.type.localeCompare("conveyor") === 0){
      setView("CONVEYOR");
    } else if (token.type.localeCompare("crew") === 0){
      setView("CREW");
    } else if (token.type.localeCompare("passenger") === 0){
      setView("USER");
    }
  }

    return (
      <div className="navigation">
      <nav className="navbar navbar-expand">
        <div className="container">
        <NavLink className="navbar-brand" to="/">
          Domů
        </NavLink>
        <div>{view}</div>
          <div>
            <SelectMode view={view} setView={setView} />
          </div>
        </div>
      </nav>
    </div>
    )
}

export default Navigation;
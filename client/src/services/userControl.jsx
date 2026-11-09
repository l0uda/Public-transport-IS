import React,{useEffect,useState} from "react";
import Account from "../components/account"


export const handleRegister = (props) => {
  
}

export const Logout = (props) => {
  if (isLoggedIn()){

  }
}
// returns true if speficied user is logged in
// special keyword "anyone" checks if anyone is logged in
export const isLoggedIn = (props) => {
  // return (localStorage.getItem("token") !== null) ? true : false;
  return ((JSON.parse(localStorage.getItem("token")) !== null) ? true : false);
}

export const getToken = () => {
  let token = localStorage.getItem("token")
  console.log("TOKEN in SESS: ",token);
  return JSON.parse(token, null, -1);
}

export const setToken = (data) => {
  console.log("SESS DATA SETTING TO: ",data)
  localStorage.setItem("token",JSON.stringify(data))
}

export const removeToken = () => {
  localStorage.removeItem("token");
  const data = localStorage.getItem("token") === null;
  console.log("removed logged; is null now?: ",data)
}

// Role hierarchy: admin > conveyor > crew > passenger > unregistered.
// A higher role can use all features of the lower roles.
export const ROLE_RANK = { passenger: 1, crew: 2, conveyor: 3, admin: 4 };

export const rankOf = (type) => ROLE_RANK[type] || 0;

// identity scope used by the carrier/crew endpoints
export const buildScope = (token) => {
  if (!token) return null;
  if (token.type === "crew") return { crewID: token.id };
  if (token.type === "conveyor") return { conveyorID: token.id };
  if (token.type === "admin") return { adminID: token.id };
  return null;
}

export const scopeToQuery = (scope) => {
  if (!scope) return "";
  if (scope.crewID) return "crewID=" + scope.crewID;
  if (scope.conveyorID) return "conveyorID=" + scope.conveyorID;
  return "adminID=" + scope.adminID;
}
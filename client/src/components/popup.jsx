import React, { useState, useEffect } from 'react';
import { Multiselect } from "multiselect-react-dropdown";
import { getToken, setToken } from "../services/userControl"

import "../App.css"

const transformDataToMultiselect = (data,seatClass) => {
  var tmp = [];
  for(let i = 0; i < data.length; ++i){
    var x = {
      name: "Sedadlo "+data[i].seat,
      class: "Třída "+seatClass
    }
    tmp.push(x);
  }
  return (tmp);
}

async function getSeatsForVehicle(vehicleID,setVeh){
  // fetch both classes first, then set the state once (avoid the two
  // requests overwriting each other depending on which resolves first)
  const [poor, rich] = await Promise.all([
    fetch("/api/free_vehicle_seats_poor?ID="+vehicleID).then(res => res.json()),
    fetch("/api/free_vehicle_seats_rich?ID="+vehicleID).then(res => res.json()),
  ]);

  setVeh([
    ...transformDataToMultiselect(poor,2),
    ...transformDataToMultiselect(rich,1)
  ]);
}

async function getAllInfoReservations(connID,setVeh) {
  const conn = await fetch("/api/spoj?ID="+connID,{
    method: "GET",
  }).then(response => response.json());

  if (!conn || !conn.vehicleID) return;
  await getSeatsForVehicle(conn.vehicleID,setVeh);
}

const onSelect = (selectedList,set,poor,rich,setallSelected) =>{
  var currPrice = 0;
  for(let i = 0; i < selectedList.length;++i){
    if(selectedList[i].class.localeCompare("Třída 2")===0){
      currPrice += poor;
    } else {
      currPrice += rich;
    }
  } 
  set(currPrice);
  setallSelected(selectedList);

} 

const onRemove = (selectedList,set,poor,rich,setallSelected) =>{
  var currPrice = 0;
  for(let i = 0; i < selectedList.length;++i){
    if(selectedList[i].class.localeCompare("Třída 2")===0){
      currPrice += poor;
    } else {
      currPrice += rich;
    }
  } 
  set(currPrice);
  setallSelected(selectedList);
}

async function createReservation(list,connID,cost,passengerID,paid){
  const seats = (list || []).map(iter => iter.name.split(' ')[1]).join(',');

  return fetch("/api/reservation?connectionID="+connID+"&passengerID="+passengerID+"&seats="+seats+"&cost="+cost+"&paid="+(paid ? 1 : 0),{
    method: "POST",
  }).then(response => response.json());
}

async function createAnonymousPassenger(name,email){
  return fetch("/api/anonymous_passenger?name="+encodeURIComponent(name)+"&email="+encodeURIComponent(email),{
    method: "POST",
  }).then(response => response.json());
}

async function registerAnonymous(ID,passwd){
  return fetch("/api/passenger_register?ID="+ID+"&passwd="+encodeURIComponent(passwd),{
    method: "POST",
  }).then(response => response.json());
}

export const PopupRegister = (props) => {
  const price = props.price;
  const token = getToken();

  const [allSelected, setallSelected] = useState();
  const [vehSeats,setVehSeats]  = useState([]);
  const [total, setTotal] = useState(0);

  const [step, setStep] = useState('select'); // select | details | success | register
  const [pendingPaid, setPendingPaid] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [passwd, setPasswd] = useState("");
  const [passwd2, setPasswd2] = useState("");
  const [anonID, setAnonID] = useState(null);
  const [reservationID, setReservationID] = useState(null);
  const [busy, setBusy] = useState(false);

  const close = () => {
    setallSelected(undefined);
    setTotal(0);
    setStep('select');
    setName("");
    setEmail("");
    setPasswd("");
    setPasswd2("");
    setAnonID(null);
    setReservationID(null);
    setPendingPaid(false);
    if (typeof props.closePopup === "function") props.closePopup();
  };

  useEffect(()=>{
    if(props.trigger){
      // clear stale seats and reload availability every time the popup opens
      setVehSeats([]);
      setStep('select');
      getAllInfoReservations(props.connID,setVehSeats).catch(e => console.error(e));
    }
  },[props.connID,props.trigger])//whenever connID changes (button clicks and sets it in home.jsx - useEffect runs)

  const submitReservation = async (passengerID, paid) => {
    try {
      const data = await createReservation(allSelected, props.connID, total, passengerID, paid);

      if(data.msg === "OK") {
        alert(paid ? "Rezervace zakoupena!" : "Rezervace úspěšná!")
        close();
      } else {
        alert("Rezervace nemohla být provedena(některá ze sedadel již nejsou volná)")
      }
    } catch(e) {
      console.error(e);
      alert("Rezervaci se nepodařilo dokončit, zkuste to prosím znovu");
    }
  };

  const start = async (paid) => {
    if(!allSelected || allSelected.length === 0){
      alert("Vyberte sedadla k rezervaci");
      return;
    }

    // only passengers have a Passenger row behind their account;
    // staff (crew/conveyor/admin) book as an anonymous passenger
    if (token && token.type === "passenger") {
      await submitReservation(token.id, paid);
    } else {
      if (token && !name) setName(token.login);
      setPendingPaid(paid);
      setStep('details');
    }
  };

  const submitAnonymous = async () => {
    if (!name.trim()) { alert("Zadejte jméno prosím!"); return; }
    if (!email.trim() || email.indexOf('@') === -1) { alert("Zadejte platný email prosím!"); return; }

    setBusy(true);
    try {
      const passenger = await createAnonymousPassenger(name.trim(), email.trim());
      if (!passenger.ID) { alert("Rezervaci se nepodařilo dokončit"); return; }

      const data = await createReservation(allSelected, props.connID, total, passenger.ID, pendingPaid);
      if (data.msg !== "OK") {
        alert("Rezervace nemohla být provedena(některá ze sedadel již nejsou volná)");
        return;
      }

      setAnonID(passenger.ID);
      setReservationID(data.ID);
      setStep('success');
    } catch(e) {
      console.error(e);
      alert("Rezervaci se nepodařilo dokončit, zkuste to prosím znovu");
    } finally {
      setBusy(false);
    }
  };

  const submitRegistration = async () => {
    if (!passwd) { alert("Zadejte heslo prosím!"); return; }
    if (passwd !== passwd2) { alert("Hesla nejsou stejná!"); return; }

    setBusy(true);
    try {
      const data = await registerAnonymous(anonID, passwd);

      if (data.msg !== "OK") {
        alert(data.error || "Registrace se nezdařila");
        return;
      }

      if (window.confirm("Registrace dokončena. Chcete se nyní přihlásit?")) {
        const login = await fetch("/api/login?name="+encodeURIComponent(name.trim())+"&passwd="+encodeURIComponent(passwd),{
          method: "POST",
        }).then(response => response.json());

        if (login.ACCESS === "GRANTED") {
          setToken({ id: login.ID, login: name.trim(), passwd: passwd, type: login.ROLE });
          window.location.reload();
          return;
        }
      }

      alert("Registrace dokončena, nyní se můžete přihlásit.");
      close();
    } catch(e) {
      console.error(e);
      alert("Registrace se nezdařila");
    } finally {
      setBusy(false);
    }
  };

  return props.trigger ? (
    <div className="popup-window">
        <div className="popup-in">
          <button className="reserve-close-button" onClick={close}>X</button>
          <h3>Rezervace: Linka: {props.connID}</h3>

          {step === 'select' && (
            <>
              <Multiselect
                placeholder="Vyber jízdenky"
                onSelect={(a)=>onSelect(a,setTotal,price[0],price[1],setallSelected)}
                onRemove={(a)=>onRemove(a,setTotal,price[0],price[1],setallSelected)}
                options={vehSeats}
                displayValue="name"
                groupBy="class"
                />
              <p>Celková cena: {total},-</p>
              <button className="reserve-confirms" onClick={()=>start(false)}>Rezervovat</button>
              <button className="reserve-confirms" onClick={()=>start(true)}>Rezervovat a koupit</button>
            </>
          )}

          {step === 'details' && (
            <div className="popup-form">
              <h4>Údaje cestujícího</h4>
              <label>Jméno</label>
              <input type="text" value={name} onChange={(e)=>setName(e.target.value)} placeholder="jmeno" />
              <label>Email</label>
              <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="email" />
              <p>Celková cena: {total},-</p>
              <button className="reserve-confirms" disabled={busy} onClick={submitAnonymous}>Pokračovat</button>
              <button className="reserve-confirms" onClick={()=>setStep('select')}>Zpět</button>
            </div>
          )}

          {step === 'success' && (
            <div className="popup-form">
              <h4>{pendingPaid ? "Rezervace zakoupena" : "Rezervace vytvořena"}</h4>
              <p>Rezervace č. {reservationID}</p>
              {!token && <p>Chcete se zaregistrovat a příště rezervovat rychleji?</p>}
              {!token && <button className="reserve-confirms" onClick={()=>setStep('register')}>Zaregistrovat se</button>}
              <button className="reserve-confirms" onClick={close}>Zavřít</button>
            </div>
          )}

          {step === 'register' && (
            <div className="popup-form">
              <h4>Registrace</h4>
              <label>Heslo</label>
              <input type="password" value={passwd} onChange={(e)=>setPasswd(e.target.value)} placeholder="heslo" />
              <label>Heslo zopakovat</label>
              <input type="password" value={passwd2} onChange={(e)=>setPasswd2(e.target.value)} placeholder="heslo" />
              <button className="reserve-confirms" disabled={busy} onClick={submitRegistration}>Dokončit registraci</button>
              <button className="reserve-confirms" onClick={close}>Přeskočit</button>
            </div>
          )}
        </div>
    </div>
  ) : "";
};

import React, { useEffect, useState } from "react";
import { getToken, buildScope, scopeToQuery } from "../services/userControl";
import { EditErrorPage } from "./edit";
import "../People.css"

const CrewReservations = ({ scopeInfo, reservations, onConfirm }) => {
  const showCarrier = scopeInfo && scopeInfo.type === "admin";

  return (
    <div className="main-page-people">
      <h3>Rezervace{scopeInfo ? " – " + scopeInfo.name : ""}</h3>
      <table className="people-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Cestující</th>
            {showCarrier && <th>Dopravce</th>}
            <th>Spoj</th>
            <th>Vozidlo</th>
            <th>Sedadla</th>
            <th>Cena</th>
            <th>Stav</th>
            <th>*</th>
          </tr>
        </thead>
        <tbody>
          {reservations.length === 0 ? (
            <tr><td colSpan={showCarrier ? 9 : 8}>Žádné rezervace</td></tr>
          ) : reservations.map(r => (
            <tr key={r.ID}>
              <td>{r.ID}</td>
              <td>{r.passengerName}{r.registered ? "" : " (neregistrovaný)"}</td>
              {showCarrier && <td>{r.carrier}</td>}
              <td>{r.connectionID}</td>
              <td>{r.vehicle}</td>
              <td>{r.seats || "-"}</td>
              <td>{r.cost === null ? "-" : r.cost}</td>
              <td>{r.paid ? "Zaplaceno" : "Nezaplaceno"}</td>
              <td>
                {r.paid ? "" : (
                  <button type="button" className="editbtn" onClick={() => onConfirm(r.ID)}>Potvrdit</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const CrewPosition = ({ scopeInfo, vehicles, stops, selectedStops, onSelect, onSave }) => {
  const showCarrier = scopeInfo && scopeInfo.type === "admin";

  return (
    <div className="main-page-people">
      <h3>Aktuální poloha vozidel</h3>
      {vehicles.length === 0 ? (
        <p>Žádná vozidla</p>
      ) : vehicles.map(v => (
        <div className="crew-vehicle" key={v.ID}>
          <b>{v.description || ("Vozidlo #" + v.ID)}</b>
          {showCarrier ? <span> ({v.carrier})</span> : null}
          <span> – aktuálně: {v.last_stop || "neznámá zastávka"}</span>
          <div>
            <select value={selectedStops[v.ID] || ""} onChange={(e) => onSelect(v.ID, e.target.value)}>
              <option value="">-- vyberte zastávku --</option>
              {stops.map(s => <option key={s.ID} value={s.ID}>{s.name}</option>)}
            </select>
            <button type="button" className="editbtn" onClick={() => onSave(v.ID)}>Nastavit</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export const EditCrewPage = ({ scope }) => {
  const token = getToken();
  const activeScope = scope || buildScope(token);

  const [scopeInfo, setScopeInfo] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [stops, setStops] = useState([]);
  const [selectedStops, setSelectedStops] = useState({});
  const [error, setError] = useState("");

  const loadReservations = async () => {
    const data = await fetch("/api/crew_reservations?" + scopeToQuery(activeScope)).then(r => r.json());
    setScopeInfo(data.scope || null);
    setReservations(data.reservations || []);
  };

  const loadVehicles = async () => {
    const data = await fetch("/api/crew_vehicles?" + scopeToQuery(activeScope)).then(r => r.json());
    setScopeInfo(data.scope || scopeInfo);
    setVehicles(data.vehicles || []);
    setStops(data.stops || []);
    setSelectedStops(prev => {
      const next = { ...prev };
      for (const v of (data.vehicles || [])) {
        if (!next[v.ID]) next[v.ID] = v.last_visited ? String(v.last_visited) : "";
      }
      return next;
    });
  };

  useEffect(() => {
    if (!activeScope) return;
    Promise.all([loadReservations(), loadVehicles()])
      .catch(e => {
        console.error(e);
        setError("Nepodařilo se načíst data");
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!activeScope) {
    return <EditErrorPage />;
  }

  const confirm = async (id) => {
    try {
      const data = await fetch("/api/reservation_confirm?ID=" + id + "&" + scopeToQuery(activeScope), {
        method: "POST",
      }).then(r => r.json());

      if (data.msg === "OK") {
        alert("Rezervace potvrzena");
        await loadReservations();
      } else {
        alert("Rezervaci se nepodařilo potvrdit");
      }
    } catch (e) {
      console.error(e);
      alert("Rezervaci se nepodařilo potvrdit");
    }
  };

  const savePosition = async (vehicleID) => {
    const stopID = selectedStops[vehicleID];
    if (!stopID) {
      alert("Vyberte zastávku");
      return;
    }

    try {
      const data = await fetch("/api/crew_position?vehicleID=" + vehicleID + "&stopID=" + stopID + "&" + scopeToQuery(activeScope), {
        method: "POST",
      }).then(r => r.json());

      if (data.msg === "OK") {
        alert("Poloha vozidla aktualizována");
        await loadVehicles();
      } else {
        alert("Polohu se nepodařilo aktualizovat");
      }
    } catch (e) {
      console.error(e);
      alert("Polohu se nepodařilo aktualizovat");
    }
  };

  return (
    <div>
      {error ? <p className="crew-error">{error}</p> : null}
      <CrewReservations scopeInfo={scopeInfo} reservations={reservations} onConfirm={confirm} />
      <CrewPosition
        scopeInfo={scopeInfo}
        vehicles={vehicles}
        stops={stops}
        selectedStops={selectedStops}
        onSelect={(vehicleID, stopID) => setSelectedStops(prev => ({ ...prev, [vehicleID]: stopID }))}
        onSave={savePosition}
      />
    </div>
  );
};

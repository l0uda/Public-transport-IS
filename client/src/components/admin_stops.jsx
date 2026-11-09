import React, { useState, useEffect } from "react";
import { getToken } from "../services/userControl";

import "../Admin.css"

export const AdminStops = () => {
  const token = getToken();
  const adminID = token ? token.id : -1;

  const [stops, setStops] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const reload = async () => {
    const data = await fetch("/api/admin_stops?adminID=" + adminID).then(res => res.json());
    if (Array.isArray(data)) {
      setStops(data);
      setError("");
    } else {
      setError("Nepodařilo se načíst zastávky");
    }
  };

  useEffect(() => {
    reload().catch(e => {
      console.error(e);
      setError("Nepodařilo se načíst zastávky");
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const confirmStop = async (s) => {
    setBusy(true);
    try {
      const data = await fetch("/api/admin_stops/" + s.ID + "?adminID=" + adminID, { method: "POST" }).then(res => res.json());
      if (data.msg !== "OK") { alert(data.error || "Schválení se nezdařilo"); return; }
      await reload();
    } catch (e) {
      console.error(e);
      alert("Schválení se nezdařilo");
    } finally {
      setBusy(false);
    }
  };

  const rejectStop = async (s) => {
    if (!window.confirm("Opravdu smazat zastávku " + s.name + "?")) return;

    setBusy(true);
    try {
      const data = await fetch("/api/admin_stops/" + s.ID + "?adminID=" + adminID, { method: "DELETE" }).then(res => res.json());
      if (data.msg !== "OK") { alert(data.error || "Smazání se nezdařilo"); return; }
      await reload();
    } catch (e) {
      console.error(e);
      alert("Smazání se nezdařilo");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin_frame">
      <div className="admin_users_config">
        <h3>Zastávky</h3>
        {error ? <p className="crew-error">{error}</p> : null}

        <table className="admin_users_table">
          <thead className="admin_table_head">
            <tr>
              <th>ID</th>
              <th>Název</th>
              <th>Dopravce</th>
              <th>Stav</th>
              <th>*</th>
            </tr>
          </thead>
          <tbody>
            {stops.length === 0 ? (
              <tr><td colSpan="5">Žádné zastávky</td></tr>
            ) : stops.map(s => (
              <tr key={s.ID}>
                <td>{s.ID}</td>
                <td>{s.name}</td>
                <td>{s.firm}</td>
                <td>{s.confirmed ? "Schváleno" : "Čeká na schválení"}</td>
                <td>
                  {!s.confirmed && (
                    <button type="button" className="editbtn" disabled={busy} onClick={() => confirmStop(s)}>Schválit</button>
                  )}
                  <button type="button" className="editbtn" disabled={busy} onClick={() => rejectStop(s)}>Smazat</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

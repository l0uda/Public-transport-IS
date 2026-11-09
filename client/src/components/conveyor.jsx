import React,{useState,useEffect} from "react";
import {GeneralErrorPage} from "./home";
import {getToken, buildScope, scopeToQuery} from "../services/userControl"

import "../People.css"

const apiJson = (url, options) => fetch(url, options).then(res => res.json());

// ---------------------------------------------------------------- personnel

async function GetPeople(scope,setPersonel) {
  await fetch("/api/conveyor_crew?"+scopeToQuery(scope),{
    method: "GET",
    headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
    },
   })
  .then((res) => res.json())
  .then((result) => {
    setPersonel(Array.isArray(result) ? result : [])
  })
}

const editPersonel = (id) => {
  alert("Úprava personálu bude doplněna (ID " + id + ")");
}

const EditConvPerson = (props) => {

  const [personel,setPersonel] = useState([]);

  useEffect(()=>{
    GetPeople(props.scope,setPersonel);
  },[])
    
    return(
      <div className="main-page-people">
      <table className="people-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Jméno</th>
            <th>Dopravce</th>
            <th>*</th>
          </tr>
        </thead>
        <tbody>
          {personel.length === 0 ? (
            <tr><td colSpan="4">Žádný personál</td></tr>
          ) : personel.map(val => {
            return (
              <tr key={val.ID}>
                <td>{val.ID}</td>
                <td>{val.name}</td>
                <td>{val.firm}</td>
                <td><button type="button" className="editbtn" onClick={()=> editPersonel(val.ID)}>edit</button></td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ---------------------------------------------------------------- vehicles

const EditConvMachine = ({ scope }) => {
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const reload = async () => {
    const data = await apiJson("/api/conveyor_vehicles?" + scopeToQuery(scope));
    setVehicles(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    reload().catch(e => { console.error(e); setError("Nepodařilo se načíst vozidla"); });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const openCreate = () => setForm({ ID: null, description: "", rich: 0, poor: 0 });
  const openEdit = (v) => setForm({ ID: v.ID, description: v.description || "", rich: v.max_seats_rich, poor: v.max_seats_poor });

  const save = async () => {
    if (!form) return;
    const rich = parseInt(form.rich);
    const poor = parseInt(form.poor);
    if (isNaN(rich) || isNaN(poor) || rich < 0 || poor < 0 || rich + poor === 0) {
      alert("Zadejte platný počet míst");
      return;
    }

    setBusy(true);
    try {
      const url = (form.ID ? "/api/conveyor_vehicles/" + form.ID : "/api/conveyor_vehicles") + "?" + scopeToQuery(scope);
      const data = await apiJson(url, {
        method: form.ID ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: form.description, max_seats_rich: rich, max_seats_poor: poor })
      });

      if (data.msg !== "OK") { alert(data.error || "Uložení se nezdařilo"); return; }
      setForm(null);
      await reload();
    } catch (e) {
      console.error(e);
      alert("Uložení se nezdařilo");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (v) => {
    if (!window.confirm("Opravdu smazat vozidlo " + (v.description || ("#" + v.ID)) + "?")) return;

    setBusy(true);
    try {
      const data = await apiJson("/api/conveyor_vehicles/" + v.ID + "?" + scopeToQuery(scope), { method: "DELETE" });
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
    <div className="main-page-people">
      <h3>Vozidla</h3>
      <div className="conv-toolbar">
        <button type="button" className="editbtn" onClick={openCreate}>+ Nové vozidlo</button>
      </div>
      {error ? <p className="crew-error">{error}</p> : null}

      <table className="people-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Popis</th>
            <th>1. třída</th>
            <th>2. třída</th>
            <th>Míst celkem</th>
            <th>Poloha</th>
            <th>*</th>
          </tr>
        </thead>
        <tbody>
          {vehicles.length === 0 ? (
            <tr><td colSpan="7">Žádná vozidla</td></tr>
          ) : vehicles.map(v => (
            <tr key={v.ID}>
              <td>{v.ID}</td>
              <td>{v.description || "-"}</td>
              <td>{v.max_seats_rich}</td>
              <td>{v.max_seats_poor}</td>
              <td>{v.seat_count}</td>
              <td>{v.last_stop || "-"}</td>
              <td>
                <button type="button" className="editbtn" onClick={() => openEdit(v)}>Upravit</button>
                <button type="button" className="editbtn" onClick={() => remove(v)}>Smazat</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {form && (
        <div className="conv-form">
          <h4>{form.ID ? "Upravit vozidlo" : "Nové vozidlo"}</h4>
          <label>Popis
            <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </label>
          <label>Místa 1. třída
            <input type="number" min="0" value={form.rich} onChange={(e) => setForm({ ...form, rich: e.target.value })} />
          </label>
          <label>Místa 2. třída
            <input type="number" min="0" value={form.poor} onChange={(e) => setForm({ ...form, poor: e.target.value })} />
          </label>
          <button type="button" className="editbtn" disabled={busy} onClick={save}>Uložit</button>
          <button type="button" className="editbtn" onClick={() => setForm(null)}>Zrušit</button>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------- connections

const EditConvConn = ({ scope }) => {
  const [connections, setConnections] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [stops, setStops] = useState([]);
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const reload = async () => {
    const [conns, veh, allStops] = await Promise.all([
      apiJson("/api/conveyor_connections?" + scopeToQuery(scope)),
      apiJson("/api/conveyor_vehicles?" + scopeToQuery(scope)),
      apiJson("/api/confirmed_stops")
    ]);
    setConnections(Array.isArray(conns) ? conns : []);
    setVehicles(Array.isArray(veh) ? veh : []);
    setStops(Array.isArray(allStops) ? allStops : []);
  };

  useEffect(() => {
    reload().catch(e => { console.error(e); setError("Nepodařilo se načíst spoje"); });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const openCreate = () => setForm({
    ID: null, vehicleID: "", price_rich: "", price_poor: "",
    stops: [{ stopID: "", arrival: "" }, { stopID: "", arrival: "" }]
  });

  const openEdit = (c) => setForm({
    ID: c.ID,
    vehicleID: String(c.vehicleID),
    price_rich: String(c.price_rich),
    price_poor: String(c.price_poor),
    stops: (c.stops || []).map(s => ({ stopID: String(s.stopID), arrival: s.arrival.slice(0, 5) }))
  });

  const setRow = (index, field, value) => {
    const next = form.stops.map((row, i) => i === index ? { ...row, [field]: value } : row);
    setForm({ ...form, stops: next });
  };

  const addRow = () => setForm({ ...form, stops: [...form.stops, { stopID: "", arrival: "" }] });
  const removeRow = (index) => setForm({ ...form, stops: form.stops.filter((_, i) => i !== index) });

  const save = async () => {
    if (!form) return;
    if (!form.vehicleID) { alert("Vyberte vozidlo"); return; }

    const rich = parseInt(form.price_rich);
    const poor = parseInt(form.price_poor);
    if (isNaN(rich) || isNaN(poor) || rich < 0 || poor < 0) { alert("Zadejte platné ceny"); return; }
    if (form.stops.length < 2) { alert("Spoj musí mít alespoň 2 zastávky"); return; }
    for (const row of form.stops) {
      if (!row.stopID || !row.arrival) { alert("Vyplňte všechny zastávky a časy"); return; }
    }

    setBusy(true);
    try {
      const url = (form.ID ? "/api/conveyor_connections/" + form.ID : "/api/conveyor_connections") + "?" + scopeToQuery(scope);
      const data = await apiJson(url, {
        method: form.ID ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleID: parseInt(form.vehicleID),
          price_rich: rich,
          price_poor: poor,
          stops: form.stops.map(row => ({ stopID: parseInt(row.stopID), arrival: row.arrival }))
        })
      });

      if (data.msg !== "OK") { alert(data.error || "Uložení se nezdařilo"); return; }
      setForm(null);
      await reload();
    } catch (e) {
      console.error(e);
      alert("Uložení se nezdařilo");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (c) => {
    if (!window.confirm("Opravdu smazat spoj #" + c.ID + "?")) return;

    setBusy(true);
    try {
      const data = await apiJson("/api/conveyor_connections/" + c.ID + "?" + scopeToQuery(scope), { method: "DELETE" });
      if (data.msg !== "OK") { alert(data.error || "Smazání se nezdařilo"); return; }
      await reload();
    } catch (e) {
      console.error(e);
      alert("Smazání se nezdařilo");
    } finally {
      setBusy(false);
    }
  };

  const stopsSummary = (c) => (c.stops && c.stops.length)
    ? c.stops.map(s => s.name + " " + s.arrival.slice(0, 5)).join(" → ")
    : "-";

  return (
    <div className="main-page-people">
      <h3>Spoje</h3>
      <div className="conv-toolbar">
        <button type="button" className="editbtn" onClick={openCreate}>+ Nový spoj</button>
      </div>
      {error ? <p className="crew-error">{error}</p> : null}

      <table className="people-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Vozidlo</th>
            <th>1. třída</th>
            <th>2. třída</th>
            <th>Zastávky</th>
            <th>*</th>
          </tr>
        </thead>
        <tbody>
          {connections.length === 0 ? (
            <tr><td colSpan="6">Žádné spoje</td></tr>
          ) : connections.map(c => (
            <tr key={c.ID}>
              <td>{c.ID}</td>
              <td>{c.vehicle || "-"}</td>
              <td>{c.price_rich}</td>
              <td>{c.price_poor}</td>
              <td>{stopsSummary(c)}</td>
              <td>
                <button type="button" className="editbtn" onClick={() => openEdit(c)}>Upravit</button>
                <button type="button" className="editbtn" onClick={() => remove(c)}>Smazat</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {form && (
        <div className="conv-form">
          <h4>{form.ID ? "Upravit spoj" : "Nový spoj"}</h4>

          <label>Vozidlo
            <select value={form.vehicleID} onChange={(e) => setForm({ ...form, vehicleID: e.target.value })}>
              <option value="">-- vyberte vozidlo --</option>
              {vehicles.map(v => <option key={v.ID} value={v.ID}>{v.description || ("#" + v.ID)}</option>)}
            </select>
          </label>

          <label>Cena 1. třída
            <input type="number" min="0" value={form.price_rich} onChange={(e) => setForm({ ...form, price_rich: e.target.value })} />
          </label>
          <label>Cena 2. třída
            <input type="number" min="0" value={form.price_poor} onChange={(e) => setForm({ ...form, price_poor: e.target.value })} />
          </label>

          <h5>Zastávky a časy</h5>
          {form.stops.map((row, index) => (
            <div className="conv-stop-row" key={index}>
              <select value={row.stopID} onChange={(e) => setRow(index, "stopID", e.target.value)}>
                <option value="">-- zastávka --</option>
                {stops.map(s => <option key={s.ID} value={s.ID}>{s.name}</option>)}
              </select>
              <input type="time" value={row.arrival} onChange={(e) => setRow(index, "arrival", e.target.value)} />
              <button type="button" className="editbtn" onClick={() => removeRow(index)} disabled={form.stops.length <= 2}>-</button>
            </div>
          ))}
          <button type="button" className="editbtn" onClick={addRow}>+ Zastávka</button>

          <div>
            <button type="button" className="editbtn" disabled={busy} onClick={save}>Uložit</button>
            <button type="button" className="editbtn" onClick={() => setForm(null)}>Zrušit</button>
          </div>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------- stops

const EditConvStops = ({ scope }) => {
  const [stops, setStops] = useState([]);
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const reload = async () => {
    const data = await apiJson("/api/conveyor_stops?" + scopeToQuery(scope));
    setStops(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    reload().catch(e => { console.error(e); setError("Nepodařilo se načíst zastávky"); });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const save = async () => {
    if (!form) return;
    const name = form.name.trim();
    if (!name) { alert("Zadejte název zastávky"); return; }

    setBusy(true);
    try {
      const url = (form.ID ? "/api/conveyor_stops/" + form.ID : "/api/conveyor_stops") + "?" + scopeToQuery(scope);
      const data = await apiJson(url, {
        method: form.ID ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name })
      });

      if (data.msg !== "OK") { alert(data.error || "Uložení se nezdařilo"); return; }
      setForm(null);
      await reload();
    } catch (e) {
      console.error(e);
      alert("Uložení se nezdařilo");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (s) => {
    if (!window.confirm("Opravdu smazat zastávku " + s.name + "?")) return;

    setBusy(true);
    try {
      const data = await apiJson("/api/conveyor_stops/" + s.ID + "?" + scopeToQuery(scope), { method: "DELETE" });
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
    <div className="main-page-people">
      <h3>Zastávky</h3>
      <div className="conv-toolbar">
        <button type="button" className="editbtn" onClick={() => setForm({ ID: null, name: "" })}>+ Navrhnout zastávku</button>
      </div>
      {error ? <p className="crew-error">{error}</p> : null}

      <table className="people-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Název</th>
            <th>Stav</th>
            <th>*</th>
          </tr>
        </thead>
        <tbody>
          {stops.length === 0 ? (
            <tr><td colSpan="4">Žádné zastávky</td></tr>
          ) : stops.map(s => (
            <tr key={s.ID}>
              <td>{s.ID}</td>
              <td>{s.name}</td>
              <td>{s.confirmed ? "Schváleno" : "Čeká na schválení"}</td>
              <td>
                <button type="button" className="editbtn" onClick={() => setForm({ ID: s.ID, name: s.name })}>Upravit</button>
                <button type="button" className="editbtn" onClick={() => remove(s)}>Smazat</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {form && (
        <div className="conv-form">
          <h4>{form.ID ? "Upravit zastávku" : "Navrhnout zastávku"}</h4>
          <label>Název
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <p className="conv-hint">Změny a nové zastávky musí schválit administrátor.</p>
          <button type="button" className="editbtn" disabled={busy} onClick={save}>Uložit</button>
          <button type="button" className="editbtn" onClick={() => setForm(null)}>Zrušit</button>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------- page shell

const EditConveyorChangeView = (props) => {
  if(props.convPage === 0){
    return <EditConvPerson convPage={props.convPage} setConvPage={props.setConvPage} scope={props.scope}/>
  } else if(props.convPage===1) {
    return <EditConvMachine scope={props.scope}/>
  } else if(props.convPage===2) {
    return <EditConvConn scope={props.scope}/>
  } else if(props.convPage===3) {
    return <EditConvStops scope={props.scope}/>
  } else {
    return <GeneralErrorPage />
  }
}

const EditHeaderPeople = (props) => {
  return (
    <div>
      <div className="header-people">
        <button onClick={() => props.setConvPage(0)} className="btn-ppl">Personál</button>
        <button onClick={() => props.setConvPage(1)} className="btn-ppl">Vozidla</button>
        <button onClick={() => props.setConvPage(2)} className="btn-ppl">Spoje</button>
        <button onClick={() => props.setConvPage(3)} className="btn-ppl">Zastávky</button>
      </div>
    </div>
  )
}

export const EditConveyorPage = ({ scope }) => {
  const token = getToken();
  const baseScope = scope || buildScope(token);
  const isAdmin = !!(baseScope && baseScope.adminID);

  const [convPage,setConvPage] = useState(0);
  const [carriers, setCarriers] = useState([]);
  const [carrierID, setCarrierID] = useState("");

  useEffect(() => {
    if (!isAdmin) return;
    fetch("/api/carriers?adminID=" + baseScope.adminID)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length) {
          setCarriers(data);
          setCarrierID(String(data[0].ID));
        }
      })
      .catch(e => console.error(e));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const carrierScope = isAdmin
    ? (carrierID ? { conveyorID: parseInt(carrierID) } : null)
    : baseScope;

  return (
    <div>
      {isAdmin && (
        <div className="main-page-people">
          <label>Dopravce
            <select value={carrierID} onChange={(e) => setCarrierID(e.target.value)}>
              {carriers.map(c => <option key={c.ID} value={c.ID}>{c.firm}</option>)}
            </select>
          </label>
        </div>
      )}

      {carrierScope ? (
        <div key={carrierScope.conveyorID || "own"}>
          <EditHeaderPeople convPage={convPage} setConvPage={setConvPage}/>
          <EditConveyorChangeView convPage={convPage} setConvPage={setConvPage} scope={carrierScope}/>
        </div>
      ) : (
        <p>Žádný dopravce k zobrazení</p>
      )}
    </div>
  )
}

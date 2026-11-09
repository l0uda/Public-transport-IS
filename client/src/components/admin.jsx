import React, { useState, useEffect } from 'react';
import { getToken } from "../services/userControl";

import "../Admin.css"

const ROLE_LABEL = {
  admin: "Administrátor",
  conveyor: "Dopravce",
  crew: "Personál",
  passenger: "Cestující"
};

const emptyForm = () => ({
  mode: "create",
  type: "passenger",
  ID: null,
  name: "",
  passwd: "",
  email: "",
  registered: true,
  conveyorID: ""
});

const AdminForm = ({ form, carriers, onChange, onSave, onCancel, busy }) => {
  const set = (field, value) => onChange({ ...form, [field]: value });
  const isEdit = form.mode === "edit";

  return (
    <div className="admin-form">
      <h3>{isEdit ? "Upravit uživatele" : "Nový uživatel"}</h3>

      {!isEdit && (
        <label>Role
          <select value={form.type} onChange={(e) => set("type", e.target.value)}>
            <option value="admin">Administrátor</option>
            <option value="conveyor">Dopravce</option>
            <option value="crew">Personál</option>
            <option value="passenger">Cestující</option>
          </select>
        </label>
      )}

      <label>{form.type === "conveyor" ? "Firma" : "Jméno"}
        <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)} />
      </label>

      {form.type === "crew" && (
        <label>Dopravce
          <select value={form.conveyorID} onChange={(e) => set("conveyorID", e.target.value)}>
            <option value="">-- vyberte dopravce --</option>
            {carriers.map(c => <option key={c.ID} value={c.ID}>{c.firm}</option>)}
          </select>
        </label>
      )}

      {form.type === "passenger" && (
        <>
          <label>Email
            <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
          </label>
          <label className="admin-check">
            <input type="checkbox" checked={form.registered} onChange={(e) => set("registered", e.target.checked)} />
            Registrovaný
          </label>
        </>
      )}

      <label>{isEdit ? "Nové heslo (prázdné = zachovat)" : "Heslo"}
        <input type="password" value={form.passwd} onChange={(e) => set("passwd", e.target.value)} />
      </label>

      <div>
        <button type="button" className="editbtn" disabled={busy} onClick={onSave}>Uložit</button>
        <button type="button" className="editbtn" onClick={onCancel}>Zrušit</button>
      </div>
    </div>
  );
};

const userDetail = (u) => {
  if (u.type === "passenger") {
    return u.email || "-";
  }
  if (u.type === "crew") {
    return u.detail || "-";
  }
  return "";
};

export const EditAdminPage = () => {
  const token = getToken();
  const adminID = token ? token.id : -1;

  const [users, setUsers] = useState([]);
  const [carriers, setCarriers] = useState([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const [loadedUsers, loadedCarriers] = await Promise.all([
      fetch("/api/users?adminID=" + adminID).then(res => res.json()),
      fetch("/api/carriers?adminID=" + adminID).then(res => res.json()),
    ]);

    if (!Array.isArray(loadedUsers) || !Array.isArray(loadedCarriers)) {
      setError("Nepodařilo se načíst uživatele");
      return;
    }

    setUsers(loadedUsers);
    setCarriers(loadedCarriers);
    setError("");
  };

  useEffect(() => {
    load().catch(e => {
      console.error(e);
      setError("Nepodařilo se načíst uživatele");
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const openCreate = () => setForm(emptyForm());

  const openEdit = (u) => setForm({
    mode: "edit",
    type: u.type,
    ID: u.ID,
    name: u.name,
    passwd: "",
    email: u.email || "",
    registered: u.registered === 1 || u.registered === true,
    conveyorID: u.conveyorID ? String(u.conveyorID) : ""
  });

  const save = async () => {
    if (!form) return;
    if (!form.name.trim()) return alert("Zadejte jméno");
    if (form.mode === "create" && form.type !== "passenger" && !form.passwd) return alert("Zadejte heslo");
    if (form.type === "crew" && !form.conveyorID) return alert("Vyberte dopravce");

    const body = {
      name: form.name.trim(),
      passwd: form.passwd,
      email: form.email ? form.email.trim() : null,
      registered: form.registered,
      conveyorID: form.conveyorID ? parseInt(form.conveyorID) : null
    };
    if (form.type === "conveyor") body.firm = form.name.trim();

    const url = form.mode === "create"
      ? "/api/users/" + form.type + "?adminID=" + adminID
      : "/api/users/" + form.type + "/" + form.ID + "?adminID=" + adminID;
    const method = form.mode === "create" ? "POST" : "PUT";

    setBusy(true);
    try {
      const data = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }).then(res => res.json());

      if (data.msg !== "OK") {
        alert("Uložení se nezdařilo");
        return;
      }

      setForm(null);
      await load();
    } catch(e) {
      console.error(e);
      alert("Uložení se nezdařilo");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (u) => {
    const what = u.type === "conveyor"
      ? "dopravce včetně jeho spojů, vozidel, personálu a zastávek"
      : u.type === "passenger"
        ? "cestujícího včetně jeho rezervací"
        : ROLE_LABEL[u.type].toLowerCase() + "a";

    if (!window.confirm("Opravdu smazat " + what + " (" + u.name + ")? Tuto akci nelze vrátit.")) {
      return;
    }

    setBusy(true);
    try {
      const data = await fetch("/api/users/" + u.type + "/" + u.ID + "?adminID=" + adminID, {
        method: "DELETE"
      }).then(res => res.json());

      if (data.msg !== "OK") {
        alert("Smazání se nezdařilo");
        return;
      }

      await load();
    } catch(e) {
      console.error(e);
      alert("Smazání se nezdařilo");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin_frame">
      <div className="admin_users_config">
        <div className="admin-toolbar">
          <button type="button" className="editbtn" onClick={openCreate}>+ Nový uživatel</button>
        </div>

        {error ? <p className="crew-error">{error}</p> : null}

        <table className="admin_users_table">
          <thead className="admin_table_head">
            <tr>
              <th>ID</th>
              <th>Jméno / Firma</th>
              <th>Role</th>
              <th>Detail</th>
              <th>*</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.type + "-" + u.ID}>
                <td>{u.ID}</td>
                <td>{u.name}</td>
                <td>{ROLE_LABEL[u.type]}</td>
                <td>{userDetail(u)}</td>
                <td>
                  <button type="button" className="editbtn" onClick={() => openEdit(u)}>Upravit</button>
                  <button type="button" className="editbtn" onClick={() => remove(u)}>Smazat</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="admin_others_config">
        {form ? (
          <AdminForm
            form={form}
            carriers={carriers}
            onChange={setForm}
            onSave={save}
            onCancel={() => setForm(null)}
            busy={busy}
          />
        ) : (
          <p>Vyberte uživatele k úpravě nebo vytvořte nového.</p>
        )}
      </div>
    </div>
  );
};

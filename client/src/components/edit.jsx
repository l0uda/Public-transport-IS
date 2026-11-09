import React, { useState } from "react";
import { getToken, rankOf, buildScope } from "../services/userControl";
import { EditCrewPage } from "../components/edit_crew";
import { EditAdminPage } from "../components/admin";
import { EditConveyorPage } from "../components/conveyor";
import { AdminStops } from "../components/admin_stops";

export const EditErrorPage = () => {
  const t = getToken();
  if(!t){
    return <h3>Omlouváme se, k tomuto musíte být příhlášeni :(</h3>
  } else {
    return <h3>Jste přihlášeni jako někdo jiný *suspicious*</h3>
  }
}

// sections ordered from the lowest role requirement to the highest
const SECTIONS = [
  { key: "crew", label: "Rezervace", rank: 2 },
  { key: "conveyor", label: "Dopravce", rank: 3 },
  { key: "stops", label: "Zastávky", rank: 4 },
  { key: "admin", label: "Administrace", rank: 4 },
];

const Edit = () => {
  const token = getToken();
  const rank = token ? rankOf(token.type) : -1;
  const allowed = SECTIONS.filter(section => rank >= section.rank);
  const [selected, setSelected] = useState(null);

  if (!token) {
    return <EditErrorPage />;
  }

  if (allowed.length === 0) {
    return <h3>Omlouváme se, ale k tomuto obsahu nemáte přístup.</h3>;
  }

  const current = selected || allowed[allowed.length - 1].key;
  const scope = buildScope(token);

  return (
    <div>
      {allowed.length > 1 && (
        <div className="header-people">
          {allowed.map(section => (
            <button
              key={section.key}
              type="button"
              className="btn-ppl"
              onClick={() => setSelected(section.key)}
            >
              {section.label}
            </button>
          ))}
        </div>
      )}

      {current === "crew" && <EditCrewPage scope={scope} />}
      {current === "conveyor" && <EditConveyorPage scope={scope} />}
      {current === "stops" && <AdminStops />}
      {current === "admin" && <EditAdminPage />}
    </div>
  );
}

export default Edit;

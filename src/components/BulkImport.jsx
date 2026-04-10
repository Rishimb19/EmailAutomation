import React, { useState } from "react";
import { importFromCSV } from "../utils/helpers";

const BulkImport = ({ onImport, keywords }) => {
  const [csvText, setCsvText] = useState("");
  const [showImport, setShowImport] = useState(false);

  const handleImport = () => {
    const imported = importFromCSV(csvText);
    if (imported.length > 0) {
      onImport(imported);
      setCsvText("");
      setShowImport(false);
      alert(`Imported ${imported.length} recipients successfully!`);
    } else {
      alert("No valid recipients found in CSV");
    }
  };

  return (
    <div className="bulk-import">
      <button
        onClick={() => setShowImport(!showImport)}
        className="toggle-import"
      >
        📤 Bulk Import from CSV
      </button>

      {showImport && (
        <div className="import-area">
          <p>CSV Format: email,{keywords.join(",")}</p>
          <textarea
            placeholder={`email,name,company\njohn@example.com,John Doe,ABC Corp\njane@example.com,Jane Smith,XYZ Ltd`}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            rows={6}
          />
          <div className="import-buttons">
            <button onClick={handleImport} className="import-btn">
              Import
            </button>
            <button onClick={() => setShowImport(false)} className="cancel-btn">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkImport;

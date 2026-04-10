import React, { useState } from "react";

const RecipientManager = ({ keywords, recipients, onRecipientsChange }) => {
  const [currentRecipient, setCurrentRecipient] = useState({ email: "" });

  const addRecipient = () => {
    // Validate all keywords have values
    const missing = keywords.filter((k) => !currentRecipient[k]);
    if (missing.length > 0) {
      alert(`Please provide values for: ${missing.join(", ")}`);
      return;
    }

    if (!currentRecipient.email) {
      alert("Email is required");
      return;
    }

    onRecipientsChange([...recipients, currentRecipient]);
    setCurrentRecipient({ email: "" });
  };

  const removeRecipient = (index) => {
    onRecipientsChange(recipients.filter((_, i) => i !== index));
  };

  const updateRecipientField = (field, value) => {
    setCurrentRecipient({ ...currentRecipient, [field]: value });
  };

  return (
    <div className="recipient-manager">
      <h3>Add Recipients</h3>

      <div className="recipient-form">
        <input
          type="email"
          placeholder="Email Address"
          value={currentRecipient.email || ""}
          onChange={(e) => updateRecipientField("email", e.target.value)}
        />

        {keywords.map((keyword) => (
          <input
            key={keyword}
            placeholder={`${keyword}`}
            value={currentRecipient[keyword] || ""}
            onChange={(e) => updateRecipientField(keyword, e.target.value)}
          />
        ))}

        <button onClick={addRecipient}>Add Recipient</button>
      </div>

      <div className="recipients-table">
        <table>
          <thead>
            <tr>
              <th>Email</th>
              {keywords.map((k) => (
                <th key={k}>{k}</th>
              ))}
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {recipients.map((recipient, index) => (
              <tr key={index}>
                <td>{recipient.email}</td>
                {keywords.map((k) => (
                  <td key={k}>{recipient[k] || "-"}</td>
                ))}
                <td>
                  <button onClick={() => removeRecipient(index)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bulk-import">
        <h4>Bulk Import (CSV Format)</h4>
        <textarea
          placeholder="email,name,company&#10;john@example.com,John Doe,ABC Corp&#10;jane@example.com,Jane Smith,XYZ Ltd"
          rows={5}
          onBlur={(e) => {
            const lines = e.target.value.split("\n");
            const headers = lines[0].split(",");
            const newRecipients = lines
              .slice(1)
              .map((line) => {
                const values = line.split(",");
                const obj = {};
                headers.forEach((h, i) => (obj[h.trim()] = values[i]?.trim()));
                return obj;
              })
              .filter((r) => r.email);
            onRecipientsChange([...recipients, ...newRecipients]);
          }}
        />
      </div>
    </div>
  );
};

export default RecipientManager;

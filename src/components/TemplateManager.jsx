import React, { useState } from "react";

const TemplateManager = ({ templates, onSelect, onSave }) => {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [templateName, setTemplateName] = useState("");

  const handleSave = () => {
    const subject = document.querySelector("#subject")?.value || "";
    const message = document.querySelector("#message")?.value || "";

    onSave({
      id: Date.now(),
      name: templateName,
      subject: subject,
      message: message,
      keywords: [],
      createdAt: new Date().toISOString(),
    });
    setShowSaveDialog(false);
    setTemplateName("");
  };

  return (
    <div className="template-manager">
      <h3>Saved Templates</h3>
      <div className="template-list">
        {templates.length === 0 ? (
          <p className="no-templates">No templates saved yet</p>
        ) : (
          templates.map((template) => (
            <div
              key={template.id}
              className="template-item"
              onClick={() => onSelect(template)}
            >
              <div className="template-name">{template.name}</div>
              <div className="template-date">
                {new Date(template.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>

      <button
        className="save-template-btn"
        onClick={() => setShowSaveDialog(true)}
      >
        Save Current Template
      </button>

      {showSaveDialog && (
        <>
          <div
            className="modal-overlay"
            onClick={() => setShowSaveDialog(false)}
          ></div>
          <div className="modal">
            <h4>Save Template</h4>
            <input
              placeholder="Template Name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              autoFocus
            />
            <div className="modal-buttons">
              <button onClick={handleSave} className="save-btn">
                Save
              </button>
              <button
                onClick={() => setShowSaveDialog(false)}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TemplateManager;

import React, { useState } from "react";

const KeywordManager = ({ keywords, onKeywordsChange }) => {
  const [newKeyword, setNewKeyword] = useState("");

  const addKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      onKeywordsChange([...keywords, newKeyword.trim()]);
      setNewKeyword("");
    }
  };

  const removeKeyword = (keyword) => {
    onKeywordsChange(keywords.filter((k) => k !== keyword));
  };

  return (
    <div className="keyword-manager">
      <h3>Template Keywords</h3>
      <p>Keywords will be replaced with recipient-specific values</p>

      <div className="keyword-input">
        <input
          placeholder="Enter keyword (e.g., name, company)"
          value={newKeyword}
          onChange={(e) => setNewKeyword(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && addKeyword()}
        />
        <button onClick={addKeyword}>Add Keyword</button>
      </div>

      <div className="keywords-list">
        {keywords.map((keyword) => (
          <div key={keyword} className="keyword-chip">
            <span>{`{{${keyword}}}`}</span>
            <button onClick={() => removeKeyword(keyword)}>×</button>
          </div>
        ))}
      </div>

      <div className="keyword-usage">
        <h4>Usage Example:</h4>
        <pre>
          {`Hello {{name}},\n\nWelcome to {{company}}!\nYour position: {{position}}`}
        </pre>
      </div>
    </div>
  );
};

export default KeywordManager;

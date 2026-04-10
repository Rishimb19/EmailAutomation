import React from 'react';

// Inline personalize function
const personalizeMessage = (message, recipient) => {
  if (!message || !recipient) return message;
  
  let personalized = message;
  Object.keys(recipient).forEach(key => {
    const variable = `{{${key}}}`;
    const regex = new RegExp(variable.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    personalized = personalized.replace(regex, recipient[key] || '');
  });
  return personalized;
};

const EmailPreview = ({ subject, message, recipients, keywords }) => {
  const [selectedRecipientIndex, setSelectedRecipientIndex] = React.useState(0);

  if (!recipients || recipients.length === 0) {
    return (
      <div className="email-preview">
        <div className="preview-empty">
          <p>No recipients added yet. Add recipients to see preview.</p>
        </div>
      </div>
    );
  }

  const selectedRecipient = recipients[selectedRecipientIndex];
  const personalizedSubject = personalizeMessage(subject, selectedRecipient);
  const personalizedMessage = personalizeMessage(message, selectedRecipient);

  return (
    <div className="email-preview">
      <div className="preview-header">
        <h3>Email Preview</h3>
        <div className="recipient-selector">
          <label>Preview for: </label>
          <select 
            value={selectedRecipientIndex}
            onChange={(e) => setSelectedRecipientIndex(Number(e.target.value))}
          >
            {recipients.map((recipient, idx) => (
              <option key={idx} value={idx}>
                {recipient.email}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="preview-card">
        <div className="preview-recipient">
          <strong>To:</strong> {selectedRecipient.email}
        </div>
        <div className="preview-subject">
          <strong>Subject:</strong> {personalizedSubject}
        </div>
        <div className="preview-divider"></div>
        <div className="preview-message">
          <div style={{ whiteSpace: 'pre-wrap' }}>
            {personalizedMessage}
          </div>
        </div>
      </div>

      {keywords && keywords.length > 0 && (
        <div className="preview-keywords">
          <h4>Keyword Values for this Recipient:</h4>
          <table className="keyword-table">
            <tbody>
              {keywords.map(keyword => (
                <tr key={keyword}>
                  <td><strong>{'{' + keyword + '}'}</strong></td>
                  <td>→</td>
                  <td>{selectedRecipient[keyword] || '<missing>'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EmailPreview;
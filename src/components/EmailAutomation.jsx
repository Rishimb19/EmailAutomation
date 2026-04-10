import React, { useState, useEffect } from "react";
import axios from "axios";
import "./EmailAutomation.css";

const EmailAutomation = () => {
  // State Management
  const [step, setStep] = useState(1);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [templateName, setTemplateName] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [keywords, setKeywords] = useState([]);
  const [newKeyword, setNewKeyword] = useState("");
  const [recipients, setRecipients] = useState([]);
  const [currentRecipient, setCurrentRecipient] = useState({ email: "" });
  const [sending, setSending] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });
  const [responseDetails, setResponseDetails] = useState(null);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Load templates on mount
  useEffect(() => {
    const saved = localStorage.getItem("emailTemplates");
    if (saved) {
      try {
        setTemplates(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading templates:", e);
      }
    }
  }, []);

  // Save templates
  const saveTemplatesToStorage = (updatedTemplates) => {
    localStorage.setItem("emailTemplates", JSON.stringify(updatedTemplates));
    setTemplates(updatedTemplates);
  };

  // Show notification
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(
      () => setNotification({ show: false, message: "", type: "" }),
      4000,
    );
  };

  // Replace keywords
  const personalizeMessage = (text, recipientData) => {
    if (!text) return "";
    let personalized = text;
    Object.keys(recipientData).forEach((key) => {
      const regex = new RegExp(`{{${key}}}`, "g");
      personalized = personalized.replace(regex, recipientData[key] || "");
    });
    // Replace date range if present
    if (showDatePicker && dateRange.start && dateRange.end) {
      personalized = personalized.replace(/{{startDate}}/g, dateRange.start);
      personalized = personalized.replace(/{{endDate}}/g, dateRange.end);
    }
    return personalized;
  };

  // Insert keyword
  const insertKeyword = (keywordItem) => {
    const textarea = document.querySelector(".form-textarea");
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = message;
      const newText =
        text.substring(0, start) + `{{${keywordItem}}}` + text.substring(end);
      setMessage(newText);
      showNotification(`Added {{${keywordItem}}} to template`, "success");
    }
  };

  // Add keyword
  const addKeyword = () => {
    if (!newKeyword.trim()) {
      showNotification("Please enter a keyword", "error");
      return;
    }
    if (keywords.includes(newKeyword.trim())) {
      showNotification("Keyword already exists", "warning");
      return;
    }
    setKeywords([...keywords, newKeyword.trim()]);
    setNewKeyword("");
    showNotification(`Keyword "${newKeyword.trim()}" added`, "success");
  };

  // Remove keyword
  const removeKeywordItem = (keywordToRemove) => {
    setKeywords(keywords.filter((k) => k !== keywordToRemove));
    showNotification("Keyword removed", "info");
  };

  // Add recipient
  const addRecipient = () => {
    if (!currentRecipient.email) {
      showNotification("Email address is required", "error");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(currentRecipient.email)) {
      showNotification("Invalid email format", "error");
      return;
    }

    if (recipients.some((r) => r.email === currentRecipient.email)) {
      showNotification("Email already exists in list", "warning");
      return;
    }

    const missingKeywords = keywords.filter((k) => !currentRecipient[k]);
    if (missingKeywords.length > 0) {
      showNotification(
        `Please provide values for: ${missingKeywords.join(", ")}`,
        "error",
      );
      return;
    }

    setRecipients([...recipients, currentRecipient]);
    setCurrentRecipient({ email: "" });
    showNotification("Recipient added successfully", "success");
  };

  // Bulk add recipients
  const bulkAddRecipients = (bulkText) => {
    const lines = bulkText.trim().split("\n");
    const newRecipients = [];

    lines.forEach((line) => {
      const parts = line.split(",");
      if (parts[0] && parts[0].includes("@")) {
        const recipient = { email: parts[0].trim() };
        keywords.forEach((k, idx) => {
          if (parts[idx + 1]) {
            recipient[k] = parts[idx + 1].trim();
          }
        });
        if (!recipients.some((r) => r.email === recipient.email)) {
          newRecipients.push(recipient);
        }
      }
    });

    setRecipients([...recipients, ...newRecipients]);
    showNotification(`Added ${newRecipients.length} recipients`, "success");
  };

  // Remove recipient
  const removeRecipient = (index) => {
    setRecipients(recipients.filter((_, i) => i !== index));
    showNotification("Recipient removed", "info");
  };

  // Save template
  const saveTemplate = () => {
    if (!templateName.trim()) {
      showNotification("Please enter a template name", "error");
      return;
    }

    const newTemplate = {
      id: Date.now(),
      name: templateName,
      subject,
      message,
      keywords,
      dateRange: showDatePicker ? dateRange : null,
      createdAt: new Date().toISOString(),
    };

    const updatedTemplates = [...templates, newTemplate];
    saveTemplatesToStorage(updatedTemplates);
    setShowTemplateDialog(false);
    setTemplateName("");
    showNotification("Template saved successfully!", "success");
  };

  // Load template
  const loadTemplate = (template) => {
    setSelectedTemplateId(template.id);
    setSubject(template.subject || "");
    setMessage(template.message || "");
    setKeywords(template.keywords || []);
    if (template.dateRange) {
      setShowDatePicker(true);
      setDateRange(template.dateRange);
    }
    showNotification(`Loaded: ${template.name}`, "success");
    setStep(2);
  };

  // Delete template
  const deleteTemplate = (templateId, templateNameToDelete) => {
    if (window.confirm(`Delete "${templateNameToDelete}"?`)) {
      const updatedTemplates = templates.filter((t) => t.id !== templateId);
      saveTemplatesToStorage(updatedTemplates);
      if (selectedTemplateId === templateId) {
        setSelectedTemplateId(null);
        setSubject("");
        setMessage("");
        setKeywords([]);
      }
      showNotification("Template deleted", "info");
    }
  };

  // Send emails
  const sendEmails = async () => {
    if (recipients.length === 0) {
      showNotification("No recipients added", "error");
      return;
    }
    if (!subject.trim() || !message.trim()) {
      showNotification("Please add subject and message", "error");
      return;
    }

    setSending(true);
    setSendProgress(0);
    setResponseDetails(null);

    try {
      const webhookUrl =
        process.env.REACT_APP_N8N_WEBHOOK_URL ||
        "http://localhost:5678/webhook/5jLA9GxAw1vXwJHf";

      const interval = setInterval(() => {
        setSendProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      const response = await axios.post(
        webhookUrl,
        {
          recipients: recipients,
          subject: subject,
          message: message,
          dateRange: showDatePicker ? dateRange : null,
          totalRecipients: recipients.length,
          timestamp: new Date().toISOString(),
        },
        {
          timeout: 60000,
          headers: { "Content-Type": "application/json" },
        },
      );

      clearInterval(interval);
      setSendProgress(100);

      setResponseDetails({
        status: "success",
        message: `Successfully sent ${recipients.length} emails`,
        response: response.data,
        timestamp: new Date().toLocaleString(),
      });

      showNotification(
        `✅ Successfully sent ${recipients.length} emails!`,
        "success",
      );

      setTimeout(() => {
        setRecipients([]);
        setStep(1);
        setSendProgress(0);
      }, 2000);
    } catch (error) {
      console.error("Error:", error);
      setResponseDetails({
        status: "error",
        message: "Failed to send emails",
        error: error.message,
        timestamp: new Date().toLocaleString(),
      });
      showNotification("❌ Failed to send emails", "error");
      setSendProgress(0);
    } finally {
      setSending(false);
    }
  };

  // Get preview for a specific recipient
  const getPreviewForRecipient = (recipient, idx) => {
    let personalizedSubject = subject;
    let personalizedMessage = message;

    // Replace keywords
    Object.keys(recipient).forEach((key) => {
      const regex = new RegExp(`{{${key}}}`, "g");
      personalizedSubject = personalizedSubject.replace(
        regex,
        recipient[key] || "",
      );
      personalizedMessage = personalizedMessage.replace(
        regex,
        recipient[key] || "",
      );
    });

    // Replace date range if present
    if (showDatePicker && dateRange.start && dateRange.end) {
      personalizedSubject = personalizedSubject.replace(
        /{{startDate}}/g,
        dateRange.start,
      );
      personalizedSubject = personalizedSubject.replace(
        /{{endDate}}/g,
        dateRange.end,
      );
      personalizedMessage = personalizedMessage.replace(
        /{{startDate}}/g,
        dateRange.start,
      );
      personalizedMessage = personalizedMessage.replace(
        /{{endDate}}/g,
        dateRange.end,
      );
    }

    return (
      <div className="preview-card" key={idx}>
        <div className="preview-header-badge">
          <span className="recipient-email">{recipient.email}</span>
        </div>
        <div className="preview-subject">
          <strong>Subject:</strong> {personalizedSubject}
        </div>
        <div className="preview-divider"></div>
        <div className="preview-body">
          <div style={{ whiteSpace: "pre-wrap" }}>{personalizedMessage}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="email-automation-container">
      {/* Header */}
      <div className="header">
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon">📧</div>
            <h1>Bulk Email Sender</h1>
          </div>
          <div className="header-stats">
            <div className="stat">
              <span className="stat-value">{templates.length}</span>
              <span className="stat-label">Templates</span>
            </div>
            <div className="stat">
              <span className="stat-value">{recipients.length}</span>
              <span className="stat-label">Recipients</span>
            </div>
            <div className="stat">
              <span className="stat-value">{keywords.length}</span>
              <span className="stat-label">Keywords</span>
            </div>
          </div>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="step-indicator">
        <div
          className={`step ${step >= 1 ? "active" : ""}`}
          onClick={() => step > 1 && setStep(1)}
        >
          <div className="step-number">1</div>
          <div className="step-label">Create Template</div>
        </div>
        <div className={`step-line ${step >= 2 ? "active" : ""}`}></div>
        <div
          className={`step ${step >= 2 ? "active" : ""}`}
          onClick={() => step > 2 && setStep(2)}
        >
          <div className="step-number">2</div>
          <div className="step-label">Add Keywords</div>
        </div>
        <div className={`step-line ${step >= 3 ? "active" : ""}`}></div>
        <div
          className={`step ${step >= 3 ? "active" : ""}`}
          onClick={() => step > 3 && setStep(3)}
        >
          <div className="step-number">3</div>
          <div className="step-label">Add Recipients</div>
        </div>
        <div className={`step-line ${step >= 4 ? "active" : ""}`}></div>
        <div className={`step ${step >= 4 ? "active" : ""}`}>
          <div className="step-number">4</div>
          <div className="step-label">Review & Send</div>
        </div>
      </div>

      {/* Notification */}
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          <div className="notification-content">
            <span className="notification-icon">
              {notification.type === "success" && "✓"}
              {notification.type === "error" && "✗"}
              {notification.type === "warning" && "⚠"}
            </span>
            <span className="notification-message">{notification.message}</span>
          </div>
        </div>
      )}

      <div className="main-layout">
        {/* Sidebar - Templates */}
        <div className="sidebar">
          <div className="sidebar-header">
            <h3>📁 My Templates</h3>
            <button
              className="btn-icon"
              onClick={() => setShowTemplateDialog(true)}
            >
              +
            </button>
          </div>
          <div className="templates-list">
            {templates.length === 0 ? (
              <div className="empty-state">
                <p>No templates yet</p>
                <small>Click + to create</small>
              </div>
            ) : (
              templates.map((template) => (
                <div
                  key={template.id}
                  className={`template-item ${selectedTemplateId === template.id ? "active" : ""}`}
                  onClick={() => loadTemplate(template)}
                >
                  <div className="template-info">
                    <div className="template-name">{template.name}</div>
                    <div className="template-meta">
                      {template.keywords?.length || 0} keywords
                    </div>
                  </div>
                  <button
                    className="btn-delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTemplate(template.id, template.name);
                    }}
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          {/* Step 1: Template Creation */}
          {step === 1 && (
            <div className="step-content">
              <h2>Step 1: Create Your Email Template</h2>

              <div className="form-group">
                <label>Subject Line</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter email subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Email Message</label>
                <textarea
                  className="form-textarea"
                  placeholder="Write your email template here... Use keywords by clicking the buttons below"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={10}
                />
              </div>

              <div className="form-group">
                <label>Date Range (Optional)</label>
                <div className="date-range-group">
                  <input
                    type="date"
                    className="date-input"
                    value={dateRange.start}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, start: e.target.value })
                    }
                  />
                  <span>to</span>
                  <input
                    type="date"
                    className="date-input"
                    value={dateRange.end}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, end: e.target.value })
                    }
                  />
                  <button
                    className="btn-add-date"
                    onClick={() => setShowDatePicker(!showDatePicker)}
                  >
                    {showDatePicker ? "Remove Dates" : "Add Date Range"}
                  </button>
                </div>
                {showDatePicker && (
                  <div className="hint-text">
                    Use {"{{startDate}}"} and {"{{endDate}}"} in your template
                  </div>
                )}
              </div>

              <div className="step-actions">
                <button
                  className="btn-secondary"
                  onClick={() => setShowTemplateDialog(true)}
                >
                  💾 Save Template
                </button>
                <button className="btn-primary" onClick={() => setStep(2)}>
                  Next: Add Keywords →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Keywords */}
          {step === 2 && (
            <div className="step-content">
              <h2>Step 2: Add Personalization Keywords</h2>
              <p className="step-description">
                Add keywords to personalize your emails. Click any keyword to
                insert it into your template.
              </p>

              <div className="keyword-input-group">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter keyword (e.g., name, company, position)"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addKeyword()}
                />
                <button className="btn-add" onClick={addKeyword}>
                  Add Keyword
                </button>
              </div>

              <div className="keywords-container">
                <label>Your Keywords (Click to insert)</label>
                <div className="keywords-buttons">
                  {keywords.map((keywordItem) => (
                    <button
                      key={keywordItem}
                      className="keyword-button"
                      onClick={() => insertKeyword(keywordItem)}
                    >
                      {keywordItem}
                    </button>
                  ))}
                  {keywords.length === 0 && (
                    <div className="hint-text">
                      No keywords added yet. Add keywords above.
                    </div>
                  )}
                </div>
              </div>

              <div className="step-actions">
                <button className="btn-secondary" onClick={() => setStep(1)}>
                  ← Back
                </button>
                <button className="btn-primary" onClick={() => setStep(3)}>
                  Next: Add Recipients →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Recipients */}
          {step === 3 && (
            <div className="step-content">
              <h2>Step 3: Add Recipients</h2>

              <div className="two-columns">
                <div className="add-recipient-card">
                  <h3>Add Single Recipient</h3>
                  <div className="recipient-form">
                    <input
                      type="email"
                      placeholder="Email Address *"
                      value={currentRecipient.email}
                      onChange={(e) =>
                        setCurrentRecipient({
                          ...currentRecipient,
                          email: e.target.value,
                        })
                      }
                    />
                    {keywords.map((keywordItem) => (
                      <input
                        key={keywordItem}
                        type="text"
                        placeholder={`${keywordItem} *`}
                        value={currentRecipient[keywordItem] || ""}
                        onChange={(e) =>
                          setCurrentRecipient({
                            ...currentRecipient,
                            [keywordItem]: e.target.value,
                          })
                        }
                      />
                    ))}
                    <button className="btn-primary" onClick={addRecipient}>
                      + Add Recipient
                    </button>
                  </div>
                </div>

                <div className="bulk-import-card">
                  <h3>Bulk Import</h3>
                  <textarea
                    className="bulk-textarea"
                    placeholder={`Format: email,${keywords.join(",")}\njohn@example.com,John Doe,ABC Corp\njane@example.com,Jane Smith,XYZ Ltd`}
                    rows={6}
                    onBlur={(e) => bulkAddRecipients(e.target.value)}
                  />
                  <div className="hint-text">
                    One recipient per line. Format: email,keyword1,keyword2,...
                  </div>
                </div>
              </div>

              <div className="recipients-list">
                <h3>Recipients ({recipients.length})</h3>
                {recipients.length === 0 ? (
                  <div className="empty-state">No recipients added yet</div>
                ) : (
                  <div className="table-wrapper">
                    <table className="recipients-table">
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
                              <button
                                className="btn-delete-small"
                                onClick={() => removeRecipient(index)}
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="step-actions">
                <button className="btn-secondary" onClick={() => setStep(2)}>
                  ← Back
                </button>
                <button className="btn-primary" onClick={() => setStep(4)}>
                  Next: Review & Send →
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Review & Send */}
          {step === 4 && (
            <div className="step-content">
              <h2>Step 4: Review & Send</h2>

              <div className="review-section">
                <div className="review-card">
                  <h3>Template Preview</h3>
                  <div className="review-subject">
                    <strong>Subject:</strong> {subject}
                  </div>
                  <div className="review-message">{message}</div>
                </div>

                <div className="review-card">
                  <h3>Recipients ({recipients.length})</h3>
                  <div className="recipients-summary">
                    {recipients.slice(0, 5).map((r, i) => (
                      <div key={i} className="recipient-summary-item">
                        {r.email}
                      </div>
                    ))}
                    {recipients.length > 5 && (
                      <div className="more-recipients">
                        +{recipients.length - 5} more
                      </div>
                    )}
                  </div>
                </div>

                <div className="preview-container">
                  <h3>Preview (First Recipient)</h3>
                  {recipients.length > 0 &&
                    getPreviewForRecipient(recipients[0], 0)}
                </div>
              </div>

              {sending && (
                <div className="progress-section">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${sendProgress}%` }}
                    ></div>
                  </div>
                  <div className="progress-text">
                    Sending... {sendProgress}%
                  </div>
                </div>
              )}

              {responseDetails && (
                <div className={`response-card ${responseDetails.status}`}>
                  <div className="response-header">
                    <span className={`status-badge ${responseDetails.status}`}>
                      {responseDetails.status === "success"
                        ? "✓ Success"
                        : "✗ Failed"}
                    </span>
                    <span className="response-time">
                      {responseDetails.timestamp}
                    </span>
                  </div>
                  <div className="response-body">{responseDetails.message}</div>
                </div>
              )}

              <div className="step-actions">
                <button className="btn-secondary" onClick={() => setStep(3)}>
                  ← Back
                </button>
                <button
                  className="btn-send"
                  onClick={sendEmails}
                  disabled={sending}
                >
                  {sending
                    ? "Sending..."
                    : `📧 Send to ${recipients.length} Recipients`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Template Dialog */}
      {showTemplateDialog && (
        <div
          className="modal-overlay"
          onClick={() => setShowTemplateDialog(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Save Template</h3>
            <input
              type="text"
              placeholder="Template name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              autoFocus
            />
            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setShowTemplateDialog(false)}
              >
                Cancel
              </button>
              <button className="btn-primary" onClick={saveTemplate}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailAutomation;

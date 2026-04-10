const STORAGE_KEY = "email_templates";

export const saveTemplates = (template) => {
  const existing = loadTemplates();
  const updated = [...existing, template];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

export const loadTemplates = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
};

export const updateTemplate = (templateId, updates) => {
  const templates = loadTemplates();
  const updated = templates.map((t) =>
    t.id === templateId ? { ...t, ...updates } : t,
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

export const deleteTemplate = (templateId) => {
  const templates = loadTemplates();
  const updated = templates.filter((t) => t.id !== templateId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

export const saveRecipients = (templateId, recipients) => {
  const key = `recipients_${templateId}`;
  localStorage.setItem(key, JSON.stringify(recipients));
};

export const loadRecipients = (templateId) => {
  const key = `recipients_${templateId}`;
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : [];
};

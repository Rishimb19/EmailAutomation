import { useState, useEffect } from "react";
import {
  loadTemplates,
  saveTemplates,
  deleteTemplate,
  updateTemplate,
} from "../utils/storage";

export const useTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAllTemplates();
  }, []);

  const loadAllTemplates = async () => {
    try {
      setLoading(true);
      const loaded = await loadTemplates();
      setTemplates(loaded);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addTemplate = async (templateData) => {
    try {
      const newTemplate = {
        id: Date.now(),
        ...templateData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const updated = await saveTemplates(newTemplate);
      setTemplates(updated);
      return newTemplate;
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  const updateExistingTemplate = async (templateId, updates) => {
    try {
      const updated = await updateTemplate(templateId, updates);
      setTemplates(updated);
      return updated;
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  const removeTemplate = async (templateId) => {
    try {
      const updated = await deleteTemplate(templateId);
      setTemplates(updated);
      return updated;
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  const getTemplateById = (templateId) => {
    return templates.find((t) => t.id === templateId);
  };

  return {
    templates,
    loading,
    error,
    addTemplate,
    updateExistingTemplate,
    removeTemplate,
    getTemplateById,
    reloadTemplates: loadAllTemplates,
  };
};

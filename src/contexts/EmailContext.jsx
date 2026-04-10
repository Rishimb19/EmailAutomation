import React, { createContext, useContext, useReducer } from "react";

// Initial state
const initialState = {
  templates: [],
  currentTemplate: null,
  recipients: [],
  keywords: [],
  subject: "",
  message: "",
  loading: false,
  error: null,
};

// Action types
const ACTIONS = {
  SET_TEMPLATES: "SET_TEMPLATES",
  SET_CURRENT_TEMPLATE: "SET_CURRENT_TEMPLATE",
  SET_RECIPIENTS: "SET_RECIPIENTS",
  SET_KEYWORDS: "SET_KEYWORDS",
  SET_SUBJECT: "SET_SUBJECT",
  SET_MESSAGE: "SET_MESSAGE",
  ADD_RECIPIENT: "ADD_RECIPIENT",
  REMOVE_RECIPIENT: "REMOVE_RECIPIENT",
  ADD_KEYWORD: "ADD_KEYWORD",
  REMOVE_KEYWORD: "REMOVE_KEYWORD",
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
  CLEAR_FORM: "CLEAR_FORM",
};

// Reducer
const emailReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_TEMPLATES:
      return { ...state, templates: action.payload };

    case ACTIONS.SET_CURRENT_TEMPLATE:
      return {
        ...state,
        currentTemplate: action.payload,
        subject: action.payload?.subject || "",
        message: action.payload?.message || "",
        keywords: action.payload?.keywords || [],
      };

    case ACTIONS.SET_RECIPIENTS:
      return { ...state, recipients: action.payload };

    case ACTIONS.SET_KEYWORDS:
      return { ...state, keywords: action.payload };

    case ACTIONS.SET_SUBJECT:
      return { ...state, subject: action.payload };

    case ACTIONS.SET_MESSAGE:
      return { ...state, message: action.payload };

    case ACTIONS.ADD_RECIPIENT:
      return { ...state, recipients: [...state.recipients, action.payload] };

    case ACTIONS.REMOVE_RECIPIENT:
      return {
        ...state,
        recipients: state.recipients.filter((_, i) => i !== action.payload),
      };

    case ACTIONS.ADD_KEYWORD:
      if (state.keywords.includes(action.payload)) return state;
      return { ...state, keywords: [...state.keywords, action.payload] };

    case ACTIONS.REMOVE_KEYWORD:
      return {
        ...state,
        keywords: state.keywords.filter((k) => k !== action.payload),
      };

    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };

    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload };

    case ACTIONS.CLEAR_FORM:
      return {
        ...state,
        currentTemplate: null,
        recipients: [],
        subject: "",
        message: "",
        error: null,
      };

    default:
      return state;
  }
};

// Create context
const EmailContext = createContext();

// Provider component
export const EmailProvider = ({ children }) => {
  const [state, dispatch] = useReducer(emailReducer, initialState);

  const value = {
    ...state,
    setTemplates: (templates) =>
      dispatch({ type: ACTIONS.SET_TEMPLATES, payload: templates }),
    setCurrentTemplate: (template) =>
      dispatch({ type: ACTIONS.SET_CURRENT_TEMPLATE, payload: template }),
    setRecipients: (recipients) =>
      dispatch({ type: ACTIONS.SET_RECIPIENTS, payload: recipients }),
    setKeywords: (keywords) =>
      dispatch({ type: ACTIONS.SET_KEYWORDS, payload: keywords }),
    setSubject: (subject) =>
      dispatch({ type: ACTIONS.SET_SUBJECT, payload: subject }),
    setMessage: (message) =>
      dispatch({ type: ACTIONS.SET_MESSAGE, payload: message }),
    addRecipient: (recipient) =>
      dispatch({ type: ACTIONS.ADD_RECIPIENT, payload: recipient }),
    removeRecipient: (index) =>
      dispatch({ type: ACTIONS.REMOVE_RECIPIENT, payload: index }),
    addKeyword: (keyword) =>
      dispatch({ type: ACTIONS.ADD_KEYWORD, payload: keyword }),
    removeKeyword: (keyword) =>
      dispatch({ type: ACTIONS.REMOVE_KEYWORD, payload: keyword }),
    setLoading: (loading) =>
      dispatch({ type: ACTIONS.SET_LOADING, payload: loading }),
    setError: (error) => dispatch({ type: ACTIONS.SET_ERROR, payload: error }),
    clearForm: () => dispatch({ type: ACTIONS.CLEAR_FORM }),
  };

  return (
    <EmailContext.Provider value={value}>{children}</EmailContext.Provider>
  );
};

// Custom hook to use context
export const useEmailContext = () => {
  const context = useContext(EmailContext);
  if (!context) {
    throw new Error("useEmailContext must be used within EmailProvider");
  }
  return context;
};

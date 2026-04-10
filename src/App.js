import React from "react";
import EmailAutomation from "./components/EmailAutomation";
import { EmailProvider } from "./contexts/EmailContext";
import "./App.css";

function App() {
  return (
    <EmailProvider>
      <div className="App">
        <header className="App-header">
          <h1>📧 Email Automation System</h1>
          <p>Connect to n8n workflow for personalized email sending</p>
        </header>
        <EmailAutomation />
      </div>
    </EmailProvider>
  );
}

export default App;

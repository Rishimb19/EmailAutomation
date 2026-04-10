import axios from "axios";

const N8N_WEBHOOK_URL =
  process.env.REACT_APP_N8N_WEBHOOK_URL ||
  "http://localhost:5678/webhook/5jLA9GxAw1vXwJHf";

export const sendEmailsToWebhook = async (data) => {
  try {
    const response = await axios.post(N8N_WEBHOOK_URL, data, {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 30000, // 30 seconds timeout
    });

    return {
      success: true,
      data: response.data,
      message: "Emails sent successfully",
    };
  } catch (error) {
    console.error("Error sending to n8n webhook:", error);
    return {
      success: false,
      error: error.message,
      message: "Failed to send emails",
    };
  }
};

// Test connection to n8n
export const testConnection = async () => {
  try {
    const response = await axios.get(N8N_WEBHOOK_URL, { timeout: 5000 });
    return { success: true, status: response.status };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

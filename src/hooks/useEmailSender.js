import { useState } from "react";
import { sendEmailsToWebhook } from "../services/api";

export const useEmailSender = () => {
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const sendEmails = async (emailData, onProgress) => {
    setSending(true);
    setError(null);
    setSuccess(null);
    setProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 500);

      const result = await sendEmailsToWebhook(emailData);

      clearInterval(progressInterval);
      setProgress(100);

      if (result.success) {
        setSuccess({
          message: result.message,
          count: emailData.recipients?.length || 0,
        });
        return result;
      } else {
        setError(result.error);
        return null;
      }
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setSending(false);
      setTimeout(() => setProgress(0), 2000);
    }
  };

  const reset = () => {
    setSending(false);
    setProgress(0);
    setError(null);
    setSuccess(null);
  };

  return {
    sendEmails,
    sending,
    progress,
    error,
    success,
    reset,
  };
};

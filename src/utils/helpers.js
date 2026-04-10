// Replace keywords in message with actual values
export const personalizeMessage = (message, recipient) => {
  if (!message || !recipient) return message;

  let personalized = message;
  Object.keys(recipient).forEach((key) => {
    const variable = `{{${key}}}`;
    const regex = new RegExp(
      variable.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "g",
    );
    personalized = personalized.replace(regex, recipient[key] || "");
  });
  return personalized;
};

// Validate email format
export const isValidEmail = (email) => {
  if (!email) return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Export recipients to CSV
export const exportToCSV = (recipients, keywords) => {
  if (!recipients || recipients.length === 0) return "";

  const headers = ["email", ...keywords];
  const rows = recipients.map((recipient) =>
    headers
      .map((header) => {
        const value = recipient[header] || "";
        return value.includes(",") || value.includes('"')
          ? `"${value.replace(/"/g, '""')}"`
          : value;
      })
      .join(","),
  );
  return [headers.join(","), ...rows].join("\n");
};

// Import recipients from CSV
export const importFromCSV = (csvText) => {
  if (!csvText || !csvText.trim()) return [];

  const lines = csvText.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const recipients = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === 0) continue;

    const recipient = {};
    headers.forEach((header, index) => {
      recipient[header] = values[index] ? values[index].trim() : "";
    });

    if (recipient.email && isValidEmail(recipient.email)) {
      recipients.push(recipient);
    }
  }

  return recipients;
};

// Helper function to parse CSV line
const parseCSVLine = (line) => {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);

  return result.map((value) => value.replace(/^"|"$/g, "").replace(/""/g, '"'));
};

// Extract keywords from message
export const extractKeywords = (message) => {
  if (!message) return [];

  const regex = /{{(.*?)}}/g;
  const matches = [];
  let match;

  while ((match = regex.exec(message)) !== null) {
    if (!matches.includes(match[1])) {
      matches.push(match[1]);
    }
  }

  return matches;
};

// backend/config/app.js
// Central place for all configuration.
// Import this instead of process.env directly throughout the app.

import dotenv from "dotenv";
dotenv.config();

const config = {
  server: {
    port: parseInt(process.env.PORT) || 5000,
    env: process.env.NODE_ENV || "development",
    isProd: process.env.NODE_ENV === "production",
  },
  azure: {
    apiKey:     process.env.AZURE_OPENAI_API_KEY     || "",
    endpoint:   process.env.AZURE_OPENAI_ENDPOINT    || "",
    deployment: process.env.AZURE_OPENAI_DEPLOYMENT  || "gpt-4o",
    apiVersion: process.env.AZURE_OPENAI_API_VERSION || "2024-02-15-preview",
  },
  foundry: {
    connectionString: process.env.FOUNDRY_PROJECT_CONNECTION_STRING || "",
    get isConfigured() {
      return (
        !!this.connectionString &&
        this.connectionString !== "your_foundry_connection_string_here"
      );
    },
  },
  get isAzureConfigured() {
    return (
      !!this.azure.apiKey &&
      this.azure.apiKey !== "your_azure_openai_key_here" &&
      !!this.azure.endpoint &&
      this.azure.endpoint !== "https://your-resource-name.openai.azure.com/"
    );
  },
};

export default config;

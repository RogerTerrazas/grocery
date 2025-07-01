import Constants from "expo-constants";

export interface EnvironmentConfig {
  API_URL: string;
  ENV: "development" | "staging" | "production";
}

// Get the current environment
const getEnvironment = (): "development" | "staging" | "production" => {
  // Check if we're in development mode
  if (__DEV__) {
    return "development";
  }

  // Check for staging environment (you can customize this logic)
  if (Constants.expoConfig?.extra?.environment === "staging") {
    return "staging";
  }

  // Default to production
  return "production";
};

// Environment-specific configurations
const environments: Record<string, EnvironmentConfig> = {
  development: {
    API_URL: "http://192.168.1.90:3000/api/trpc", // Use HTTP for local development
    ENV: "development",
  },
  staging: {
    API_URL: "https://grocery-backend-omega.vercel.app/api/trpc", // Replace with your staging URL
    ENV: "staging",
  },
  production: {
    API_URL: "https://grocery-backend-omega.vercel.app/api/trpc", // Replace with your production URL
    ENV: "production",
  },
};

// Get current environment config
export const getEnvironmentConfig = (): EnvironmentConfig => {
  const currentEnv = getEnvironment();
  return environments[currentEnv];
};

// Export individual values for convenience
export const { API_URL, ENV } = getEnvironmentConfig();

// Helper function to get API URL dynamically (useful for runtime changes)
export const getApiUrl = (): string => {
  return getEnvironmentConfig().API_URL;
};

// Debug helper to log current environment (remove in production)
export const logEnvironmentInfo = () => {
  const config = getEnvironmentConfig();
  console.log("🌍 Environment Info:", {
    environment: config.ENV,
    apiUrl: config.API_URL,
    isDev: __DEV__,
    expoConfig: Constants.expoConfig?.extra,
  });
};

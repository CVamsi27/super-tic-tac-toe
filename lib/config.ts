const dev = {
  API_URL: process.env.BACKEND_URL_DEV || "http://127.0.0.1:8000",
};

const prod = {
  API_URL: process.env.BACKEND_URL_PROD || "http://127.0.0.1:8000",
};

const config = process.env.NODE_ENV === "production" ? prod : dev;
export default config;

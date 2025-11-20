/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  rewrites: async () => {
    // Determine backend URL based on environment
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ||
      (process.env.NODE_ENV === "development"
        ? "http://127.0.0.1:8000"
        : "https://super-tic-tac-toe-api.buildora.work");

    return [
      {
        source: "/api/py/:path*",
        destination: `${backendUrl}/api/py/:path*`,
      },
      {
        source: "/docs",
        destination: `${backendUrl}/api/py/docs`,
      },
      {
        source: "/openapi.json",
        destination: `${backendUrl}/api/py/openapi.json`,
      },
    ];
  },
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 👇 Ye CORS Headers add karo
  async headers() {
    return [
      {
        // Sabhi API routes ke liye
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" }, // 👈 Star (*) matlab sabko allow karo (Hackathon ke liye best)
          { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
        ]
      }
    ]
  }
};

export default nextConfig;
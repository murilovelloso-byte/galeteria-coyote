import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/cardapio",
        destination: "https://app.cardapioweb.com/papa_leguas_2/offers",
        statusCode: 302,
      },
    ];
  },
};

export default nextConfig;

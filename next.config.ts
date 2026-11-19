import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/cardapio",
        destination: "https://app.cardapioweb.com/papa_leguas_2/offers",
        statusCode: 302,
      },
      {
        // 19/11/2026: cardápio próprio (Escany Food) da Coyote.
        source: "/coyote",
        destination: "https://food.escany.com.br/m/galeteria-coyote",
        statusCode: 302,
      },
    ];
  },
};

export default nextConfig;

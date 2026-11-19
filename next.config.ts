import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        // 19/11/2026 (Murilo): /cardapio passa do Cardápio Web para o cardápio próprio (Escany Food).
        source: "/cardapio",
        destination: "https://food.escany.com.br/m/galeteria-coyote",
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

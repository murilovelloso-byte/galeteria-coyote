"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Image from "next/image";

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const origem = searchParams.get("origem") || "direto";

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{
        background:
          "linear-gradient(135deg, #CC0000 0%, #990000 60%, #660000 100%)",
      }}
    >
      {/* Logo */}
      <div className="flex flex-col items-center mb-6">
        <Image
          src="/logo.jpg"
          alt="Galeteria Coyote"
          width={160}
          height={160}
          className="rounded-full shadow-2xl"
          style={{ objectFit: "cover", objectPosition: "center" }}
          priority
        />
      </div>

      {/* Card */}
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center">
        <div className="mb-2">
          <span className="text-4xl">⭐</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Pesquisa de Satisfação
        </h2>
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          Sua opinião é muito importante para nós.
          <br />
          Leva menos de <strong>30 segundos</strong> para responder.
        </p>

        <button
          onClick={() => router.push(`/pesquisa?origem=${origem}`)}
          className="w-full py-4 rounded-2xl font-bold text-white text-lg shadow-lg active:scale-95 transition-transform cursor-pointer"
          style={{ background: "linear-gradient(135deg, #CC0000, #990000)" }}
        >
          Começar ➔
        </button>

        <p className="text-xs text-gray-400 mt-4">
          6 perguntas rápidas • Anônimo
        </p>
      </div>

      <p className="text-white/50 text-xs mt-8">
        Av. José Carlos Silva, 4359 – Bairro Orlando Dantas
      </p>
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}

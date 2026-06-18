"use client";

import { useRouter } from "next/navigation";

export default function ObrigadoPage() {
  const router = useRouter();

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{
        background:
          "linear-gradient(135deg, #CC0000 0%, #990000 60%, #660000 100%)",
      }}
    >
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center">
        {/* Animação de sucesso */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
          style={{ background: "linear-gradient(135deg, #FFD700, #e6b800)" }}
        >
          <span className="text-4xl">🎉</span>
        </div>

        <h1 className="text-2xl font-black text-gray-900 mb-3">
          Obrigado pela sua avaliação!
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          Sua opinião nos ajuda a melhorar cada vez mais.
          <br />
          Esperamos te ver em breve! 🐺
        </p>

        {/* Identidade */}
        <div
          className="rounded-2xl py-4 px-6 mb-6"
          style={{ background: "#fff5f5", border: "2px solid #fecaca" }}
        >
          <p className="font-black text-sm" style={{ color: "#CC0000" }}>
            GALETERIA COYOTE
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Av. José Carlos Silva, 4359 – Orlando Dantas
          </p>
          <p className="text-xs text-gray-500">(79) 9 9898-1074</p>
        </div>

        <button
          onClick={() => router.push("/")}
          className="w-full py-4 rounded-2xl font-bold text-white text-sm shadow-lg active:scale-95 transition-transform cursor-pointer"
          style={{ background: "linear-gradient(135deg, #CC0000, #990000)" }}
        >
          Finalizar
        </button>
      </div>
    </main>
  );
}

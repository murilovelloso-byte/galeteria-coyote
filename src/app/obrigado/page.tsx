"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

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
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image
            src="/logo-final.png"
            alt="Galeteria Coyote"
            width={160}
            height={160}
          />
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

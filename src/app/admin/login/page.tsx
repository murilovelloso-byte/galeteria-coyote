"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const entrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setCarregando(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senha }),
      });
      if (res.ok) {
        router.push("/admin");
      } else {
        setErro("Senha incorreta. Tente novamente.");
      }
    } catch {
      setErro("Erro de conexão.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background:
          "linear-gradient(135deg, #CC0000 0%, #990000 60%, #660000 100%)",
      }}
    >
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full">
        <div className="text-center mb-6">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg"
            style={{
              background: "linear-gradient(135deg, #FFD700, #e6b800)",
              border: "3px solid #1a1a1a",
            }}
          >
            <span className="text-3xl">🐺</span>
          </div>
          <h1 className="text-xl font-black text-gray-900">Painel Admin</h1>
          <p className="text-sm text-gray-400">Galeteria Coyote</p>
        </div>

        <form onSubmit={entrar} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Senha
            </label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Digite a senha do admin"
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-red-500 transition"
            />
          </div>

          {erro && (
            <p className="text-xs text-red-600 font-semibold text-center">
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={!senha || carregando}
            className="w-full py-3 rounded-2xl font-bold text-white disabled:opacity-40 transition cursor-pointer"
            style={{ background: "linear-gradient(135deg, #CC0000, #990000)" }}
          >
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </main>
  );
}

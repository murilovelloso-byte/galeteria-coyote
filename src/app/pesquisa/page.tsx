"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

const TOTAL_PERGUNTAS = 6;

const LABELS_ESTRELA = ["Muito Ruim", "Ruim", "Regular", "Bom", "Excelente"];

const DESTAQUES = [
  "Sabor da comida",
  "Atendimento",
  "Rapidez",
  "Preço",
  "Quantidade servida",
  "Ambiente",
  "Outro",
];

function EstrelaRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(star)}
            className="text-4xl transition-transform active:scale-90 cursor-pointer"
            style={{
              color:
                star <= (hover || value) ? "#FFD700" : "#e5e7eb",
              textShadow:
                star <= (hover || value)
                  ? "0 0 8px rgba(255,215,0,0.5)"
                  : "none",
            }}
          >
            ★
          </button>
        ))}
      </div>
      {(hover || value) > 0 && (
        <span className="text-sm font-semibold text-gray-600">
          {LABELS_ESTRELA[(hover || value) - 1]}
        </span>
      )}
    </div>
  );
}

function SurveyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const origem = searchParams.get("origem") || "direto";

  const [passo, setPasso] = useState(1);
  const [enviando, setEnviando] = useState(false);

  // Respostas
  const [sabor, setSabor] = useState(0);
  const [atendimento, setAtendimento] = useState(0);
  const [tempo, setTempo] = useState(0);
  const [pedidoConforme, setPedidoConforme] = useState("");
  const [destaques, setDestaques] = useState<string[]>([]);
  const [nps, setNps] = useState<number | null>(null);
  const [comentario, setComentario] = useState("");

  const toggleDestaque = (item: string) => {
    setDestaques((prev) =>
      prev.includes(item) ? prev.filter((d) => d !== item) : [...prev, item]
    );
  };

  const podeProsseguir = () => {
    if (passo === 1) return sabor > 0;
    if (passo === 2) return atendimento > 0;
    if (passo === 3) return tempo > 0;
    if (passo === 4) return pedidoConforme !== "";
    if (passo === 5) return destaques.length > 0;
    if (passo === 6) return nps !== null;
    return false;
  };

  const avancar = () => {
    if (passo < TOTAL_PERGUNTAS) {
      setPasso((p) => p + 1);
    } else {
      enviar();
    }
  };

  const voltar = () => {
    if (passo > 1) setPasso((p) => p - 1);
  };

  const enviar = async () => {
    if (nps === null) return;
    setEnviando(true);
    try {
      await fetch("/api/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notaSabor: sabor,
          notaAtendimento: atendimento,
          notaTempo: tempo,
          pedidoConforme,
          destaques,
          notaNps: nps,
          comentario: comentario.trim() || null,
          origem,
        }),
      });
      router.push("/obrigado");
    } catch {
      setEnviando(false);
    }
  };

  const progresso = (passo / TOTAL_PERGUNTAS) * 100;

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4 py-8"
      style={{
        background:
          "linear-gradient(135deg, #CC0000 0%, #990000 60%, #660000 100%)",
      }}
    >
      {/* Header */}
      <div className="flex flex-col items-center mb-6">
        <Image
          src="/logo-final.png"
          alt="Galeteria Coyote"
          width={160}
          height={160}
          priority
        />
      </div>

      {/* Card */}
      <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full">
        {/* Progresso */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-gray-400">
              Pergunta {passo} de {TOTAL_PERGUNTAS}
            </span>
            <span
              className="text-xs font-bold"
              style={{ color: "#CC0000" }}
            >
              {Math.round(progresso)}%
            </span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progresso}%`,
                background: "linear-gradient(90deg, #CC0000, #FFD700)",
              }}
            />
          </div>
        </div>

        {/* Pergunta 1 — Sabor */}
        {passo === 1 && (
          <div className="slide-in">
            <h2 className="text-lg font-bold text-gray-900 text-center mb-6">
              Como você avalia o <span style={{ color: "#CC0000" }}>sabor</span>{" "}
              dos nossos produtos?
            </h2>
            <EstrelaRating value={sabor} onChange={setSabor} />
          </div>
        )}

        {/* Pergunta 2 — Atendimento */}
        {passo === 2 && (
          <div className="slide-in">
            <h2 className="text-lg font-bold text-gray-900 text-center mb-6">
              Como você avalia nosso{" "}
              <span style={{ color: "#CC0000" }}>atendimento</span>?
            </h2>
            <EstrelaRating value={atendimento} onChange={setAtendimento} />
          </div>
        )}

        {/* Pergunta 3 — Tempo */}
        {passo === 3 && (
          <div className="slide-in">
            <h2 className="text-lg font-bold text-gray-900 text-center mb-6">
              Como você avalia o{" "}
              <span style={{ color: "#CC0000" }}>tempo de entrega</span> ou
              preparo do pedido?
            </h2>
            <EstrelaRating value={tempo} onChange={setTempo} />
          </div>
        )}

        {/* Pergunta 4 — Pedido conforme */}
        {passo === 4 && (
          <div className="slide-in">
            <h2 className="text-lg font-bold text-gray-900 text-center mb-6">
              Seu pedido chegou{" "}
              <span style={{ color: "#CC0000" }}>conforme esperado</span>?
            </h2>
            <div className="flex flex-col gap-3">
              {[
                { value: "sim", label: "Sim, perfeitamente", icon: "✅" },
                {
                  value: "pequenos_problemas",
                  label: "Teve pequenos problemas",
                  icon: "⚠️",
                },
                {
                  value: "problemas_significativos",
                  label: "Teve problemas significativos",
                  icon: "❌",
                },
              ].map((op) => (
                <button
                  key={op.value}
                  type="button"
                  onClick={() => setPedidoConforme(op.value)}
                  className="flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all cursor-pointer"
                  style={{
                    borderColor:
                      pedidoConforme === op.value ? "#CC0000" : "#e5e7eb",
                    background:
                      pedidoConforme === op.value ? "#fff5f5" : "#fff",
                    fontWeight: pedidoConforme === op.value ? 700 : 400,
                  }}
                >
                  <span className="text-xl">{op.icon}</span>
                  <span className="text-sm text-gray-800">{op.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Pergunta 5 — Destaques */}
        {passo === 5 && (
          <div className="slide-in">
            <h2 className="text-lg font-bold text-gray-900 text-center mb-2">
              O que mais chamou sua{" "}
              <span style={{ color: "#CC0000" }}>atenção</span>?
            </h2>
            <p className="text-xs text-gray-400 text-center mb-5">
              Pode escolher mais de uma opção
            </p>
            <div className="flex flex-wrap gap-2">
              {DESTAQUES.map((item) => {
                const selecionado = destaques.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleDestaque(item)}
                    className="px-3 py-2 rounded-xl text-sm border-2 transition-all cursor-pointer font-medium"
                    style={{
                      borderColor: selecionado ? "#CC0000" : "#e5e7eb",
                      background: selecionado ? "#CC0000" : "#fff",
                      color: selecionado ? "#fff" : "#374151",
                    }}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Pergunta 6 — NPS */}
        {passo === 6 && (
          <div className="slide-in">
            <h2 className="text-lg font-bold text-gray-900 text-center mb-2">
              De 0 a 10, qual a probabilidade de você{" "}
              <span style={{ color: "#CC0000" }}>indicar</span> a Galeteria
              Coyote?
            </h2>
            <p className="text-xs text-gray-400 text-center mb-5">
              0 = Jamais indicaria • 10 = Com certeza indicaria
            </p>
            <div className="grid grid-cols-11 gap-1 mb-4">
              {Array.from({ length: 11 }, (_, i) => i).map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setNps(num)}
                  className="aspect-square rounded-lg text-sm font-bold transition-all cursor-pointer"
                  style={{
                    background:
                      nps === num
                        ? num <= 6
                          ? "#CC0000"
                          : num <= 8
                          ? "#f59e0b"
                          : "#16a34a"
                        : "#f3f4f6",
                    color:
                      nps === num
                        ? "#fff"
                        : num <= 6
                        ? "#CC0000"
                        : num <= 8
                        ? "#f59e0b"
                        : "#16a34a",
                    border: `2px solid ${
                      nps === num
                        ? "transparent"
                        : num <= 6
                        ? "#fecaca"
                        : num <= 8
                        ? "#fde68a"
                        : "#bbf7d0"
                    }`,
                  }}
                >
                  {num}
                </button>
              ))}
            </div>

            {/* Campo condicional */}
            {nps !== null && nps <= 7 && (
              <div className="mt-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  O que podemos melhorar?{" "}
                  <span style={{ color: "#CC0000" }}>*</span>
                </label>
                <textarea
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  rows={3}
                  placeholder="Conte-nos o que aconteceu..."
                  className="w-full rounded-xl border-2 border-gray-200 p-3 text-sm resize-none focus:outline-none focus:border-red-500 transition"
                />
              </div>
            )}

            {nps !== null && nps >= 8 && (
              <div className="mt-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  O que você mais gostou?{" "}
                  <span className="text-gray-400 font-normal">(opcional)</span>
                </label>
                <textarea
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  rows={3}
                  placeholder="Adoramos saber o que você gostou!"
                  className="w-full rounded-xl border-2 border-gray-200 p-3 text-sm resize-none focus:outline-none focus:border-green-500 transition"
                />
              </div>
            )}
          </div>
        )}

        {/* Botões de navegação */}
        <div className="flex gap-3 mt-8">
          {passo > 1 && (
            <button
              type="button"
              onClick={voltar}
              className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition cursor-pointer"
            >
              ← Voltar
            </button>
          )}

          <button
            type="button"
            onClick={avancar}
            disabled={
              !podeProsseguir() ||
              enviando ||
              (passo === 6 && nps !== null && nps <= 7 && !comentario.trim())
            }
            className="flex-1 py-3 rounded-2xl font-bold text-white text-sm transition-all disabled:opacity-40 cursor-pointer active:scale-95"
            style={{
              background: podeProsseguir()
                ? "linear-gradient(135deg, #CC0000, #990000)"
                : "#e5e7eb",
              color: podeProsseguir() ? "#fff" : "#9ca3af",
            }}
          >
            {enviando
              ? "Enviando..."
              : passo === TOTAL_PERGUNTAS
              ? "Enviar avaliação ✓"
              : "Próximo →"}
          </button>
        </div>
      </div>
    </main>
  );
}

export default function PesquisaPage() {
  return (
    <Suspense fallback={null}>
      <SurveyContent />
    </Suspense>
  );
}

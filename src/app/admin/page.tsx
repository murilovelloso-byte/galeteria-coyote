"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { classificarNps } from "@/lib/utils";

type Metricas = {
  total: number;
  mediaSabor: number;
  mediaAtendimento: number;
  mediaTempo: number;
  mediaGeral: number;
  nps: number;
  percentualSemProblemas: number;
  distribuicaoNps: { nota: number; total: number }[];
  distribuicaoSabor: { nota: number; total: number }[];
  distribuicaoAtendimento: { nota: number; total: number }[];
  distribuicaoTempo: { nota: number; total: number }[];
  evolucaoNps: { data: string; nps: number; total: number }[];
  destaques: { nome: string; total: number }[];
};

type Resposta = {
  id: number;
  criadoEm: string;
  notaSabor: number;
  notaAtendimento: number;
  notaTempo: number;
  notaNps: number;
  comentario: string | null;
  origem: string | null;
};

type RespostasData = {
  respostas: Resposta[];
  total: number;
  totalPaginas: number;
  pagina: number;
};

const ESTRELAS = ["★", "★★", "★★★", "★★★★", "★★★★★"];

function MetricCard({
  titulo,
  valor,
  subtitulo,
  cor,
  icone,
}: {
  titulo: string;
  valor: string | number;
  subtitulo?: string;
  cor: string;
  icone: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{icone}</span>
        <span
          className="text-xs font-bold px-2 py-1 rounded-full"
          style={{ background: cor + "20", color: cor }}
        >
          {subtitulo}
        </span>
      </div>
      <p className="text-3xl font-black" style={{ color: cor }}>
        {valor}
      </p>
      <p className="text-xs text-gray-500 mt-1 font-medium">{titulo}</p>
    </div>
  );
}

function NpsColorBar({ nota }: { nota: number }) {
  const cor =
    nota <= 6 ? "#CC0000" : nota <= 8 ? "#f59e0b" : "#16a34a";
  return (
    <span
      className="inline-block w-6 h-6 rounded-md text-white text-xs font-bold flex items-center justify-center"
      style={{ background: cor }}
    >
      {nota}
    </span>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [metricas, setMetricas] = useState<Metricas | null>(null);
  const [respostasData, setRespostasData] = useState<RespostasData | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("todos");
  const [pagina, setPagina] = useState(1);

  const buscarMetricas = useCallback(async () => {
    const params = new URLSearchParams();
    if (inicio) params.set("inicio", inicio);
    if (fim) params.set("fim", fim);
    const res = await fetch(`/api/admin/metrics?${params}`);
    if (res.status === 401) {
      router.push("/admin/login");
      return;
    }
    const data = await res.json();
    setMetricas(data);
  }, [inicio, fim, router]);

  const buscarRespostas = useCallback(async () => {
    const params = new URLSearchParams({ pagina: String(pagina) });
    if (inicio) params.set("inicio", inicio);
    if (fim) params.set("fim", fim);
    if (tipoFiltro !== "todos") params.set("tipo", tipoFiltro);
    const res = await fetch(`/api/admin/responses?${params}`);
    if (res.ok) {
      const data = await res.json();
      setRespostasData(data);
    }
  }, [inicio, fim, tipoFiltro, pagina]);

  useEffect(() => {
    setCarregando(true);
    Promise.all([buscarMetricas(), buscarRespostas()]).finally(() =>
      setCarregando(false)
    );
  }, [buscarMetricas, buscarRespostas]);

  const sair = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
  };

  const exportar = (formato: "xlsx" | "csv") => {
    window.open(`/api/admin/export?formato=${formato}`, "_blank");
  };

  if (carregando) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#f8f8f8" }}
      >
        <div className="text-center">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 animate-bounce"
            style={{ background: "linear-gradient(135deg, #FFD700, #e6b800)" }}
          >
            <span className="text-2xl">🐺</span>
          </div>
          <p className="text-gray-500 text-sm">Carregando dados...</p>
        </div>
      </div>
    );
  }

  const npsInfo = metricas ? classificarNps(metricas.nps) : null;

  return (
    <div className="min-h-screen" style={{ background: "#f1f5f9" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-10 shadow-md"
        style={{ background: "linear-gradient(135deg, #CC0000, #990000)" }}
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center shadow"
              style={{ background: "#FFD700", border: "2px solid #1a1a1a" }}
            >
              <span className="text-lg">🐺</span>
            </div>
            <div>
              <p className="text-white font-black text-sm leading-tight">
                GALETERIA COYOTE
              </p>
              <p className="text-white/60 text-xs">Painel Administrativo</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => exportar("xlsx")}
              className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-white border border-white/30 hover:bg-white/10 transition cursor-pointer"
            >
              📥 Excel
            </button>
            <button
              onClick={() => exportar("csv")}
              className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-white border border-white/30 hover:bg-white/10 transition cursor-pointer"
            >
              📄 CSV
            </button>
            <button
              onClick={sair}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-white/80 hover:text-white border border-white/20 hover:border-white/40 transition cursor-pointer"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filtros */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              De
            </label>
            <input
              type="date"
              value={inicio}
              onChange={(e) => setInicio(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-red-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              Até
            </label>
            <input
              type="date"
              value={fim}
              onChange={(e) => setFim(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-red-400"
            />
          </div>
          <button
            onClick={() => { setInicio(""); setFim(""); }}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-500 border border-gray-200 hover:bg-gray-50 cursor-pointer"
          >
            Limpar
          </button>
          <div className="ml-auto flex gap-2 flex-wrap">
            <button onClick={() => exportar("xlsx")} className="sm:hidden flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-green-600 text-white cursor-pointer">📥 Excel</button>
            <button onClick={() => exportar("csv")} className="sm:hidden flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white cursor-pointer">📄 CSV</button>
          </div>
        </div>

        {/* Cards de métricas */}
        {metricas && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
              <MetricCard
                titulo="Nota Média Geral"
                valor={`${metricas.mediaGeral}/5`}
                subtitulo={`${metricas.total} avaliações`}
                cor="#CC0000"
                icone="⭐"
              />
              <MetricCard
                titulo="NPS Geral"
                valor={metricas.nps}
                subtitulo={npsInfo?.label || ""}
                cor={npsInfo?.color || "#CC0000"}
                icone="📊"
              />
              <MetricCard
                titulo="Média de Sabor"
                valor={`${metricas.mediaSabor}/5`}
                subtitulo="estrelas"
                cor="#e65c00"
                icone="🍗"
              />
              <MetricCard
                titulo="Média de Atendimento"
                valor={`${metricas.mediaAtendimento}/5`}
                subtitulo="estrelas"
                cor="#7c3aed"
                icone="🤝"
              />
              <MetricCard
                titulo="Média de Tempo"
                valor={`${metricas.mediaTempo}/5`}
                subtitulo="estrelas"
                cor="#0891b2"
                icone="⏱️"
              />
              <MetricCard
                titulo="Pedidos sem Problema"
                valor={`${metricas.percentualSemProblemas}%`}
                subtitulo="conformidade"
                cor="#16a34a"
                icone="✅"
              />
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              {/* Evolução NPS */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-bold text-gray-800 mb-4 text-sm">
                  📈 Evolução do NPS por período
                </h3>
                {metricas.evolucaoNps.length > 0 ? (
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={metricas.evolucaoNps}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="data"
                        tick={{ fontSize: 10 }}
                        tickFormatter={(v) => v.slice(5)}
                      />
                      <YAxis domain={[-100, 100]} tick={{ fontSize: 10 }} />
                      <Tooltip
                        formatter={(v: unknown) => [`NPS: ${v}`, ""]}
                        labelFormatter={(l) => `Data: ${l}`}
                      />
                      <Line
                        type="monotone"
                        dataKey="nps"
                        stroke="#CC0000"
                        strokeWidth={2}
                        dot={{ fill: "#CC0000", r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-44 flex items-center justify-center text-gray-400 text-sm">
                    Sem dados suficientes
                  </div>
                )}
              </div>

              {/* Distribuição NPS */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-bold text-gray-800 mb-4 text-sm">
                  🎯 Distribuição das notas NPS
                </h3>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={metricas.distribuicaoNps}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="nota" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v: unknown) => [`${v} respostas`, ""]} />
                    <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                      {metricas.distribuicaoNps.map((entry, i) => (
                        <Cell
                          key={i}
                          fill={
                            entry.nota <= 6
                              ? "#CC0000"
                              : entry.nota <= 8
                              ? "#f59e0b"
                              : "#16a34a"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Sabor */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-bold text-gray-800 mb-4 text-sm">
                  🍗 Avaliações de Sabor
                </h3>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={metricas.distribuicaoSabor}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="nota"
                      tickFormatter={(v) => ESTRELAS[v - 1]}
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip
                      formatter={(v: unknown) => [`${v} respostas`, ""]}
                      labelFormatter={(l) => ESTRELAS[Number(l) - 1]}
                    />
                    <Bar dataKey="total" fill="#e65c00" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Atendimento */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-bold text-gray-800 mb-4 text-sm">
                  🤝 Avaliações de Atendimento
                </h3>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={metricas.distribuicaoAtendimento}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="nota"
                      tickFormatter={(v) => ESTRELAS[v - 1]}
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip
                      formatter={(v: unknown) => [`${v} respostas`, ""]}
                      labelFormatter={(l) => ESTRELAS[Number(l) - 1]}
                    />
                    <Bar dataKey="total" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Tempo */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-bold text-gray-800 mb-4 text-sm">
                  ⏱️ Avaliações de Tempo
                </h3>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={metricas.distribuicaoTempo}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="nota"
                      tickFormatter={(v) => ESTRELAS[v - 1]}
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip
                      formatter={(v: unknown) => [`${v} respostas`, ""]}
                      labelFormatter={(l) => ESTRELAS[Number(l) - 1]}
                    />
                    <Bar dataKey="total" fill="#0891b2" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Destaques */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-bold text-gray-800 mb-4 text-sm">
                  💡 O que mais chamou atenção
                </h3>
                {metricas.destaques.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {metricas.destaques.map((d, i) => {
                      const maxTotal = metricas.destaques[0].total;
                      const pct = (d.total / maxTotal) * 100;
                      return (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-xs text-gray-600 w-28 shrink-0 truncate">
                            {d.nome}
                          </span>
                          <div className="flex-1 bg-gray-100 rounded-full h-2">
                            <div
                              className="h-2 rounded-full transition-all"
                              style={{
                                width: `${pct}%`,
                                background:
                                  "linear-gradient(90deg, #CC0000, #FFD700)",
                              }}
                            />
                          </div>
                          <span className="text-xs font-bold text-gray-700 w-6 text-right">
                            {d.total}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-40 flex items-center justify-center text-gray-400 text-sm">
                    Sem dados
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Comentários */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <h3 className="font-bold text-gray-800 text-sm">
              💬 Comentários recebidos
            </h3>
            <div className="flex gap-2 flex-wrap">
              {[
                { label: "Todos", value: "todos" },
                { label: "Promotores (9-10)", value: "promotores" },
                { label: "Neutros (7-8)", value: "neutros" },
                { label: "Detratores (0-6)", value: "detratores" },
              ].map((f) => (
                <button
                  key={f.value}
                  onClick={() => { setTipoFiltro(f.value); setPagina(1); }}
                  className="px-3 py-1 rounded-xl text-xs font-semibold transition cursor-pointer"
                  style={{
                    background: tipoFiltro === f.value ? "#CC0000" : "#f3f4f6",
                    color: tipoFiltro === f.value ? "#fff" : "#374151",
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {respostasData && respostasData.respostas.length > 0 ? (
            <>
              <div className="flex flex-col gap-3">
                {respostasData.respostas.map((r) => (
                  <div
                    key={r.id}
                    className="p-4 rounded-xl border border-gray-100"
                    style={{ background: "#f9fafb" }}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <NpsColorBar nota={r.notaNps} />
                        <span className="text-xs text-gray-400">
                          Sabor {r.notaSabor}★ • Atend. {r.notaAtendimento}★ •
                          Tempo {r.notaTempo}★
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">
                          {new Date(r.criadoEm).toLocaleString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        {r.origem && (
                          <span className="text-xs text-gray-300">
                            via {r.origem}
                          </span>
                        )}
                      </div>
                    </div>
                    {r.comentario && (
                      <p className="text-sm text-gray-700 italic">
                        &ldquo;{r.comentario}&rdquo;
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Paginação */}
              {respostasData.totalPaginas > 1 && (
                <div className="flex items-center justify-center gap-2 mt-5">
                  <button
                    onClick={() => setPagina((p) => Math.max(1, p - 1))}
                    disabled={pagina === 1}
                    className="px-3 py-1 rounded-lg text-sm border disabled:opacity-40 cursor-pointer hover:bg-gray-50"
                  >
                    ←
                  </button>
                  <span className="text-sm text-gray-600">
                    {pagina} / {respostasData.totalPaginas}
                  </span>
                  <button
                    onClick={() =>
                      setPagina((p) =>
                        Math.min(respostasData.totalPaginas, p + 1)
                      )
                    }
                    disabled={pagina === respostasData.totalPaginas}
                    className="px-3 py-1 rounded-lg text-sm border disabled:opacity-40 cursor-pointer hover:bg-gray-50"
                  >
                    →
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="py-12 text-center text-gray-400 text-sm">
              Nenhum comentário encontrado com os filtros selecionados.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

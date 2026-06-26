import { useEffect, useState } from "react";
import LogoSeusiteAlugado from "./LogoSeusiteAlugado";

interface LoadingScreenProps {
  onComplete: () => void;
  duration?: number; // em segundos
}

const PHRASES = [
  "Preparando sua plataforma...",
  "Configurando ambiente multi-tenant...",
  "Carregando sites dos lojistas...",
  "Quase lá! Conectando ao banco...",
  "Tudo pronto. Bem-vindo! 🚀",
];

export default function LoadingScreen({ onComplete, duration = 4 }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [phraseIdx, setPhraseIdx] = useState(0);

  useEffect(() => {
    const totalMs = duration * 1000;
    const steps = 200;
    const intervalMs = totalMs / steps;

    // Progresso suave com easing exponencial
    let step = 0;
    const interval = setInterval(() => {
      step++;
      // Easing: começa rápido, afrouxa no final
      const raw = step / steps;
      const eased = raw < 0.5
        ? 2 * raw * raw
        : 1 - Math.pow(-2 * raw + 2, 2) / 2;
      setProgress(Math.min(Math.round(eased * 100), 100));

      if (step >= steps) clearInterval(interval);
    }, intervalMs);

    // Alternância de frases
    const phraseInterval = setInterval(() => {
      setPhraseIdx((prev) => Math.min(prev + 1, PHRASES.length - 1));
    }, totalMs / PHRASES.length);

    // Conclusão
    const done = setTimeout(() => {
      setProgress(100);
      setPhraseIdx(PHRASES.length - 1);
      setTimeout(() => {
        setIsDone(true);
        setTimeout(() => onComplete(), 600);
      }, 400);
    }, totalMs);

    return () => {
      clearInterval(interval);
      clearInterval(phraseInterval);
      clearTimeout(done);
    };
  }, [duration, onComplete]);

  // Círculo SVG de progresso
  const RADIUS = 64;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const strokeDashoffset = CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-700 ${
        isDone ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{
        background: "linear-gradient(135deg, #0a0a14 0%, #0d1428 50%, #0a0f1e 100%)",
      }}
    >
      {/* Glow de fundo animado */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(29,111,196,0.12) 0%, transparent 70%)",
          animation: "pulseGlow 3s ease-in-out infinite",
        }}
      />

      {/* Partículas flutuantes decorativas */}
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${3 + (i % 3) * 2}px`,
            height: `${3 + (i % 3) * 2}px`,
            backgroundColor: i % 2 === 0 ? "#1d6fc4" : "#facc15",
            opacity: 0.3 + (i % 4) * 0.1,
            left: `${10 + i * 11}%`,
            top: `${15 + (i % 3) * 25}%`,
            animation: `floatUp ${3 + i * 0.4}s ease-in-out infinite`,
            animationDelay: `${i * 0.35}s`,
          }}
        />
      ))}

      {/* Container central */}
      <div className="relative flex flex-col items-center gap-8 z-10">

        {/* Anel de progresso SVG + Logo centralizada */}
        <div className="relative flex items-center justify-center">

          {/* Anel externo — rotação lenta decorativa */}
          <svg
            width={180}
            height={180}
            className="absolute"
            style={{ animation: "spinSlow 8s linear infinite" }}
          >
            <circle
              cx={90}
              cy={90}
              r={82}
              fill="none"
              stroke="rgba(29,111,196,0.12)"
              strokeWidth={2}
              strokeDasharray="6 10"
            />
          </svg>

          {/* Anel de progresso principal */}
          <svg width={180} height={180} style={{ transform: "rotate(-90deg)" }}>
            {/* Track */}
            <circle
              cx={90}
              cy={90}
              r={RADIUS}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={6}
            />
            {/* Fill animado */}
            <circle
              cx={90}
              cy={90}
              r={RADIUS}
              fill="none"
              stroke="url(#progressGrad)"
              strokeWidth={6}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: "stroke-dashoffset 0.15s ease" }}
            />
            <defs>
              <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1d6fc4" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#facc15" />
              </linearGradient>
            </defs>
          </svg>

          {/* Anel interno girando oposto */}
          <svg
            width={130}
            height={130}
            className="absolute"
            style={{ animation: "spinSlow 5s linear infinite reverse" }}
          >
            <circle
              cx={65}
              cy={65}
              r={58}
              fill="none"
              stroke="rgba(250,204,21,0.1)"
              strokeWidth={1.5}
              strokeDasharray="4 14"
            />
          </svg>

          {/* Logo e percentual centralizados */}
          <div className="absolute flex flex-col items-center justify-center gap-1">
            <LogoSeusiteAlugado size="sm" />
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "20px",
                fontWeight: 800,
                background: "linear-gradient(90deg, #3b82f6, #facc15)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                lineHeight: 1,
              }}
            >
              {progress}%
            </span>
          </div>
        </div>

        {/* Frase animada */}
        <div className="text-center min-h-[40px] flex flex-col items-center gap-1 px-6">
          <p
            key={phraseIdx}
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "13px",
              color: "rgba(255,255,255,0.7)",
              animation: "fadeSlideIn 0.4s ease forwards",
              letterSpacing: "0.01em",
            }}
          >
            {PHRASES[phraseIdx]}
          </p>
        </div>

        {/* Barra de progresso linear */}
        <div
          style={{
            width: "220px",
            height: "3px",
            backgroundColor: "rgba(255,255,255,0.07)",
            borderRadius: "99px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: "linear-gradient(90deg, #1d6fc4, #3b82f6, #facc15)",
              borderRadius: "99px",
              transition: "width 0.15s ease",
              boxShadow: "0 0 8px rgba(59,130,246,0.6)",
            }}
          />
        </div>

        {/* Tag de versão */}
        <p
          style={{
            fontFamily: "monospace",
            fontSize: "10px",
            color: "rgba(255,255,255,0.2)",
            letterSpacing: "0.08em",
          }}
        >
          SeuSiteAlugado v2.6 • Multitenancy Ativo
        </p>
      </div>

      <style>{`
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.08); }
        }
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes floatUp {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.3; }
          50%      { transform: translateY(-18px) scale(1.2); opacity: 0.6; }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

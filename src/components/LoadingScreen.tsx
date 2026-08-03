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

  // Círculo SVG de progresso ampliado
  const RADIUS = 88;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const strokeDashoffset = CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE;

  // Texto datilográfico ao redor do círculo
  const FULL_TYPING_TEXT = "SEU SITE EM APENAS 20 SEGUNDOS";
  const totalChars = FULL_TYPING_TEXT.length;
  // Garante que em 0% digite ao menos a primeira letra e em 100% a frase completa
  const typedCount = Math.min(totalChars, Math.max(0, Math.ceil((progress / 100) * totalChars)));
  const currentTypedText = FULL_TYPING_TEXT.slice(0, typedCount);

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
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(29,111,196,0.15) 0%, transparent 70%)",
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
      <div className="relative flex flex-col items-center gap-7 z-10">

        {/* Anel de progresso SVG + Logo centralizada + Texto datilográfico circular */}
        <div className="relative flex items-center justify-center">

          {/* Anel externo decorativo em rotação lenta */}
          <svg
            width={280}
            height={280}
            className="absolute"
            style={{ animation: "spinSlow 12s linear infinite" }}
          >
            <circle
              cx={140}
              cy={140}
              r={130}
              fill="none"
              stroke="rgba(29,111,196,0.15)"
              strokeWidth={1.5}
              strokeDasharray="6 12"
            />
          </svg>

          {/* SVG Principal do Progresso e Texto Datilográfico em Curva */}
          <svg width={280} height={280} className="relative overflow-visible">
            <defs>
              <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1d6fc4" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#facc15" />
              </linearGradient>
              {/* Caminho em arco no topo do círculo (de 9h a 3h por cima) */}
              <path
                id="circleTextPath"
                d="M 22, 140 A 118,118 0 0,1 258,140"
              />
            </defs>

            {/* Texto datilográfico de máquina de escrever circular na parte superior */}
            <text
              fill="#facc15"
              style={{
                fontFamily: "'Courier Prime', 'Courier New', monospace",
                fontSize: "11.5px",
                fontWeight: 700,
                letterSpacing: "0.15em",
                textShadow: "0 0 10px rgba(250,204,21,0.7)",
              }}
            >
              <textPath href="#circleTextPath" startOffset="50%" textAnchor="middle">
                {currentTypedText}
                {progress < 100 && (
                  <tspan style={{ animation: "blinkCursor 0.4s infinite" }}>|</tspan>
                )}
              </textPath>
            </text>

            {/* Círculo de trilho de progresso */}
            <g style={{ transform: "rotate(-90deg)", transformOrigin: "140px 140px" }}>
              <circle
                cx={140}
                cy={140}
                r={RADIUS}
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth={7}
              />
              {/* Círculo preenchido de progresso */}
              <circle
                cx={140}
                cy={140}
                r={RADIUS}
                fill="none"
                stroke="url(#progressGrad)"
                strokeWidth={7}
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={strokeDashoffset}
                style={{ transition: "stroke-dashoffset 0.15s ease" }}
              />
            </g>
          </svg>

          {/* Anel interno girando oposto */}
          <svg
            width={150}
            height={150}
            className="absolute"
            style={{ animation: "spinSlow 6s linear infinite reverse" }}
          >
            <circle
              cx={75}
              cy={75}
              r={68}
              fill="none"
              stroke="rgba(250,204,21,0.12)"
              strokeWidth={1.5}
              strokeDasharray="4 14"
            />
          </svg>

          {/* Logo e percentual centralizados */}
          <div className="absolute flex flex-col items-center justify-center gap-1">
            <LogoSeusiteAlugado size="md" />
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "24px",
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
        <div className="text-center min-h-[36px] flex flex-col items-center justify-center px-6">
          <p
            key={phraseIdx}
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "14px",
              color: "rgba(255,255,255,0.75)",
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
            width: "240px",
            height: "4px",
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
              boxShadow: "0 0 10px rgba(59,130,246,0.7)",
            }}
          />
        </div>

        {/* Tag de versão */}
        <p
          style={{
            fontFamily: "monospace",
            fontSize: "11px",
            color: "rgba(255,255,255,0.25)",
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
        @keyframes blinkCursor {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

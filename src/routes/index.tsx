import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import maycon from "@/assets/maycon.png";
import mayconRuler from "@/assets/maycon-ruler.png";
import madson from "@/assets/madson.png";
import classroom from "@/assets/classroom.jpg";
import { playSmack, playDing, playBuzzer, playCheer, playGameOver, startMusic, stopMusic, isMusicPlaying } from "@/lib/audio";
import { Leaderboard, saveScore } from "@/components/Leaderboard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Escola do Maycon Lindão — O Jogo do Madson" },
      { name: "description", content: "Responda questões de matemática e português. Cuidado: se errar, o MAYCON LINDÃO aparece!" },
    ],
  }),
  component: Index,
});

type Question = {
  subject: "Matemática" | "Português";
  question: string;
  options: string[];
  answer: number;
  hint: string;
};

const ALL_QUESTIONS: Question[] = [
  // Matemática
  { subject: "Matemática", question: "Quanto é 7 + 6?", options: ["12", "13", "14", "15"], answer: 1, hint: "Comece em 7 e conte mais 6 nos dedos." },
  { subject: "Matemática", question: "Quanto é 9 × 4?", options: ["32", "34", "36", "38"], answer: 2, hint: "9 × 4 = (10 × 4) - 4." },
  { subject: "Matemática", question: "Quanto é 25 - 9?", options: ["14", "15", "16", "17"], answer: 2, hint: "25 - 10 = 15, agora some 1." },
  { subject: "Matemática", question: "Metade de 50 é:", options: ["20", "25", "30", "15"], answer: 1, hint: "Divida 50 por 2." },
  { subject: "Matemática", question: "Quanto é 8 × 7?", options: ["54", "56", "58", "52"], answer: 1, hint: "8 × 5 = 40, mais 8 × 2 = 16." },
  { subject: "Matemática", question: "Quanto é 100 - 37?", options: ["61", "62", "63", "64"], answer: 2, hint: "100 - 30 = 70, depois menos 7." },
  { subject: "Matemática", question: "Qual o dobro de 15?", options: ["25", "28", "30", "32"], answer: 2, hint: "15 + 15." },
  { subject: "Matemática", question: "Quanto é 6 × 9?", options: ["52", "53", "54", "56"], answer: 2, hint: "6 × 10 = 60, agora tire 6." },
  { subject: "Matemática", question: "Quanto é 45 ÷ 5?", options: ["8", "9", "10", "7"], answer: 1, hint: "5 × 9 = 45." },
  { subject: "Matemática", question: "Quanto é 12 + 28?", options: ["38", "39", "40", "41"], answer: 2, hint: "12 + 30 = 42, tire 2." },
  { subject: "Matemática", question: "Quanto é 7 × 8?", options: ["54", "55", "56", "58"], answer: 2, hint: "5 × 8 = 40, mais 2 × 8 = 16." },
  { subject: "Matemática", question: "Quanto é 81 - 29?", options: ["50", "51", "52", "53"], answer: 2, hint: "81 - 30 = 51, mais 1." },
  { subject: "Matemática", question: "Quanto é 3 × 11?", options: ["30", "31", "33", "36"], answer: 2, hint: "3 × 10 = 30, mais 3." },
  { subject: "Matemática", question: "Quanto é 64 ÷ 8?", options: ["6", "7", "8", "9"], answer: 2, hint: "8 × 8 = 64." },
  { subject: "Matemática", question: "Quanto é 99 + 1?", options: ["99", "100", "101", "98"], answer: 1, hint: "Quase cem!" },
  { subject: "Matemática", question: "Qual número vem depois do 199?", options: ["198", "200", "201", "190"], answer: 1, hint: "199 + 1." },
  { subject: "Matemática", question: "Quanto é 5 × 5 × 2?", options: ["45", "50", "55", "40"], answer: 1, hint: "5 × 5 = 25, depois × 2." },
  { subject: "Matemática", question: "Quanto é 72 ÷ 9?", options: ["7", "8", "9", "6"], answer: 1, hint: "9 × 8 = 72." },
  { subject: "Matemática", question: "Quanto é 17 + 25?", options: ["40", "41", "42", "43"], answer: 2, hint: "17 + 20 = 37, mais 5." },
  { subject: "Matemática", question: "Quanto é 10 × 10?", options: ["100", "110", "90", "101"], answer: 0, hint: "Cem!" },
  { subject: "Matemática", question: "Quanto é 56 - 18?", options: ["36", "37", "38", "39"], answer: 2, hint: "56 - 20 = 36, mais 2." },
  { subject: "Matemática", question: "Quanto é 4 × 12?", options: ["44", "46", "48", "50"], answer: 2, hint: "4 × 10 = 40, mais 4 × 2 = 8." },
  { subject: "Matemática", question: "Quanto é 90 ÷ 10?", options: ["8", "9", "10", "7"], answer: 1, hint: "10 × 9 = 90." },
  // Português
  { subject: "Português", question: "Qual palavra está escrita CORRETAMENTE?", options: ["Excessão", "Exceção", "Esceção", "Exseção"], answer: 1, hint: "Vem do verbo 'excetuar'. Tem X e Ç." },
  { subject: "Português", question: "Qual é o plural de 'cidadão'?", options: ["Cidadões", "Cidadãos", "Cidadães", "Cidadans"], answer: 1, hint: "Termina em -ãos, como 'irmãos'." },
  { subject: "Português", question: "Qual é um substantivo?", options: ["Correr", "Bonito", "Cachorro", "Rapidamente"], answer: 2, hint: "Substantivo dá nome às coisas, pessoas e animais." },
  { subject: "Português", question: "'Mau' é o oposto de:", options: ["Bem", "Bom", "Feio", "Triste"], answer: 1, hint: "Mau (com U) é adjetivo. Pense em 'mau menino' x 'bom menino'." },
  { subject: "Português", question: "Qual a separação correta de sílabas de 'paralelepípedo'?", options: ["pa-ra-le-le-pí-pe-do", "pa-ra-le-le-pí-pe-do", "pa-ra-le-lé-pi-pe-do", "pa-ra-le-le-pi-pe-do"], answer: 0, hint: "O E fica no final da sílaba antes do P." },
  { subject: "Português", question: "Qual é o plural de 'guarda-chuva'?", options: ["Guardas-chuvas", "Guarda-chuvas", "Guardas-chuva", "Guarda-chuva"], answer: 0, hint: "Só o primeiro substantivo vira plural." },
  { subject: "Português", question: "'Ela ESTUDA todos os dias.' O verbo indica:", options: ["Ação", "Estado", "Passado", "Futuro"], answer: 0, hint: "Estudar é algo que se faz (ação)." },
  { subject: "Português", question: "Complete: 'Ele ____ muito feliz.'", options: ["está", "está", "está", "está"], answer: 0, hint: "'Está' para estados temporários." },
  { subject: "Português", question: "Qual palavra está ERRADA?", options: ["Pneu", "Pneumonia", "Psicologia", "Pnei"], answer: 3, hint: "Não existe 'pnei'." },
  { subject: "Português", question: "'Onteu' está escrito de forma:", options: ["Correta", "Errada"], answer: 1, hint: "O correto é 'ontem'." },
  { subject: "Português", question: "Qual é o antônimo de 'alegre'?", options: ["Feliz", "Contente", "Triste", "Animado"], answer: 2, hint: "Pense no oposto de feliz." },
  { subject: "Português", question: "Qual é o plural de 'cão'?", options: ["Cãos", "Cães", "Cões", "Cans"], answer: 1, hint: "Plural irregular: cães." },
  { subject: "Português", question: "Complete a frase: 'O gato está ____ cadeira.'", options: ["na", "no", "em", "a"], answer: 0, hint: "Contração de em + a = na." },
  { subject: "Português", question: "Qual é o sujeito da frase: 'O cachorro corre no parque.'?", options: ["Corre", "No parque", "O cachorro", "O cachorro corre"], answer: 2, hint: "Quem pratica a ação?" },
  { subject: "Português", question: "Qual palavra é um advérbio?", options: ["Rápido", "Bonito", "Amanhã", "Livro"], answer: 2, hint: "Indica tempo." },
  { subject: "Português", question: "Qual é a forma correta: 'Ela ____ para a escola.'", options: ["foi", "foi", "foi", "foi"], answer: 0, hint: "'Foi' é o pretérito perfeito de 'ir'." },
  { subject: "Português", question: "Qual é o plural de 'mãe'?", options: ["Mães", "Mãos", "Mãis", "Mãe"], answer: 0, hint: "Só muda o final: mães." },
  { subject: "Português", question: "'A menina comprou flores.' Qual é o objeto direto?", options: ["A menina", "Comprou", "Flores", "Menina comprou"], answer: 2, hint: "O que foi comprado?" },
  { subject: "Português", question: "Qual dessas palavras tem acento?", options: ["Cafe", "Café", "Cafe", "Café"], answer: 1, hint: "Acento na sílaba tônica." },
  { subject: "Português", question: "Qual é o plural de 'pão'?", options: ["Pães", "Pãos", "Pães", "Pão"], answer: 0, hint: "Plural irregular: pães." },
  { subject: "Português", question: "Qual frase está na ordem correta?", options: ["Eu gosto de comer maçã", "Gosto eu de comer maçã", "Maçã de comer gosto eu", "Comer maçã eu gosto de"], answer: 0, hint: "Sujeito + verbo + complemento." },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}


function Index() {
  const ROUND_SIZE = 10;
  const [started, setStarted] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [subject, setSubject] = useState<"Ambas" | "Matemática" | "Português">("Ambas");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [showHint, setShowHint] = useState(false);
  const [hintsLeft, setHintsLeft] = useState(3);
  const [feedback, setFeedback] = useState<"none" | "right" | "wrong">("none");
  const [finished, setFinished] = useState(false);

  const q = questions[idx];
  const progress = useMemo(() => (questions.length ? (idx / questions.length) * 100 : 0), [idx, questions.length]);
  const [musicOn, setMusicOn] = useState(true);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [boardKey, setBoardKey] = useState(0);

  useEffect(() => {
    if (finished) {
      const survived = lives > 0;
      if (survived) playCheer(); else playGameOver();
      saveScore(playerName, score, survived).then((id) => {
        setSavedId(id);
        setBoardKey((k) => k + 1);
      });
    }
  }, [finished]);

  useEffect(() => () => stopMusic(), []);



  function toggleMusic() {
    if (isMusicPlaying()) { stopMusic(); setMusicOn(false); }
    else { startMusic(); setMusicOn(true); }
  }

  function start() {
    if (!playerName.trim()) return;
    const pool = subject === "Ambas" ? ALL_QUESTIONS : ALL_QUESTIONS.filter((x) => x.subject === subject);
    setQuestions(shuffle(pool).slice(0, ROUND_SIZE));
    setStarted(true); setIdx(0); setScore(0); setLives(3);
    setShowHint(false); setHintsLeft(3); setFeedback("none"); setFinished(false);
    setSavedId(null);
    startMusic();
  }


  function answer(i: number) {
    if (feedback !== "none") return;
    if (i === q.answer) {
      setFeedback("right");
      setScore((s) => s + 10);
      playDing();
    } else {
      setFeedback("wrong");
      setLives((l) => l - 1);
      playSmack();
      playBuzzer();
    }
    setTimeout(() => {
      setShowHint(false);
      setFeedback("none");
      if (i !== q.answer && lives - 1 <= 0) {
        setFinished(true);
        return;
      }
      if (idx + 1 >= questions.length) {
        setFinished(true);
      } else {
        setIdx((n) => n + 1);
      }
    }, 2200);
  }

  function useHint() {
    if (hintsLeft <= 0 || showHint) return;
    setShowHint(true);
    setHintsLeft((h) => h - 1);
  }

  if (!started) {
    return <StartScreen name={playerName} setName={setPlayerName} subject={subject} setSubject={setSubject} onStart={start} boardKey={boardKey} />;
  }

  if (finished) {
    return <EndScreen name={playerName} score={score} survived={lives > 0} onRestart={start} savedId={savedId} boardKey={boardKey} />;
  }



  return (
    <div
      className="min-h-screen w-full bg-cover bg-center px-4 py-8"
      style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.35)), url(${classroom})` }}
    >
      <div className="mx-auto max-w-3xl">
        {/* HUD */}
        <div className="comic-border mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-secondary px-5 py-3">
          <div className="flex items-center gap-3">
            <img src={madson} alt="Madson" width={48} height={48} className="h-12 w-12 object-contain" />
            <div>
              <div className="font-display text-xl leading-none text-foreground">{playerName.toUpperCase()}</div>
              <div className="text-xs font-semibold text-foreground/70">Jogador</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge label="Pontos" value={String(score)} />
            <Badge label="Vidas" value={"❤".repeat(lives) || "—"} />
            <Badge label="Dicas" value={String(hintsLeft)} />
            <button
              onClick={toggleMusic}
              aria-label={musicOn ? "Desligar música" : "Ligar música"}
              className="comic-border font-display rounded-xl bg-background px-3 py-1 text-xl leading-none text-foreground"
            >
              {musicOn ? "🎵" : "🔇"}
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="comic-border mb-6 h-4 overflow-hidden rounded-full bg-background">
          <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>

        {/* Question card */}
        <div className={`comic-border-lg relative rounded-3xl bg-background p-6 sm:p-8 overflow-hidden ${feedback === "wrong" ? "animate-shake" : ""} ${feedback === "right" ? "animate-right-flash" : ""}`}>
          {feedback === "right" && <CorrectBurst />}
          <span className="font-display absolute -top-4 left-6 rounded-full bg-primary px-4 py-1 text-xl text-primary-foreground">
            {q.subject}
          </span>
          <span className="font-display absolute -top-4 right-6 rounded-full bg-foreground px-4 py-1 text-lg text-background">
            {idx + 1} / {questions.length}
          </span>

          <h2 className="mt-4 text-2xl font-bold text-foreground sm:text-3xl">{q.question}</h2>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {q.options.map((opt, i) => {
              const isRight = feedback !== "none" && i === q.answer;
              const isWrongPick = feedback === "wrong" && i !== q.answer;
              return (
                <button
                  key={i}
                  onClick={() => answer(i)}
                  disabled={feedback !== "none"}
                  className={`comic-border rounded-xl px-4 py-4 text-left text-lg font-bold transition-transform hover:-translate-y-1 hover:translate-x-0 disabled:cursor-not-allowed
                    ${isRight ? "bg-green-400 text-foreground" : isWrongPick ? "bg-muted text-foreground/60" : "bg-secondary text-foreground"}`}
                >
                  <span className="font-display mr-2 text-2xl">{String.fromCharCode(65 + i)}.</span>
                  {opt}
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={useHint}
              disabled={hintsLeft <= 0 || showHint || feedback !== "none"}
              className="comic-border font-display rounded-xl bg-secondary px-5 py-2 text-lg text-foreground transition-transform hover:-translate-y-0.5 disabled:opacity-50"
            >
              💡 Dica ({hintsLeft})
            </button>
            {showHint && (
              <div className="comic-border flex-1 rounded-xl bg-yellow-100 px-4 py-2 text-sm font-semibold text-foreground">
                {q.hint}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Maycon attack overlay */}
      {feedback === "wrong" && <MayconAttack name={playerName} />}
    </div>
  );
}

function Badge({ label, value }: { label: string; value: string }) {
  return (
    <div className="comic-border rounded-xl bg-background px-3 py-1 text-center">
      <div className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">{label}</div>
      <div className="font-display text-xl leading-none text-foreground">{value}</div>
    </div>
  );
}

function CorrectBurst() {
  const confetti = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => ({
        left: Math.random() * 100,
        dx: (Math.random() - 0.5) * 200,
        duration: 1.4 + Math.random() * 1.2,
        delay: Math.random() * 0.15,
        emoji: ["🎉", "⭐", "✨", "🌟", "💫", "🟡", "🟠"][i % 7],
      })),
    [],
  );
  return (
    <>
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-30">
        <div className="animate-score-pop font-display rotate-[-4deg] rounded-2xl border-[6px] border-foreground bg-green-400 px-6 py-2 text-3xl text-foreground shadow-[6px_6px_0_0_#1a1a2e] sm:text-4xl">
          +10! 🎯
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
        {confetti.map((c, i) => (
          <span
            key={i}
            className="animate-confetti absolute -top-4 text-2xl"
            style={{
              left: `${c.left}%`,
              animationDuration: `${c.duration}s`,
              animationDelay: `${c.delay}s`,
              ['--dx' as string]: `${c.dx}px`,
            }}
          >
            {c.emoji}
          </span>
        ))}
      </div>
    </>
  );
}

function MayconAttack({ name }: { name: string }) {
  const stars = [
    { dx: -120, dy: -80, char: "✦" },
    { dx: -60, dy: -140, char: "★" },
    { dx: 40, dy: -120, char: "✶" },
    { dx: 120, dy: -40, char: "✦" },
    { dx: -160, dy: 20, char: "✸" },
    { dx: 80, dy: 80, char: "✺" },
  ];
  return (
    <div className="animate-flash-bg pointer-events-none fixed inset-0 z-50 overflow-hidden backdrop-blur-sm">
      {/* Stage holds Madson + Maycon in a side-by-side fight */}
      <div className="absolute inset-0 flex items-end justify-center gap-2 sm:gap-8">
        {/* Madson on the left, gets smacked */}
        <div className="animate-madson-hit relative flex h-[70vh] items-end">
          <img
            src={madson}
            alt={name}
            className="h-[60vh] w-auto object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.6)]"
          />
          <div className="comic-border font-display absolute -top-2 left-1/2 -translate-x-1/2 rotate-[-6deg] rounded-xl bg-background px-3 py-1 text-base text-foreground sm:text-xl">
            {name.toUpperCase()}
          </div>
        </div>

        {/* Maycon on the right, swings the ruler */}
        <div className="animate-maycon-swing relative flex h-[80vh] items-end">
          <img
            src={mayconRuler}
            alt="MAYCON LINDÃO"
            className="h-[80vh] w-auto object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.7)]"
          />
        </div>
      </div>

      {/* Impact burst at the collision point */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="animate-impact-burst font-display relative rotate-[-8deg] rounded-[40%] border-[8px] border-foreground bg-secondary px-10 py-6 text-5xl text-foreground shadow-[12px_12px_0_0_#1a1a2e] sm:text-7xl">
          POW! 💥
          {stars.map((s, i) => (
            <span
              key={i}
              className="animate-star-float pointer-events-none absolute left-1/2 top-1/2 text-3xl text-primary sm:text-5xl"
              style={{ ['--dx' as string]: `${s.dx}px`, ['--dy' as string]: `${s.dy}px` }}
            >
              {s.char}
            </span>
          ))}
        </div>
      </div>

      {/* Headline */}
      <div className="animate-pow font-display absolute left-1/2 top-[8%] -translate-x-1/2 rotate-[-6deg] rounded-3xl border-[8px] border-foreground bg-primary px-8 py-4 text-4xl text-primary-foreground shadow-[10px_10px_0_0_#1a1a2e] sm:text-6xl">
        TÁPA! ERROU!
      </div>

      {/* Speech bubble */}
      <div className="comic-border font-display absolute bottom-6 left-1/2 max-w-[90vw] -translate-x-1/2 rotate-[-2deg] rounded-2xl bg-background px-5 py-3 text-center text-lg text-foreground sm:text-2xl">
        "ESTUDA, {name.toUpperCase()}!" — MAYCON LINDÃO 📏
      </div>
    </div>
  );
}

type SubjectChoice = "Ambas" | "Matemática" | "Português";
function StartScreen({ name, setName, subject, setSubject, onStart, boardKey }: { name: string; setName: (v: string) => void; subject: SubjectChoice; setSubject: (v: SubjectChoice) => void; onStart: () => void; boardKey: number }) {
  const [pickingSubject, setPickingSubject] = useState(false);
  const handleStartClick = () => {
    if (!name.trim()) return;
    if (!pickingSubject) { setPickingSubject(true); return; }
    onStart();
  };
  return (
    <div
      className="relative min-h-screen w-full overflow-hidden bg-cover bg-center px-4 py-10"
      style={{ backgroundImage: `linear-gradient(rgba(255,235,160,0.85), rgba(255,180,140,0.85)), url(${classroom})` }}
    >
      <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2">
        <div>
          <span className="comic-border font-display inline-block rounded-full bg-primary px-4 py-1 text-lg text-primary-foreground">
            🎒 Quiz da escola
          </span>
          <h1 className="font-display mt-4 text-5xl leading-[0.95] text-foreground sm:text-7xl">
            ESCOLA DO<br />
            <span className="text-primary drop-shadow-[4px_4px_0_#1a1a2e]">MAYCON LINDÃO</span>
          </h1>
          <div className="font-display mt-2 inline-block rounded-lg bg-foreground px-3 py-1 text-lg text-background sm:text-xl">
            CETI COSMA RAMOS
          </div>
          <p className="mt-5 max-w-md text-lg font-semibold text-foreground/80">
            Digite seu nome e sobreviva à aula respondendo questões de
            <b> matemática</b> e <b>português</b>. Errou? O <b>MAYCON LINDÃO</b> vem
            com a <b>régua</b>… 📏
          </p>

          <ul className="mt-5 space-y-2 text-foreground">
            <li className="flex items-center gap-2"><span className="font-display text-2xl text-primary">❤</span> 3 vidas para não rodar de ano</li>
            <li className="flex items-center gap-2"><span className="font-display text-2xl text-primary">💡</span> 3 dicas quando travar</li>
            <li className="flex items-center gap-2"><span className="font-display text-2xl text-primary">🏆</span> 10 pontos por acerto</li>
          </ul>

          <div className="mt-6">
            <label className="font-display block text-2xl text-foreground">SEU NOME:</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 20))}
              onKeyDown={(e) => { if (e.key === "Enter") handleStartClick(); }}
              placeholder="Digite aqui..."
              className="comic-border mt-2 w-full max-w-sm rounded-xl bg-background px-4 py-3 text-2xl font-bold text-foreground outline-none placeholder:text-foreground/40"
            />

            {pickingSubject && (
              <div className="mt-5 animate-score-pop">
                <label className="font-display block text-2xl text-foreground">MATÉRIA:</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(["Ambas", "Matemática", "Português"] as SubjectChoice[]).map((s) => {
                    const active = subject === s;
                    const emoji = s === "Matemática" ? "➗" : s === "Português" ? "📖" : "🎲";
                    return (
                      <button
                        key={s}
                        onClick={() => setSubject(s)}
                        className={`comic-border font-display rounded-xl px-4 py-2 text-lg transition-transform hover:-translate-y-0.5 ${
                          active ? "bg-primary text-primary-foreground" : "bg-background text-foreground"
                        }`}
                      >
                        {emoji} {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              onClick={handleStartClick}
              disabled={!name.trim()}
              className="comic-border-lg font-display mt-5 block rounded-2xl bg-primary px-10 py-4 text-3xl text-primary-foreground transition-transform hover:-translate-y-1 hover:rotate-[-1deg] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pickingSubject ? "COMEÇAR AULA ▶" : "INICIAR ▶"}
            </button>
          </div>
        </div>



        <div className="flex flex-col gap-4">
          <div className="relative flex flex-col items-center justify-center">
            <div className="font-display z-10 mb-2 text-3xl font-bold text-foreground drop-shadow-[3px_3px_0_#1a1a2e] sm:text-4xl">
              MAYCON LINDÃO
            </div>
            <img
              src={mayconRuler}
              alt="MAYCON LINDÃO"
              width={768}
              height={768}
              className="animate-float h-56 w-56 object-contain drop-shadow-[8px_8px_0_rgba(26,26,46,0.4)] sm:h-72 sm:w-72"
            />
            <div className="comic-border font-display absolute right-0 top-10 rotate-[6deg] rounded-2xl bg-background px-4 py-2 text-lg text-foreground">
              "Não erra, hein! 📏😎"
            </div>
          </div>
          <Leaderboard refreshKey={boardKey} />
        </div>
      </div>
    </div>
  );
}

function EndScreen({ name, score, survived, onRestart, savedId, boardKey }: { name: string; score: number; survived: boolean; onRestart: () => void; savedId: string | null; boardKey: number }) {
  return (
    <div className="flex min-h-screen items-start justify-center bg-secondary px-4 py-10">
      <div className="grid w-full max-w-4xl gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-6">
          <div className="comic-border-lg rounded-3xl bg-background p-6 text-center sm:p-8">
            <h2 className="font-display text-4xl text-primary drop-shadow-[3px_3px_0_#1a1a2e] sm:text-5xl">
              {survived ? `${name.toUpperCase()} VENCEU!` : `${name.toUpperCase()} RODOU!`}
            </h2>
            <p className="mt-3 text-lg font-semibold text-foreground/80">
              {survived
                ? "MAYCON LINDÃO está orgulhoso de você. 👏"
                : "MAYCON LINDÃO acabou com a régua… amanhã tem aula de novo. 📏😤"}
            </p>
            <div className="comic-border font-display mx-auto mt-6 inline-block rounded-2xl bg-primary px-8 py-3 text-3xl text-primary-foreground">
              {score} pontos
            </div>
            <div className="mt-6 flex justify-center">
              <img src={survived ? madson : mayconRuler} alt="" width={300} height={300} className="h-44 w-44 object-contain sm:h-56 sm:w-56" />
            </div>
            <button
              onClick={onRestart}
              className="comic-border-lg font-display mt-6 rounded-2xl bg-primary px-8 py-3 text-2xl text-primary-foreground transition-transform hover:-translate-y-1"
            >
              JOGAR DE NOVO ↻
            </button>
          </div>

          <ShareCard name={name} score={score} survived={survived} />
        </div>

        <Leaderboard highlightId={savedId} refreshKey={boardKey} />
      </div>
    </div>
  );
}

function ShareCard({ name, score, survived }: { name: string; score: number; survived: boolean }) {
  const [copied, setCopied] = useState(false);
  const message = survived
    ? `🏆 ${name.toUpperCase()} venceu o MAYCON LINDÃO com ${score} pontos na ESCOLA DO MAYCON LINDÃO! Tenta superar! 📏😎`
    : `📏 O MAYCON LINDÃO rodou ${name.toUpperCase()} (${score} pts) na ESCOLA DO MAYCON LINDÃO. Será que você sobrevive? 😱`;
  const url = typeof window !== "undefined" ? window.location.origin : "";
  const fullText = `${message} ${url}`;

  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({ title: "ESCOLA DO MAYCON LINDÃO", text: message, url });
      } else {
        await navigator.clipboard.writeText(fullText);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }
    } catch {
      // user cancelled or denied
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  }

  return (
    <div className="comic-border-lg rounded-3xl bg-background p-5 sm:p-6">
      <div className="font-display mb-2 text-2xl text-foreground">📣 COMPARTILHAR RESULTADO</div>
      <div className="comic-border rounded-2xl bg-secondary p-4 text-foreground">
        <div className="font-display text-3xl text-primary drop-shadow-[2px_2px_0_#1a1a2e]">
          {survived ? "🏆 SOBREVIVEU!" : "📏 RODOU!"}
        </div>
        <div className="font-display mt-1 text-xl">{name.toUpperCase()}</div>
        <div className="mt-2 text-sm font-semibold text-foreground/80">{message}</div>
        <div className="font-display mt-3 text-3xl text-foreground">{score} pts</div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={share}
          className="comic-border font-display rounded-xl bg-primary px-4 py-2 text-lg text-primary-foreground transition-transform hover:-translate-y-0.5"
        >
          📤 Compartilhar
        </button>
        <button
          onClick={copy}
          className="comic-border font-display rounded-xl bg-background px-4 py-2 text-lg text-foreground transition-transform hover:-translate-y-0.5"
        >
          {copied ? "✅ Copiado!" : "📋 Copiar texto"}
        </button>
      </div>
    </div>
  );
}

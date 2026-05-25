import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Row = {
  id: string;
  player_name: string;
  score: number;
  survived: boolean;
  created_at: string;
};

export function Leaderboard({ highlightId, refreshKey }: { highlightId?: string | null; refreshKey?: number }) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancel = false;
    setRows(null);
    setErr(null);
    supabase
      .from("scores")
      .select("id, player_name, score, survived, created_at")
      .order("score", { ascending: false })
      .order("created_at", { ascending: true })
      .limit(10)
      .then(({ data, error }) => {
        if (cancel) return;
        if (error) setErr(error.message);
        else setRows(data ?? []);
      });
    return () => { cancel = true; };
  }, [refreshKey]);

  return (
    <div className="comic-border-lg rounded-3xl bg-background p-5 sm:p-6">
      <div className="font-display mb-3 flex items-center justify-between">
        <span className="text-2xl text-foreground">🏆 RANKING TOP 10</span>
      </div>

      {err && <p className="text-sm font-semibold text-destructive">Erro: {err}</p>}
      {!rows && !err && <p className="text-sm font-semibold text-foreground/60">Carregando...</p>}
      {rows && rows.length === 0 && (
        <p className="text-sm font-semibold text-foreground/60">Ninguém pontuou ainda. Seja o primeiro!</p>
      )}

      {rows && rows.length > 0 && (
        <ol className="space-y-1.5">
          {rows.map((r, i) => {
            const isMe = r.id === highlightId;
            const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`;
            return (
              <li
                key={r.id}
                className={`comic-border flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm font-bold sm:text-base ${
                  isMe ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                }`}
              >
                <span className="font-display flex min-w-0 items-center gap-2 truncate text-lg">
                  <span className="w-8 shrink-0">{medal}</span>
                  <span className="truncate">{r.player_name.toUpperCase()}</span>
                  {!r.survived && <span title="Rodou" className="text-xs">📏</span>}
                </span>
                <span className="font-display shrink-0 text-xl">{r.score}</span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

export async function saveScore(name: string, score: number, survived: boolean) {
  const { data, error } = await supabase
    .from("scores")
    .insert({ player_name: name.slice(0, 20), score, survived })
    .select("id")
    .single();
  if (error) {
    console.error("[saveScore]", error);
    return null;
  }
  return data?.id ?? null;
}

"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export type PerguntaResposta = {
  pergunta: string;
  resposta: string; // HTML seguro gerado no servidor a partir dos dados reais
  fonte: string;
};

type Msg = { de: "user" | "bot"; html: string };

// Chat do assistente (padrão do mockup): perguntas sugeridas respondidas com os
// dados reais calculados no servidor. Perguntas livres explicam o escopo atual
// (a integração com IA generativa é etapa futura).
export function ChatAssistente({ qa }: { qa: PerguntaResposta[] }) {
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      de: "bot",
      html: "Olá! Respondo com os <b>dados reais do exercício ativo</b> — experimente as perguntas sugeridas abaixo. 👇",
    },
  ]);
  const [texto, setTexto] = useState("");
  const logRef = useRef<HTMLDivElement>(null);

  function push(novas: Msg[]) {
    setMsgs((m) => [...m, ...novas]);
    requestAnimationFrame(() => {
      logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
    });
  }

  function perguntar(i: number) {
    const q = qa[i];
    push([{ de: "user", html: q.pergunta }]);
    setTimeout(
      () =>
        push([
          {
            de: "bot",
            html: `${q.resposta}<span class="src">Fonte: ${q.fonte} · a plataforma organiza e cita; a decisão é da comissão.</span>`,
          },
        ]),
      300
    );
  }

  function perguntaLivre() {
    const v = texto.trim();
    if (!v) return;
    push([{ de: "user", html: v.replace(/</g, "&lt;") }]);
    setTexto("");
    setTimeout(
      () =>
        push([
          {
            de: "bot",
            html:
              "Por enquanto respondo às perguntas sugeridas, calculadas em tempo real sobre o banco. A resposta livre com IA (citando planilhas e normas) é a próxima etapa do assistente.<span class=\"src\">Fonte: escopo atual · Human First</span>",
          },
        ]),
      300
    );
  }

  return (
    <div className="flex h-[520px] flex-col overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
      <div ref={logRef} className="flex flex-1 flex-col gap-3.5 overflow-y-auto p-5">
        {msgs.map((m, i) => (
          <div
            key={i}
            className={
              m.de === "user"
                ? "max-w-[80%] self-end rounded-2xl rounded-br-sm bg-primary px-4 py-3 text-[13.5px] text-primary-foreground"
                : "max-w-[80%] self-start rounded-2xl rounded-bl-sm bg-secondary px-4 py-3 text-[13.5px] [&_.src]:mt-2 [&_.src]:block [&_.src]:border-t [&_.src]:border-border [&_.src]:pt-1.5 [&_.src]:text-[10.5px] [&_.src]:text-muted-foreground"
            }
            dangerouslySetInnerHTML={{ __html: m.html }}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-2 border-t bg-background/60 px-4 py-2.5">
        {qa.map((q, i) => (
          <button
            key={q.pergunta}
            onClick={() => perguntar(i)}
            className="rounded-full border-[1.5px] border-border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground hover:border-brand-cyan hover:text-foreground"
          >
            {q.pergunta}
          </button>
        ))}
      </div>
      <div className="flex gap-2.5 border-t px-4 py-3">
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && perguntaLivre()}
          placeholder="Escreva sua pergunta…"
          className="flex-1 rounded-lg border-[1.5px] border-border px-3.5 py-2 text-sm outline-none focus:border-brand-cyan"
        />
        <Button onClick={perguntaLivre} className="font-bold">
          Enviar
        </Button>
      </div>
    </div>
  );
}

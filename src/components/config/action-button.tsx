"use client";

import { useTransition, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/lib/actions/config";

// Botão que dispara uma server action (com confirmação opcional). Usado para
// exclusões e alternâncias na configuração.
export function ActionButton({
  action,
  children,
  confirmText,
  successMsg = "Feito.",
  variant = "ghost",
  size = "sm",
  title,
}: {
  action: () => Promise<ActionResult>;
  children: ReactNode;
  confirmText?: string;
  successMsg?: string;
  variant?: "ghost" | "outline" | "secondary" | "destructive";
  size?: "sm" | "icon" | "default";
  title?: string;
}) {
  const [pending, start] = useTransition();

  function onClick() {
    if (confirmText && !window.confirm(confirmText)) return;
    start(async () => {
      const res = await action();
      if (res.ok) toast.success(res.message ?? successMsg);
      else toast.error(res.error);
    });
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      disabled={pending}
      onClick={onClick}
      title={title}
    >
      {children}
    </Button>
  );
}

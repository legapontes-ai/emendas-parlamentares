import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="grad-dark flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          {/* Marca Emendas360: três barras cyan→mint */}
          <svg viewBox="0 0 48 48" className="mx-auto mb-2 size-12" aria-hidden>
            <rect width="48" height="48" rx="12" fill="#0A2463" />
            <rect x="9.5" y="27" width="8" height="12" rx="2.2" fill="#00B4D8" />
            <rect x="20" y="19.5" width="8" height="19.5" rx="2.2" fill="#00CFC2" />
            <rect x="30.5" y="10" width="8" height="29" rx="2.2" fill="#00E5A0" />
          </svg>
          <CardTitle className="text-xl font-extrabold tracking-tight">
            Emendas<span className="text-brand-cyan">360</span>
          </CardTitle>
          <CardDescription>
            <span className="eyebrow block">Orçamento impositivo</span>
            Entre com suas credenciais para continuar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}

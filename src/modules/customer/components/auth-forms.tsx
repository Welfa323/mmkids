"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Gift, KeyRound, Mail, ShieldCheck, Smartphone } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../store/auth.store";
import { Button } from "@/shared/ui/button";
import { LogoMark } from "@/shared/ui/logo";
import { toast } from "@/shared/ui/toast";
import { cn } from "@/shared/lib/utils";

function SocialButtons({ onDone }: { onDone: () => void }) {
  const [loading, setLoading] = useState<string | null>(null);
  const go = (p: string) => {
    setLoading(p);
    setTimeout(onDone, 900);
  };
  return (
    <div className="grid grid-cols-2 gap-2">
      <Button variant="outline" type="button" loading={loading === "google"} onClick={() => go("google")}>
        <svg viewBox="0 0 24 24" className="size-[18px]" aria-hidden>
          <path fill="#4285F4" d="M22.6 12.2c0-.8-.1-1.5-.2-2.2H12v4.2h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2.1-1.9 3.3-4.8 3.3-8Z" />
          <path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.7c-1 .7-2.2 1-3.7 1-2.9 0-5.3-1.9-6.2-4.5H2.1v2.8A11 11 0 0 0 12 23Z" />
          <path fill="#FBBC05" d="M5.8 14.1a6.6 6.6 0 0 1 0-4.2V7.1H2.1a11 11 0 0 0 0 9.8l3.7-2.8Z" />
          <path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.6l3.2-3.2A11 11 0 0 0 2.1 7.1l3.7 2.8C6.7 7.3 9.1 5.4 12 5.4Z" />
        </svg>
        Google
      </Button>
      <Button variant="outline" type="button" loading={loading === "apple"} onClick={() => go("apple")}>
        <svg viewBox="0 0 24 24" className="size-[18px]" fill="currentColor" aria-hidden>
          <path d="M16.4 12.6c0-2.6 2.1-3.8 2.2-3.9a4.8 4.8 0 0 0-3.8-2c-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.4-.9a5 5 0 0 0-4.2 2.6c-1.8 3.1-.5 7.7 1.3 10.2.8 1.2 1.8 2.6 3.1 2.6 1.3-.1 1.7-.8 3.3-.8s2 .8 3.3.8c1.4 0 2.3-1.3 3.1-2.5a11 11 0 0 0 1.4-2.9 4.5 4.5 0 0 1-2.4-4.1ZM13.9 4.9a4.4 4.4 0 0 0 1-3.3 4.6 4.6 0 0 0-3 1.6 4.3 4.3 0 0 0-1.1 3.2c1.2.1 2.3-.6 3.1-1.5Z" />
        </svg>
        Apple
      </Button>
    </div>
  );
}

function Shell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="container-page grid min-h-[70vh] items-center gap-10 py-10 lg:grid-cols-2">
      <div className="hidden rounded-[2rem] bg-gradient-to-br from-brand-600 via-brand-800 to-brand-950 p-10 text-white lg:block">
        <LogoMark className="size-14" />
        <h2 className="mt-8 text-3xl font-extrabold leading-tight">Votre espace MMKids, partout avec vous.</h2>
        <ul className="mt-8 space-y-4 text-brand-50">
          {[
            { icon: Gift, t: "Gagnez des points à chaque achat et passez au niveau Or" },
            { icon: Smartphone, t: "Suivez vos livraisons en temps réel sur WhatsApp" },
            { icon: ShieldCheck, t: "Paiements sécurisés, double authentification" },
          ].map((x) => (
            <li key={x.t} className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-white/10">
                <x.icon className="size-5 text-gold-400" />
              </span>
              {x.t}
            </li>
          ))}
        </ul>
      </div>
      <div className="mx-auto w-full max-w-md">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>
        <p className="mt-1 text-sm text-ink-500">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

function PasswordInput({ value, onChange, placeholder = "••••••••" }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input type={show ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)} className="input pr-11" placeholder={placeholder} required minLength={6} />
      <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400" aria-label={show ? "Masquer" : "Afficher"}>
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

export function LoginForm() {
  const router = useRouter();
  const back = useSearchParams().get("retour") ?? "/compte";
  const login = useAuth((s) => s.login);
  const [mode, setMode] = useState<"email" | "phone">("email");
  const [id, setId] = useState("jean.kouassi@exemple.ci");
  const [pwd, setPwd] = useState("demo1234");
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState<string | null>(null);
  const done = () => {
    login(mode === "email" ? id : undefined);
    toast.success("Bienvenue Jean 👋", { description: "Vous êtes connecté." });
    router.push(back);
  };
  return (
    <Shell title="Connexion" subtitle="Ravi de vous revoir ! Compte de démonstration pré-rempli.">
      <SocialButtons onDone={done} />
      <div className="my-5 flex items-center gap-3 text-xs text-ink-400">
        <span className="h-px flex-1 bg-ink-200" /> ou <span className="h-px flex-1 bg-ink-200" />
      </div>
      <div className="mb-4 grid grid-cols-2 rounded-xl bg-ink-100 p-1">
        {(["email", "phone"] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)} className={cn("flex h-9 items-center justify-center gap-1.5 rounded-lg text-sm font-semibold transition", mode === m ? "bg-white shadow-soft" : "text-ink-500")}>
            {m === "email" ? <Mail className="size-4" /> : <Smartphone className="size-4" />} {m === "email" ? "Email" : "Téléphone"}
          </button>
        ))}
      </div>
      {otp === null ? (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setLoading(true);
            setTimeout(() => {
              setLoading(false);
              if (mode === "phone") setOtp("");
              else done();
            }, 700);
          }}
        >
          {mode === "email" ? (
            <>
              <div>
                <label className="label">Email</label>
                <input type="email" className="input" value={id} onChange={(e) => setId(e.target.value)} required />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <label className="label">Mot de passe</label>
                  <Link href="/mot-de-passe-oublie" className="mb-1.5 text-xs font-semibold text-brand-700">
                    Mot de passe oublié ?
                  </Link>
                </div>
                <PasswordInput value={pwd} onChange={setPwd} />
              </div>
            </>
          ) : (
            <div>
              <label className="label">Numéro de téléphone</label>
              <div className="flex">
                <span className="flex h-11 items-center rounded-l-xl border border-r-0 border-ink-200 bg-ink-50 px-3 text-sm font-semibold">+225</span>
                <input className="input rounded-l-none" defaultValue="07 07 12 34 56" inputMode="tel" required />
              </div>
              <p className="mt-1.5 text-xs text-ink-500">Nous vous enverrons un code par SMS.</p>
            </div>
          )}
          <label className="flex items-center gap-2 text-sm text-ink-600">
            <input type="checkbox" defaultChecked className="size-4 accent-brand-600" /> Rester connecté sur cet appareil
          </label>
          <Button size="lg" className="w-full" loading={loading}>
            {mode === "email" ? "Se connecter" : "Recevoir le code"}
          </Button>
        </form>
      ) : (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            done();
          }}
        >
          <p className="text-sm text-ink-600">Saisissez le code à 6 chiffres envoyé au +225 07 07 12 34 56 (démo : n&apos;importe quel code).</p>
          <input value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} className="input h-14 text-center font-mono text-2xl tracking-[0.5em]" inputMode="numeric" autoFocus placeholder="••••••" />
          <Button size="lg" className="w-full" disabled={otp.length < 6}>
            <KeyRound className="size-4" /> Valider
          </Button>
        </form>
      )}
      <p className="mt-6 text-center text-sm text-ink-500">
        Pas encore de compte ?{" "}
        <Link href="/inscription" className="link">
          Créer un compte
        </Link>
      </p>
    </Shell>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const login = useAuth((s) => s.login);
  const [pwd, setPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const strength = [/.{8,}/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((r) => r.test(pwd)).length;
  const done = () => {
    login();
    toast.success("Compte créé 🎉", { description: "Votre code BIENVENUE10 vous attend : −10 % sur la 1re commande." });
    router.push("/compte");
  };
  return (
    <Shell title="Créer un compte" subtitle="−10 % sur votre première commande avec le code BIENVENUE10.">
      <SocialButtons onDone={done} />
      <div className="my-5 flex items-center gap-3 text-xs text-ink-400">
        <span className="h-px flex-1 bg-ink-200" /> ou avec votre email <span className="h-px flex-1 bg-ink-200" />
      </div>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          setLoading(true);
          setTimeout(done, 800);
        }}
      >
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Prénom</label>
            <input className="input" required placeholder="Aya" />
          </div>
          <div>
            <label className="label">Nom</label>
            <input className="input" required placeholder="Koné" />
          </div>
        </div>
        <div>
          <label className="label">Téléphone</label>
          <div className="flex">
            <span className="flex h-11 items-center rounded-l-xl border border-r-0 border-ink-200 bg-ink-50 px-3 text-sm font-semibold">+225</span>
            <input className="input rounded-l-none" inputMode="tel" required placeholder="07 07 00 00 00" />
          </div>
        </div>
        <div>
          <label className="label">Email</label>
          <input type="email" className="input" required placeholder="aya@exemple.ci" />
        </div>
        <div>
          <label className="label">Mot de passe</label>
          <PasswordInput value={pwd} onChange={setPwd} placeholder="8 caractères minimum" />
          <div className="mt-2 grid grid-cols-4 gap-1">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className={cn("h-1 rounded-full", i < strength ? (strength <= 1 ? "bg-red-500" : strength <= 2 ? "bg-amber-500" : "bg-brand-500") : "bg-ink-200")} />
            ))}
          </div>
        </div>
        <label className="flex items-start gap-2 text-sm text-ink-600">
          <input type="checkbox" defaultChecked className="mt-0.5 size-4 accent-brand-600" /> Je souhaite recevoir les bons plans par WhatsApp et SMS
        </label>
        <label className="flex items-start gap-2 text-sm text-ink-600">
          <input type="checkbox" required className="mt-0.5 size-4 accent-brand-600" /> J&apos;accepte les conditions générales et la politique de confidentialité
        </label>
        <Button size="lg" className="w-full" loading={loading}>
          Créer mon compte
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-500">
        Déjà inscrit ?{" "}
        <Link href="/connexion" className="link">
          Se connecter
        </Link>
      </p>
    </Shell>
  );
}

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  return (
    <Shell title="Mot de passe oublié" subtitle="Recevez un lien de réinitialisation par email ou un code par SMS.">
      {sent ? (
        <div className="rounded-2xl bg-brand-50 p-5 text-sm text-brand-900">
          <p className="font-semibold">C&apos;est envoyé ✉️</p>
          <p className="mt-1">Si un compte existe, vous recevrez un lien valable 30 minutes. Pensez à vérifier vos spams.</p>
          <Link href="/connexion" className="mt-3 inline-block font-semibold underline">
            Retour à la connexion
          </Link>
        </div>
      ) : (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
        >
          <div>
            <label className="label">Email ou téléphone</label>
            <input className="input" required placeholder="jean.kouassi@exemple.ci" />
          </div>
          <Button size="lg" className="w-full">
            Envoyer le lien
          </Button>
        </form>
      )}
    </Shell>
  );
}

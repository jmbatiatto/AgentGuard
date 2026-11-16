"use client";

import * as React from "react";
import { useState, useId, useEffect } from "react";
import { Slot } from "@radix-ui/react-slot";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";
import { Eye, EyeOff, Shield, Building2 } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Typewriter ───────────────────────────────────────────────────────────────
export interface TypewriterProps {
  text: string | string[];
  speed?: number;
  cursor?: string;
  loop?: boolean;
  deleteSpeed?: number;
  delay?: number;
  className?: string;
}

export function Typewriter({
  text,
  speed = 100,
  cursor = "|",
  loop = false,
  deleteSpeed = 50,
  delay = 1500,
  className,
}: TypewriterProps) {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [textArrayIndex, setTextArrayIndex] = useState(0);

  const textArray = Array.isArray(text) ? text : [text];
  const currentText = textArray[textArrayIndex] || "";

  useEffect(() => {
    if (!currentText) return;
    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          if (currentIndex < currentText.length) {
            setDisplayText((prev) => prev + currentText[currentIndex]);
            setCurrentIndex((prev) => prev + 1);
          } else if (loop) {
            setTimeout(() => setIsDeleting(true), delay);
          }
        } else {
          if (displayText.length > 0) {
            setDisplayText((prev) => prev.slice(0, -1));
          } else {
            setIsDeleting(false);
            setCurrentIndex(0);
            setTextArrayIndex((prev) => (prev + 1) % textArray.length);
          }
        }
      },
      isDeleting ? deleteSpeed : speed,
    );
    return () => clearTimeout(timeout);
  }, [currentIndex, isDeleting, currentText, loop, speed, deleteSpeed, delay, displayText, text, textArray.length]);

  return (
    <span className={className}>
      {displayText}
      <span className="animate-pulse">{cursor}</span>
    </span>
  );
}

// ─── Label ────────────────────────────────────────────────────────────────────
const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

// ─── Button ───────────────────────────────────────────────────────────────────
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input dark:border-input/50 bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary-foreground/60 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-md px-6",
        icon: "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

// ─── Input ────────────────────────────────────────────────────────────────────
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-lg border border-input dark:border-input/50 bg-background px-3 py-3 text-sm text-foreground shadow-sm shadow-black/5 transition-shadow placeholder:text-muted-foreground/70 focus-visible:bg-accent focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Input.displayName = "Input";

// ─── PasswordInput ────────────────────────────────────────────────────────────
export interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, label, ...props }, ref) => {
    const id = useId();
    const [showPassword, setShowPassword] = useState(false);
    return (
      <div className="grid w-full items-center gap-2">
        {label && <Label htmlFor={id}>{label}</Label>}
        <div className="relative">
          <Input
            id={id}
            type={showPassword ? "text" : "password"}
            className={cn("pe-10", className)}
            ref={ref}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 end-0 flex h-full w-10 items-center justify-center text-muted-foreground/80 transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? (
              <EyeOff className="size-4" aria-hidden="true" />
            ) : (
              <Eye className="size-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";

// ─── Formulario Iniciar Sesión ─────────────────────────────────────────────────
function SignInForm({
  onSuccess,
  onSignIn,
  isLoading,
}: {
  onSuccess?: () => void;
  onSignIn?: (credentials: { email: string; password: string }) => Promise<void>;
  isLoading?: boolean;
}) {
  const [email, setEmail] = useState("admin@acmecorp.com");
  const [password, setPassword] = useState("demo-password");

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (onSignIn) {
      await onSignIn({ email, password });
    } else if (onSuccess) {
      onSuccess();
    }
  };
  return (
    <form onSubmit={handleSignIn} autoComplete="on" className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-3 text-center">
        {/* Logo AgentGuard */}
        <div className="flex items-center justify-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Shield className="h-6 w-6" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight">AgentGuard</span>
        </div>
        <h1 className="text-xl font-bold text-foreground">Iniciar sesión</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Ingresá tu correo electrónico para continuar
        </p>
      </div>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email-signin">Correo electrónico</Label>
          <Input
            id="email-signin"
            name="email"
            type="email"
            placeholder="usuario@empresa.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            disabled={isLoading}
          />
        </div>
        <PasswordInput
          name="password"
          label="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          placeholder="Contraseña"
          disabled={isLoading}
        />
        <Button type="submit" variant="default" className="mt-2 font-semibold" disabled={isLoading}>
          {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
        </Button>
      </div>
    </form>
  );
}

// ─── Formulario Registrarse (Empresa SaaS B2B) ───────────────────────────────
function SignUpForm({
  onSuccess,
  onSignUp,
  onRegisterOrg,
  isLoading,
}: {
  onSuccess?: () => void;
  onSignUp?: (data: { email: string; password: string; name: string; organizationName?: string }) => Promise<void>;
  onRegisterOrg?: (data: {
    organization_name: string;
    admin_name: string;
    email: string;
    password: string;
  }) => Promise<void>;
  isLoading?: boolean;
}) {
  const [adminName, setAdminName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [orgName, setOrgName] = useState("");

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (onRegisterOrg) {
      await onRegisterOrg({
        organization_name: orgName,
        admin_name: adminName,
        email,
        password,
      });
    } else if (onSignUp) {
      await onSignUp({ email, password, name: adminName, organizationName: orgName });
    } else if (onSuccess) {
      onSuccess();
    }
  };
  return (
    <form onSubmit={handleSignUp} autoComplete="on" className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        {/* Logo AgentGuard */}
        <div className="flex items-center justify-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Shield className="h-6 w-6" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight">AgentGuard</span>
        </div>
        <h1 className="text-xl font-bold text-foreground">Registrar Empresa</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Creá tu tenant aislado, usuario administrador y primera API Key operativa
        </p>
      </div>
      <div className="grid gap-3.5">
        <div className="grid gap-1.5">
          <Label htmlFor="org-name">Nombre de la Empresa</Label>
          <div className="relative">
            <Input
              id="org-name"
              name="organization_name"
              type="text"
              placeholder="Acme FinTech S.A."
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="name-signup">Nombre del Administrador</Label>
          <Input
            id="name-signup"
            name="admin_name"
            type="text"
            placeholder="Laura Gómez"
            value={adminName}
            onChange={(e) => setAdminName(e.target.value)}
            required
            autoComplete="name"
            disabled={isLoading}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="email-signup">Correo electrónico corporativo</Label>
          <Input
            id="email-signup"
            name="email"
            type="email"
            placeholder="admin@miempresa.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            disabled={isLoading}
          />
        </div>
        <PasswordInput
          name="password"
          label="Contraseña (mín. 6 caracteres)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          autoComplete="new-password"
          placeholder="••••••••"
          disabled={isLoading}
        />

        <div className="flex items-center gap-2 rounded-lg border border-border/80 bg-accent/30 px-3 py-2 text-xs text-muted-foreground">
          <Building2 className="h-4 w-4 shrink-0 text-primary" />
          <span>Se generará automáticamente una API Key inicial con aislamiento multi-tenant.</span>
        </div>

        <Button type="submit" variant="default" className="mt-1" disabled={isLoading}>
          {isLoading ? "Creando empresa y credenciales..." : "Registrar Empresa y Generar API Key"}
        </Button>
      </div>
    </form>
  );
}

// ─── Contenedor del formulario con pestañas + botón demo ──────────────────────
function AuthFormContainer({
  isSignIn,
  onSelectMode,
  onSuccess,
  onSignIn,
  onSignUp,
  onRegisterOrg,
  isLoading,
}: {
  isSignIn: boolean;
  onSelectMode: (signIn: boolean) => void;
  onSuccess?: () => void;
  onSignIn?: (credentials: { email: string; password: string }) => Promise<void>;
  onSignUp?: (data: { email: string; password: string; name: string; organizationName?: string }) => Promise<void>;
  onRegisterOrg?: (data: {
    organization_name: string;
    admin_name: string;
    email: string;
    password: string;
  }) => Promise<void>;
  isLoading?: boolean;
}) {
  return (
    <div className="mx-auto grid w-[380px] max-w-full gap-4">
      {/* Barra de pestañas Iniciar Sesión / Registrar Empresa */}
      <div
        role="tablist"
        aria-label="Modo de acceso"
        className="grid grid-cols-2 rounded-lg border border-border bg-muted/40 p-1"
      >
        <button
          type="button"
          role="tab"
          aria-selected={isSignIn}
          onClick={() => onSelectMode(true)}
          disabled={isLoading}
          className={cn(
            "rounded-md px-3 py-2 text-sm font-medium transition-all cursor-pointer",
            isSignIn
              ? "bg-background text-foreground shadow-sm border border-border/70"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Iniciar Sesión
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={!isSignIn}
          onClick={() => onSelectMode(false)}
          disabled={isLoading}
          className={cn(
            "rounded-md px-3 py-2 text-sm font-medium transition-all cursor-pointer",
            !isSignIn
              ? "bg-background text-foreground shadow-sm border border-border/70"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Registrar Empresa
        </button>
      </div>

      {isSignIn ? (
        <SignInForm onSuccess={onSuccess} onSignIn={onSignIn} isLoading={isLoading} />
      ) : (
        <SignUpForm
          onSuccess={onSuccess}
          onSignUp={onSignUp}
          onRegisterOrg={onRegisterOrg}
          isLoading={isLoading}
        />
      )}

      <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
        <span className="relative z-10 bg-background px-2 text-muted-foreground">
          O continuar con
        </span>
      </div>

      <Button
        variant="outline"
        type="button"
        disabled={isLoading}
        onClick={async () => {
          if (onSignIn) {
            await onSignIn({ email: 'admin@acmecorp.com', password: 'demo-password' });
          } else if (onSuccess) {
            onSuccess();
          }
        }}
      >
        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Continuar con Google
      </Button>
    </div>
  );
}

// ─── Props tipadas ─────────────────────────────────────────────────────────────
interface AuthContentProps {
  image?: { src: string; alt: string };
  quote?: { text: string; author: string };
}

export interface AuthUIProps {
  signInContent?: AuthContentProps;
  signUpContent?: AuthContentProps;
  onAuthenticated?: () => void;
  onSignIn?: (credentials: { email: string; password: string }) => Promise<void>;
  onSignUp?: (data: { email: string; password: string; name: string; organizationName?: string }) => Promise<void>;
  onRegisterOrg?: (data: {
    organization_name: string;
    admin_name: string;
    email: string;
    password: string;
  }) => Promise<void>;
  onboardingSuccess?: React.ReactNode;
  isLoading?: boolean;
}

// ─── Contenido por defecto ─────────────────────────────────────────────────────
const defaultSignInContent: Required<AuthContentProps> = {
  image: {
    src: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80",
    alt: "Centro de datos con luces azules, representando la infraestructura de seguridad",
  },
  quote: {
    text: "La gobernanza determinista que protege cada acción de tus agentes de IA.",
    author: "AgentGuard — Zero Trust Runtime",
  },
};

const defaultSignUpContent: Required<AuthContentProps> = {
  image: {
    src: "https://images.unsplash.com/photo-1639322537228-f710d846310a?w=1200&auto=format&fit=crop&q=80",
    alt: "Red de nodos conectados representando la arquitectura de seguridad agéntica",
  },
  quote: {
    text: "Un nuevo capítulo de seguridad para tus agentes autónomos comienza aquí.",
    author: "AgentGuard — Motor PDP & Gateway PEP",
  },
};

// ─── Componente Principal AuthUI ───────────────────────────────────────────────
export function AuthUI({
  signInContent = {},
  signUpContent = {},
  onAuthenticated,
  onSignIn,
  onSignUp,
  onRegisterOrg,
  onboardingSuccess,
  isLoading = false,
}: AuthUIProps) {
  const [isSignIn, setIsSignIn] = useState(true);

  const finalSignIn = {
    image: { ...defaultSignInContent.image, ...signInContent.image },
    quote: { ...defaultSignInContent.quote, ...signInContent.quote },
  };
  const finalSignUp = {
    image: { ...defaultSignUpContent.image, ...signUpContent.image },
    quote: { ...defaultSignUpContent.quote, ...signUpContent.quote },
  };

  const currentContent = isSignIn && !onboardingSuccess ? finalSignIn : finalSignUp;

  return (
    <div className="w-full h-full min-h-screen md:h-screen md:overflow-hidden md:grid md:grid-cols-2 bg-background text-foreground">
      <style>{`
        input[type="password"]::-ms-reveal,
        input[type="password"]::-ms-clear { display: none; }
      `}</style>

      {/* Panel izquierdo: formulario o credencial generada */}
      <div className="flex min-h-screen md:min-h-0 md:h-full items-center justify-center p-6 md:p-8 bg-background overflow-y-auto">
        {onboardingSuccess ? (
          onboardingSuccess
        ) : (
          <AuthFormContainer
            isSignIn={isSignIn}
            onSelectMode={setIsSignIn}
            onSuccess={onAuthenticated}
            onSignIn={onSignIn}
            onSignUp={onSignUp}
            onRegisterOrg={onRegisterOrg}
            isLoading={isLoading}
          />
        )}
      </div>

      {/* Panel derecho: imagen + cita */}
      <div
        className="hidden md:block relative bg-cover bg-center transition-all duration-500 ease-in-out"
        style={{ backgroundImage: `url(${currentContent.image.src})` }}
        key={currentContent.image.src}
      >
        {/* Gradiente inferior para legibilidad */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-[120px] bg-gradient-to-t from-black/80 to-transparent" />

        {/* Cita con efecto typewriter */}
        <div className="relative z-10 flex h-full flex-col items-center justify-end p-6 pb-10">
          <blockquote className="space-y-2 text-center text-white max-w-sm">
            <p className="text-lg font-medium leading-relaxed">
              "
              <Typewriter
                key={currentContent.quote.text}
                text={currentContent.quote.text}
                speed={55}
              />
              "
            </p>
            <cite className="block text-sm font-light text-white/70 not-italic">
              — {currentContent.quote.author}
            </cite>
          </blockquote>
        </div>
      </div>
    </div>
  );
}


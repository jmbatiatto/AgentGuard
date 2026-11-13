import { useState } from 'react';
import { Building2, Check, Copy, KeyRound, ShieldCheck, ArrowRight, AlertTriangle } from 'lucide-react';
import { AuthUI } from '../components/ui/auth-ui';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ROLE_LABELS } from '../constants/labels';
import type {
  AuthCredentials,
  RegisterData,
  RegisterOrgData,
  RegisterOrgResponse,
} from '../types/domain';

interface AuthViewProps {
  onAuthenticated?: () => void;
}

export function AuthView({ onAuthenticated }: AuthViewProps) {
  const { login, register, registerOrg } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [orgRegResult, setOrgRegResult] = useState<RegisterOrgResponse | null>(null);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);

  const handleSignIn = async (credentials: AuthCredentials) => {
    setIsLoading(true);
    try {
      await login(credentials);
      toast.success('Sesión iniciada correctamente');
      window.location.hash = '#overview';
      if (onAuthenticated) {
        onAuthenticated();
      }
    } catch (err: any) {
      const msg =
        err?.detail ||
        err?.message ||
        'Credenciales inválidas. Por favor verifique su correo electrónico y contraseña.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      await register(data);
      toast.success('Cuenta registrada con éxito');
      window.location.hash = '#overview';
      if (onAuthenticated) {
        onAuthenticated();
      }
    } catch (err: any) {
      const msg =
        err?.detail ||
        err?.message ||
        'No se pudo completar el registro. Intente nuevamente con otros datos.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterOrg = async (data: RegisterOrgData) => {
    setIsLoading(true);
    try {
      // Mantiene visible AuthView mientras el administrador copia su API Key inicial
      window.location.hash = '#auth';
      const result = await registerOrg(data);
      setOrgRegResult(result);
      toast.success(`Empresa "${result.organization.name}" registrada con éxito`);
    } catch (err: any) {
      const msg =
        err?.detail ||
        err?.message ||
        'No se pudo registrar la empresa. Verificá los datos ingresados.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyApiKey = async () => {
    if (!orgRegResult?.api_key) return;
    try {
      await navigator.clipboard.writeText(orgRegResult.api_key);
      setCopiedKey(true);
      toast.success('API Key copiada al portapapeles');
      setTimeout(() => setCopiedKey(false), 3000);
    } catch {
      toast.error('No se pudo copiar automáticamente. Copiala manualmente desde el recuadro.');
    }
  };

  const handleEnterDashboard = () => {
    setOrgRegResult(null);
    window.location.hash = '#overview';
    if (onAuthenticated) {
      onAuthenticated();
    }
  };

  const onboardingSuccessPanel = orgRegResult ? (
    <div className="mx-auto w-[430px] max-w-full rounded-xl border border-border bg-card p-6 shadow-lg flex flex-col gap-5">
      <div className="flex items-start gap-3">
        <div className="h-11 w-11 shrink-0 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div>
          <span className="inline-block text-[11px] font-semibold uppercase tracking-wider text-emerald-400 mb-0.5">
            Entorno SaaS Provisionado
          </span>
          <h2 className="text-xl font-bold text-foreground">
            ¡Bienvenido a AgentGuard!
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Tu organización y sesión de {ROLE_LABELS[orgRegResult.user.role] || 'Administrador'} ya están activas.
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-background/60 p-3.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <Building2 className="h-4 w-4 text-primary shrink-0" />
          <div className="min-w-0">
            <div className="text-[11px] text-muted-foreground">Organización creada</div>
            <div className="text-sm font-semibold text-foreground truncate">
              {orgRegResult.organization.name}
            </div>
          </div>
        </div>
        <span className="rounded-full bg-indigo-500/15 border border-indigo-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-300 shrink-0">
          {ROLE_LABELS[orgRegResult.user.role] || orgRegResult.user.role}
        </span>
      </div>

      <div className="rounded-lg border border-amber-500/35 bg-amber-500/10 p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
          <KeyRound className="h-4 w-4 shrink-0" />
          <span>Credencial Inicial Generada (Data Plane)</span>
        </div>

        <div className="rounded-md border border-border bg-background px-3 py-2.5 font-mono text-xs text-sky-300 break-all select-all">
          {orgRegResult.api_key}
        </div>

        <button
          type="button"
          onClick={handleCopyApiKey}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-secondary px-3 py-2 text-xs font-semibold text-secondary-foreground hover:bg-secondary/80 transition-colors cursor-pointer"
        >
          {copiedKey ? (
            <>
              <Check className="h-4 w-4 text-emerald-400" />
              <span>¡Copiada al portapapeles!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              <span>Copiar API Key</span>
            </>
          )}
        </button>

        <div className="flex items-start gap-2 text-[11px] text-amber-200/90 leading-relaxed">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-400" />
          <span>
            Por seguridad, esta clave se muestra una única vez. Usala en la cabecera{' '}
            <code className="font-mono text-amber-100">X-AgentGuard-Key</code> para autenticar tus agentes IA en{' '}
            <code className="font-mono text-amber-100">/api/v1/gateway/execute</code>.
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleEnterDashboard}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
      >
        <span>Entrar al Dashboard</span>
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  ) : undefined;

  return (
    <AuthUI
      onAuthenticated={onAuthenticated}
      onSignIn={handleSignIn}
      onSignUp={handleSignUp}
      onRegisterOrg={handleRegisterOrg}
      onboardingSuccess={onboardingSuccessPanel}
      isLoading={isLoading}
      signInContent={{
        quote: {
          text: 'Bienvenido de nuevo. La gobernanza en tiempo real sigue activa.',
          author: 'AgentGuard — Zero Trust PEP / PDP',
        },
      }}
      signUpContent={{
        quote: {
          text: 'Un nuevo capítulo de seguridad para tus agentes autónomos comienza aquí.',
          author: 'AgentGuard — Motor de Políticas Deterministas',
        },
      }}
    />
  );
}

export default AuthView;

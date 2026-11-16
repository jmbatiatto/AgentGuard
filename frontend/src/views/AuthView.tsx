import { useState } from 'react';
import { AuthUI } from '../components/ui/auth-ui';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import type { AuthCredentials, RegisterData } from '../types/domain';

interface AuthViewProps {
  onAuthenticated?: () => void;
}

export function AuthView({ onAuthenticated }: AuthViewProps) {
  const { login, register } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSignIn = async (credentials: AuthCredentials) => {
    setIsLoading(true);
    try {
      await login(credentials);
      toast.success('Sesión iniciada correctamente');
      if (onAuthenticated) {
        onAuthenticated();
      }
      window.location.hash = '#overview';
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
      if (onAuthenticated) {
        onAuthenticated();
      }
      window.location.hash = '#overview';
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

  return (
    <AuthUI
      onAuthenticated={onAuthenticated}
      onSignIn={handleSignIn}
      onSignUp={handleSignUp}
      isLoading={isLoading}
      signInContent={{
        image: {
          src: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=1200&auto=format&fit=crop&q=80',
          alt: 'Escudo perimetral de ciberseguridad y gobernanza runtime para agentes de IA',
        },
        quote: {
          text: 'La gobernanza determinista que protege cada acción de tus agentes de IA en tiempo real.',
          author: 'AgentGuard — Zero Trust PEP / PDP Gateway',
        },
      }}
      signUpContent={{
        image: {
          src: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&auto=format&fit=crop&q=80',
          alt: 'Red neuronal de agentes autónomos protegidos bajo políticas Zero Trust',
        },
        quote: {
          text: 'Despliega agentes autónomos con la tranquilidad de un cortafuegos determinista.',
          author: 'AgentGuard — Motor de Políticas & Aislamiento Multi-tenant',
        },
      }}
    />
  );
}

export default AuthView;

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

import { AuthUI } from '../components/ui/auth-ui';

interface AuthViewProps {
  onAuthenticated: () => void;
}

export function AuthView({ onAuthenticated }: AuthViewProps) {
  return (
    <AuthUI
      onAuthenticated={onAuthenticated}
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


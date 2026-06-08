import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { GoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/router";
import { loginWithGoogle } from "../services/login/loginService";

interface GoogleLoginButtonProps {
  onLoadingChange: (loading: boolean) => void;
}

export function GoogleLoginButton({ onLoadingChange }: GoogleLoginButtonProps) {
  const { toast } = useToast();
  const { setUser } = useAuth();
  const router = useRouter();

  const handleSuccess = async (credentialResponse: { credential?: string }) => {
    const { credential } = credentialResponse;
    if (credential) {
      try {
        onLoadingChange(true); // <-- Ativa o LoadingOverlay no pai imediatamente ao iniciar o processo

        const response = await loginWithGoogle(credential);
        const data = response.data;

        if (data.token) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          localStorage.setItem("local_user", JSON.stringify(data.local_user));
          setUser(data.user);

          toast({
            title: "Login realizado com sucesso!",
            description: "Você está autenticado com Google.",
          });

          // O router.events configurado no pai vai manter o loading visível até a rota mudar de fato
          router.push("/dashboard");
        } else {
          onLoadingChange(false); // Desliga se o token falhar internamente
          toast({
            title: "Erro ao autenticar",
            description: "Token inválido ou expirado. Tente novamente.",
          });
        }
      } catch (error) {
        onLoadingChange(false); // Desliga se a requisição estourar catch
        toast({
          title: "Erro no login",
          description:
            "Não foi possível autenticar com o Google. Tente novamente.",
        });
        console.error("Erro ao autenticar com Google", error);
      }
    }
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={() => {
        onLoadingChange(false);
        toast({
          title: "Erro no login",
          description:
            "Não foi possível autenticar com o Google. Tente novamente.",
        });
      }}
    />
  );
}

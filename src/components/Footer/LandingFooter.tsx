import { IconBrandWhatsapp, IconMail } from "@tabler/icons-react";
import Link from "next/link";

export default function LandingFooter(): JSX.Element {
  return (
    <footer className="mt-16 border-t border-[#f0e6dd] bg-transparent">
      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-10 lg:px-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="space-y-3">
            <div className="text-2xl font-semibold text-[#2f2822]">
              Marriplan
            </div>
            <p className="max-w-sm text-sm text-[#6f6157]">
              Porque o casamento deve ser vivido, não apenas organizado.
            </p>
          </div>

          <nav className="flex flex-col gap-3 md:items-start">
            <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9a8c7f]">
              Navegação
            </h4>
            <div className="mt-2 flex flex-col gap-2">
              <a
                href="#features"
                className="text-sm text-[#4a3f36] transition-colors duration-200 hover:text-[#2f2822]"
                onClick={(e) => {
                  e.preventDefault();
                  document
                    .getElementById("features")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Funcionalidades
              </a>
              <a
                href="#features"
                className="text-sm text-[#4a3f36] transition-colors duration-200 hover:text-[#2f2822]"
                onClick={(e) => {
                  e.preventDefault();
                  document
                    .getElementById("features")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Como funciona
              </a>
              <Link
                href="/plans"
                className="text-sm text-[#4a3f36] transition-colors duration-200 hover:text-[#2f2822]"
              >
                Planos
              </Link>
              <Link
                href="/login"
                className="text-sm text-[#4a3f36] transition-colors duration-200 hover:text-[#2f2822]"
              >
                Entrar
              </Link>
              <Link
                href="/register"
                className="text-sm text-[#4a3f36] transition-colors duration-200 hover:text-[#2f2822]"
              >
                Começar agora
              </Link>
              <Link
                href="/terms"
                className="text-sm text-[#4a3f36] transition-colors duration-200 hover:text-[#2f2822]"
              >
                Termos de Uso
              </Link>
              <Link
                href="/privacy"
                className="text-sm text-[#4a3f36] transition-colors duration-200 hover:text-[#2f2822]"
              >
                Política de Privacidade
              </Link>
            </div>
          </nav>

          <div id="contato" className="flex flex-col items-start gap-4">
            <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9a8c7f]">
              Contato
            </h4>
            <div className="flex flex-col gap-2">
              <a
                href="https://wa.me/5583991773034"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[#4a3f36] transition-all duration-200 hover:bg-[#f7efe5] hover:shadow-sm"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#f2e6d8] text-[#84786b]">
                  <IconBrandWhatsapp size={18} stroke={1.4} />
                </span>
                <span>(83) 9 9177-3034</span>
              </a>

              <a
                href="mailto:app.noreply.ai.model@gmail.com"
                className="inline-flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[#4a3f36] transition-all duration-200 hover:bg-[#f7efe5] hover:shadow-sm"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#f2e6d8] text-[#84786b]">
                  <IconMail size={18} stroke={1.4} />
                </span>
                <span>app.noreply.ai.model@gmail.com</span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-transparent pt-6 text-center text-sm text-[#84786b]">
          © {new Date().getFullYear()} Marriplan. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}

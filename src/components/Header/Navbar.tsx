import { IconMenu2, IconX } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";

export default function Navbar(): JSX.Element {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleNavigate = (href: string) => (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setOpen(false);
    // micro delay for microinteraction
    setTimeout(() => router.push(href), 140);
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4 sm:px-10 lg:px-12">
        <div className="flex items-center gap-4">
          <Link href="/" className="inline-flex items-center gap-3">
            {/* <Image src="/favicon-32x32.png" alt="Marriplan" width={36} height={36} priority /> */}
            <span className="text-lg font-semibold text-[#2f2822]">
              Marriplan
            </span>
          </Link>
        </div>

        <nav className="hidden items-center gap-6 md:flex">
          <a
            href="#features"
            onClick={(e) => {
              e.preventDefault();
              document
                .getElementById("features")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            className="text-sm text-[#4a3f36] transition-colors duration-200 hover:text-[#2f2822]"
          >
            Funcionalidades
          </a>
          <a
            href="#features"
            onClick={(e) => {
              e.preventDefault();
              document
                .getElementById("features")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            className="text-sm text-[#4a3f36] transition-colors duration-200 hover:text-[#2f2822]"
          >
            Como funciona
          </a>
          <a
            href="#contato"
            onClick={(e) => {
              e.preventDefault();
              document
                .getElementById("contato")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            className="text-sm text-[#4a3f36] transition-colors duration-200 hover:text-[#2f2822]"
          >
            Contato
          </a>
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <a
            href="/login"
            onClick={(e) => {
              e.preventDefault();
              handleNavigate("/login")();
            }}
            className="rounded-full px-3 py-2 text-sm font-medium text-[#4a3f36] border border-transparent transition-colors duration-150 hover:border-[#eadfd3] hover:bg-white/70"
          >
            Entrar
          </a>
          <a
            href="/register"
            onClick={(e) => {
              e.preventDefault();
              handleNavigate("/register")();
            }}
            className="rounded-full bg-[#2f2822] px-4 py-2 text-sm font-semibold text-[#fffaf6] shadow-[0_12px_30px_rgba(47,40,34,0.14)] transition-transform duration-150 hover:-translate-y-0.5"
          >
            Começar agora
          </a>
        </div>

        <div className="md:hidden">
          <button
            onClick={() => setOpen((s) => !s)}
            aria-label="Abrir menu"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-white/70 text-[#4a3f36] shadow-sm"
          >
            {open ? <IconX size={18} /> : <IconMenu2 size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-[#f0e6dd] bg-white/60 px-6 py-6 backdrop-blur">
          <div className="flex flex-col gap-4">
            <a
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById("features")
                  ?.scrollIntoView({ behavior: "smooth" });
                setOpen(false);
              }}
              className="text-base text-[#4a3f36]"
            >
              Funcionalidades
            </a>
            <a
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById("features")
                  ?.scrollIntoView({ behavior: "smooth" });
                setOpen(false);
              }}
              className="text-base text-[#4a3f36]"
            >
              Como funciona
            </a>
            <a
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById("contato")
                  ?.scrollIntoView({ behavior: "smooth" });
                setOpen(false);
              }}
              className="text-base text-[#4a3f36]"
            >
              Contato
            </a>
            <a
              onClick={(e) => {
                e.preventDefault();
                setOpen(false);
                handleNavigate("/login")();
              }}
              className="text-base text-[#4a3f36]"
            >
              Entrar
            </a>
            <a
              onClick={(e) => {
                e.preventDefault();
                setOpen(false);
                handleNavigate("/register")();
              }}
              className="mt-2 inline-block rounded-full bg-[#2f2822] px-4 py-3 text-center text-sm font-semibold text-[#fffaf6]"
            >
              Começar agora
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

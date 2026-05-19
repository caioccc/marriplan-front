import LandingFooter from "@/components/Footer/LandingFooter";
import Navbar from "@/components/Header/Navbar";
import {
    IconChecklist,
    IconGauge,
    IconGift,
    IconMailOpened,
    IconTools,
    IconUsers,
} from "@tabler/icons-react";
import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";

export default function HomePage() {
  const router = useRouter();

  const features = [
    {
      title: "Checklist de casamento",
      description:
        "Planeje cada etapa com fluidez, do primeiro detalhe ao grande dia.",
      icon: <IconChecklist size={22} stroke={1.5} />,
    },
    {
      title: "Lista de convidados",
      description:
        "Organize confirmações, acompanhantes e observações sem ruído visual.",
      icon: <IconUsers size={22} stroke={1.5} />,
    },
    {
      title: "Lista de presentes compartilhável",
      description:
        "Compartilhe uma experiência elegante, prática e fácil de acessar.",
      icon: <IconGift size={22} stroke={1.5} />,
    },
    {
      title: "RSVP online",
      description:
        "Receba respostas com clareza e acompanhe tudo em um só lugar.",
      icon: <IconMailOpened size={22} stroke={1.5} />,
    },
    {
      title: "Gestão de fornecedores",
      description:
        "Centralize contatos e decisões para manter tudo sob controle.",
      icon: <IconTools size={22} stroke={1.5} />,
    },
    {
      title: "Dashboard do casal",
      description:
        "Veja o progresso do casamento com uma visão limpa e acolhedora.",
      icon: <IconGauge size={22} stroke={1.5} />,
    },
  ];

  const handleNavigate =
    (href: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      const el = e.currentTarget;
      try {
        // quick tactile animation using Web Animations API
        el.animate(
          [
            { transform: "translateY(0) scale(1)", opacity: 1 },
            { transform: "translateY(-6px) scale(0.995)", opacity: 0.98 },
          ],
          { duration: 180, easing: "cubic-bezier(.2,.9,.3,1)" },
        );
      } catch (err) {
        console.log(
          "Animation not supported, navigating without animation",
          err,
        );
      }
      setTimeout(() => {
        router.push(href);
      }, 180);
    };

  return (
    <>
      <Head>
        <title>Marriplan | Organize seu casamento sem estresse</title>
        <meta
          name="description"
          content="Marriplan é uma experiência premium para organizar checklist, convidados, presentes, RSVP e fornecedores com leveza e elegância."
        />
      </Head>

      <main className="min-h-screen overflow-hidden bg-[linear-gradient(180deg,#faf7f2_0%,#f6f1ea_56%,#ffffff_100%)] text-[#2f2822]">
        <Navbar />
        <section className="relative mx-auto max-w-7xl px-6 pb-20 pt-8 sm:px-10 lg:px-12 lg:pb-28 lg:pt-12">
          <div className="absolute left-0 top-0 h-80 w-80 rounded-full bg-[#f2e6d8]/70 blur-3xl" />
          <div className="absolute right-0 top-32 h-96 w-96 rounded-full bg-[#e8d7cb]/50 blur-3xl" />

          <div className="relative grid items-center gap-14 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10">
            <div className="max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-[#eadfd3] bg-white/75 px-4 py-2 shadow-[0_10px_30px_rgba(70,56,43,0.05)] backdrop-blur">
                <span className="h-2.5 w-2.5 rounded-full bg-[#c8b08a]" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#84786b]">
                  SaaS premium para casamentos
                </span>
              </div>

              <h1 className="max-w-xl font-['Montserrat',sans-serif] text-4xl font-semibold tracking-[-0.04em] text-[#2f2822] sm:text-5xl lg:text-6xl">
                Organize seu casamento sem estresse.
              </h1>

              <p className="mt-6 max-w-xl text-base leading-7 text-[#6f6157] sm:text-lg">
                Checklist, convidados, presentes, RSVP e fornecedores em uma
                experiência elegante e simples.
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <a
                  href="/register"
                  onClick={handleNavigate("/register")}
                  className="inline-flex items-center justify-center rounded-full bg-[#2f2822] px-7 py-4 text-sm font-semibold text-[#fffaf6] shadow-[0_18px_50px_rgba(47,40,34,0.18)] transition-transform duration-200 hover:-translate-y-0.5"
                >
                  Começar agora
                </a>
                <a
                  href="/register"
                  onClick={handleNavigate("/register")}
                  className="inline-flex items-center justify-center rounded-full border border-[#e4d6c7] bg-white/80 px-7 py-4 text-sm font-semibold text-[#4a3f36] shadow-[0_10px_30px_rgba(70,56,43,0.05)] backdrop-blur transition-transform duration-200 hover:-translate-y-0.5"
                >
                  Criar meu casamento
                </a>
              </div>

              <div className="mt-4 text-xs text-[#6f6157]">
                Já possui conta?{" "}
                <a
                  href="/login"
                  onClick={handleNavigate("/login")}
                  className="font-semibold text-[#2f2822]"
                >
                  Entrar
                </a>
              </div>

              <div className="mt-10 flex flex-wrap gap-6 text-xs text-[#7d7166]">
                <div>
                  <div className="text-xl font-semibold text-[#2f2822]">
                    + leveza
                  </div>
                  <div>Menos planilhas</div>
                </div>
                <div className="h-12 w-px bg-[#eadfd3]" />
                <div>
                  <div className="text-xl font-semibold text-[#2f2822]">
                    + clareza
                  </div>
                  <div>Tudo em um só lugar</div>
                </div>
                <div className="h-12 w-px bg-[#eadfd3]" />
                <div>
                  <div className="text-xl font-semibold text-[#2f2822]">
                    + emoção
                  </div>
                  <div>Mais momentos especiais</div>
                </div>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[760px]">
              <div className="absolute inset-x-10 top-8 h-72 rounded-full bg-[#f2e6d8]/60 blur-3xl" />
              <div className="relative flex items-center justify-center">
                <img
                  src="/mockup.png"
                  alt="Mockup do Marriplan"
                  className="h-auto w-full max-w-[760px] object-contain lg:scale-110 lg:origin-top"
                />
              </div>
            </div>
          </div>
        </section>

        <section
          id="features"
          className="mx-auto max-w-7xl px-6 py-10 sm:px-10 lg:px-12 lg:py-16"
        >
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#9a8c7f]">
              Funcionalidades principais
            </p>
            <h2 className="mt-4 font-['Montserrat',sans-serif] text-3xl font-semibold tracking-[-0.03em] text-[#2f2822] sm:text-4xl">
              Tudo o que importa, sem excesso.
            </h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="rounded-[1.7rem] border border-[#eadfd3] bg-white/80 p-6 shadow-[0_16px_40px_rgba(70,56,43,0.06)] backdrop-blur"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#eadfd3] bg-[linear-gradient(180deg,#fffaf6_0%,#f6ebdf_100%)] text-lg font-semibold text-[#7d7166]">
                  {feature.icon}
                </div>
                <h3 className="mt-5 font-['Montserrat',sans-serif] text-xl font-semibold text-[#2f2822]">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[#6f6157]">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-10 sm:px-10 lg:px-12 lg:py-16">
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <article className="rounded-[2rem] border border-[#eadfd3] bg-[linear-gradient(180deg,#fffaf6_0%,#f7efe5_100%)] p-8 shadow-[0_18px_50px_rgba(70,56,43,0.06)] lg:p-10">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#9a8c7f]">
                Um momento leve
              </p>
              <h2 className="mt-4 font-['Montserrat',sans-serif] text-3xl font-semibold tracking-[-0.03em] text-[#2f2822] sm:text-4xl">
                Menos planilhas. Mais momentos especiais.
              </h2>
              <p className="mt-5 max-w-xl text-base leading-8 text-[#6f6157]">
                Marriplan reduz a ansiedade da organização e transforma o
                processo em uma experiência leve, prática e bonita de
                acompanhar.
              </p>
            </article>

            <article className="rounded-[2rem] border border-[#eadfd3] bg-white/80 p-8 shadow-[0_18px_50px_rgba(70,56,43,0.06)] lg:p-10">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#9a8c7f]">
                Experiência
              </p>
              <h2 className="mt-4 font-['Montserrat',sans-serif] text-3xl font-semibold tracking-[-0.03em] text-[#2f2822] sm:text-4xl">
                O casamento cabe na palma da mão.
              </h2>
              <p className="mt-5 max-w-xl text-base leading-8 text-[#6f6157]">
                A navegação é simples, responsiva e feita para decisões rápidas
                no celular, com a mesma sensação premium em qualquer tela.
              </p>
              <div className="mt-6 flex items-center gap-3 rounded-[1.5rem] border border-[#eadfd3] bg-[#fffaf6] p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f2e6d8] text-[#84786b]">
                  ⌁
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#2f2822]">
                    Rápido e intuitivo
                  </div>
                  <div className="text-sm text-[#7d7166]">
                    Tudo pronto para acompanhar o casal em movimento.
                  </div>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section
          id="cta"
          className="mx-auto max-w-7xl px-6 pb-20 pt-10 sm:px-10 lg:px-12 lg:pb-28 lg:pt-16"
        >
          <div className="relative overflow-hidden rounded-[2.4rem] border border-[#eadfd3] bg-[linear-gradient(135deg,#2f2822_0%,#4b3f36_58%,#6a584b_100%)] px-8 py-14 shadow-[0_28px_80px_rgba(47,40,34,0.22)] sm:px-12 lg:px-16 lg:py-16">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(242,230,216,0.24),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(200,176,138,0.16),transparent_28%)]" />
            <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[#f2e6d8]/80">
                  Pronto para começar
                </p>
                <h2 className="mt-4 max-w-2xl font-['Montserrat',sans-serif] text-3xl font-semibold tracking-[-0.03em] text-[#fffaf6] sm:text-4xl lg:text-5xl">
                  Seu casamento merece uma experiência tão bonita quanto o
                  momento.
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-8 text-[#f6efe7]">
                  Comece agora com uma landing que comunica sofisticação,
                  cuidado e tranquilidade desde o primeiro olhar.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
                <a
                  href="/register"
                  onClick={handleNavigate("/register")}
                  className="inline-flex items-center justify-center rounded-full bg-[#f2e6d8] px-7 py-4 text-sm font-semibold text-[#2f2822] shadow-[0_18px_40px_rgba(0,0,0,0.18)] transition-transform duration-200 hover:-translate-y-0.5"
                >
                  Começar agora
                </a>
                <a
                  href="/register"
                  onClick={handleNavigate("/register")}
                  className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/8 px-7 py-4 text-sm font-semibold text-[#fffaf6] backdrop-blur transition-transform duration-200 hover:-translate-y-0.5"
                >
                  Criar meu casamento
                </a>
              </div>
            </div>
          </div>
        </section>
        <LandingFooter />
      </main>
    </>
  );
}

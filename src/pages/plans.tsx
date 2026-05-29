import LandingFooter from "@/components/Footer/LandingFooter";
import Navbar from "@/components/Header/Navbar";
import { PlanCard } from "@/components/billing/PlanCard";
import { PLAN_DEFINITIONS } from "@/constants/plans";
import { Badge, Container, SimpleGrid, Text, Title } from "@mantine/core";
import Head from "next/head";
import { useRouter } from "next/router";

export default function PlansPage() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Marriplan | Planos</title>
        <meta
          name="description"
          content="Compare os planos Free e Premium do Marriplan e escolha a melhor experiência para organizar seu casamento."
        />
      </Head>

      <main className="min-h-screen overflow-hidden bg-[linear-gradient(180deg,#faf7f2_0%,#f6f1ea_56%,#ffffff_100%)] text-[#2f2822]">
        <Navbar />

        <section className="relative mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:px-12 lg:py-20">
          <div className="absolute left-0 top-0 h-80 w-80 rounded-full bg-[#f2e6d8]/60 blur-3xl" />
          <div className="absolute right-0 top-24 h-96 w-96 rounded-full bg-[#e8d7cb]/50 blur-3xl" />

          <div className="relative mx-auto max-w-3xl text-center">
            <Badge
              size="lg"
              radius="xl"
              variant="light"
              style={{
                background: "rgba(181, 139, 122, 0.16)",
                color: "var(--marriplan-rose)",
              }}
            >
              Planos
            </Badge>
            <Title
              order={1}
              mt="md"
              className="font-['Montserrat',sans-serif]"
              style={{
                fontSize: "clamp(2.5rem, 4vw, 4.5rem)",
                lineHeight: 1.02,
              }}
            >
              Escolha o plano ideal para organizar o seu casamento.
            </Title>
            <Text mt="lg" size="lg" c="dimmed" style={{ lineHeight: 1.8 }}>
              Comece no Free com o essencial ou libere tudo com Premium,
              incluindo exportações, IA e limites expandidos.
            </Text>
          </div>

          <Container size="xl" px={0} mt={48}>
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
              {PLAN_DEFINITIONS.map((plan) => (
                <PlanCard
                  key={plan.slug}
                  plan={plan}
                  actionHref={
                    plan.slug === "premium" ? "/checkout" : "/dashboard"
                  }
                  actionLabel={
                    plan.slug === "premium" ? "Assinar Premium" : "Plano atual"
                  }
                  active={plan.slug === "free"}
                  onActionClick={
                    plan.slug === "free"
                      ? () => {
                          void router.push("/dashboard");
                        }
                      : undefined
                  }
                />
              ))}
            </SimpleGrid>
          </Container>
        </section>

        <LandingFooter />
      </main>
    </>
  );
}

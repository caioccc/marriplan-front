import {
    formatCurrency
} from "@/lib/simulationResultUtils";
import { SimulationResult } from "@/lib/simulationUtils";
import api from "@/services/api";
import { BarChart, DonutChart } from "@mantine/charts";
import {
    Alert,
    Badge,
    Box,
    Button,
    Card,
    Center,
    Container,
    Divider,
    Grid,
    Group,
    Progress,
    RingProgress,
    SimpleGrid,
    Skeleton,
    Stack,
    Text,
    ThemeIcon,
    Title
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
    IconCalendar,
    IconCheck,
    IconChecklist,
    IconCopy,
    IconCrown,
    IconExternalLink,
    IconLamp,
    IconMapPin,
    IconMessageReport,
    IconShare,
    IconSparkles,
    IconTrendingUp,
    IconUsers
} from "@tabler/icons-react";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

// Paleta Estrita de Cores do Design System Marriplan
const PALETTE = {
  champagne: "#F7F1E8",
  roseGold: "#E6B8A2",
  beige: "#EFE6DA",
  warmGray: "#6F6660",
  ink: "#2D2622",
  line: "#EEE3D8",
  softWhite: "#FFFCF8",
  marriplanRose: "var(--marriplan-rose)",
};

// Variantes de animação para o Framer Motion (Scroll Reveal)
const fadeInUpVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const PublicWeddingSimulationPage: React.FC = () => {
  const router = useRouter();
  const { token } = router.query;
  const isMobile = useMediaQuery("(max-width: 768px)");

  const [loading, setLoading] = useState(true);
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [copied, setCopied] = useState(false);

 // 1. Chamada de API pública (Não autenticada)
useEffect(() => {
  if (!token) return;

  async function fetchPublicSimulation() {
    try {
      await api.get(`api/simulations/${token}/`).then((res) => {
          setSimulation(res.data.simulation);

          // Efeito refinado de celebração ao carregar com sucesso
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.65 },
            colors: [PALETTE.roseGold, "#D4AF37", PALETTE.warmGray],
          });
      });
    } catch (err) {
      setSimulation(null); // Aqui sim ele deve zerar em caso de erro!
      console.error("Erro ao buscar simulação pública:", err);
    } finally {
      // REMOVIDO: setSimulation(null); <-- Isso estava apagando os dados de sucesso!
      setLoading(false);
    }
  }

  fetchPublicSimulation();
}, [token]);

  // Handlers de Compartilhamento Unificado
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    notifications.show({
      color: "teal",
      title: "Link Copiado!",
      message:
        "Pronto para enviar para seus familiares, padrinhos ou fornecedores.",
    });
    setTimeout(() => setCopied(false), 3000);
  };

  const handleShareApi = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Simulação de Custos de Casamento | Marriplan",
          text: `Confira a estimativa orçamentária detalhada para o planejamento deste grande dia!`,
          url: currentUrl,
        });
      } catch (err) {
        // Silenciar cancelamento
      }
    } else {
      handleCopyLink();
    }
  };

  // Renderização do Estado de Loading com Skeletons estruturados
  if (loading) {
    return (
      <Container size="lg" py={50}>
        <Stack gap="xl">
          <Skeleton height={60} radius="xl" width="50%" mx="auto" />
          <Skeleton height={280} radius="2xl" />
          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
            <Skeleton height={150} radius="xl" />
            <Skeleton height={150} radius="xl" />
            <Skeleton height={150} radius="xl" />
          </SimpleGrid>
        </Stack>
      </Container>
    );
  }

  // Renderização do Estado de Erro / Token Inválido ou Removido (Empty State)
  if (!simulation) {
    return (
      <Container size="sm" py={100}>
        <Head>
          <title>Simulação não encontrada | Marriplan</title>
        </Head>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUpVariants}
        >
          <Card
            radius="2xl"
            p="xl"
            ta="center"
            style={{
              border: `1px solid ${PALETTE.line}`,
              background: PALETTE.softWhite,
            }}
          >
            <ThemeIcon
              variant="light"
              color="var(--marriplan-rose)"
              size={64}
              radius="xl"
              mx="auto"
            >
              <IconMessageReport size={34} />
            </ThemeIcon>
            <Title order={2} c={PALETTE.ink} mt="md">
              Simulação não encontrada
            </Title>
            <Text
              c={PALETTE.warmGray}
              size="sm"
              mt="sm"
              max-width={420}
              mx="auto"
            >
              Esta simulação pode ter sido removida pelos noivos ou o link
              informado não é mais válido no nosso sistema.
            </Text>
            <Button
              color="var(--marriplan-rose)"
              radius="xl"
              size="md"
              mt="xl"
              onClick={() => router.push("/")}
              style={{ fontWeight: 600 }}
            >
              Conhecer o Marriplan
            </Button>
          </Card>
        </motion.div>
      </Container>
    );
  }

  const { inputs, scenarios, breakdown, monthlyGoalStatus, recommendations } =
    simulation;

  // Processamento de dados para gráficos baseados nos componentes do Mantine
  const chartColors = ["#E6B8A2", "#C9ADA7", "#9A8C98", "#4A4E69", "#22223B"];
  const donutChartData = breakdown.map((item, idx) => ({
    name: item.category,
    value: item.estimatedCost,
    color: chartColors[idx % chartColors.length],
  }));

  const barChartData = [
    {
      cenario: "Econômico",
      valor: scenarios.alternativeEconomical.totalEstimated,
    },
    { cenario: "Recomendado", valor: scenarios.target.totalEstimated },
    { cenario: "Sonhos", valor: scenarios.alternativePremium.totalEstimated },
  ];

  return (
    <Box style={{ background: "#FFFDFB", minHeight: "100vh" }}>
      {/* INJEÇÃO DE METADADOS DINÂMICOS PARA COMPARTILHAMENTO EM REDES SOCIAIS (SEO/OG) */}
      <Head>
        <title>Simulação de Custos de Casamento | Marriplan</title>
        <meta
          name="description"
          content={`Veja a estimativa de ${formatCurrency(
            scenarios.target.totalEstimated,
          )} criada para este casamento de ${inputs.guestsCount} convidados.`}
        />
        <meta
          property="og:title"
          content="Simulação Orçamentária de Casamento | Marriplan"
        />
        <meta
          property="og:description"
          content="Acesse os cenários de investimento, custos de buffet, decoração e infraestrutura calculados de forma inteligente."
        />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/images/og-simulation-share.jpg" />
      </Head>

      {/* HEADER DE MARCA FLUTUANTE (VISITANTE) */}
      <Box
        py="md"
        style={{
          borderBottom: `1px solid ${PALETTE.line}`,
          background: "#fff",
        }}
      >
        <Container size="lg">
          <Group justify="space-between">
            <Text
              fw={800}
              size="lg"
              c={PALETTE.ink}
              style={{ letterSpacing: -0.5, cursor: "pointer" }}
              onClick={() => router.push("/")}
            >
              marriplan<span style={{ color: PALETTE.roseGold }}>.</span>
            </Text>
            <Badge color="var(--marriplan-rose)" variant="light" radius="sm">
              Acesso Público
            </Badge>
          </Group>
        </Container>
      </Box>

      <Container size="lg" py="xl">
        {/* HERO LANDING PREMIUM */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUpVariants}
        >
          <Card
            radius="2xl"
            p={{ base: "xl", md: 60 }}
            ta="center"
            style={{
              background: `linear-gradient(135deg, ${PALETTE.champagne} 0%, ${PALETTE.softWhite} 100%)`,
              border: `1px solid ${PALETTE.line}`,
            }}
          >
            <Group justify="center" gap="xs" mb="md">
              <Badge color="var(--marriplan-rose)" radius="sm">
                Simulação Personalizada
              </Badge>
              <Badge color="gray" variant="light" radius="sm">
                Compartilhável
              </Badge>
              <Badge color="teal" radius="sm">
                Gerada pelo Marriplan
              </Badge>
            </Group>

            <Title
              order={1}
              c={PALETTE.ink}
              style={{ fontSize: isMobile ? 28 : 40, fontWeight: 600 }}
            >
              Estimativa de Investimento para este Casamento
            </Title>

            <Title
              order={2}
              mt="md"
              c={PALETTE.ink}
              style={{
                fontSize: isMobile ? 46 : 68,
                fontWeight: 800,
                fontFamily: "serif",
              }}
            >
              {formatCurrency(scenarios.target.totalEstimated)}
            </Title>

            <Text
              c={PALETTE.warmGray}
              size="sm"
              max-width={580}
              mx="auto"
              mt="sm"
              lh={1.5}
            >
              Estimativa personalizada gerada com base nas preferências,
              premissas operacionais e perfil geográfico deste casamento.
            </Text>
          </Card>
        </motion.div>

        {/* RESUMO DE PREMISSAS */}
        <SimpleGrid cols={{ base: 2, sm: 5 }} mt="md" spacing="sm">
          {[
            {
              icon: IconUsers,
              title: "Convidados",
              value: `${inputs.guestsCount} presentes`,
            },
            {
              icon: IconCalendar,
              title: "Data Pretendida",
              value: inputs.weddingDate
                ? new Date(inputs.weddingDate + "T00:00:00").toLocaleDateString(
                    "pt-BR",
                  )
                : "A definir",
            },
            {
              icon: IconMapPin,
              title: "Localização",
              value: `${inputs.city} - ${inputs.state}`,
            },
            {
              icon: IconSparkles,
              title: "Estilo Geral",
              value: inputs.style || "Não informado",
            },
            {
              icon: IconCrown,
              title: "Padrão",
              value: inputs.eventLevel.toUpperCase(),
            },
          ].map((item, idx) => (
            <Card
              key={idx}
              radius="xl"
              p="md"
              style={{
                border: `1px solid ${PALETTE.line}`,
                background: PALETTE.softWhite,
              }}
            >
              <ThemeIcon
                variant="light"
                color="var(--marriplan-rose)"
                size="md"
                radius="md"
                mb={8}
              >
                <item.icon size={18} />
              </ThemeIcon>
              <Text size="xs" c={PALETTE.warmGray} fw={500}>
                {item.title}
              </Text>
              <Text
                size="sm"
                fw={700}
                c={PALETTE.ink}
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {item.value}
              </Text>
            </Card>
          ))}
        </SimpleGrid>

        {/* PERFIL IDENTIFICADO */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUpVariants}
        >
          <Card
            radius="xl"
            p="lg"
            mt="xl"
            style={{
              background: PALETTE.champagne,
              border: `1px solid ${PALETTE.line}`,
            }}
          >
            <Group gap="sm" align="flex-start" wrap="nowrap">
              <ThemeIcon color="var(--marriplan-rose)" radius="xl" size="md">
                <IconLamp size={20} />
              </ThemeIcon>
              <Box>
                <Title order={4} c={PALETTE.ink} size="sm">
                  Perfil Identificado
                </Title>
                <Text size="sm" c={PALETTE.warmGray} mt={4} lh={1.5}>
                  Este casamento apresenta características operacionais de um
                  evento padrão <b>{inputs.eventLevel.toUpperCase()}</b>{" "}
                  estruturado para uma lista de médio impacto. O planejamento
                  prioriza conforto, fluidez de infraestrutura e otimização
                  logística na região de {inputs.city}.
                </Text>
              </Box>
            </Group>
          </Card>
        </motion.div>

        {/* CENÁRIOS COMPARATIVOS */}
        <Box mt={50}>
          <Title
            order={3}
            c={PALETTE.ink}
            mb="lg"
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <IconTrendingUp size={24} color="var(--marriplan-rose)" /> Possíveis
            Cenários Calculados
          </Title>

          <Grid spacing="md" align="stretch">
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Card
                radius="xl"
                p="lg"
                style={{
                  border: `1px solid ${PALETTE.line}`,
                  background: PALETTE.softWhite,
                }}
                h="100%"
              >
                <Text size="xs" fw={700} c="teal" tt="uppercase">
                  Econômico Otimizado
                </Text>
                <Title order={3} c={PALETTE.ink} mt={4}>
                  {formatCurrency(
                    scenarios.alternativeEconomical.totalEstimated,
                  )}
                </Title>
                <Text size="xs" c={PALETTE.warmGray} mt="xs" lh={1.4}>
                  {scenarios.alternativeEconomical.description}
                </Text>
              </Card>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 4 }}>
              <Card
                radius="xl"
                p="lg"
                style={{
                  border: `2px solid var(--marriplan-rose)`,
                  background: PALETTE.softWhite,
                }}
                h="100%"
                position="relative"
              >
                <Badge
                  color="var(--marriplan-rose)"
                  radius="sm"
                  style={{ position: "absolute", top: 12, right: 12 }}
                >
                  Mais indicado
                </Badge>
                <Text
                  size="xs"
                  fw={700}
                  c="var(--marriplan-rose)"
                  tt="uppercase"
                >
                  Cenário Recomendado
                </Text>
                <Title order={2} c={PALETTE.ink} mt={4}>
                  {formatCurrency(scenarios.target.totalEstimated)}
                </Title>
                <Text size="xs" c={PALETTE.warmGray} mt="xs" lh={1.4}>
                  {scenarios.target.description}
                </Text>
              </Card>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 4 }}>
              <Card
                radius="xl"
                p="lg"
                style={{
                  border: `1px solid ${PALETTE.line}`,
                  background: PALETTE.softWhite,
                }}
                h="100%"
              >
                <Text size="xs" fw={700} c="purple" tt="uppercase">
                  Casamento dos Sonhos
                </Text>
                <Title order={3} c={PALETTE.ink} mt={4}>
                  {formatCurrency(scenarios.alternativePremium.totalEstimated)}
                </Title>
                <Text size="xs" c={PALETTE.warmGray} mt="xs" lh={1.4}>
                  {scenarios.alternativePremium.description}
                </Text>
              </Card>
            </Grid.Col>
          </Grid>

          <Card
            radius="xl"
            p="lg"
            mt="md"
            style={{
              border: `1px solid ${PALETTE.line}`,
              background: PALETTE.softWhite,
            }}
          >
            <BarChart
              h={200}
              data={barChartData}
              dataKey="cenario"
              series={[{ name: "valor", color: "var(--marriplan-rose)" }]}
              valueFormatter={(v) => formatCurrency(v)}
              gridAxis="xy"
            />
          </Card>
        </Box>

        {/* DISTRIBUIÇÃO ESTIMADA DOS INVESTIMENTOS */}
        <Box mt={50}>
          <Title order={3} c={PALETTE.ink} mb="lg">
            Distribuição Estimada dos Investimentos
          </Title>
          <Grid spacing="xl" align="center">
            <Grid.Col span={{ base: 12, md: 5 }}>
              <Center>
                <DonutChart
                  size={200}
                  thickness={25}
                  data={donutChartData}
                  withLabels
                  valueFormatter={(v) => formatCurrency(v)}
                />
              </Center>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 7 }}>
              <Stack gap="xs">
                {breakdown.map((item, idx) => (
                  <Box key={idx}>
                    <Group justify="space-between" mb={2}>
                      <Text size="sm" fw={600} c={PALETTE.ink}>
                        {item.category}
                      </Text>
                      <Group gap={6}>
                        <Text size="sm" fw={700} c={PALETTE.ink}>
                          {formatCurrency(item.estimatedCost)}
                        </Text>
                        <Badge size="xs" color="gray" variant="light">
                          {item.percentage}%
                        </Badge>
                      </Group>
                    </Group>
                    <Progress
                      value={item.percentage}
                      color={chartColors[idx % chartColors.length]}
                      radius="xl"
                      size="sm"
                    />
                  </Box>
                ))}
              </Stack>
            </Grid.Col>
          </Grid>
        </Box>

        {/* PLANEJAMENTO FINANCEIRO DE APORTE */}
        <Box mt={50}>
          <Card
            radius="2xl"
            p="xl"
            style={{
              border: `1px solid ${PALETTE.line}`,
              background: PALETTE.softWhite,
            }}
          >
            <Title order={3} c={PALETTE.ink} mb="lg">
              Planejamento Financeiro Alvo
            </Title>
            <Grid spacing="lg" align="center">
              <Grid.Col span={{ base: 12, md: 4 }}>
                <Center>
                  <RingProgress
                    size={150}
                    thickness={12}
                    roundCaps
                    sections={[{ value: 100, color: "var(--marriplan-rose)" }]}
                    label={
                      <Stack gap={0} align="center">
                        <Text size="xl" fw={800} c={PALETTE.ink}>
                          {monthlyGoalStatus.monthsUntilWedding}
                        </Text>
                        <Text
                          size="xs"
                          c={PALETTE.warmGray}
                          fw={600}
                          tt="uppercase"
                        >
                          Meses Alvo
                        </Text>
                      </Stack>
                    }
                  />
                </Center>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 8 }}>
                <SimpleGrid cols={2} spacing="sm">
                  <Box>
                    <Text
                      size="xs"
                      c={PALETTE.warmGray}
                      fw={600}
                      tt="uppercase"
                    >
                      Meta Total de Reserva
                    </Text>
                    <Title order={3} c="var(--marriplan-rose)" mt={2}>
                      {formatCurrency(scenarios.target.totalEstimated)}
                    </Title>
                  </Box>
                  <Box>
                    <Text
                      size="xs"
                      c={PALETTE.warmGray}
                      fw={600}
                      tt="uppercase"
                    >
                      Reserva Mensal Esperada
                    </Text>
                    <Title order={3} c={PALETTE.ink} mt={2}>
                      {formatCurrency(inputs.monthlySaving)}
                    </Title>
                  </Box>
                </SimpleGrid>
                <Alert
                  color="teal"
                  radius="lg"
                  mt="lg"
                  icon={<IconCheck size={16} />}
                >
                  Efetuando uma poupança programada de{" "}
                  <b>{formatCurrency(inputs.monthlySaving)}</b> por mês, o casal
                  garante autonomia financeira para quitação do escopo dentro do
                  cronograma regular.
                </Alert>
              </Grid.Col>
            </Grid>
          </Card>
        </Box>

        {/* PRINCIPAIS DESCOBERTAS & SUGESTÕES */}
        <Box mt={50}>
          <Title order={3} c={PALETTE.ink} mb="md">
            Principais Descobertas & Sugestões Inteligentes
          </Title>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            {recommendations.slice(0, 4).map((rec, index) => (
              <Card
                key={index}
                radius="xl"
                p="md"
                style={{
                  border: `1px solid ${PALETTE.line}`,
                  background: PALETTE.softWhite,
                }}
              >
                <Group gap="sm" align="flex-start" wrap="nowrap">
                  <ThemeIcon
                    variant="light"
                    color="var(--marriplan-rose)"
                    size="md"
                    radius="md"
                  >
                    <IconLamp size={18} />
                  </ThemeIcon>
                  <Text size="xs" c={PALETTE.warmGray} lh={1.4}>
                    {rec}
                  </Text>
                </Group>
              </Card>
            ))}
          </SimpleGrid>
        </Box>

        {/* COMPARTILHAR SIMULAÇÃO */}
        <Box mt={50}>
          <Card
            radius="2xl"
            p="lg"
            ta="center"
            style={{
              border: `1px solid ${PALETTE.line}`,
              background: PALETTE.champagne,
            }}
          >
            <Title order={4} c={PALETTE.ink}>
              Gostou da análise? Compartilhe com os envolvidos
            </Title>
            <Text
              size="xs"
              c={PALETTE.warmGray}
              mt={4}
              max-width={500}
              mx="auto"
            >
              Envie o link desta página para assessores, cerimonialistas ou
              familiares que estão ajudando no orçamento.
            </Text>
            <Group justify="center" gap="sm" mt="lg">
              <Button
                variant="default"
                radius="xl"
                leftSection={<IconCopy size={16} />}
                onClick={handleCopyLink}
                style={{ minWidth: 160 }}
              >
                Copiar Link
              </Button>
              <Button
                styles={{
                  root: { backgroundColor: PALETTE.ink, color: "#fff" },
                }}
                radius="xl"
                leftSection={<IconShare size={16} />}
                onClick={handleShareApi}
                style={{ minWidth: 160 }}
              >
                Compartilhar
              </Button>
            </Group>
          </Card>
        </Box>

        {/* BRANDING INSTITUCIONAL MARRIPLAN (CONVERSÃO & MARKETING) */}
        <Divider my={60} style={{ borderColor: PALETTE.line }} />

        <Box ta="center" mb={40}>
          <Title
            order={2}
            c={PALETTE.ink}
            style={{ fontFamily: "serif", fontSize: 32 }}
          >
            Planeje seu casamento com mais tranquilidade
          </Title>
          <Text
            c={PALETTE.warmGray}
            size="sm"
            max-width={600}
            mx="auto"
            mt="xs"
          >
            O Marriplan é a ferramenta definitiva para casais que buscam
            organizar cada etapa do casamento sem estresse e com controle
            absoluto.
          </Text>

          <SimpleGrid cols={{ base: 1, sm: 3 }} mt="xl" spacing="lg">
            {[
              {
                icon: IconTrendingUp,
                title: "Controle Financeiro de Ponta",
                desc: "Monitore fluxos de caixa, parcelas de fornecedores e orçamentos em tempo real.",
              },
              {
                icon: IconUsers,
                title: "Lista de Convidados Eficiente",
                desc: "Confirmação de presença (RSVP) automatizada e mapa de mesas interativo.",
              },
              {
                icon: IconChecklist,
                title: "Cronograma Dinâmico",
                desc: "Checklist inteligente de tarefas com lembretes baseados na data do seu evento[cite: 3].",
              },
            ].map((benefit, index) => (
              <Card
                key={index}
                radius="xl"
                p="lg"
                style={{
                  border: `1px solid ${PALETTE.line}`,
                  background: PALETTE.softWhite,
                }}
                ta="left"
              >
                <ThemeIcon
                  variant="light"
                  color="var(--marriplan-rose)"
                  size="lg"
                  radius="xl"
                  mb="md"
                >
                  <benefit.icon size={24} />
                </ThemeIcon>
                <Text fw={600} size="md" c={PALETTE.ink}>
                  {benefit.title}
                </Text>
                <Text size="xs" c={PALETTE.warmGray} mt={6} lh={1.5}>
                  {benefit.desc}
                </Text>
              </Card>
            ))}
          </SimpleGrid>
        </Box>

        {/* CALL TO ACTION (CTA) FINAL DE CONVERSÃO */}
        <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
          <Card
            radius="2xl"
            p={{ base: "xl", md: 50 }}
            ta="center"
            style={{
              background: PALETTE.ink,
              boxShadow: "0 16px 40px rgba(45, 38, 34, 0.12)",
            }}
          >
            <Title
              order={2}
              c="#fff"
              style={{
                fontFamily: "serif",
                fontWeight: 500,
                fontSize: isMobile ? 26 : 36,
              }}
            >
              Também está planejando seu casamento?
            </Title>
            <Text
              c={PALETTE.roseGold}
              size="sm"
              mt="sm"
              max-width={500}
              mx="auto"
            >
              Crie gratuitamente sua conta agora e descubra em minutos o custo
              detalhado para o perfil exato do seu grande dia.
            </Text>

            <Group justify="center" mt="xl" gap="sm">
              <Button
                variant="white"
                color="dark"
                radius="xl"
                size="md"
                rightSection={<IconExternalLink size={16} />}
                onClick={() => router.push("/register")}
                style={{ fontWeight: 600 }}
              >
                Criar Minha Conta
              </Button>
              <Button
                variant="subtle"
                color="white"
                size="md"
                onClick={() => router.push("/")}
              >
                Conhecer o Marriplan
              </Button>
            </Group>
          </Card>
        </motion.div>
      </Container>
    </Box>
  );
};

export default PublicWeddingSimulationPage;

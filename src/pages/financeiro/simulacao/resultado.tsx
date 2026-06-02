import React, { useEffect, useState } from "react";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import BaseLayout from "@/components/Layout/_BaseLayout";
import {
  Container, Grid, Card, Text, Title, SimpleGrid, Group, Stack, Badge,
  ThemeIcon, RingProgress, Progress, Button, Center, Skeleton, Box, Divider,
  Checkbox, Tooltip, Alert
} from "@mantine/core";
import { DonutChart, BarChart } from "@mantine/charts";
import { useMediaQuery } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import {
  IconSparkles, IconCheck, IconShare, IconCopy, IconCalendar, IconUsers,
  IconMapPin, IconMessageReport, IconLamp, IconArrowLeft, IconLayoutDashboard,
  IconFileText, IconTrendingUp, IconDeviceMusic, IconCamera, IconCrown, IconCash
} from "@tabler/icons-react";
import { giftsService } from "@/services/giftsService"; // Conector de API unificado do Marriplan
import { formatCurrency, getAvailableEconomyOptions, EconomyOption } from "@/lib/simulationResultUtils";
import { SimulationResult } from "@/lib/simulationUtils";

// Cores de Identidade Visual Estrita do Marriplan
const PALETTE = {
  champagne: "#F7F1E8",
  roseGold: "#E6B8A2",
  beige: "#EFE6DA",
  warmGray: "#6F6660",
  ink: "#2D2622",
  line: "#EEE3D8",
  softWhite: "#FFFCF8",
  marriplanRose: "var(--marriplan-rose)"
};

const inputStyles = { input: { borderColor: PALETTE.line, focusBorderColor: PALETTE.roseGold } };

const WeddingCostSimulationResultPage: NextPage = () => {
  const router = useRouter();
  const { token } = router.query; // Parâmetro para visualização compartilhada pública
  const { user, loading: authLoading } = useAuth();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const [loading, setLoading] = useState(true);
  const [simulationData, setSimulationData] = useState<SimulationResult | null>(null);
  const [selectedEconomies, setSelectedEconomies] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  // 1. Carregamento dos dados com base no contexto (Privado vs Compartilhado Publicamente)
  useEffect(() => {
    async function fetchSimulation() {
      try {
        if (token) {
          // Resultado Compartilhado de rota pública
          const res = await fetch(`/api/simulations/${token}/`);
          if (res.ok) {
            const data = await res.json();
            setSimulationData(data.simulation);
          } else {
            notifications.show({ color: "red", title: "Erro", message: "Simulação compartilhada expirada ou inválida." });
          }
        } else if (!authLoading) {
          // Resultado Privado vindo do Perfil do Usuário Logado
          if (user?.wedding_profile?.simulation) {
            setSimulationData(user.wedding_profile.simulation);
          }
        }
      } catch (err) {
        console.error("Erro ao recuperar simulação", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSimulation();
  }, [token, user, authLoading]);

  // 2. Disparo controlado do efeito de Confetti no primeiro carregamento de sucesso
  useEffect(() => {
    if (simulationData) {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: [PALETTE.roseGold, "#D4AF37", "#F3E5AB"]
      });
    }
  }, [simulationData]);

  if (loading || authLoading) {
    return (
      <BaseLayout>
        <Container size="lg" py="xl">
          <Stack gap="xl">
            <Skeleton height={50} width="60%" radius="xl" mx="auto" />
            <Skeleton height={200} radius="2xl" />
            <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
              <Skeleton height={140} radius="xl" />
              <Skeleton height={140} radius="xl" />
              <Skeleton height={140} radius="xl" />
            </SimpleGrid>
          </Stack>
        </Container>
      </BaseLayout>
    );
  }

  // Estado: Usuário ainda não efetuou nenhuma simulação ativa (Empty State)
  if (!simulationData) {
    return (
      <BaseLayout>
        <Container size="sm" py={80}>
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
            <Card radius="2xl" p="xl" ta="center" style={{ border: `1px solid ${PALETTE.line}`, background: PALETTE.softWhite }}>
              <ThemeIcon variant="light" color="var(--marriplan-rose)" size={64} radius="xl" mx="auto">
                <IconMessageReport size={34} />
              </ThemeIcon>
              <Title order={2} c={PALETTE.ink} mt="md">Você ainda não realizou nenhuma simulação</Title>
              <Text c={PALETTE.warmGray} size="sm" mt="sm" max-width={400} mx="auto">
                Utilize nossa consultoria inteligente para estimar detalhadamente os custos e prazos do casamento dos seus sonhos.
              </Text>
              <Button
                color="var(--marriplan-rose)"
                radius="xl"
                size="md"
                mt="xl"
                onClick={() => router.push("/financeiro/simulacao")}
                style={{ fontWeight: 600 }}
              >
                Iniciar Simulação
              </Button>
            </Card>
          </motion.div>
        </Container>
      </BaseLayout>
    );
  }

  const { inputs, scenarios, breakdown, monthlyGoalStatus, recommendations } = simulationData;
  const economyOptions = getAvailableEconomyOptions(simulationData);

  // Cálculo da economia em tempo real baseado nas seleções do painel interativo
  const totalEconomyCalculated = economyOptions
    .filter(opt => selectedEconomies.includes(opt.id))
    .reduce((sum, opt) => sum + opt.savings, 0);

  // Handlers de compartilhamento de link
  const shareToken = user?.wedding_profile?.simulation_share_token || token || "demo-token";
  const shareUrl = `${window.location.origin}/financeiro/simulacao/${shareToken}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    notifications.show({ color: "teal", title: "Copiado!", message: "Link de compartilhamento copiado para a área de transferência." });
    setTimeout(() => setCopied(false), 3000);
  };

  const handleShareApi = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Minha Simulação de Custos no Marriplan",
          text: `Confira o planejamento financeiro estimado para o nosso casamento!`,
          url: shareUrl
        });
      } catch (err) {
        console.log("Compartilhamento cancelado ou não suportado.");
      }
    } else {
      handleCopyLink();
    }
  };

  // Cores fixas para mapeamento do gráfico de distribuição
  const chartColors = ["#E6B8A2", "#C9ADA7", "#9A8C98", "#4A4E69", "#22223B"];

  const donutChartData = breakdown.map((item, idx) => ({
    name: item.category,
    value: item.estimatedCost,
    color: chartColors[idx % chartColors.length]
  }));

  const barChartData = [
    { cenario: "Econômico", valor: scenarios.alternativeEconomical.totalEstimated },
    { cenario: "Recomendado", valor: scenarios.target.totalEstimated },
    { cenario: "Luxo/Sonho", valor: scenarios.alternativePremium.totalEstimated }
  ];

  return (
    <BaseLayout>
      <Container size="lg" py="xl">
        
        {/* HERO PRINCIPAL DE ALTO IMPACTO EMOCIONAL */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card radius="2xl" p={{ base: "xl", md: 50 }} ta="center" className="hero-simulation-card" style={{
            background: `linear-gradient(135deg, ${PALETTE.champagne} 0%, ${PALETTE.softWhite} 100%)`,
            border: `1px solid ${PALETTE.line}`,
            position: "relative",
            overflow: "hidden"
          }}>
            <Group justify="center" gap="xs" mb="sm">
              <Badge variant="dot" color="var(--marriplan-rose)" radius="md">Personalizado</Badge>
              <Badge variant="dot" color="teal" radius="md">Planejamento Inteligente</Badge>
              <Badge variant="dot" color="blue" radius="md">Atualizado Agora</Badge>
            </Group>

            <Text c={PALETTE.warmGray} size="md" fw={500} tt="uppercase" lts={1}>
              Seu casamento foi estimado em
            </Text>
            
            <Title order={1} mt="xs" c={PALETTE.ink} style={{ fontSize: isMobile ? 42 : 64, fontWeight: 800, fontFamily: "serif" }}>
              {formatCurrency(scenarios.target.totalEstimated)}
            </Title>

            <Text c={PALETTE.warmGray} size="sm" max-width={550} mx="auto" mt="sm">
              Baseado nas especificações técnicas fornecidas, volume de fornecedores e localização logística do evento.
            </Text>
            
            {simulationData.generatedAt && (
              <Text size="xs" c="dimmed" mt="lg">
                Última atualização do motor de cálculo: {simulationData.generatedAt}
              </Text>
            )}
          </Card>
        </motion.div>

        {/* RESUMO GERAL EM CARDS E ICONOGRAFIA */}
        <SimpleGrid cols={{ base: 2, sm: 4 }} mt="md" spacing="sm">
          {[
            { icon: IconUsers, title: "Convidados", desc: `${inputs.guestsCount} pessoas` },
            { icon: IconCalendar, title: "Data Prevista", desc: inputs.weddingDate ? new Date(inputs.weddingDate + "T00:00:00").toLocaleDateString("pt-BR") : "A definir" },
            { icon: IconMapPin, title: "Localização", desc: `${inputs.city} (${inputs.locationType})` },
            { icon: IconCrown, title: "Categoria", desc: inputs.eventLevel.toUpperCase() }
          ].map((item, idx) => (
            <Card key={idx} radius="xl" p="md" style={{ border: `1px solid ${PALETTE.line}`, background: PALETTE.softWhite }}>
              <Group gap="sm" wrap="nowrap">
                <ThemeIcon variant="light" color="var(--marriplan-rose)" size="md" radius="md">
                  <item.icon size={20} />
                </ThemeIcon>
                <Box style={{ overflow: "hidden" }}>
                  <Text size="xs" c={PALETTE.warmGray} fw={500}>{item.title}</Text>
                  <Text size="sm" fw={700} c={PALETTE.ink} style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.desc}</Text>
                </Box>
              </Group>
            </Card>
          ))}
        </SimpleGrid>

        {/* CARD DINÂMICO DE ANÁLISE COMPATIBILIDADE DE PERFIL */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <Card radius="xl" p="lg" mt="md" style={{ background: PALETTE.champagne, border: `1px solid ${PALETTE.line}` }}>
            <Group gap="sm" align="flex-start" wrap="nowrap">
              <ThemeIcon color="var(--marriplan-rose)" radius="xl" size="md">
                <IconLamp size={20} />
              </ThemeIcon>
              <Box>
                <Text size="sm" fw={700} c={PALETTE.ink}>Análise de Compatibilidade do Perfil</Text>
                <Text size="sm" c={PALETTE.warmGray} mt={4} lh={1.5}>
                  Seu perfil se aproxima de um casamento {inputs.eventLevel === "luxury" ? "exclusivo de alto padrão" : "moderno e sob medida"}, com foco prioritário estruturado em {inputs.priorities.length > 0 ? inputs.priorities.join(", ") : "equilíbrio global de fornecedores"}. A configuração em {inputs.city} apresenta custos competitivos comparados a grandes polos metropolitanos nacionais.
                </Text>
              </Box>
            </Group>
          </Card>
        </motion.div>

        {/* SESSÃO: COMPARAÇÃO VISUAL DE CENÁRIOS */}
        <Box mt={40}>
          <Title order={3} c={PALETTE.ink} mb="md" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <IconTrendingUp size={24} color="var(--marriplan-rose)" /> Possíveis Cenários de Investimento
          </Title>

          <Grid spacing="md" align="stretch">
            {/* Cenário Econômico */}
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Card radius="xl" p="lg" style={{ border: `1px solid ${PALETTE.line}`, background: PALETTE.softWhite }} h="100%">
                <Text size="xs" fw={700} c="teal" tt="uppercase">Econômico Otimizado</Text>
                <Title order={3} c={PALETTE.ink} mt={4}>{formatCurrency(scenarios.alternativeEconomical.totalEstimated)}</Title>
                <Text size="xs" c={PALETTE.warmGray} mt="xs" lh={1.4}>
                  {scenarios.alternativeEconomical.description} Ideal para quem busca otimização máxima sem abrir mão da elegância essencial.
                </Text>
              </Card>
            </Grid.Col>

            {/* Cenário Recomendado (Destacado) */}
            <Grid.Col span={{ base: 12, md: 4 }}>
              <motion.div whileHover={{ scale: 1.01 }} style={{ height: "100%" }}>
                <Card radius="xl" p="lg" style={{
                  border: `2px solid var(--marriplan-rose)`,
                  background: PALETTE.softWhite,
                  boxShadow: "0 8px 24px rgba(230, 184, 162, 0.15)"
                }} h="100%" position="relative">
                  <Badge color="var(--marriplan-rose)" radius="sm" style={{ position: "absolute", top: 12, right: 12 }}>
                    Mais Indicado
                  </Badge>
                  <Text size="xs" fw={700} c="var(--marriplan-rose)" tt="uppercase">Cenário Ideal</Text>
                  <Title order={2} c={PALETTE.ink} mt={4}>{formatCurrency(scenarios.target.totalEstimated)}</Title>
                  <Text size="xs" c={PALETTE.warmGray} mt="xs" lh={1.4}>
                    {scenarios.target.description} Equilibra perfeitamente todos os desejos pontuados em sua consultoria com segurança orçamentária.
                  </Text>
                </Card>
              </motion.div>
            </Grid.Col>

            {/* Cenário Casamento dos Sonhos */}
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Card radius="xl" p="lg" style={{ border: `1px solid ${PALETTE.line}`, background: PALETTE.softWhite }} h="100%">
                <Text size="xs" fw={700} c="purple" tt="uppercase">Experiência Premium</Text>
                <Title order={3} c={PALETTE.ink} mt={4}>{formatCurrency(scenarios.alternativePremium.totalEstimated)}</Title>
                <Text size="xs" c={PALETTE.warmGray} mt="xs" lh={1.4}>
                  {scenarios.alternativePremium.description} Entrega máxima com upgrades sofisticados em gastronomia, entretenimento e efeitos.
                </Text>
              </Card>
            </Grid.Col>
          </Grid>

          {/* Gráfico de Barras Comparativo de Cenários */}
          <Card radius="xl" p="lg" mt="md" style={{ border: `1px solid ${PALETTE.line}`, background: PALETTE.softWhite }}>
            <BarChart
              h={200}
              data={barChartData}
              dataKey="cenario"
              series={[{ name: "valor", color: "var(--marriplan-rose)" }]}
              valueFormatter={(value) => formatCurrency(value)}
              gridAxis="xy"
            />
          </Card>
        </Box>

        {/* SESSÃO: DISTRIBUIÇÃO ANALÍTICA DO INVESTIMENTO */}
        <Box mt={40}>
          <Title order={3} c={PALETTE.ink} mb="md">Para onde vai o investimento</Title>
          <Grid spacing="xl" align="center">
            <Grid.Col span={{ base: 12, md: 5 }}>
              <Center>
                <DonutChart
                  size={220}
                  thickness={30}
                  data={donutChartData}
                  withLabels
                  valueFormatter={(v) => formatCurrency(v)}
                />
              </Center>
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, md: 7 }}>
              <Stack gap="sm">
                {breakdown.map((item, idx) => (
                  <Box key={idx}>
                    <Group justify="space-between" mb={4}>
                      <Text size="sm" fw={600} c={PALETTE.ink}>{item.category}</Text>
                      <Group gap={6}>
                        <Text size="sm" fw={700} c={PALETTE.ink}>{formatCurrency(item.estimatedCost)}</Text>
                        <Badge size="xs" color="gray" variant="light">{item.percentage}%</Badge>
                      </Group>
                    </Group>
                    <Progress value={item.percentage} color={chartColors[idx % chartColors.length]} radius="xl" size="sm" />
                  </Box>
                ))}
              </Stack>
            </Grid.Col>
          </Grid>
        </Box>

        {/* SESSÃO: PLANO DE ALCANCE FINANCEIRO */}
        <Box mt={40}>
          <Card radius="2xl" p="xl" style={{ border: `1px solid ${PALETTE.line}`, background: PALETTE.softWhite }}>
            <Title order={3} c={PALETTE.ink} mb="lg">Plano para alcançar esse objetivo</Title>
            
            <Grid spacing="lg" align="center">
              <Grid.Col span={{ base: 12, md: 4 }}>
                <Center>
                  <RingProgress
                    size={160}
                    thickness={14}
                    roundCaps
                    sections={[{ value: monthlyGoalStatus.isPossibleBeforeWedding ? 100 : 70, color: "var(--marriplan-rose)" }]}
                    label={
                      <Stack gap={0} align="center">
                        <Text size="xl" fw={800} c={PALETTE.ink}>{monthlyGoalStatus.monthsUntilWedding}</Text>
                        <Text size="xs" c={PALETTE.warmGray} tt="uppercase" fw={600}>Meses</Text>
                      </Stack>
                    }
                  />
                </Center>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 8 }}>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                  <Box>
                    <Text size="xs" c={PALETTE.warmGray} fw={600} tt="uppercase">Economia Mensal Necessária</Text>
                    <Title order={3} c={PALETTE.ink} mt={2}>{formatCurrency(inputs.monthlySaving)}</Title>
                  </Box>
                  <Box>
                    <Text size="xs" c={PALETTE.warmGray} fw={600} tt="uppercase">Meta de Reserva Total</Text>
                    <Title order={3} c="var(--marriplan-rose)" mt={2}>{formatCurrency(scenarios.target.totalEstimated)}</Title>
                  </Box>
                </SimpleGrid>

                <Alert icon={<IconCheck size={16} />} color={monthlyGoalStatus.isPossibleBeforeWedding ? "teal" : "orange"} radius="lg" mt="xl">
                  Guardando aproximadamente <b>{formatCurrency(inputs.monthlySaving)}</b> por mês, vocês conseguem acumular o aporte planejado para cobrir as despesas essenciais do cronograma.
                </Alert>
              </Grid.Col>
            </Grid>
          </Card>
        </Box>

        {/* INSIGHTS INTELIGENTES DO MOTOR */}
        <Box mt={40}>
          <Title order={3} c={PALETTE.ink} mb="sm">O que descobrimos sobre o seu casamento</Title>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            {recommendations.map((rec, index) => (
              <Card key={index} radius="xl" p="md" style={{ border: `1px solid ${PALETTE.line}`, background: PALETTE.softWhite }}>
                <Group gap="sm" align="flex-start" wrap="nowrap">
                  <ThemeIcon variant="light" color="var(--marriplan-rose)" size="md" radius="md">
                    <IconLamp size={18} />
                  </ThemeIcon>
                  <Text size="xs" c={PALETTE.warmGray} lh={1.4}>{rec}</Text>
                </Group>
              </Card>
            ))}
          </SimpleGrid>
        </Box>

        {/* SIMULADOR INTERATIVO DE ECONOMIA (MICROINTERAÇÃO PREMIUM) */}
        <Box mt={40}>
          <Card radius="2xl" p="xl" style={{
            border: `1px solid ${PALETTE.line}`,
            background: `linear-gradient(to bottom right, #fff, ${PALETTE.softWhite})`
          }}>
            <Box mb="md">
              <Title order={3} c={PALETTE.ink}>Simulador de Economia Inteligente</Title>
              <Text size="xs" c={PALETTE.warmGray} mt={2}>
                Marque opções alternativas abaixo para visualizar projeções hipotéticas de redução de custo em tempo real, sem corromper sua simulação oficial.
              </Text>
            </Box>

            <Stack gap="sm">
              {economyOptions.map((opt) => (
                <Card key={opt.id} radius="lg" p="sm" style={{ border: `1px solid ${PALETTE.line}`, background: "#fff" }}>
                  <Group justify="space-between">
                    <Checkbox
                      color="var(--marriplan-rose)"
                      label={<Text size="sm" fw={500} c={PALETTE.ink}>{opt.label}</Text>}
                      checked={selectedEconomies.includes(opt.id)}
                      onChange={(e) => {
                        const next = e.currentTarget.checked
                          ? [...selectedEconomies, opt.id]
                          : selectedEconomies.filter(id => id !== opt.id);
                        setSelectedEconomies(next);
                      }}
                    />
                    <Text size="sm" fw={700} c="teal">-{formatCurrency(opt.savings)}</Text>
                  </Group>
                </Card>
              ))}
            </Stack>

            {totalEconomyCalculated > 0 && (
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} mt="xl">
                <Divider my="md" style={{ borderColor: PALETTE.line }} />
                <Group justify="space-between">
                  <Text size="sm" fw={600} c={PALETTE.ink}>Potencial de Economia Aplicado:</Text>
                  <Title order={3} c="teal">{formatCurrency(totalEconomyCalculated)}</Title>
                </Group>
                <Group justify="space-between" mt={4}>
                  <Text size="sm" fw={500} c={PALETTE.warmGray}>Novo Valor Estimado Otimizado:</Text>
                  <Text size="lg" fw={700} c={PALETTE.ink}>
                    {formatCurrency(scenarios.target.totalEstimated - totalEconomyCalculated)}
                  </Text>
                </Group>
              </motion.div>
            )}
          </Card>
        </Box>

        {/* SEÇÃO COMPARTILHAMENTO & EXPORTAÇÃO */}
        <Grid spacing="md" mt={40}>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card radius="2xl" p="lg" style={{ border: `1px solid ${PALETTE.line}`, background: PALETTE.softWhite }}>
              <Title order={4} c={PALETTE.ink} mb="xs">Compartilhe sua simulação</Title>
              <Text size="xs" c={PALETTE.warmGray} mb="md">
                Envie este link seguro e otimizado para o seu parceiro ou assessoria financeira visualizarem o relatório completo.
              </Text>
              <Group gap="sm">
                <Button variant="default" radius="xl" leftSection={<IconCopy size={16} />} onClick={handleCopyLink} style={{ flex: 1 }}>
                  Copiar Link
                </Button>
                <Button styles={{ root: { backgroundColor: PALETTE.ink, color: "#fff" } }} radius="xl" leftSection={<IconShare size={16} />} onClick={handleShareApi} style={{ flex: 1 }}>
                  Compartilhar
                </Button>
              </Group>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card radius="2xl" p="lg" style={{ border: `1px solid ${PALETTE.line}`, background: PALETTE.softWhite }}>
              <Title order={4} c={PALETTE.ink} mb="xs">Documentação Oficial</Title>
              <Text size="xs" c={PALETTE.warmGray} mb="md">
                Gere um arquivo estruturado em PDF com todos os cenários e distribuições percentuais para apresentar em reuniões.
              </Text>
              <Tooltip label="Geração de PDF em desenvolvimento" position="top" withArrow>
                <Button variant="light" color="gray" radius="xl" leftSection={<IconFileText size={16} />} fullWidth disabled>
                  Gerar PDF (Breve)
                </Button>
              </Tooltip>
            </Card>
          </Grid.Col>
        </Grid>

        {/* CALL TO ACTION (CTA) FINAL DE ENGAJAMENTO */}
        <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
          <Card radius="2xl" p="xl" mt={50} ta="center" style={{
            background: PALETTE.ink,
            boxShadow: "0 12px 32px rgba(45, 38, 34, 0.15)"
          }}>
            <Title order={2} c="#fff" style={{ fontFamily: "serif", fontWeight: 500 }}>
              Pronto para começar a planejar esse sonho?
            </Title>
            <Text c={PALETTE.roseGold} size="sm" mt="xs" max-width={500} mx="auto">
              Transforme seus números em realidade integrando esta simulação diretamente ao seu cronograma e Checklist de tarefas do Marriplan.
            </Text>

            <Group justify="center" mt="xl" gap="sm">
              <Button variant="subtle" color="white" leftSection={<IconArrowLeft size={16} />} onClick={() => router.push("/financeiro/simulacao")}>
                Refazer Simulação
              </Button>
              <Button variant="white" color="dark" radius="xl" leftSection={<IconLayoutDashboard size={16} />} onClick={() => router.push("/financeiro")}>
                Ir para o Painel Financeiro
              </Button>
            </Group>
          </Card>
        </motion.div>

      </Container>
    </BaseLayout>
  );
};

export default WeddingCostSimulationResultPage;
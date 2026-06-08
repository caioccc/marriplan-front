import {
  DashboardFinanceiroData,
  getProgressoOrcamento,
} from "@/services/financeiro";
import { BarChart, DonutChart } from "@mantine/charts";
import {
  ActionIcon,
  Box,
  Card,
  Grid,
  Group,
  Progress,
  Skeleton,
  Text,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconChartPie,
  IconCheck,
  IconEye,
  IconEyeOff,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
// Importação do Service e da Interface criados no passo anterior

export function ResumoProgressoFinanceiro() {
  const [visible, setVisible] = useState<boolean>(true);
  const [data, setData] = useState<DashboardFinanceiroData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Chamada Real da API utilizando o Service
  useEffect(() => {
    const carregarDadosDashboard = async () => {
      try {
        setLoading(true);
        const result = await getProgressoOrcamento();
        setData(result);
        setError(null);
      } catch (err: any) {
        console.error("Erro na requisição do painel financeiro:", err);
        setError("Não foi possível carregar o resumo financeiro.");
      } finally {
        setLoading(false);
      }
    };

    carregarDadosDashboard();
  }, []);

  // Formatação de moeda BRL respeitando o clique do botão de privacidade
  const formatMoney = (value: number) => {
    if (!visible) return "R$ ••••";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Tratamento visual para o estado de Loading (Skeletons elegantes do Mantine)
  if (loading) {
    return (
      <Box mb="xl">
        <Group justify="space-between" mb="lg">
          <Skeleton h={35} w={300} radius="md" />
          <Skeleton h={35} w={40} radius="md" />
        </Group>
        <Grid gutter="md">
          {[1, 2, 3, 4].map((i) => (
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }} key={i}>
              <Skeleton h={130} radius="md" />
            </Grid.Col>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Card withBorder color="rose.1" p="md" mb="xl" radius="md">
        <Text c="rose.7" size="sm" fw={600}>
          {error || "Erro de carregamento."}
        </Text>
      </Card>
    );
  }

  const {
    progresso_total,
    gasto_vs_perfil,
    previsao_caixa,
    distribuicao_categorias,
  } = data;

  // Tradução dinâmica de meses vinda da agregação ORM do Django para o BarChart
  const getMesNome = (num: number) => {
    const meses = [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ];
    return meses[num - 1] || "";
  };

  const chartBarData = previsao_caixa.fluxo_futuro.map((item) => ({
    month: `${getMesNome(item.mes)}/${String(item.ano).slice(-2)}`,
    "A Pagar": Number(item.total_a_pagar),
  }));

  // Paleta cíclica para as barras horizontais das top categorias (Card 4)
  const paletaCoresCategorias = [
    "terracota.6",
    "champanhe.5",
    "beige.5",
    "rose.4",
  ];

  return (
    <Box mb="xl">
      {/* Topo de Controle Unificado com dados dinâmicos */}
      <Group justify="space-between" mb="lg">
        <div>
          <Text size="xs" fw={700} c="dimmed" lts="1px" tt="uppercase">
            Painel de Controle
          </Text>
          <Text size="xl" fw={800} c="terracota.7">
            Resumo do Progresso Total
          </Text>
        </div>

        <Tooltip
          label={visible ? "Ocultar Valores" : "Mostrar Valores"}
          position="left"
          withArrow
        >
          <ActionIcon
            variant="subtle"
            color="beige.6"
            size="lg"
            radius="md"
            onClick={() => setVisible(!visible)}
          >
            {visible ? <IconEye size={22} /> : <IconEyeOff size={22} />}
          </ActionIcon>
        </Tooltip>
      </Group>

      <Grid gutter="md">
        {/* CARD 1: Progresso Total do Orçamento (Donut) */}
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Card
            withBorder
            radius="md"
            padding="md"
            bg="beige.0"
            style={{ height: "100%" }}
          >
            <Text size="xs" fw={700} c="beige.7" tt="uppercase" lts="0.5px">
              Orçamento Global
            </Text>
            <Group justify="space-between" align="center" mt="sm" gap="xs">
              <DonutChart
                size={75}
                thickness={9}
                data={[
                  {
                    name: "Pago",
                    value: Number(progresso_total.pago),
                    color: "terracota.6",
                  },
                  {
                    name: "A Vencer",
                    value: Number(progresso_total.a_vencer),
                    color: "champanhe.4",
                  },
                  {
                    name: "Sobras",
                    value: Number(progresso_total.sobras),
                    color: "beige.3",
                  },
                ]}
              />
              <Box style={{ flex: 1 }}>
                <Text size="11px" fw={600} c="dimmed">
                  Pago:{" "}
                  <span
                    style={{
                      color: "var(--mantine-color-text)",
                      fontWeight: 700,
                    }}
                  >
                    {formatMoney(Number(progresso_total.pago))}
                  </span>
                </Text>
                <Text size="11px" fw={600} c="dimmed" mt={2}>
                  Falta:{" "}
                  <span
                    style={{
                      color: "var(--mantine-color-text)",
                      fontWeight: 700,
                    }}
                  >
                    {formatMoney(Number(progresso_total.a_vencer))}
                  </span>
                </Text>
                <Text size="11px" fw={600} c="dimmed" mt={2}>
                  Sobra:{" "}
                  <span
                    style={{
                      color: "var(--mantine-color-text)",
                      fontWeight: 700,
                    }}
                  >
                    {formatMoney(Number(progresso_total.sobras))}
                  </span>
                </Text>
              </Box>
            </Group>
          </Card>
        </Grid.Col>

        {/* CARD 2: Gasto vs Perfil Planejado com Alerta Dinâmico de Estouro */}
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Card
            withBorder
            radius="md"
            padding="md"
            bg="beige.0"
            style={{ height: "100%" }}
          >
            <Group justify="space-between" mb="xs">
              <Text size="xs" fw={700} c="beige.7" tt="uppercase" lts="0.5px">
                {gasto_vs_perfil.titulo}
              </Text>
              <ThemeIcon
                variant="light"
                color={
                  gasto_vs_perfil.status_limite === "estourado"
                    ? "rose.6"
                    : "terracota.4"
                }
                radius="xl"
                size="sm"
              >
                {gasto_vs_perfil.status_limite === "estourado" ? (
                  <IconAlertCircle size={12} />
                ) : (
                  <IconCheck size={12} />
                )}
              </ThemeIcon>
            </Group>
            <Text
              size="lg"
              fw={800}
              c={
                gasto_vs_perfil.status_limite === "estourado"
                  ? "rose.7"
                  : "terracota.7"
              }
              mt="xs"
            >
              {gasto_vs_perfil.texto_exemplo}
            </Text>
            <Text size="xs" c="dimmed" mt={2}>
              Contratado:{" "}
              {formatMoney(Number(progresso_total.valor_contratado))}
            </Text>
            <Progress
              value={Number(gasto_vs_perfil.percentual_consumido)}
              color={
                gasto_vs_perfil.status_limite === "estourado"
                  ? "rose.6"
                  : "terracota.5"
              }
              size="xs"
              radius="xl"
              mt="sm"
            />
          </Card>
        </Grid.Col>

        {/* CARD 3: Previsão de Caixa Mensal */}
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Card
            withBorder
            radius="md"
            padding="md"
            bg="beige.0"
            style={{ height: "100%" }}
          >
            <Text size="xs" fw={700} c="beige.7" tt="uppercase" lts="0.5px">
              {previsao_caixa.titulo}
            </Text>
            <Group justify="space-between" align="flex-end" mt="xs">
              <Box style={{ flex: 1 }}>
                <Text size="lg" fw={800} c="champanhe.7">
                  {formatMoney(
                    previsao_caixa.fluxo_futuro[0]?.total_a_pagar || 0,
                  )}
                </Text>
                <Text size="10px" c="dimmed" lh="1.2" mt={4}>
                  Compromisso pendente para o mês atual.
                </Text>
              </Box>
              {chartBarData.length > 0 && (
                <Box w={80} style={{ height: 50 }}>
                  <BarChart
                    h={50}
                    data={chartBarData}
                    dataKey="month"
                    series={[{ name: "A Pagar", color: "champanhe.4" }]}
                    withXAxis={false}
                    withYAxis={false}
                    gridAxis="none"
                    barProps={{ radius: [3, 3, 0, 0] }}
                  />
                </Box>
              )}
            </Group>
          </Card>
        </Grid.Col>

        {/* CARD 4: Distribuição Dinâmica por Categorias */}
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Card
            withBorder
            radius="md"
            padding="md"
            bg="beige.0"
            style={{ height: "100%" }}
          >
            <Group justify="space-between" mb="xs">
              <Text size="xs" fw={700} c="beige.7" tt="uppercase" lts="0.5px">
                Concentração de Gastos
              </Text>
              <IconChartPie
                size={14}
                style={{ color: "var(--mantine-color-beige-6)" }}
              />
            </Group>

            <Box mt="xs">
              {distribuicao_categorias.length === 0 ? (
                <Text size="xs" c="dimmed" fontStyle="italic">
                  Nenhum fornecedor contratado.
                </Text>
              ) : (
                distribuicao_categorias.map((item, idx) => (
                  <Box key={idx} mb={5}>
                    <Group justify="space-between" gap={0}>
                      <Text
                        size="10px"
                        fw={600}
                        style={{ maxWidth: "75%" }}
                        truncate
                      >
                        {item.categoria}
                      </Text>
                      <Text size="10px" fw={700} c="dimmed">
                        {item.percentual}%
                      </Text>
                    </Group>
                    <Progress
                      value={Number(item.percentual)}
                      color={
                        paletaCoresCategorias[
                          idx % paletaCoresCategorias.length
                        ]
                      }
                      size={3}
                      radius="xl"
                    />
                  </Box>
                ))
              )}
            </Box>
          </Card>
        </Grid.Col>
      </Grid>
    </Box>
  );
}

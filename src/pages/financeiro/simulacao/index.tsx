import BaseLayout from "@/components/Layout/_BaseLayout";
import { useAuth } from "@/contexts/AuthContext";
import {
  calculateWeddingSimulation,
  SimulationInputs,
} from "@/lib/simulationUtils";
import { updateWeddingProfile } from "@/services/weddingProfile";
import { inputStyles, primaryButtonStyles, softButtonStyles } from "@/styles";
import {
  Box,
  Button,
  Card,
  Center,
  Container,
  Group,
  Loader,
  Modal,
  NumberInput,
  Progress,
  RingProgress,
  Select,
  SimpleGrid,
  Stack,
  Stepper,
  Text,
  TextInput,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { DatePickerInput, DatesProvider } from "@mantine/dates";
import { useMediaQuery } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IconArrowLeft,
  IconArrowRight,
  IconCamera,
  IconCheck,
  IconCoin,
  IconGlassFull,
  IconHeart,
  IconMapPin,
  IconMusic,
  IconRefresh,
  IconSparkles,
  IconTools,
  IconTrendingUp,
  IconUsers,
} from "@tabler/icons-react";
import { AnimatePresence, motion } from "framer-motion";
import { NextPage } from "next";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

// Definição da paleta visual interna do projeto Marriplan
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

const STEPS_META = [
  { label: "Perfil", desc: "Dados base" },
  { label: "Local", desc: "Região" },
  { label: "Nível", desc: "Sofisticação" },
  { label: "Estrutura", desc: "Escopo" },
  { label: "Menu", desc: "Alimentação" },
  { label: "Atração", desc: "Música" },
  { label: "Mídia", desc: "Registro" },
  { label: "Foco", desc: "Prioridades" },
  { label: "Finanças", desc: "Aporte" },
];

const PROCESSING_MESSAGES = [
  "Analisando perfil do casamento...",
  "Calculando custos médios por região...",
  "Comparando cenários de mercado...",
  "Estimando orçamento e taxas de segurança...",
  "Gerando recomendações personalizadas...",
];

const WeddingCostSimulationPage: NextPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Estados de Controle de Fluxo
  const [activeStep, setActiveStep] = useState(0);
  const [hasExistingSimulation, setHasExistingSimulation] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMsgIdx, setProcessingMsgIdx] = useState(0);
  const [confirmResetModal, setConfirmResetModal] = useState(false);

  // Estado Central do Formulário da Consultoria
  const [formInputs, setFormInputs] = useState<SimulationInputs>({
    guestsCount: 100,
    weddingDate: "",
    style: "",
    dressCode: "",
    locationType: "capital",
    state: "PB",
    city: "Campina Grande",
    eventLevel: "intermediate",
    structure: ["recepcao", "festa"],
    foodType: "buffet",
    entertainment: "dj",
    media: "photo_video",
    priorities: [],
    budgetTier: "30k",
    monthlySaving: 1500,
  });

  // 1. Carregamento inicial de dados existentes
  useEffect(() => {
    if (user?.wedding_profile) {
      const profile = user.wedding_profile;

      // Mapeia dados básicos se já existirem no perfil para poupar digitação
      setFormInputs((prev) => ({
        ...prev,
        guestsCount: profile.quantidade_convidados || prev.guestsCount || 100,
        weddingDate: profile.data_casamento || prev.weddingDate || "",
        style: profile.estilo || prev.style || "",
        dressCode: profile.dress_code || prev.dressCode || "",
      }));

      // Se já existe uma simulação gravada no backend
      if (profile.simulation) {
        setHasExistingSimulation(true);
      }
    }
  }, [user]);

  // 2. Loop de mensagens da tela de processamento animada
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isProcessing) {
      interval = setInterval(() => {
        setProcessingMsgIdx((prev) => (prev + 1) % PROCESSING_MESSAGES.length);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isProcessing]);

  // Validação estrita por etapa
  const validateCurrentStep = (): boolean => {
    switch (activeStep) {
      case 0:
        if (!formInputs.weddingDate) {
          notifications.show({
            color: "red",
            title: "Atenção",
            message: "A data do casamento é obrigatória.",
          });
          return false;
        }
        if (formInputs.guestsCount < 10 || formInputs.guestsCount > 1000) {
          notifications.show({
            color: "red",
            title: "Atenção",
            message: "O número de convidados deve ser entre 10 e 1000.",
          });
          return false;
        }
        return true;
      case 1:
        if (!formInputs.state || !formInputs.city) {
          notifications.show({
            color: "red",
            title: "Atenção",
            message: "Selecione o Estado e a Cidade do evento.",
          });
          return false;
        }
        return true;
      case 3:
        if (formInputs.structure.length === 0) {
          notifications.show({
            color: "red",
            title: "Atenção",
            message: "Selecione pelo menos uma opção da estrutura do evento.",
          });
          return false;
        }
        return true;
      case 7:
        if (
          formInputs.priorities.length === 0 ||
          formInputs.priorities.length > 3
        ) {
          notifications.show({
            color: "red",
            title: "Atenção",
            message: "Selecione entre 1 e 3 prioridades essenciais.",
          });
          return false;
        }
        return true;
      case 8:
        if (formInputs.monthlySaving <= 0) {
          notifications.show({
            color: "red",
            title: "Atenção",
            message:
              "A capacidade de reserva financeira mensal precisa ser maior que zero.",
          });
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(0, prev - 1));
  };

  // Processamento e Salvamento via PATCH
  const handleGenerateSimulation = async () => {
    if (!validateCurrentStep()) return;

    setIsProcessing(true);

    // Calcula os cenários e projeções financeiras no motor de regras
    const simulationPayload = calculateWeddingSimulation(formInputs);

    // Garante a experiência emocional retendo a tela de processamento por 4 segundos
    setTimeout(async () => {
      try {
        // Envio do payload completo para persistência no banco do perfil de casamento
        // Utilizando o core service do ecossistema do app
        await updateWeddingProfile({
          simulation: simulationPayload,
        });

        notifications.show({
          color: "green",
          title: "Simulação Concluída!",
          message:
            "Seu relatório de custos personalizado foi gerado com sucesso.",
        });

        router.push("/financeiro/simulacao/resultado");
      } catch (err) {
        notifications.show({
          color: "red",
          title: "Erro ao salvar",
          message:
            "Não foi possível registrar os dados da simulação no momento.",
        });
        setIsProcessing(false);
      }
    }, 8000);
  };

  const togglePriority = (id: string) => {
    setFormInputs((prev) => {
      const current = [...prev.priorities];
      if (current.includes(id)) {
        return { ...prev, priorities: current.filter((p) => p !== id) };
      }
      if (current.length >= 3) return prev; // Bloqueia acima de 3 escolhas
      return { ...prev, priorities: [...current, id] };
    });
  };

  // Se já houver dados salvos anteriormente, exibe Dashboard Informativo de entrada
  if (hasExistingSimulation && activeStep === 0 && !isProcessing) {
    const savedSim = user?.wedding_profile?.simulation;
    return (
      <BaseLayout>
        <Container size="md" py="xl">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card
              radius="xl"
              p="xl"
              style={{
                border: `1px solid ${PALETTE.line}`,
                background: PALETTE.softWhite,
              }}
              ta="center"
            >
              <ThemeIcon
                variant="light"
                size={60}
                radius="xl"
                color="teal"
                mx="auto"
              >
                <IconCheck size={32} />
              </ThemeIcon>
              <Title order={2} c={PALETTE.ink} mt="md">
                Simulação de Custos Ativa
              </Title>
              <Text
                c={PALETTE.warmGray}
                size="sm"
                mt="xs"
                max-width={500}
                mx="auto"
              >
                Identificamos que você possui uma consultoria financeira
                personalizada gravada em seu perfil.
              </Text>

              <SimpleGrid cols={{ base: 1, sm: 2 }} mt="xl" spacing="md">
                <Card
                  radius="lg"
                  p="md"
                  style={{ background: PALETTE.champagne }}
                >
                  <Text size="xs" c={PALETTE.warmGray} fw={600} tt="uppercase">
                    Último Cálculo
                  </Text>
                  <Text size="lg" fw={700} c={PALETTE.ink} mt={4}>
                    {savedSim?.generatedAt || "Recente"}
                  </Text>
                </Card>
                <Card
                  radius="lg"
                  p="md"
                  style={{ background: PALETTE.champagne }}
                >
                  <Text size="xs" c={PALETTE.warmGray} fw={600} tt="uppercase">
                    Cenário Recomendado
                  </Text>
                  <Text size="lg" fw={700} c={PALETTE.marriplanRose} mt={4}>
                    R${" "}
                    {Number(
                      savedSim?.scenarios?.target?.totalEstimated || 0,
                    ).toLocaleString("pt-BR")}
                  </Text>
                </Card>
              </SimpleGrid>

              <Group justify="center" mt="xl" gap="md">
                <Button
                  styles={softButtonStyles}
                  leftSection={<IconRefresh size={18} />}
                  onClick={() => setConfirmResetModal(true)}
                >
                  Refazer Simulação
                </Button>
                <Button
                  styles={primaryButtonStyles}
                  rightSection={<IconArrowRight size={18} />}
                  onClick={() => router.push("/financeiro/simulacao/resultado")}
                >
                  Ver Resultado
                </Button>
              </Group>
            </Card>
          </motion.div>

          <Modal
            opened={confirmResetModal}
            onClose={() => setConfirmResetModal(false)}
            title="Refazer Simulação?"
            centered
            radius="lg"
          >
            <Text size="sm" c={PALETTE.ink}>
              Uma nova simulação substituirá integralmente os resultados
              anteriores. Deseja continuar com a nova consultoria?
            </Text>
            <Group justify="flex-end" mt="xl" gap="sm">
              <Button
                variant="default"
                onClick={() => setConfirmResetModal(false)}
              >
                Cancelar
              </Button>
              <Button
                color="red"
                onClick={() => {
                  setHasExistingSimulation(false);
                  setConfirmResetModal(false);
                }}
              >
                Continuar
              </Button>
            </Group>
          </Modal>
        </Container>
      </BaseLayout>
    );
  }

  // Intermediário: Tela de Processamento e Análise de Dados
  if (isProcessing) {
    return (
      <BaseLayout>
        <Container size="sm" py={100}>
          <Center>
            <Stack
              align="center"
              gap="xl"
              ta="center"
              style={{ width: "100%" }}
            >
              <Box position="relative">
                <RingProgress
                  size={140}
                  thickness={4}
                  sections={[{ value: 100, color: PALETTE.roseGold }]}
                  label={
                    <Center>
                      <Loader
                        size="md"
                        color="var(--marriplan-rose)"
                        type="dots"
                      />
                    </Center>
                  }
                />
              </Box>
              <AnimatePresence mode="wait">
                <motion.div
                  key={processingMsgIdx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <Title order={3} c={PALETTE.ink} style={{ fontWeight: 500 }}>
                    {PROCESSING_MESSAGES[processingMsgIdx]}
                  </Title>
                </motion.div>
              </AnimatePresence>
              <Text c={PALETTE.warmGray} size="sm" max-width={400}>
                Nossa IA está cruzando os dados estruturais fornecidos com a
                média de custos do mercado de casamentos para a sua região.
              </Text>
            </Stack>
          </Center>
        </Container>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout>
      <Container size="lg" py="md">
        {/* HERO SECTION INICIAL */}
        {activeStep === 0 && (
          <Box mb="xl" ta="center">
            <Title
              order={1}
              c={PALETTE.ink}
              style={{ fontWeight: 600 }}
              lh={1.2}
            >
              Descubra quanto custará o casamento dos seus sonhos
            </Title>
            <Text
              c={PALETTE.warmGray}
              size="md"
              max-width={600}
              mx="auto"
              mt="sm"
            >
              Responda a este questionário interativo e simule o investimento
              completo com base nas especificações do seu grande dia.
            </Text>

            <SimpleGrid cols={{ base: 2, md: 4 }} mt="xl" spacing="md">
              {[
                {
                  icon: IconSparkles,
                  title: "Consultoria Intuitiva",
                  desc: "Sem formulários cansativos",
                },
                {
                  icon: IconTrendingUp,
                  title: "Cenários Inteligentes",
                  desc: "Otimizado por metas",
                },
                {
                  icon: IconCoin,
                  title: "Análise de Aporte",
                  desc: "Viabilidade mensal",
                },
                {
                  icon: IconCheck,
                  title: "Resultado Imediato",
                  desc: "Relatório de categorias",
                },
              ].map((item, index) => (
                <Card
                  key={index}
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
                    mx="auto"
                  >
                    <item.icon size={20} />
                  </ThemeIcon>
                  <Text fw={600} size="sm" c={PALETTE.ink} mt="sm">
                    {item.title}
                  </Text>
                  <Text size="xs" c={PALETTE.warmGray}>
                    {item.desc}
                  </Text>
                </Card>
              ))}
            </SimpleGrid>
          </Box>
        )}

        {/* METADADOS DO PROGRESSO */}
        <Card
          radius="xl"
          p="lg"
          mb="xl"
          style={{
            border: `1px solid ${PALETTE.line}`,
            background: PALETTE.softWhite,
          }}
        >
          <Group justify="space-between" mb="xs">
            <Text size="xs" c={PALETTE.warmGray} fw={600}>
              Etapa {activeStep + 1} de 10 —{" "}
              {STEPS_META[activeStep]?.label || "Resumo"}
            </Text>
            <Text size="xs" c={PALETTE.warmGray}>
              Faltam aprox. {Math.max(1, Math.ceil((9 - activeStep) * 0.5))} min
            </Text>
          </Group>
          <Progress
            value={((activeStep + 1) / 10) * 100}
            color="var(--marriplan-rose)"
            radius="xl"
            animated
          />

          {!isMobile && (
            <Box mt="lg">
              <Stepper
                active={activeStep}
                size="xs"
                color="var(--marriplan-rose)"
              >
                {STEPS_META.map((step, idx) => (
                  <Stepper.Step
                    key={idx}
                    label={step.label}
                    description={step.desc}
                  />
                ))}
                <Stepper.Completed label="Concluído" description="Dashboard" />
              </Stepper>
            </Box>
          )}
        </Card>

        {/* COMPONENTE DE TRANSIÇÃO DA ETAPA ATUAL */}
        <Box minHeight={340} mb="xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.25 }}
            >
              {/* ETAPA 1: DADOS GERAIS */}
              {activeStep === 0 && (
                <Stack gap="md">
                  <Title order={3} c={PALETTE.ink}>
                    Configurações de Perfil do Evento
                  </Title>
                  <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    <NumberInput
                      label="Quantidade de Convidados"
                      placeholder="Ex: 150"
                      value={formInputs.guestsCount}
                      onChange={(val) =>
                        setFormInputs((prev) => ({
                          ...prev,
                          guestsCount: Number(val),
                        }))
                      }
                      min={10}
                      max={1000}
                      styles={inputStyles}
                      required
                    />
                    <DatesProvider settings={{ locale: "pt-br" }}>
                      <DatePickerInput
                        label="Data Pretendida"
                        value={formInputs.weddingDate}
                        onChange={(e) =>
                          setFormInputs((prev) => ({ ...prev, weddingDate: e }))
                        }
                        styles={inputStyles}
                        required
                        valueFormat="DD/MM/YYYY"
                      />
                    </DatesProvider>
                    <TextInput
                      label="Estilo (Opcional)"
                      placeholder="Ex: Rústico Chic, Clássico"
                      value={formInputs.style}
                      onChange={(e) =>
                        setFormInputs((prev) => ({
                          ...prev,
                          style: e.target.value,
                        }))
                      }
                      styles={inputStyles}
                    />
                    <TextInput
                      label="Dress Code (Opcional)"
                      placeholder="Ex: Esporte Fino, Black Tie"
                      value={formInputs.dressCode}
                      onChange={(e) =>
                        setFormInputs((prev) => ({
                          ...prev,
                          dressCode: e.target.value,
                        }))
                      }
                      styles={inputStyles}
                    />
                  </SimpleGrid>
                </Stack>
              )}

              {/* ETAPA 2: LOCALIZAÇÃO */}
              {activeStep === 1 && (
                <Stack gap="md">
                  <Title order={3} c={PALETTE.ink}>
                    Onde acontecerá este momento único?
                  </Title>
                  <SimpleGrid cols={{ base: 2, sm: 5 }} spacing="sm">
                    {[
                      { id: "capital", label: "Capital" },
                      { id: "interior", label: "Interior" },
                      { id: "praia", label: "Praia" },
                      { id: "campo", label: "Campo" },
                      { id: "serra", label: "Serra" },
                    ].map((type) => (
                      <Card
                        key={type.id}
                        radius="lg"
                        p="md"
                        ta="center"
                        style={{
                          cursor: "pointer",
                          border: `1px solid ${
                            formInputs.locationType === type.id
                              ? PALETTE.marriplanRose
                              : PALETTE.line
                          }`,
                          background:
                            formInputs.locationType === type.id
                              ? PALETTE.champagne
                              : "#fff",
                        }}
                        onClick={() =>
                          setFormInputs((prev) => ({
                            ...prev,
                            locationType: type.id as any,
                          }))
                        }
                      >
                        <IconMapPin
                          size={24}
                          color={
                            formInputs.locationType === type.id
                              ? PALETTE.marriplanRose
                              : PALETTE.warmGray
                          }
                          style={{ margin: "0 auto" }}
                        />
                        <Text size="sm" fw={500} mt="xs" c={PALETTE.ink}>
                          {type.label}
                        </Text>
                      </Card>
                    ))}
                  </SimpleGrid>
                  <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mt="sm">
                    <Select
                      label="Estado"
                      data={["PB", "PE", "RN", "SP", "RJ", "MG"]}
                      value={formInputs.state}
                      onChange={(val) =>
                        setFormInputs((prev) => ({ ...prev, state: val || "" }))
                      }
                      styles={inputStyles}
                      required
                    />
                    <TextInput
                      label="Cidade"
                      placeholder="Nome da cidade"
                      value={formInputs.city}
                      onChange={(e) =>
                        setFormInputs((prev) => ({
                          ...prev,
                          city: e.target.value,
                        }))
                      }
                      styles={inputStyles}
                      required
                    />
                  </SimpleGrid>
                </Stack>
              )}

              {/* ETAPA 3: NÍVEL DO EVENTO */}
              {activeStep === 2 && (
                <Stack gap="md">
                  <Title order={3} c={PALETTE.ink}>
                    Como vocês imaginam o nível de sofisticação do evento?
                  </Title>
                  <SimpleGrid cols={{ base: 1, sm: 4 }} spacing="md">
                    {[
                      {
                        id: "economic",
                        title: "Econômico",
                        desc: "Elegante, focado no essencial e consciente.",
                      },
                      {
                        id: "intermediate",
                        title: "Intermediário",
                        desc: "Equilibrado, unindo charme com bom custo-benefício.",
                      },
                      {
                        id: "premium",
                        title: "Premium",
                        desc: "Experiência diferenciada, fornecedores renomados.",
                      },
                      {
                        id: "luxury",
                        title: "Luxo",
                        desc: "Experiência máxima sem limitações de escopo.",
                      },
                    ].map((level) => (
                      <Card
                        key={level.id}
                        radius="xl"
                        p="lg"
                        style={{
                          cursor: "pointer",
                          border: `1px solid ${
                            formInputs.eventLevel === level.id
                              ? PALETTE.marriplanRose
                              : PALETTE.line
                          }`,
                          background:
                            formInputs.eventLevel === level.id
                              ? PALETTE.champagne
                              : "#fff",
                        }}
                        onClick={() =>
                          setFormInputs((prev) => ({
                            ...prev,
                            eventLevel: level.id as any,
                          }))
                        }
                      >
                        <Text fw={600} c={PALETTE.ink}>
                          {level.title}
                        </Text>
                        <Text size="xs" c={PALETTE.warmGray} mt="xs">
                          {level.desc}
                        </Text>
                      </Card>
                    ))}
                  </SimpleGrid>
                </Stack>
              )}

              {/* ETAPA 4: ESTRUTURA DO EVENTO */}
              {activeStep === 3 && (
                <Stack gap="md">
                  <Title order={3} c={PALETTE.ink}>
                    Qual será a estrutura e rituais inclusos?
                  </Title>
                  <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
                    {[
                      {
                        id: "cerimonia_religiosa",
                        label: "Cerimônia Religiosa",
                        icon: IconHeart,
                      },
                      {
                        id: "cerimonia_ar_livre",
                        label: "Cerimônia ao Ar Livre",
                        icon: IconSparkles,
                      },
                      {
                        id: "recepcao",
                        label: "Recepção de Convidados",
                        icon: IconUsers,
                      },
                      {
                        id: "festa",
                        label: "Festa Longa com Pista",
                        icon: IconMusic,
                      },
                      {
                        id: "open_bar",
                        label: "Serviço de Open Bar",
                        icon: IconGlassFull,
                      },
                    ].map((item) => {
                      const isSelected = formInputs.structure.includes(item.id);
                      return (
                        <Card
                          key={item.id}
                          radius="lg"
                          p="md"
                          style={{
                            cursor: "pointer",
                            border: `1px solid ${
                              isSelected ? PALETTE.marriplanRose : PALETTE.line
                            }`,
                            background: isSelected ? PALETTE.champagne : "#fff",
                          }}
                          onClick={() =>
                            setFormInputs((prev) => {
                              const struct = prev.structure.includes(item.id)
                                ? prev.structure.filter((x) => x !== item.id)
                                : [...prev.structure, item.id];
                              return { ...prev, structure: struct };
                            })
                          }
                        >
                          <Group gap="sm">
                            <item.icon
                              size={20}
                              color={
                                isSelected
                                  ? PALETTE.marriplanRose
                                  : PALETTE.warmGray
                              }
                            />
                            <Text size="sm" fw={500} c={PALETTE.ink}>
                              {item.label}
                            </Text>
                          </Group>
                        </Card>
                      );
                    })}
                  </SimpleGrid>
                </Stack>
              )}

              {/* ETAPA 5: ALIMENTAÇÃO */}
              {activeStep === 4 && (
                <Stack gap="md">
                  <Title order={3} c={PALETTE.ink}>
                    Qual estilo de buffet mais agrada vocês?
                  </Title>
                  <SimpleGrid cols={{ base: 1, sm: 5 }} spacing="sm">
                    {[
                      {
                        id: "coquetel",
                        label: "Coquetel Finger Food",
                        desc: "Dinâmico e moderno",
                      },
                      {
                        id: "jantar",
                        label: "Jantar À La Carte",
                        desc: "Clássico e requintado",
                      },
                      {
                        id: "churrasco",
                        label: "Churrasco Premium",
                        desc: "Descontraído e farto",
                      },
                      {
                        id: "buffet",
                        label: "Buffet Completo",
                        desc: "Variedade auto-serviço",
                      },
                      {
                        id: "ilhas",
                        label: "Ilhas Gastronômicas",
                        desc: "Estações temáticas vivas",
                      },
                    ].map((food) => (
                      <Card
                        key={food.id}
                        radius="lg"
                        p="md"
                        style={{
                          cursor: "pointer",
                          border: `1px solid ${
                            formInputs.foodType === food.id
                              ? PALETTE.marriplanRose
                              : PALETTE.line
                          }`,
                          background:
                            formInputs.foodType === food.id
                              ? PALETTE.champagne
                              : "#fff",
                        }}
                        onClick={() =>
                          setFormInputs((prev) => ({
                            ...prev,
                            foodType: food.id as any,
                          }))
                        }
                      >
                        <Text size="sm" fw={600} c={PALETTE.ink}>
                          {food.label}
                        </Text>
                        <Text size="xs" c={PALETTE.warmGray} mt={4}>
                          {food.desc}
                        </Text>
                      </Card>
                    ))}
                  </SimpleGrid>
                </Stack>
              )}

              {/* ETAPA 6: MÚSICA & ENTRETENIMENTO */}
              {activeStep === 5 && (
                <Stack gap="md">
                  <Title order={3} c={PALETTE.ink}>
                    Como imaginam a trilha sonora da comemoração?
                  </Title>
                  <SimpleGrid cols={{ base: 1, sm: 4 }} spacing="md">
                    {[
                      {
                        id: "playlist",
                        label: "Playlist Controlada",
                        desc: "Discreto e intimista.",
                      },
                      {
                        id: "dj",
                        label: "DJ Profissional",
                        desc: "Pista cheia e hits contínuos.",
                      },
                      {
                        id: "banda",
                        label: "Banda Exclusiva",
                        desc: "Performance ao vivo impactante.",
                      },
                      {
                        id: "banda_dj",
                        label: "Banda + DJ",
                        desc: "Experiência completa sem pausas.",
                      },
                    ].map((item) => (
                      <Card
                        key={item.id}
                        radius="xl"
                        p="lg"
                        style={{
                          cursor: "pointer",
                          border: `1px solid ${
                            formInputs.entertainment === item.id
                              ? PALETTE.marriplanRose
                              : PALETTE.line
                          }`,
                          background:
                            formInputs.entertainment === item.id
                              ? PALETTE.champagne
                              : "#fff",
                        }}
                        onClick={() =>
                          setFormInputs((prev) => ({
                            ...prev,
                            entertainment: item.id as any,
                          }))
                        }
                      >
                        <Text fw={600} c={PALETTE.ink}>
                          {item.label}
                        </Text>
                        <Text size="xs" c={PALETTE.warmGray} mt="xs">
                          {item.desc}
                        </Text>
                      </Card>
                    ))}
                  </SimpleGrid>
                </Stack>
              )}

              {/* ETAPA 7: COBERTURA AUDIOVISUAL */}
              {activeStep === 6 && (
                <Stack gap="md">
                  <Title order={3} c={PALETTE.ink}>
                    Qual o nível de registro audiovisual desejado?
                  </Title>
                  <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
                    {[
                      {
                        id: "photo",
                        label: "Apenas Fotografia",
                        badge: "Econômico",
                      },
                      {
                        id: "photo_video",
                        label: "Foto + Filme Cinematográfico",
                        badge: "Popular",
                      },
                      {
                        id: "photo_video_drone",
                        label: "Foto + Filme + Cobertura Drone",
                        badge: "Mais Completo",
                      },
                    ].map((item) => (
                      <Card
                        key={item.id}
                        radius="xl"
                        p="lg"
                        style={{
                          cursor: "pointer",
                          border: `1px solid ${
                            formInputs.media === item.id
                              ? PALETTE.marriplanRose
                              : PALETTE.line
                          }`,
                          background:
                            formInputs.media === item.id
                              ? PALETTE.champagne
                              : "#fff",
                        }}
                        onClick={() =>
                          setFormInputs((prev) => ({
                            ...prev,
                            media: item.id as any,
                          }))
                        }
                      >
                        <Group justify="space-between">
                          <Text fw={600} c={PALETTE.ink}>
                            {item.label}
                          </Text>
                          <Text size="xs" fw={700} c={PALETTE.marriplanRose}>
                            {item.badge}
                          </Text>
                        </Group>
                      </Card>
                    ))}
                  </SimpleGrid>
                </Stack>
              )}

              {/* ETAPA 8: PRIORIDADES DO CASAL */}
              {activeStep === 7 && (
                <Stack gap="md">
                  <Box>
                    <Title order={3} c={PALETTE.ink}>
                      O que realmente importa para vocês?
                    </Title>
                    <Text size="xs" c={PALETTE.warmGray} mt={2}>
                      Selecione até 3 itens prioritários onde o investimento
                      deve ser cirúrgico ({formInputs.priorities.length} de 3
                      selecionados).
                    </Text>
                  </Box>
                  <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
                    {[
                      {
                        id: "gastronomia",
                        label: "Gastronomia",
                        icon: IconGlassFull,
                      },
                      { id: "decora", label: "Decoração", icon: IconSparkles },
                      { id: "musica", label: "Música & Show", icon: IconMusic },
                      {
                        id: "registro",
                        label: "Foto & Filme",
                        icon: IconCamera,
                      },
                      { id: "infra", label: "Espaço Física", icon: IconMapPin },
                      {
                        id: "look",
                        label: "Trajes & Vestido",
                        icon: IconHeart,
                      },
                      { id: "producao", label: "Cerimonial", icon: IconTools },
                      {
                        id: "experiencia",
                        label: "Mimos Convidados",
                        icon: IconUsers,
                      },
                    ].map((prio) => {
                      const isSelected = formInputs.priorities.includes(
                        prio.id,
                      );
                      return (
                        <Card
                          key={prio.id}
                          radius="lg"
                          p="md"
                          style={{
                            cursor: "pointer",
                            border: `1px solid ${
                              isSelected ? PALETTE.marriplanRose : PALETTE.line
                            }`,
                            background: isSelected ? PALETTE.champagne : "#fff",
                            opacity:
                              !isSelected && formInputs.priorities.length >= 3
                                ? 0.5
                                : 1,
                          }}
                          onClick={() => togglePriority(prio.id)}
                        >
                          <Group gap="xs">
                            <prio.icon
                              size={18}
                              color={
                                isSelected
                                  ? PALETTE.marriplanRose
                                  : PALETTE.warmGray
                              }
                            />
                            <Text size="sm" fw={500} c={PALETTE.ink}>
                              {prio.label}
                            </Text>
                          </Group>
                        </Card>
                      );
                    })}
                  </SimpleGrid>
                </Stack>
              )}

              {/* ETAPA 9: FINANCEIRO */}
              {activeStep === 8 && (
                <Stack gap="md">
                  <Title order={3} c={PALETTE.ink}>
                    Planejamento e Margem Financeira Atual
                  </Title>
                  <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    <Select
                      label="Faixa de Orçamento Imaginada"
                      data={[
                        { value: "15k", label: "Até R$ 15 mil" },
                        { value: "30k", label: "Até R$ 30 mil" },
                        { value: "50k", label: "Até R$ 50 mil" },
                        { value: "80k", label: "Até R$ 80 mil" },
                        { value: "plus", label: "Acima de R$ 80 mil" },
                      ]}
                      value={formInputs.budgetTier}
                      onChange={(val) =>
                        setFormInputs((prev) => ({
                          ...prev,
                          budgetTier: val || "30k",
                        }))
                      }
                      styles={inputStyles}
                    />
                    <NumberInput
                      label="Quanto conseguem guardar por mês para o evento?"
                      placeholder="Ex: 2000"
                      value={formInputs.monthlySaving}
                      onChange={(val) =>
                        setFormInputs((prev) => ({
                          ...prev,
                          monthlySaving: Number(val),
                        }))
                      }
                      min={1}
                      styles={inputStyles}
                      required
                    />
                  </SimpleGrid>
                </Stack>
              )}

              {/* ETAPA 10: DASHBOARD DE REVISÃO E RESUMO */}
              {activeStep === 9 && (
                <Stack gap="md">
                  <Box>
                    <Title order={3} c={PALETTE.ink}>
                      Revisão Final dos Dados Coletados
                    </Title>
                    <Text size="xs" c={PALETTE.warmGray}>
                      Confira as premissas antes de rodar o motor de
                      inteligência financeira.
                    </Text>
                  </Box>
                  <Card
                    radius="xl"
                    p="md"
                    style={{
                      border: `1px solid ${PALETTE.line}`,
                      background: PALETTE.softWhite,
                    }}
                  >
                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                      <Text size="sm" c={PALETTE.ink}>
                        <b>Convidados:</b> {formInputs.guestsCount}
                      </Text>
                      <Text size="sm" c={PALETTE.ink}>
                        <b>Data Prevista:</b>{" "}
                        {new Date(
                          formInputs.weddingDate + "T00:00:00",
                        ).toLocaleDateString("pt-BR")}
                      </Text>
                      <Text size="sm" c={PALETTE.ink}>
                        <b>Localidade:</b> {formInputs.city} -{" "}
                        {formInputs.state} ({formInputs.locationType})
                      </Text>
                      <Text size="sm" c={PALETTE.ink}>
                        <b>Nível do Casamento:</b>{" "}
                        {formInputs.eventLevel.toUpperCase()}
                      </Text>
                      <Text size="sm" c={PALETTE.ink}>
                        <b>Cardápio Escolhido:</b>{" "}
                        {formInputs.foodType.toUpperCase()}
                      </Text>
                      <Text size="sm" c={PALETTE.ink}>
                        <b>Atração Musical:</b>{" "}
                        {formInputs.entertainment.toUpperCase()}
                      </Text>
                      <Text size="sm" c={PALETTE.ink}>
                        <b>Prioridades Fixadas:</b>{" "}
                        {formInputs.priorities.join(", ")}
                      </Text>
                      <Text size="sm" c={PALETTE.ink}>
                        <b>Aporte Mensal Declarado:</b> R${" "}
                        {formInputs.monthlySaving}
                      </Text>
                    </SimpleGrid>
                  </Card>
                </Stack>
              )}
            </motion.div>
          </AnimatePresence>
        </Box>

        {/* CONTROLES DE NAVEGAÇÃO */}
        <Group
          justify="space-between"
          pt="md"
          mb="xl"
          style={{ borderTop: `1px solid ${PALETTE.line}` }}
        >
          <Button
            styles={softButtonStyles}
            leftSection={<IconLeftSection size={18} />}
            onClick={handleBack}
            disabled={activeStep === 0}
          >
            Voltar
          </Button>

          {activeStep < 9 ? (
            <Button
              styles={primaryButtonStyles}
              rightSection={<IconArrowRight size={18} />}
              onClick={handleNext}
            >
              Avançar
            </Button>
          ) : (
            <Button
              color="var(--marriplan-rose)"
              size="md"
              radius="xl"
              rightSection={<IconSparkles size={18} />}
              onClick={handleGenerateSimulation}
              style={{ fontWeight: 600 }}
            >
              Gerar Simulação
            </Button>
          )}
        </Group>
      </Container>
    </BaseLayout>
  );
};

// Componente utilitário interno de ícone dinâmico
const IconLeftSection: React.FC<{ size: number }> = ({ size }) => (
  <IconArrowLeft size={size} />
);

export default WeddingCostSimulationPage;

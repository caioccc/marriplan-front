import BaseLayout from "@/components/Layout/_BaseLayout";
import PageSectionHeader from "@/components/PageSectionHeader";
import EmptyState from "@/components/wedding/identity/EmptyState";
import DressCodePage from "@/components/wedding/identity/pages/DressCodePage";
import PalettePage from "@/components/wedding/identity/pages/PalettePage";
import WeddingSizePage from "@/components/wedding/identity/pages/WeddingSizePage";
import WeddingStylePage from "@/components/wedding/identity/pages/WeddingStylePage";
import {
  DRESS_CODE_OPTIONS,
  DRESS_CODE_REFERENCE_IMAGES,
  STYLE_IMAGE_MAP,
  WEDDING_SIZES,
  WEDDING_STYLES,
} from "@/constants/weddingIdentityData";
import { useWeddingIdentityState } from "@/hooks/useWeddingIdentityState";
import { primaryButtonStyles } from "@/styles";
import {
  ActionIcon,
  Box,
  Button,
  Card,
  CardSection,
  Grid,
  Group,
  Image,
  Modal,
  SimpleGrid,
  Stack,
  Stepper,
  Text,
  Tooltip,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import {
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconDownload,
  IconEdit,
  IconShare,
} from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";

export default function OverviewPage() {
  const {
    activePage,
    setActivePage,
    palette,
    setPalette,
    selectedStyle,
    setSelectedStyle,
    weddingSize,
    setWeddingSize,
    dressCode,
    setDressCode,
    hasIdentity,
  } = useWeddingIdentityState();

  const [isIdentityModalOpen, setIsIdentityModalOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (activePage !== "moodboard") {
      setActivePage("moodboard");
    }
  }, [activePage, setActivePage]);

  const styleData = WEDDING_STYLES.find((s) => s.id === selectedStyle);
  const sizeData = WEDDING_SIZES.find((size) => size.id === weddingSize);
  const dressData = DRESS_CODE_OPTIONS.find((d) => d.id === dressCode);

  const styleImage =
    STYLE_IMAGE_MAP[selectedStyle] ||
    "https://via.placeholder.com/600x400?text=Estilo+Nao+Definido";
  const dressesImage = dressCode
    ? DRESS_CODE_REFERENCE_IMAGES[dressCode]
    : undefined;

  const isMobile = useMediaQuery("(max-width: 768px)");

  const stepValidation = useMemo(
    () => [
      Boolean(selectedStyle),
      Boolean(weddingSize),
      Boolean(dressCode),
      palette.length > 0,
    ],
    [selectedStyle, weddingSize, dressCode, palette.length],
  );

  const canMoveToNextStep = stepValidation[activeStep];

  const handleOpenIdentityModal = () => {
    setActiveStep(0);
    setIsIdentityModalOpen(true);
  };

  const handleNextStep = () => {
    if (activeStep < 3 && canMoveToNextStep) {
      setActiveStep((previous) => previous + 1);
      return;
    }

    if (activeStep === 3 && canMoveToNextStep) {
      setIsIdentityModalOpen(false);
    }
  };

  const handleBackStep = () => {
    if (activeStep > 0) {
      setActiveStep((previous) => previous - 1);
    }
  };

  const renderFallbackVisual = (label: string, emoji: string, background: string) => (
    <CardSection
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: 180,
        background,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
      }}
    >
      <Stack gap={4} align="center" justify="center">
        <Text size="3rem" lh={1}>
          {emoji}
        </Text>
        <Text fw={700} size="sm" ta="center">
          {label}
        </Text>
      </Stack>
    </CardSection>
  );

  return (
    <BaseLayout>
      <Stack p="md" gap="xl">
        <PageSectionHeader
          eyebrow="Identidade do Casamento"
          title="Visao Geral"
          description="A sintese visual completa do seu casamento. Compartilhe com seus fornecedores para alinhar expectativas."
          actions={
            <Group gap="sm" wrap="wrap">
              <Button
                styles={primaryButtonStyles}
                leftSection={<IconEdit size={14} />}
                onClick={handleOpenIdentityModal}
              >
                {hasIdentity ? "Editar Identidade" : "Criar Identidade"}
              </Button>
            </Group>
          }
        />

        {!hasIdentity ? (
          <EmptyState
            icon="✦"
            title="Seu moodboard esta em branco"
            message="Complete as secoes de Paleta, Estilo e Dress Code para gerar seu moodboard final."
            action={
              <Button
                styles={primaryButtonStyles}
                leftSection={<IconEdit size={14} />}
                onClick={handleOpenIdentityModal}
              >
                Criar Identidade
              </Button>
            }
          />
        ) : (
          <>
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
              <Card withBorder radius="lg" padding="lg">
                <Text
                  size="sm"
                  c="dimmed"
                  tt="uppercase"
                  fw={700}
                  style={{ letterSpacing: 1.2 }}
                >
                  Paleta Definida
                </Text>
                <Text fw={700} size="xl" mt={8}>
                  {palette.length}
                </Text>
                <Text size="sm" c="dimmed">
                  cores selecionadas
                </Text>
                <Group gap={4} wrap="nowrap" mt={10}>
                  {palette.map((c) => (
                    <Card
                      key={c.id}
                      p={0}
                      radius="md"
                      withBorder
                      style={{ flex: 1, height: 18, background: c.hex }}
                    />
                  ))}
                </Group>
              </Card>
              <Card withBorder radius="lg" padding="lg">
                <Text
                  size="sm"
                  c="dimmed"
                  tt="uppercase"
                  fw={700}
                  style={{ letterSpacing: 1.2 }}
                >
                  Tamanho do Casamento
                </Text>
                <Text fw={700} size="md" mt={8}>
                  {weddingSize ? sizeData?.label : "-"}
                </Text>
                <Text size="sm" c="dimmed">
                  {sizeData?.guestRange || "Selecione o porte do evento"}
                </Text>
              </Card>
              <Card withBorder radius="lg" padding="lg">
                <Text
                  size="sm"
                  c="dimmed"
                  tt="uppercase"
                  fw={700}
                  style={{ letterSpacing: 1.2 }}
                >
                  Estilo Selecionado
                </Text>
                <Text fw={700} size="md" mt={8}>
                  {selectedStyle
                    ? WEDDING_STYLES.find((s) => s.id === selectedStyle)?.label
                    : "-"}
                </Text>

                <Tooltip
                  label={dressData?.desc || "Descricao nao disponivel"}
                  position="bottom"
                  color="dark"
                  withArrow
                  style={{ fontSize: 11 }}
                >
                  <Text size="sm" c="dimmed">
                    {isMobile
                      ? dressData?.desc
                      : dressData?.desc?.slice(0, 30) + "..." || ""}
                  </Text>
                </Tooltip>
              </Card>
              <Card withBorder radius="lg" padding="lg">
                <Text
                  size="sm"
                  c="dimmed"
                  tt="uppercase"
                  fw={700}
                  style={{ letterSpacing: 1.2 }}
                >
                  Dress Code
                </Text>
                <Text fw={700} size="md" mt={8}>
                  {dressCode
                    ? DRESS_CODE_OPTIONS.find((d) => d.id === dressCode)?.label
                    : "-"}
                </Text>
                <Text size="sm" c="dimmed">
                  {styleData?.subtitle || ""}
                </Text>
              </Card>
            </SimpleGrid>
            <Stack gap="md">
              <Card withBorder radius="lg" padding="lg">
                <Stack gap="md">
                  <Text
                    size="sm"
                    c="dimmed"
                    tt="uppercase"
                    fw={700}
                    style={{ letterSpacing: 1.2 }}
                  >
                    Previa da Paleta
                  </Text>
                  <Group gap={10} align="flex-start" wrap="nowrap">
                    {palette.map((c) => (
                      <Stack
                        key={c.id}
                        gap={8}
                        align="center"
                        style={{ flex: 1 }}
                      >
                        <Card
                          withBorder
                          radius="md"
                          p={0}
                          style={{
                            width: "100%",
                            aspectRatio: "1",
                            background: c.hex,
                            boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                          }}
                        />
                        <Text size="9px" c="dimmed" ta="center" fw={600}>
                          {c.hex}
                        </Text>
                      </Stack>
                    ))}
                  </Group>
                </Stack>
              </Card>
            </Stack>

            <Grid gutter="md" mb={28} align="stretch">
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Card withBorder radius="lg" p={0} style={{ overflow: "hidden", height: "100%", minHeight: 420 }}>
                  <Box style={{ position: "relative", width: "100%", height: "100%", minHeight: 420 }}>
                    {styleImage ? (
                      <Image
                        src={styleImage}
                        alt={styleData?.label || "Estilo Nao Definido"}
                        w="100%"
                        h="100%"
                        fit="cover"
                        style={{ position: "absolute", inset: 0 }}
                      />
                    ) : (
                      renderFallbackVisual(
                        styleData?.label || "Estilo Nao Definido",
                        styleData?.emoji || "✦",
                        "linear-gradient(135deg,#1a1a1a,#3a3a3a)",
                      )
                    )}
                    <Box
                      style={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "linear-gradient(180deg, rgba(20,14,10,0.02) 0%, rgba(20,14,10,0.18) 40%, rgba(20,14,10,0.86) 100%)",
                      }}
                    />
                    <Stack
                      justify="flex-end"
                      style={{ position: "absolute", inset: 0, padding: 20, zIndex: 2 }}
                    >
                      <Text c="white" fw={700} size="xl" style={{ lineHeight: 1.1 }}>
                        {styleData?.label || "Estilo Nao Definido"}
                      </Text>
                      <Text c="rgba(255,255,255,0.8)" size="sm">
                        {styleData?.subtitle || ""}
                      </Text>
                    </Stack>
                  </Box>
                </Card>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 6 }}>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                  {dressesImage &&
                    Object.entries(dressesImage).map(([key, imageUrl]) => {
                      const label = key.charAt(0).toUpperCase() + key.slice(1);
                      const emoji = key === "noivo" ? "🤵" : key === "noiva" ? "👰" : "👥";

                      return (
                        <Card key={key} withBorder radius="lg" p={0} style={{ overflow: "hidden", minHeight: 200 }}>
                          <Box style={{ position: "relative", width: "100%", aspectRatio: "4 / 5" }}>
                            {imageUrl ? (
                              <Image
                                src={imageUrl}
                                alt={label}
                                w="100%"
                                h="100%"
                                fit="cover"
                                style={{ position: "absolute", inset: 0 }}
                              />
                            ) : (
                              renderFallbackVisual(
                                label,
                                emoji,
                                key === "noivo"
                                  ? "linear-gradient(135deg,#1a1a1a,#3a3a3a)"
                                  : key === "noiva"
                                    ? `linear-gradient(135deg,${dressCode ? DRESS_CODE_OPTIONS.find((d) => d.id === dressCode)?.color ?? "#C9A96E" : "#C9A96E"}88,${dressCode ? DRESS_CODE_OPTIONS.find((d) => d.id === dressCode)?.color ?? "#C9A96E" : "#C9A96E"}44)`
                                    : "linear-gradient(135deg,#2a2a3a,#3a3a5a)",
                              )
                            )}
                            <Box
                              style={{
                                position: "absolute",
                                inset: 0,
                                background:
                                  "linear-gradient(180deg, rgba(20,14,10,0.04) 0%, rgba(20,14,10,0.1) 100%)",
                              }}
                            />
                            <Text
                              pos="absolute"
                              bottom={10}
                              left={12}
                              c="white"
                              fw={700}
                              size="sm"
                              style={{ zIndex: 2 }}
                            >
                              {label}
                            </Text>
                          </Box>
                        </Card>
                      );
                    })}
                </SimpleGrid>
              </Grid.Col>
            </Grid>

            <Card
              withBorder
              radius="lg"
              p="lg"
              mt={8}
              style={{
                background: "var(--mantine-color-body)",
                borderColor: "var(--mantine-color-gray-3)",
                boxShadow: "0 10px 30px rgba(20,14,10,0.06)",
              }}
            >
              <Group
                justify="space-between"
                align="center"
                gap="md"
                wrap="wrap"
              >
                <Stack gap={6}>
                  <Text
                    size="11px"
                    fw={700}
                    c="dimmed"
                    tt="uppercase"
                    style={{ letterSpacing: 2 }}
                  >
                    Compartilhar
                  </Text>
                  <Text fw={700} size="lg">
                    Envie para seus Fornecedores
                  </Text>
                  <Text size="sm" c="dimmed" style={{ maxWidth: 420 }}>
                    Gere um link exclusivo ou PDF com toda a identidade visual
                    do casamento para compartilhar com fornecedores.
                  </Text>
                </Stack>
                <Group gap="xs">
                  <ActionIcon
                    variant="light"
                    color="gray"
                    size="lg"
                    style={{
                      border: "1px solid var(--mantine-color-gray-3)",
                    }}
                  >
                    <IconDownload size={18} />
                  </ActionIcon>
                  <Button
                    styles={primaryButtonStyles}
                    style={{
                      borderRadius: 10,
                    }}
                    leftSection={<IconShare size={14} />}
                  >
                    Exportar
                  </Button>
                </Group>
              </Group>
            </Card>
          </>
        )}

        <Modal
          opened={isIdentityModalOpen}
          onClose={() => setIsIdentityModalOpen(false)}
          title={hasIdentity ? "Editar Identidade" : "Criar Identidade"}
          centered
          size="90%"
          radius="lg"
        >
          <Stack gap="lg">
            <Stepper
              active={activeStep}
              onStepClick={setActiveStep}
              allowNextStepsSelect
            >
              <Stepper.Step label="Estilo" description="Estilo do Casamento">
                <WeddingStylePage
                  selectedStyle={selectedStyle}
                  setSelectedStyle={setSelectedStyle}
                  hideHeader
                  compact
                />
              </Stepper.Step>
              <Stepper.Step label="Tamanho" description="Porte do evento">
                <WeddingSizePage
                  weddingSize={weddingSize}
                  setWeddingSize={setWeddingSize}
                  hideHeader
                  compact
                />
              </Stepper.Step>
              <Stepper.Step label="Dress Code" description="Formalidade">
                <DressCodePage
                  dressCode={dressCode}
                  setDressCode={setDressCode}
                  hideHeader
                  compact
                />
              </Stepper.Step>
              <Stepper.Step label="Paleta" description="Cores principais">
                <PalettePage
                  palette={palette}
                  setPalette={setPalette}
                  dressCode={dressCode}
                  hideHeader
                  compact
                />
              </Stepper.Step>
              <Stepper.Completed>
                <Stack align="center" gap="sm" py="xl">
                  <IconCheck size={28} />
                  <Text fw={700}>Identidade configurada com sucesso.</Text>
                </Stack>
              </Stepper.Completed>
            </Stepper>

            <Group justify="space-between" wrap="wrap">
              <Button
                variant="default"
                leftSection={<IconChevronLeft size={14} />}
                onClick={handleBackStep}
                disabled={activeStep === 0}
              >
                Voltar
              </Button>
              <Button
                styles={primaryButtonStyles}
                rightSection={
                  activeStep === 3 ? (
                    <IconCheck size={14} />
                  ) : (
                    <IconChevronRight size={14} />
                  )
                }
                onClick={handleNextStep}
                disabled={!canMoveToNextStep}
              >
                {activeStep === 3 ? "Concluir" : "Continuar"}
              </Button>
            </Group>
          </Stack>
        </Modal>
      </Stack>
    </BaseLayout>
  );
}

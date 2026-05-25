import BaseLayout from "@/components/Layout/_BaseLayout";
import { MobileFullscreenModal } from "@/components/MobileFullscreenModal";
import PageSectionHeader from "@/components/PageSectionHeader";
import EmptyState from "@/components/wedding/identity/EmptyState";
import DressCodePage from "@/components/wedding/identity/pages/DressCodePage";
import PalettePage from "@/components/wedding/identity/pages/PalettePage";
import { WeddingInspirationsPage } from "@/components/wedding/identity/pages/WeddingInspirationsPage";
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
import {
  createWeddingIdentityShareToken,
  deleteWeddingInspiration,
  listWeddingInspirations,
  saveWeddingInspiration,
  WeddingIdentityInspirationPayload,
  WeddingIdentityInspirationRecord,
} from "@/services/weddingIdentity.service";
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
import { notifications } from "@mantine/notifications"; // Importado para feedbacks de sucesso/erro
import {
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconEdit,
  IconShare,
  IconTrash,
} from "@tabler/icons-react";
import { useEffect, useMemo, useRef, useState } from "react";

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
    saveWeddingIdentity,
  } = useWeddingIdentityState();

  const [isIdentityModalOpen, setIsIdentityModalOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  // Estados para as inspirações selecionadas no modal e persistidas na grid principal
  const [selectedImages, setSelectedImages] = useState<
    WeddingIdentityInspirationPayload[]
  >([]);
  const [savedInspirations, setSavedInspirations] = useState<
    WeddingIdentityInspirationRecord[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null); // Estado para controlar qual ID está sendo deletado

  const modalTopRef = useRef<HTMLDivElement>(null);

  const handleShareLink = async () => {
    try {
      const { token } = await createWeddingIdentityShareToken();
      const publicUrl = `${window.location.origin}/moodboard/${token}`;

      await navigator.clipboard.writeText(publicUrl);
      notifications.show({
        color: "green",
        title: "Link copiado!",
        message:
          "O link público do seu moodboard foi copiado para a área de transferência.",
      });
    } catch (error) {
      console.error("Erro ao gerar link público", error);
      notifications.show({
        color: "red",
        title: "Falha ao compartilhar",
        message: "Não foi possível gerar o link público no momento.",
      });
    }
  };

  // Efeito para rolar o modal para o topo a cada mudança de passo
  // Atualize seu useEffect para esta abordagem
  useEffect(() => {
    if (isIdentityModalOpen && modalTopRef.current) {
      setTimeout(() => {
        modalTopRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 50);
    }
  }, [activeStep, isIdentityModalOpen]);

  // Busca inicial das inspirações já salvas no banco para exibir no Dashboard
  useEffect(() => {
    if (hasIdentity) {
      listWeddingInspirations()
        .then((data) => setSavedInspirations(data))
        .catch((err) => console.error("Erro ao listar inspirações", err));
    }
  }, [hasIdentity]);

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
      true,
    ],
    [selectedStyle, weddingSize, dressCode, palette.length],
  );

  const canMoveToNextStep = stepValidation[activeStep];

  const identityStepTitles = [
    "Estilo do Casamento",
    "Tamanho do Casamento",
    "Código de Vestuário",
    "Paleta de Cores",
    "Inspirações",
  ];

  const renderMobileIdentityContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <WeddingStylePage
            selectedStyle={selectedStyle}
            setSelectedStyle={setSelectedStyle}
            hideHeader
            compact
          />
        );
      case 1:
        return (
          <WeddingSizePage
            weddingSize={weddingSize}
            setWeddingSize={setWeddingSize}
            hideHeader
            compact
          />
        );
      case 2:
        return (
          <DressCodePage
            dressCode={dressCode}
            setDressCode={setDressCode}
            hideHeader
            compact
          />
        );
      case 3:
        return (
          <PalettePage
            palette={palette}
            setPalette={setPalette}
            dressCode={dressCode}
            hideHeader
            compact
          />
        );
      case 4:
      default:
        return (
          <WeddingInspirationsPage
            selectedStyle={selectedStyle}
            dressCode={dressCode}
            selectedImages={selectedImages}
            setSelectedImages={setSelectedImages}
          />
        );
    }
  };

  const renderMobileIdentityFooter = () => (
    <Group grow>
      <Button
        variant="default"
        leftSection={<IconChevronLeft size={14} />}
        onClick={handleBackStep}
        disabled={activeStep === 0 || isSubmitting}
        fullWidth
      >
        Voltar
      </Button>
      <Button
        styles={primaryButtonStyles}
        loading={isSubmitting}
        rightSection={
          activeStep === 4 ? (
            <IconCheck size={14} />
          ) : (
            <IconChevronRight size={14} />
          )
        }
        onClick={handleNextStep}
        disabled={!canMoveToNextStep}
        fullWidth
      >
        {activeStep === 4 ? "Concluir" : "Continuar"}
      </Button>
    </Group>
  );

  const handleOpenIdentityModal = () => {
    setActiveStep(0);
    setSelectedImages([]); // Reseta a seleção temporária do modal
    setIsIdentityModalOpen(true);
  };

  const handleNextStep = async () => {
    if (activeStep < 4 && canMoveToNextStep) {
      setActiveStep((previous) => previous + 1);
      return;
    }

    if (activeStep === 4 && canMoveToNextStep) {
      setIsSubmitting(true);
      try {
        await saveWeddingIdentity();

        const savePromises = selectedImages.map((url) =>
          saveWeddingInspiration({
            image_url: url.image_url,
            selected_style: selectedStyle,
            dress_code: dressCode,
          }),
        );
        await Promise.all(savePromises);

        const updatedList = await listWeddingInspirations();
        setSavedInspirations(updatedList);

        setIsIdentityModalOpen(false);
      } catch (error) {
        console.error("Erro ao salvar imagens de inspiração:", error);
        notifications.show({
          color: "red",
          title: "Falha ao salvar identidade",
          message:
            "Não foi possível concluir o cadastro da identidade do casamento.",
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBackStep = () => {
    if (activeStep > 0) {
      setActiveStep((previous) => previous - 1);
    }
  };

  // Função para remover a inspiração do banco e atualizar o estado visual local
  const handleRemoveInspiration = async (id: number) => {
    setDeletingId(id);
    try {
      await deleteWeddingInspiration(id);
      setSavedInspirations((prev) => prev.filter((item) => item.id !== id));
      notifications.show({
        color: "green",
        message: "Inspiração removida do mural.",
      });
    } catch (error) {
      console.error("Erro ao deletar inspiração:", error);
      notifications.show({
        color: "red",
        message: "Não foi possível remover a inspiração.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const renderFallbackVisual = (
    label: string,
    emoji: string,
    background: string,
  ) => (
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
                            height: 80,
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
                <Card
                  withBorder
                  radius="lg"
                  p={0}
                  style={{ overflow: "hidden", height: "100%", minHeight: 420 }}
                >
                  <Box
                    style={{
                      position: "relative",
                      width: "100%",
                      height: "100%",
                      minHeight: 420,
                    }}
                  >
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
                      style={{
                        position: "absolute",
                        inset: 0,
                        padding: 20,
                        zIndex: 2,
                      }}
                    >
                      <Text
                        c="white"
                        fw={700}
                        size="xl"
                        style={{ lineHeight: 1.1 }}
                      >
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
                      const emoji =
                        key === "noivo" ? "🤵" : key === "noiva" ? "👰" : "👥";

                      return (
                        <Card
                          key={key}
                          withBorder
                          radius="lg"
                          p={0}
                          style={{ overflow: "hidden", minHeight: 200 }}
                        >
                          <Box
                            style={{
                              position: "relative",
                              width: "100%",
                              aspectRatio: "4 / 5",
                            }}
                          >
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
                                  ? `linear-gradient(135deg,${
                                      dressCode
                                        ? DRESS_CODE_OPTIONS.find(
                                            (d) => d.id === dressCode,
                                          )?.color ?? "#C9A96E"
                                        : "#C9A96E"
                                    }88,${
                                      dressCode
                                        ? DRESS_CODE_OPTIONS.find(
                                            (d) => d.id === dressCode,
                                          )?.color ?? "#C9A96E"
                                        : "#C9A96E"
                                    }44)`
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

            {/* SEÇÃO PRINCIPAL DE PREVIEW DAS INSPIRAÇÕES SALVAS COM AÇÃO DE EXCLUSÃO */}
            {savedInspirations.length > 0 && (
              <Stack gap="md" mb="md">
                <Text
                  size="sm"
                  c="dimmed"
                  tt="uppercase"
                  fw={700}
                  style={{ letterSpacing: 1.2 }}
                >
                  Mural de Inspirações Favoritadas
                </Text>
                <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="sm">
                  {savedInspirations.map((item) => (
                    <Card
                      key={item.id}
                      withBorder
                      radius="md"
                      p={0}
                      style={{ overflow: "hidden", position: "relative" }}
                    >
                      <Image
                        src={item.image_url}
                        fit="cover"
                        style={{ height: "350px" }}
                        alt="Inspiração salva"
                      />

                      {/* Botão flutuante de exclusão por item */}
                      <ActionIcon
                        variant="filled"
                        color="red"
                        radius="xl"
                        size="md"
                        loading={deletingId === item.id}
                        onClick={() => handleRemoveInspiration(item.id)}
                        style={{
                          position: "absolute",
                          top: "10px",
                          right: "10px",
                          zIndex: 2,
                          boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
                        }}
                      >
                        <IconTrash size={14} />
                      </ActionIcon>
                    </Card>
                  ))}
                </SimpleGrid>
              </Stack>
            )}

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
                  <Button
                    styles={primaryButtonStyles}
                    style={{
                      borderRadius: 10,
                    }}
                    leftSection={<IconShare size={14} />}
                    onClick={handleShareLink}
                  >
                    Exportar
                  </Button>
                </Group>
              </Group>
            </Card>
          </>
        )}

        {isMobile ? (
          <MobileFullscreenModal
            opened={isIdentityModalOpen}
            onClose={() => !isSubmitting && setIsIdentityModalOpen(false)}
            title={identityStepTitles[activeStep]}
            progress={{ active: activeStep, total: identityStepTitles.length }}
            footer={renderMobileIdentityFooter()}
          >
            <Stack gap="lg">
              <div ref={modalTopRef} style={{ scrollMarginTop: "20px" }} />
              {renderMobileIdentityContent()}
              {activeStep === 4 ? (
                <Stack align="center" gap="sm" py="xl">
                  <IconCheck size={28} />
                  <Text fw={700}>Identidade configurada com sucesso.</Text>
                </Stack>
              ) : null}
            </Stack>
          </MobileFullscreenModal>
        ) : (
          <Modal
            opened={isIdentityModalOpen}
            onClose={() => !isSubmitting && setIsIdentityModalOpen(false)}
            title={hasIdentity ? "Editar Identidade" : "Criar Identidade"}
            centered
            size="90%"
            radius="lg"
          >
            <Stack gap="lg">
              <div ref={modalTopRef} style={{ scrollMarginTop: "20px" }} />
              <Stepper
                active={activeStep}
                onStepClick={(step) => {
                  if (isSubmitting) {
                    return;
                  }

                  if (step === 4 && (!selectedStyle || !dressCode)) {
                    return;
                  }

                  if (step < activeStep) {
                    setActiveStep(step);
                  }
                }}
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

                <Stepper.Step
                  label="Inspirações"
                  description="Imagens de referência"
                >
                  <WeddingInspirationsPage
                    selectedStyle={selectedStyle}
                    dressCode={dressCode}
                    selectedImages={selectedImages}
                    setSelectedImages={setSelectedImages}
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
                  disabled={activeStep === 0 || isSubmitting}
                >
                  Voltar
                </Button>
                <Button
                  styles={primaryButtonStyles}
                  loading={isSubmitting}
                  rightSection={
                    activeStep === 4 ? (
                      <IconCheck size={14} />
                    ) : (
                      <IconChevronRight size={14} />
                    )
                  }
                  onClick={handleNextStep}
                  disabled={!canMoveToNextStep}
                >
                  {activeStep === 4 ? "Concluir" : "Continuar"}
                </Button>
              </Group>
            </Stack>
          </Modal>
        )}
      </Stack>
    </BaseLayout>
  );
}

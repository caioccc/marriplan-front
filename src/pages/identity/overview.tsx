import BaseLayout from "@/components/Layout/_BaseLayout";
import { MobileFullscreenModal } from "@/components/MobileFullscreenModal";
import PageSectionHeader from "@/components/PageSectionHeader";
import EmptyState from "@/components/wedding/identity/EmptyState";
import DressCodePage from "@/components/wedding/identity/pages/DressCodePage";
import PalettePage from "@/components/wedding/identity/pages/PalettePage";
import { WeddingInspirationsPage } from "@/components/wedding/identity/pages/WeddingInspirationsPage";
import WeddingSizePage from "@/components/wedding/identity/pages/WeddingSizePage";
import WeddingStylePage from "@/components/wedding/identity/pages/WeddingStylePage";
import { getFeatureLimit } from "@/constants/plans";
import {
  DRESS_CODE_OPTIONS,
  DRESS_CODE_REFERENCE_IMAGES,
  STYLE_IMAGE_MAP,
  WEDDING_SIZES,
  WEDDING_STYLES,
} from "@/constants/weddingIdentityData";
import { useSubscription } from "@/hooks/useSubscription";
import { useWeddingIdentityState } from "@/hooks/useWeddingIdentityState";
import {
  createWeddingIdentityShareToken,
  deleteWeddingInspiration,
  listWeddingInspirations,
  saveWeddingInspiration,
  WeddingIdentityInspirationPayload,
  WeddingIdentityInspirationRecord,
} from "@/services/weddingIdentity.service";
import { primaryButtonStyles, softButtonStyles } from "@/styles";
import {
  ActionIcon,
  Box,
  Button,
  Card,
  CardSection,
  CloseButton,
  Grid,
  Group,
  Image,
  Menu,
  Modal,
  ScrollArea,
  SimpleGrid,
  Skeleton,
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
  IconCopy,
  IconDotsVertical,
  IconEdit,
  IconFileTypePdf,
  IconMaximize,
  IconShare,
  IconTrash,
} from "@tabler/icons-react";
import { useEffect, useMemo, useRef, useState } from "react";

const FIRST_STEPS_REFRESH_EVENT = "marriplan:first-steps-refresh";

type FullscreenImageState = {
  src: string;
  alt: string;
};

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
    isLoading,
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
  const [fullscreenImage, setFullscreenImage] =
    useState<FullscreenImageState | null>(null);
  const { isPremium } = useSubscription();

  const modalTopRef = useRef<HTMLDivElement>(null);

  const [openDeleteInspirationModal, setOpenDeleteInspirationModal] =
    useState(false);

  const handleRemoveOpenModal = (id: number) => {
    setDeletingId(id);
    setOpenDeleteInspirationModal(true);
  };

  const onCloseDeleteModal = () => {
    setDeletingId(null);
    setOpenDeleteInspirationModal(false);
  };

  const handleShareLink = async () => {
    const { token } = await createWeddingIdentityShareToken();
    const publicUrl = `${window.location.origin}/moodboard/${token}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Identidade do Casamento",
          text: `Confira a identidade visual do nosso casamento no Marriplan! Acesse o link para ver a paleta de cores, estilo e inspirações que escolhemos para o grande dia.`,
          url: publicUrl,
        });
      } catch {
        // Silenciar cancelamento
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = async () => {
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

  const openFullscreenImage = (src: string, alt: string) => {
    setFullscreenImage({ src, alt });
  };

  const closeFullscreenImage = () => {
    setFullscreenImage(null);
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
  const [loadingInspirations, setLoadingInspirations] = useState(false);
  useEffect(() => {
    if (hasIdentity) {
      setLoadingInspirations(true);
      listWeddingInspirations()
        .then((data) => setSavedInspirations(data))
        .catch((err) => console.error("Erro ao listar inspirações", err))
        .finally(() => setLoadingInspirations(false));
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
            onOpenImageFullscreen={openFullscreenImage}
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
    setSelectedImages(
      savedInspirations.map((item) => ({
        image_url: item.image_url,
        title: item.title,
        description: item.description,
        selected_style: item.selected_style,
        dress_code: item.dress_code,
        is_favorite: item.is_favorite,
        is_liked: item.is_liked,
        query: item.query,
        thumbnail_url: item.thumbnail_url,
      })),
    );
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

        const savedImageUrls = new Set(
          savedInspirations.map((item) => item.image_url),
        );

        const inspirationLimit = getFeatureLimit("inspirations");
        const savedUniqueCount = savedImageUrls.size;

        const uniqueSelectedImages = selectedImages.filter(
          (item, index, self) =>
            self.findIndex(
              (candidate) => candidate.image_url === item.image_url,
            ) === index,
        );

        const newImagesToSave = uniqueSelectedImages.filter(
          (item) => !savedImageUrls.has(item.image_url),
        );

        if (
          !isPremium &&
          typeof inspirationLimit === "number" &&
          savedUniqueCount >= inspirationLimit &&
          newImagesToSave.length > 0
        ) {
          notifications.show({
            color: "orange",
            title: "Limite do plano gratuito atingido",
            message:
              "Seu plano Free já está no limite de inspirações. Faça upgrade para salvar novas referências.",
          });
          return;
        }

        const savePromises = newImagesToSave.map((url) =>
          saveWeddingInspiration({
            image_url: url.image_url,
            selected_style: selectedStyle,
            dress_code: dressCode,
          }),
        );
        await Promise.all(savePromises);

        const updatedList = await listWeddingInspirations();
        setSavedInspirations(updatedList);

        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event(FIRST_STEPS_REFRESH_EVENT));
        }

        setIsIdentityModalOpen(false);
      } catch (error) {
        console.error("Erro ao salvar imagens de inspiração:", error);
        const errorMessage =
          (error as { response?: { data?: { detail?: string } } })?.response
            ?.data?.detail ||
          "Não foi possível concluir o cadastro da identidade do casamento.";
        notifications.show({
          color: "red",
          title: "Falha ao salvar identidade",
          message:
            errorMessage ||
            "Não foi possível salvar as inspirações neste momento.",
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

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event(FIRST_STEPS_REFRESH_EVENT));
      }

      notifications.show({
        color: "green",
        message: "Inspiração removida do mural.",
      });
    } catch (error) {
      console.error("Erro ao deletar inspiração:", error);
      const errorMessage =
        (error as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || "Não foi possível remover a inspiração.";
      notifications.show({
        color: "red",
        message: errorMessage,
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
            <Group gap="sm">
              <Button
                styles={primaryButtonStyles}
                leftSection={<IconEdit size={14} />}
                onClick={handleOpenIdentityModal}
              >
                {hasIdentity ? "Editar Identidade" : "Criar Identidade"}
              </Button>
              <Menu shadow="md" width={220} position="bottom-end">
                <Menu.Target>
                  <Button
                    styles={softButtonStyles}
                    px={8}
                    style={{ minWidth: 44 }}
                  >
                    <IconDotsVertical size={22} />
                  </Button>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item
                    leftSection={<IconShare size={18} />}
                    onClick={handleShareLink}
                  >
                    Compartilhar Identidade
                  </Menu.Item>
                  <Menu.Item
                    leftSection={<IconCopy size={18} />}
                    onClick={handleCopyLink}
                  >
                    Copiar Link
                  </Menu.Item>
                  <Menu.Item
                    leftSection={<IconFileTypePdf size={18} />}
                    disabled
                  >
                    Exportar PDF
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          }
        />
        {!isLoading && !hasIdentity && !loadingInspirations ? (
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
              <Card
                withBorder
                radius="lg"
                padding="lg"
                className="marriplan-card"
              >
                <Text
                  size="sm"
                  c="dimmed"
                  tt="uppercase"
                  fw={700}
                  style={{ letterSpacing: 1.2 }}
                >
                  Paleta Definida
                </Text>
                <Skeleton visible={isLoading} radius="xl">
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
                </Skeleton>
              </Card>
              <Card
                withBorder
                radius="lg"
                padding="lg"
                className="marriplan-card"
              >
                <Text
                  size="sm"
                  c="dimmed"
                  tt="uppercase"
                  fw={700}
                  style={{ letterSpacing: 1.2 }}
                >
                  Tamanho do Casamento
                </Text>
                <Skeleton visible={isLoading} radius="xl">
                  <Text fw={700} size="md" mt={8}>
                    {weddingSize ? sizeData?.label : "-"}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {sizeData?.guestRange || "Selecione o porte do evento"}
                  </Text>
                </Skeleton>
              </Card>
              <Card
                withBorder
                radius="lg"
                padding="lg"
                className="marriplan-card"
              >
                <Text
                  size="sm"
                  c="dimmed"
                  tt="uppercase"
                  fw={700}
                  style={{ letterSpacing: 1.2 }}
                >
                  Estilo Selecionado
                </Text>
                <Skeleton visible={isLoading} radius="xl">
                  <Text fw={700} size="md" mt={8}>
                    {selectedStyle
                      ? WEDDING_STYLES.find((s) => s.id === selectedStyle)
                          ?.label
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
                </Skeleton>
              </Card>
              <Card
                withBorder
                radius="lg"
                padding="lg"
                className="marriplan-card"
              >
                <Text
                  size="sm"
                  c="dimmed"
                  tt="uppercase"
                  fw={700}
                  style={{ letterSpacing: 1.2 }}
                >
                  Dress Code
                </Text>
                <Skeleton visible={isLoading} radius="xl">
                  <Text fw={700} size="md" mt={8}>
                    {dressCode
                      ? DRESS_CODE_OPTIONS.find((d) => d.id === dressCode)
                          ?.label
                      : "-"}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {styleData?.subtitle || ""}
                  </Text>
                </Skeleton>
              </Card>
            </SimpleGrid>

            <Stack gap="md" mb="md">
              <Text
                size="sm"
                c="dimmed"
                tt="uppercase"
                fw={700}
                style={{ letterSpacing: 1.2 }}
              >
                Dress Code e Estilo
              </Text>
              <Grid gutter="md" mb={28} align="stretch">
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Skeleton visible={isLoading} radius="lg">
                    <Card
                      className="marriplan-card"
                      withBorder
                      radius="lg"
                      p={0}
                      style={{
                        overflow: "hidden",
                        height: "100%",
                        minHeight: 420,
                      }}
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
                        <ActionIcon
                          variant="filled"
                          color="dark"
                          radius="xl"
                          size="md"
                          aria-label="Abrir imagem em fullscreen"
                          onClick={() =>
                            openFullscreenImage(
                              styleImage,
                              styleData?.label || "Estilo Não Definido",
                            )
                          }
                          style={{
                            position: "absolute",
                            top: 12,
                            right: 12,
                            zIndex: 3,
                            boxShadow: "0 2px 10px rgba(0,0,0,0.22)",
                          }}
                        >
                          <IconMaximize size={14} />
                        </ActionIcon>
                      </Box>
                    </Card>
                  </Skeleton>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Skeleton visible={isLoading} radius="lg">
                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                      {dressesImage &&
                        Object.entries(dressesImage).map(([key, imageUrl]) => {
                          const label =
                            key.charAt(0).toUpperCase() + key.slice(1);
                          const emoji =
                            key === "noivo"
                              ? "🤵"
                              : key === "noiva"
                              ? "👰"
                              : "👥";

                          return (
                            <Card
                              className="marriplan-card"
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
                                <ActionIcon
                                  variant="filled"
                                  color="dark"
                                  radius="xl"
                                  size="sm"
                                  aria-label="Abrir imagem em fullscreen"
                                  onClick={() =>
                                    openFullscreenImage(imageUrl, label)
                                  }
                                  style={{
                                    position: "absolute",
                                    top: 10,
                                    right: 10,
                                    zIndex: 3,
                                    boxShadow: "0 2px 10px rgba(0,0,0,0.22)",
                                  }}
                                >
                                  <IconMaximize size={13} />
                                </ActionIcon>
                              </Box>
                            </Card>
                          );
                        })}
                    </SimpleGrid>
                  </Skeleton>
                </Grid.Col>
              </Grid>
            </Stack>

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
                <Skeleton visible={loadingInspirations} radius="lg">
                  <SimpleGrid cols={{ base: 1, sm: 3, md: 4 }} spacing="sm">
                    {savedInspirations.map((item) => (
                      <Card
                        className="marriplan-card"
                        key={item.id}
                        withBorder
                        radius="md"
                        p={0}
                        style={{ overflow: "hidden", position: "relative" }}
                      >
                        <Box style={{ position: "relative" }}>
                          <Image
                            src={item.image_url}
                            fit="cover"
                            style={{ height: "300px" }}
                            alt="Inspiração salva"
                          />

                          <ActionIcon
                            variant="filled"
                            color="dark"
                            radius="xl"
                            size="sm"
                            aria-label="Abrir imagem em fullscreen"
                            onClick={() =>
                              openFullscreenImage(
                                item.image_url,
                                "Inspiração salva",
                              )
                            }
                            style={{
                              position: "absolute",
                              top: 10,
                              right: 10,
                              zIndex: 3,
                              boxShadow: "0 2px 10px rgba(0,0,0,0.22)",
                            }}
                          >
                            <IconMaximize size={13} />
                          </ActionIcon>

                          {/* Botão flutuante de exclusão por item */}
                          <ActionIcon
                            variant="filled"
                            color="red"
                            radius="xl"
                            size="md"
                            loading={deletingId === item.id}
                            onClick={() => handleRemoveOpenModal(item.id)}
                            style={{
                              position: "absolute",
                              bottom: "10px",
                              right: "10px",
                              zIndex: 2,
                              boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
                            }}
                          >
                            <IconTrash size={14} />
                          </ActionIcon>
                        </Box>
                      </Card>
                    ))}
                  </SimpleGrid>
                </Skeleton>
              </Stack>
            )}

            <div className="relative overflow-hidden rounded-[2.4rem] border border-[#eadfd3] bg-[linear-gradient(135deg,#2f2822_0%,#4b3f36_58%,#6a584b_100%)] px-8 py-14 shadow-[0_28px_80px_rgba(47,40,34,0.22)] sm:px-12 lg:px-16 lg:py-16">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(242,230,216,0.24),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(200,176,138,0.16),transparent_28%)]" />

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
                    tt="uppercase"
                    style={{
                      letterSpacing: 2,
                      color: "rgba(255,255,255,0.85)",
                    }}
                  >
                    Compartilhar
                  </Text>
                  <Text
                    fw={700}
                    size="xl"
                    style={{ color: "white", lineHeight: 1.2 }}
                  >
                    Envie para seus Fornecedores
                  </Text>
                  <Text size="md" style={{ maxWidth: 420, color: "white" }}>
                    Gere um link exclusivo ou PDF com toda a identidade visual
                    do casamento para compartilhar com fornecedores.
                  </Text>
                </Stack>
                <Group gap="xs">
                  <Button
                    styles={primaryButtonStyles}
                    leftSection={<IconShare size={14} />}
                    onClick={handleShareLink}
                    size="lg"
                  >
                    Compartilhar
                  </Button>
                </Group>
              </Group>
            </div>
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
            padding={16}
            styles={{
              content: {
                height: "90dvh",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              },
              body: {
                height: "100%",
                padding: 0,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              },
            }}
          >
            <Stack gap={0} h="100%" style={{ overflow: "hidden" }}>
              <ScrollArea
                style={{ flex: 1, minHeight: 0 }}
                type="auto"
                offsetScrollbars
              >
                <Stack gap="lg" p="md">
                  <div ref={modalTopRef} style={{ scrollMarginTop: "20px" }} />
                  <Stepper
                    active={activeStep}
                    size="xs"
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
                    <Stepper.Step
                      label="Estilo"
                      description="Estilo do Casamento"
                    >
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
                        onOpenImageFullscreen={openFullscreenImage}
                      />
                    </Stepper.Step>

                    <Stepper.Completed>
                      <Stack align="center" gap="sm" py="xl">
                        <IconCheck size={28} />
                        <Text fw={700}>
                          Identidade configurada com sucesso.
                        </Text>
                      </Stack>
                    </Stepper.Completed>
                  </Stepper>
                </Stack>
              </ScrollArea>

              <Box
                p="md"
                style={{
                  borderTop: "1px solid var(--mantine-color-gray-3)",
                  background: "var(--mantine-color-body)",
                  boxShadow: "0 -8px 20px rgba(0,0,0,0.04)",
                }}
              >
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
              </Box>
            </Stack>
          </Modal>
        )}
        <Modal
          opened={Boolean(fullscreenImage)}
          onClose={closeFullscreenImage}
          fullScreen
          withCloseButton={false}
          centered={false}
          zIndex={1000}
          size="100%"
          radius="lg"
          padding={0}
          styles={{
            content: {
              background: "var(--mantine-color-body)",
            },
            body: {
              height: "100%",
              padding: 0,
              background: "var(--mantine-color-body)",
            },
          }}
        >
          {fullscreenImage ? (
            <Box
              style={{
                width: "100%",
                height: "100dvh",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 24,
                background: "var(--mantine-color-body)",
              }}
            >
              <CloseButton
                onClick={closeFullscreenImage}
                aria-label="Fechar fullscreen"
                size="lg"
                style={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  zIndex: 3,
                }}
              />
              <Image
                src={fullscreenImage.src}
                alt={fullscreenImage.alt}
                fit="contain"
                w="100%"
                h="100%"
                style={{ maxHeight: "100%" }}
              />
            </Box>
          ) : null}
        </Modal>
        {deletingId !== null && (
          <Modal
            opened={openDeleteInspirationModal}
            onClose={onCloseDeleteModal}
            title="Confirmar exclusão"
            centered
            radius="md"
            padding="lg"
            size="md"
          >
            <Stack gap="md">
              <Text>
                Tem certeza que deseja remover esta inspiração do mural?
              </Text>
              <Group justify="flex-end" gap="md">
                <Button styles={softButtonStyles} onClick={onCloseDeleteModal}>
                  Cancelar
                </Button>
                <Button
                  styles={primaryButtonStyles}
                  onClick={() =>
                    handleRemoveInspiration(deletingId ? deletingId : 0)
                  }
                >
                  Excluir
                </Button>
              </Group>
            </Stack>
          </Modal>
        )}
      </Stack>
    </BaseLayout>
  );
}

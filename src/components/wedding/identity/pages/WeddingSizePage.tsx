import PageSectionHeader from "@/components/PageSectionHeader";
import { WEDDING_SIZES } from "@/constants/weddingIdentityData";
import { WeddingSizePageProps } from "@/types/weddingIdentity";
import {
  Badge,
  Box,
  Button,
  Card,
  CardSection,
  Group,
  Image,
  Modal,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import React, { useMemo, useState } from "react";
import Icon from "../Icon";
import { primaryButtonStyles, softButtonStyles } from "@/styles";

const sizeDetailsMap: Record<string, { title: string; description: string }> = {
  elopement: {
    title: "Casamento a dois",
    description:
      "Casamento a dois (ou com pouquíssimas testemunhas, no máximo 5 pessoas). Foco total em intimidade ou viagem.",
  },
  micro: {
    title: "Evento altamente intimista",
    description:
      "Evento altamente intimista, geralmente restrito à família direta e amigos muito próximos.",
  },
  mini: {
    title: "Formato acolhedor",
    description:
      "Um formato acolhedor, mas que já comporta uma estrutura de festa tradicional de pequeno porte.",
  },
  medio: {
    title: "Padrão clássico da maioria",
    description:
      "O padrão clássico da maioria dos casamentos brasileiros. Permite cobrir círculos sociais ampliados.",
  },
  mega: {
    title: "Evento de grande porte",
    description:
      "Eventos de grande porte, festas expansivas com listas extensas de familiares, amigos e corporativo.",
  },
};

const WeddingSizePage: React.FC<WeddingSizePageProps & {
  hideHeader?: boolean;
  compact?: boolean;
}> = ({ weddingSize, setWeddingSize, hideHeader = false, compact = false }) => {
  const [detailsSizeId, setDetailsSizeId] = useState<string | null>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const selectedSizeDetails = useMemo(
    () => WEDDING_SIZES.find((size) => size.id === detailsSizeId) ?? null,
    [detailsSizeId],
  );

  return (
    <Stack p={compact ? "xs" : "md"}>
      {!hideHeader && (
        <PageSectionHeader
          eyebrow="Identidade do Casamento"
          title="Tamanho do Casamento"
          description="Escolha a escala do seu evento. Essa etapa ajuda a orientar expectativas, orçamento e composição do casamento."
          actions={
            weddingSize ? (
              <Badge color="yellow" variant="light">
                ✦ {WEDDING_SIZES.find((s) => s.id === weddingSize)?.label} selecionado
              </Badge>
            ) : undefined
          }
        />
      )}

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md" mt={16} mb={compact ? 8 : 28}>
        {WEDDING_SIZES.map((size) => {
          const isSelected = weddingSize === size.id;

          return (
            <Card
              key={size.id}
              padding={0}
              radius="lg"
              withBorder
              onClick={() => setWeddingSize(size.id)}
              style={{
                cursor: "pointer",
                width: "100%",
                height: isMobile ? 250 : compact ? 300 : 340,
                position: "relative",
                overflow: "hidden",
                borderColor: isSelected ? "var(--marriplan-gold)" : "var(--marriplan-border)",
                boxShadow: isSelected
                  ? "0 0 0 2px rgba(201,169,110,0.25)"
                  : "0 8px 24px rgba(20,14,10,0.08)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
              }}
            >
              <CardSection style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0 }}>
                {size.imageUrl ? (
                  <Image src={size.imageUrl} alt={size.label} fit="cover" h="100%" />
                ) : (
                  <Box
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: size.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 72,
                    }}
                  >
                    {size.emoji}
                  </Box>
                )}
                <Box
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(180deg, rgba(20, 14, 10, 0.08) 0%, rgba(20, 14, 10, 0.25) 45%, rgba(20, 14, 10, 0.82) 100%)",
                    zIndex: 1,
                  }}
                />
              </CardSection>

              {isSelected && (
                <ThemeIcon
                  size={30}
                  radius="xl"
                  color="yellow"
                  variant="filled"
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    zIndex: 4,
                    boxShadow: "0 6px 16px rgba(20,14,10,0.24)",
                  }}
                >
                  <Icon name="check" size={14} color="#fff" />
                </ThemeIcon>
              )}

              <Box
                style={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 3,
                  display: "flex",
                  alignItems: "flex-end",
                }}
              >
                <Stack
                  gap="xs"
                  p="md"
                  style={{
                    width: "100%",
                    background:
                      "linear-gradient(180deg, rgba(20,14,10,0) 0%, rgba(20,14,10,0.78) 72%, rgba(20,14,10,0.9) 100%)",
                  }}
                >
                  <Group justify="space-between" align="flex-start" gap="xs" wrap="nowrap">
                    <Text c="white" fw={700} size="lg" style={{ lineHeight: 1.1 }}>
                      {size.label}
                    </Text>
                  </Group>

                  <Text c="rgba(255,255,255,0.85)" size="xs" style={{ lineHeight: 1.4 }}>
                    {size.subtitle}
                  </Text>

                  <Text c="rgba(255,255,255,0.75)" size="xs">
                    {size.guestRange}
                  </Text>

                  <Group gap={6} wrap="wrap">
                    {size.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="light"
                        radius="xl"
                        color="gray"
                        style={{ background: "rgba(255,255,255,0.18)", color: "#fff" }}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </Group>

                  <Button
                    variant={isSelected ? "primary" : "secondary"}
                    color={isSelected ? undefined : "gray"}
                    styles={isSelected ? primaryButtonStyles : softButtonStyles}
                    onClick={(event) => {
                      event.stopPropagation();
                      setDetailsSizeId(size.id);
                    }}
                  >
                    {isSelected ? "Selecionado" : "Ver Detalhes"}
                  </Button>
                </Stack>
              </Box>
            </Card>
          );
        })}
      </SimpleGrid>

      <Modal
        opened={Boolean(detailsSizeId)}
        onClose={() => setDetailsSizeId(null)}
        title={selectedSizeDetails?.label ?? "Detalhes do tamanho"}
        centered
        radius="lg"
        size="lg"
      >
        {selectedSizeDetails ? (
          <Stack gap="md">
            <Card withBorder radius="lg" p={0} style={{ overflow: "hidden", minHeight: 220 }}>
              {selectedSizeDetails.imageUrl ? (
                <Image
                  src={selectedSizeDetails.imageUrl}
                  alt={selectedSizeDetails.label}
                  h={220}
                  fit="cover"
                />
              ) : (
                <Box
                  h={220}
                  style={{
                    background: selectedSizeDetails.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 88,
                    position: "relative",
                  }}
                >
                  {selectedSizeDetails.emoji}
                </Box>
              )}
            </Card>

            <Stack gap={4}>
              <Text size="sm" c="dimmed" tt="uppercase" fw={700} style={{ letterSpacing: 1.2 }}>
                {selectedSizeDetails.subtitle}
              </Text>
              <Text fw={700} size="lg">
                {sizeDetailsMap[selectedSizeDetails.id]?.title ?? selectedSizeDetails.title}
              </Text>
              <Text size="sm" c="dimmed">
                {sizeDetailsMap[selectedSizeDetails.id]?.description ?? selectedSizeDetails.description}
              </Text>
            </Stack>

            <Group gap="xs">
              {selectedSizeDetails.tags.map((tag) => (
                <Badge key={tag} variant="light" color="gray">
                  {tag}
                </Badge>
              ))}
            </Group>

            <Button
              onClick={() => {
                setWeddingSize(selectedSizeDetails.id);
                setDetailsSizeId(null);
              }}
              styles={primaryButtonStyles}
            >
              Selecionar tamanho
            </Button>
          </Stack>
        ) : null}
      </Modal>
    </Stack>
  );
};

export default WeddingSizePage;
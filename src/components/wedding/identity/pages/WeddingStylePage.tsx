import {
  STYLE_IMAGE_MAP,
  WEDDING_STYLES,
} from "@/constants/weddingIdentityData";
import {
  Badge,
  Box,
  Button,
  CardSection,
  Card,
  Group,
  Modal,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import React, { useMemo, useState } from "react";
import Icon from "../Icon";
import PageSectionHeader from "@/components/PageSectionHeader";
import Image from "next/image";
import { primaryButtonStyles, softButtonStyles } from "@/styles";
import { useMediaQuery } from "@mantine/hooks";


interface WeddingStylePageProps {
  selectedStyle: string;
  setSelectedStyle: (styleId: string) => void;
  hideHeader?: boolean;
  compact?: boolean;
}

const WeddingStylePage: React.FC<WeddingStylePageProps> = ({
  selectedStyle,
  setSelectedStyle,
  hideHeader = false,
  compact = false,
}) => {
  const [detailsStyleId, setDetailsStyleId] = useState<string | null>(null);

  const filtered = WEDDING_STYLES;

  const selectedStyleDetails = useMemo(
    () => WEDDING_STYLES.find((style) => style.id === detailsStyleId) ?? null,
    [detailsStyleId],
  );

  const styleDetailsMap: Record<
    string,
    { title: string; description: string }
  > = {
    classico: {
      title: "Clássico atemporal",
      description:
        "Um estilo de estética refinada, formal e tradicional. Funciona bem para celebrações elegantes, com foco em harmonia, simetria e acabamentos sofisticados.",
    },
    boho: {
      title: "Boho orgânico",
      description:
        "Uma linguagem mais livre, natural e acolhedora. Valoriza texturas, elementos naturais, materiais artesanais e uma sensação de leveza visual.",
    },
    minimalista: {
      title: "Minimalista contemporâneo",
      description:
        "Um visual clean, com poucos elementos e bastante respiro. A proposta é destacar elegância com simplicidade, linhas puras e neutralidade.",
    },
    luxo: {
      title: "Luxo refinado",
      description:
        "Uma composição mais imponente e sofisticada, com brilho contido, cores profundas e presença visual forte. Ideal para experiências de alto impacto.",
    },
    praia: {
      title: "Praia sofisticada",
      description:
        "Uma estética leve e luminosa, voltada para ambientes costeiros. A proposta combina frescor, fluidez e cores suaves com elegância.",
    },
    campo: {
      title: "Campo elegante",
      description:
        "Um mood natural e acolhedor, com sensação de autenticidade. Faz uso de materiais orgânicos, paleta terrosa e composição afetiva.",
    },
    romantico: {
      title: "Romântico delicado",
      description:
        "Visual suave, afetivo e envolvente. Foca em tons quentes, flores, luz suave e um clima intimista para uma celebração mais emocional.",
    },
    vintage: {
      title: "Vintage nostálgico",
      description:
        "Uma leitura inspirada em referências retrô, com textura, memória e sofisticação clássica. Mistura charme antigo com acabamento atual.",
    },
  };

  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <Stack p={compact ? "xs" : "md"}>
      {!hideHeader && (
        <PageSectionHeader
          eyebrow="Identidade do Casamento"
          title="Estilo do Casamento"
          description="Escolha o estilo que mais representa o seu sonho. Isso vai guiar todas as decisoes esteticas do grande dia."
          actions={
            selectedStyle ? (
              <Badge color="yellow" variant="light">
                ✦ {WEDDING_STYLES.find((s) => s.id === selectedStyle)?.label}{" "}
                selecionado
              </Badge>
            ) : undefined
          }
        />
      )}

      <SimpleGrid
        cols={{ base: 1, sm: 2, lg: 4 }}
        spacing="md"
        mt={16}
        mb={compact ? 8 : 28}
      >
        {filtered.map((style) => {
          const isSelected = selectedStyle === style.id;

          return (
            <Card
              key={style.id}
              padding={0}
              radius="lg"
              withBorder
              onClick={() => setSelectedStyle(style.id)}
              style={{
                cursor: "pointer",
                width: "100%",
                height: isMobile ? 250 : compact ? 300 : 340,
                position: "relative",
                overflow: "hidden",
                border: isSelected ? "4px solid var(--marriplan-gold)" : "1px solid var(--marriplan-border)",
                borderColor: isSelected
                  ? "var(--marriplan-gold)"
                  : "var(--marriplan-border)",
                boxShadow: isSelected
                  ? "0 0 0 2px rgba(201,169,110,0.25)"
                  : "0 8px 24px rgba(20,14,10,0.08)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
              }}
            >
              <CardSection
                style={{
                  position: "absolute",
                  inset: 0,
                  overflow: "hidden",
                  zIndex: 0,
                }}
              >
                <Image
                  src={STYLE_IMAGE_MAP[style.id] || STYLE_IMAGE_MAP.vintage}
                  alt={style.label}
                  fill
                  unoptimized
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  style={{ objectFit: "cover", zIndex: 0 }}
                />
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
                      {style.label}
                    </Text>
                  </Group>

                  <Text c="rgba(255,255,255,0.85)" size="xs" style={{ lineHeight: 1.4 }}>
                    {style.subtitle}
                  </Text>

                  <Group gap={6} wrap="wrap">
                    {style.tags.map((tag) => (
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
                      setDetailsStyleId(style.id);
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
        opened={Boolean(detailsStyleId)}
        onClose={() => setDetailsStyleId(null)}
        title={selectedStyleDetails?.label ?? "Detalhes do estilo"}
        centered
        radius="lg"
        size="lg"
      >
        {selectedStyleDetails ? (
          <Stack gap="md">
            <div
              style={{
                borderRadius: 18,
                overflow: "hidden",
                minHeight: 220,
                position: "relative",
              }}
            >
              <Image
                src={
                  STYLE_IMAGE_MAP[selectedStyleDetails.id] ||
                  STYLE_IMAGE_MAP.vintage
                }
                alt={selectedStyleDetails.label}
                fill
                unoptimized
                sizes="(max-width: 768px) 100vw, 640px"
                style={{ objectFit: "cover" }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(180deg, rgba(20, 14, 10, 0.08) 0%, rgba(20, 14, 10, 0.25) 45%, rgba(20, 14, 10, 0.82) 100%)",
                  zIndex: 1,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 96,
                  opacity: 0.22,
                  mixBlendMode: "screen",
                  zIndex: 2,
                }}
              >
                {selectedStyleDetails.emoji}
              </div>
            </div>
            <Stack gap={4}>
              <Text
                size="sm"
                c="dimmed"
                tt="uppercase"
                fw={700}
                style={{ letterSpacing: 1.2 }}
              >
                {selectedStyleDetails.subtitle}
              </Text>
              <Text fw={700} size="lg">
                {styleDetailsMap[selectedStyleDetails.id]?.title ??
                  selectedStyleDetails.label}
              </Text>
              <Text size="sm" c="dimmed">
                {styleDetailsMap[selectedStyleDetails.id]?.description}
              </Text>
            </Stack>
            <Group gap="xs">
              {selectedStyleDetails.tags.map((tag) => (
                <Badge key={tag} variant="light" color="gray">
                  {tag}
                </Badge>
              ))}
            </Group>
            <Button
              onClick={() => {
                setSelectedStyle(selectedStyleDetails.id);
                setDetailsStyleId(null);
              }}
              styles={primaryButtonStyles}
            >
              Selecionar estilo
            </Button>
          </Stack>
        ) : null}
      </Modal>
    </Stack>
  );
};

export default WeddingStylePage;

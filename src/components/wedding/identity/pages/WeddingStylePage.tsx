import {
  STYLE_IMAGE_MAP,
  WEDDING_STYLES,
  WEDDING_STYLE_FILTERS,
} from "@/constants/weddingIdentityData";
import {
  Badge,
  Button,
  Card,
  Group,
  Modal,
  SimpleGrid,
  Stack,
  Text,
} from "@mantine/core";
import React, { useMemo, useState } from "react";
import Icon from "../Icon";
import PageSectionHeader from "@/components/PageSectionHeader";
import Image from "next/image";
import { primaryButtonStyles } from "@/styles";
import { useMediaQuery } from "@mantine/hooks";


interface WeddingStylePageProps {
  selectedStyle: string;
  setSelectedStyle: (styleId: string) => void;
}

const WeddingStylePage: React.FC<WeddingStylePageProps> = ({
  selectedStyle,
  setSelectedStyle,
}) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Todos");
  const [detailsStyleId, setDetailsStyleId] = useState<string | null>(null);

  const filtered = WEDDING_STYLES.filter(
    (s) =>
      (filter === "Todos" || s.label === filter || s.tags.includes(filter)) &&
      s.label.toLowerCase().includes(search.toLowerCase()),
  );

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
  const isTablet = useMediaQuery("(min-width: 768px)");

  return (
    <Stack p="md">
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
        filters={
          <>
            <Group
              gap="sm"
              wrap="wrap"
              align="center"
              style={{ width: "100%" }}
            >
              <input
                className="wi-input"
                style={{ maxWidth: 260, minWidth: 220 }}
                placeholder="Buscar estilo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="style-filters-desktop">
                <Text size="sm" c="dimmed" fw={600}>
                  Filtrar:
                </Text>
                <div
                  className="pill-selector"
                  style={{ display: "flex", flexWrap: "wrap", gap: 8 }}
                >
                  {WEDDING_STYLE_FILTERS.map((f) => (
                    <button
                      key={f}
                      className={`pill ${filter === f ? "selected" : ""}`}
                      onClick={() => setFilter(f)}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </Group>
            <style jsx>{`
              .style-filters-desktop {
                display: flex;
                gap: 12px;
                align-items: center;
                flex-wrap: wrap;
              }

              @media (max-width: 1024px) {
                .style-filters-desktop {
                  display: none;
                }
              }
            `}</style>
          </>
        }
      />

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md" mt={20} mb={28}>
        {filtered.map((style) => (
          <Card
            key={style.id}
            className={`style-card ${
              selectedStyle === style.id ? "selected" : ""
            }`}
            padding={0}
            radius="lg"
            withBorder
            onClick={() => setSelectedStyle(style.id)}
            style={{
              cursor: "pointer",
              width: "100%",
              height: isMobile ? 280 : isTablet ? 400 : 500,
            }}
          >
            <div
              className="style-card-bg"
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
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(180deg, rgba(20, 14, 10, 0.08) 0%, rgba(20, 14, 10, 0.25) 45%, rgba(20, 14, 10, 0.82) 100%)",
                  zIndex: 1,
                }}
              />
            </div>
            {selectedStyle === style.id && (
              <div className="style-card-check" style={{ zIndex: 4 }}>
                <Icon name="check" size={14} color="#fff" />
              </div>
            )}
            <div className="style-card-content" style={{ zIndex: 3 }}>
              <h3 style={{ color: "#fff" }}>{style.label}</h3>
              <p>{style.subtitle}</p>
              <div className="style-card-tags">
                {style.tags.map((t) => (
                  <span key={t} className="style-card-tag">
                    {t}
                  </span>
                ))}
              </div>
              <Button
                className="style-card-select-btn"
                variant="primary"
                style={
                  selectedStyle === style.id
                    ? { ...primaryButtonStyles}
                    : {}
                }
                onClick={(event) => {
                  event.stopPropagation();
                  setDetailsStyleId(style.id);
                }}
              >
                {selectedStyle === style.id ? "✦ Selecionado" : "Ver Detalhes"}
              </Button>
            </div>
          </Card>
        ))}
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

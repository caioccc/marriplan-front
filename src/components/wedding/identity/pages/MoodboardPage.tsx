import PageSectionHeader from "@/components/PageSectionHeader";
import {
  DRESS_CODE_OPTIONS,
  DRESS_CODE_REFERENCE_IMAGES,
  STYLE_IMAGE_MAP,
  WEDDING_STYLES,
} from "@/constants/weddingIdentityData";
import { PaletteColor } from "@/types/weddingIdentity";
import {
  Card,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Tooltip
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import React from "react";
import EmptyState from "../EmptyState";
import FakeImage from "../FakeImage";
import Icon from "../Icon";

interface MoodboardPageProps {
  selectedStyle: string;
  palette: PaletteColor[];
  dressCode: string;
}

const MoodboardPage: React.FC<MoodboardPageProps> = ({
  selectedStyle,
  palette,
  dressCode,
}) => {
  const styleData = WEDDING_STYLES.find((s) => s.id === selectedStyle);
  const dressData = DRESS_CODE_OPTIONS.find((d) => d.id === dressCode);

  const styleImage =
    STYLE_IMAGE_MAP[selectedStyle] ||
    "https://via.placeholder.com/600x400?text=Estilo+Não+Definido";
  const dressesImage =
    DRESS_CODE_REFERENCE_IMAGES[dressCode] ||
    "https://via.placeholder.com/600x400?text=Dress+Code+Não+Definido";
  console.log("MoodboardPage render", styleImage, dressesImage);

  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <div className="wi-page">
      <PageSectionHeader
        eyebrow="Identidade do Casamento"
        title="Visão Geral"
        description="A sintese visual completa do seu casamento. Compartilhe com seus fornecedores para alinhar expectativas."
        actions={
          <Group gap="sm" wrap="wrap">
            <button className="btn-primary">
              <Icon name="download" size={14} color="#fff" /> Exportar PDF
            </button>
          </Group>
        }
      />

      {!selectedStyle && palette.length === 0 ? (
        <EmptyState
          icon="✦"
          title="Seu moodboard esta em branco"
          message="Complete as secoes de Paleta, Estilo e Dress Code para gerar seu moodboard final."
          action={
            <span style={{ fontSize: 13, color: "var(--marriplan-muted)" }}>
              Navegue pelas secoes no menu lateral
            </span>
          }
        />
      ) : (
        <>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md" my={28}>
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
              <div className="palette-bar" style={{ marginTop: 10 }}>
                {palette.map((c) => (
                  <div
                    key={c.id}
                    className="palette-bar-segment"
                    style={{ background: c.hex }}
                  />
                ))}
              </div>
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
                  : "—"}
              </Text>

              <Tooltip
                label={dressData?.desc || "Descrição não disponível"}
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
                  : "—"}
              </Text>
              <Text size="sm" c="dimmed">
                {styleData?.subtitle || ""}
              </Text>
            </Card>
            <Card withBorder radius="lg" padding="lg">
              <Stack gap="md">
                <Text
                  size="sm"
                  c="dimmed"
                  tt="uppercase"
                  fw={700}
                  style={{ letterSpacing: 1.2 }}
                >
                  Prévia da Paleta
                </Text>
                <div style={{ display: "flex", gap: 10 }}>
                  {palette.map((c) => (
                    <div
                      key={c.id}
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <div
                        style={{
                          width: "100%",
                          aspectRatio: "1",
                          borderRadius: 12,
                          background: c.hex,
                          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                        }}
                      />
                      <span
                        style={{
                          fontSize: 9,
                          color: "var(--marriplan-muted)",
                          textAlign: "center",
                          fontWeight: 600,
                        }}
                      >
                        {c.hex}
                      </span>
                    </div>
                  ))}
                </div>
              </Stack>
            </Card>
          </SimpleGrid>

          {isMobile ? (
            <>
              <Stack gap="md" width="100%">
                <FakeImage
                  emoji={styleData?.emoji || "✦"}
                  imageUrl={
                    styleImage
                      ? styleImage
                      : "https://via.placeholder.com/400x600?text=Imagem+Não+Definida"
                  }
                  color="linear-gradient(135deg,#1a1a1a,#3a3a3a)"
                  aspectRatio="16 / 16"
                  label={styleData?.label || "Estilo Não Definido"}
                  style={{ flex: 1, borderRadius: 12, width: "100%"}}
                />
                {dressesImage &&
                  Object.entries(dressesImage).map(([key, imageUrl]) => (
                    <FakeImage
                      key={key}
                      emoji={
                        key === "noivo" ? "🤵" : key === "noiva" ? "👰" : "👥"
                      }
                      imageUrl={
                        imageUrl
                          ? imageUrl
                          : "https://via.placeholder.com/400x600?text=Imagem+Não+Definida"
                      }
                      color="linear-gradient(135deg,#1a1a1a,#3a3a3a)"
                      aspectRatio="16 / 16"
                      label={key.charAt(0).toUpperCase() + key.slice(1)}
                      style={{ flex: 1, borderRadius: 12, width: "100%" }}
                    />
                  ))}
              </Stack>
            </>
          ) : (
            <div className="moodboard-grid" style={{ marginBottom: 28 }}>
              <div
                className="moodboard-hero"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 60,
                  height: isMobile ? "auto" : "612px",
                  width: "100%",
                }}
              >
                <FakeImage
                  emoji={styleData?.emoji || "✦"}
                  imageUrl={
                    styleImage
                      ? styleImage
                      : "https://via.placeholder.com/400x600?text=Imagem+Não+Definida"
                  }
                  color="linear-gradient(135deg,#1a1a1a,#3a3a3a)"
                  aspectRatio="9 / 16"
                  label={styleData?.label || "Estilo Não Definido"}
                  style={{ flex: 1, borderRadius: 12 }}
                />
              </div>
              {dressesImage &&
                Object.entries(dressesImage).map(([key, imageUrl]) => (
                  <FakeImage
                    key={key}
                    emoji={
                      key === "noivo" ? "🤵" : key === "noiva" ? "👰" : "👥"
                    }
                    imageUrl={
                      imageUrl
                        ? imageUrl
                        : "https://via.placeholder.com/400x600?text=Imagem+Não+Definida"
                    }
                    color="linear-gradient(135deg,#1a1a1a,#3a3a3a)"
                    aspectRatio="9 / 16"
                    label={key.charAt(0).toUpperCase() + key.slice(1)}
                    style={{ flex: 1, borderRadius: 12 }}
                    h={300}
                  />
                ))}
            </div>
          )}

          <div className="export-card" style={{ marginTop: 28 }}>
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  opacity: 0.6,
                  marginBottom: 8,
                }}
              >
                Compartilhar
              </div>
              <h3
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontSize: 20,
                  fontWeight: 700,
                  marginBottom: 6,
                  color: "white",
                }}
              >
                Envie para seus Fornecedores
              </h3>
              <p style={{ fontSize: 13, opacity: 0.7, maxWidth: 380 }}>
                Gere um link exclusivo ou PDF com toda a identidade visual do
                casamento para compartilhar com fornecedores.
              </p>
            </div>
            <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
              <button
                style={{
                  background: "rgba(255,255,255,0.15)",
                  backdropFilter: "blur(4px)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  borderRadius: 10,
                  padding: "12px 20px",
                  color: "#fff",
                  fontFamily: "Manrope, sans-serif",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Icon name="share" size={14} color="#fff" /> Gerar Link
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MoodboardPage;

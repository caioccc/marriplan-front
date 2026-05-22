import PageSectionHeader from "@/components/PageSectionHeader";
import {
  Badge,
  Card,
  Grid,
  Group,
  SimpleGrid,
  Stack,
  Text,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import React, { useState } from "react";
import Icon from "../Icon";

// ==========================================
// 1. COMPONENTES VETORIAIS DINÂMICOS (SVGs)
// ==========================================

const InvitationSvg = ({ color }: { color: string }) => (
  <svg viewBox="0 0 100 100" width="100%" height="100%">
    <rect
      x="10"
      y="25"
      width="80"
      height="55"
      rx="6"
      fill="#FFF"
      stroke="var(--marriplan-border, #E9ECEF)"
      strokeWidth="2"
    />
    <rect
      x="18"
      y="15"
      width="64"
      height="45"
      rx="4"
      fill={color}
      style={{ transition: "fill 0.3s ease" }}
      opacity="0.9"
    />
    <line
      x1="28"
      y1="28"
      x2="50"
      y2="28"
      stroke="#fff"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="28"
      y1="36"
      x2="68"
      y2="36"
      stroke="#fff"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M 10 25 L 50 60 L 90 25"
      fill="none"
      stroke="var(--marriplan-border, #CBD5E1)"
      strokeWidth="1.5"
    />
    <circle cx="50" cy="58" r="7" fill="#D4AF37" />
  </svg>
);

const DressSvg = ({ color }: { color: string }) => (
  <svg viewBox="0 0 100 100" width="100%" height="100%">
    <path
      d="M 38 20 Q 50 25 62 20 L 58 40 L 75 85 Q 50 90 25 85 L 42 40 Z"
      fill={color}
      style={{ transition: "fill 0.3s ease" }}
      stroke="rgba(0,0,0,0.08)"
      strokeWidth="1"
    />
    <path
      d="M 41.5 40 Q 50 43 58.5 40"
      fill="none"
      stroke="#fff"
      strokeWidth="2"
      opacity="0.6"
    />
    <path
      d="M 38 20 L 44 12 M 62 20 L 56 12"
      fill="none"
      stroke="#A4A4A4"
      strokeWidth="1.5"
    />
  </svg>
);

const CakeSvg = ({ color }: { color: string }) => (
  <svg viewBox="0 0 100 100" width="100%" height="100%">
    <ellipse cx="50" cy="85" rx="35" ry="6" fill="#E4E4E6" />
    <rect
      x="22"
      y="58"
      width="56"
      height="22"
      rx="4"
      fill={color}
      style={{ transition: "fill 0.3s ease" }}
    />
    <rect x="22" y="58" width="56" height="5" fill="#fff" opacity="0.3" />
    <rect
      x="30"
      y="38"
      width="40"
      height="20"
      rx="4"
      fill={color}
      style={{ transition: "fill 0.3s ease" }}
      opacity="0.9"
    />
    <rect x="30" y="38" width="40" height="4" fill="#fff" opacity="0.3" />
    <rect
      x="38"
      y="20"
      width="24"
      height="18"
      rx="4"
      fill={color}
      style={{ transition: "fill 0.3s ease" }}
      opacity="0.8"
    />
    <rect x="38" y="20" width="24" height="3" fill="#fff" opacity="0.3" />
    <circle cx="50" cy="14" r="3" fill="#D4AF37" />
  </svg>
);

const TableSvg = ({ color }: { color: string }) => (
  <svg viewBox="0 0 100 100" width="100%" height="100%">
    <circle
      cx="50"
      cy="50"
      r="38"
      fill={color}
      style={{ transition: "fill 0.3s ease" }}
      opacity="0.85"
    />
    <circle
      cx="50"
      cy="50"
      r="28"
      fill="#FFFDF8"
      stroke="rgba(0,0,0,0.05)"
      strokeWidth="1"
    />
    <circle
      cx="50"
      cy="50"
      r="20"
      fill="#FFFDF8"
      stroke="var(--marriplan-border, #E2E8F0)"
      strokeWidth="1"
      strokeDasharray="2,2"
    />
    <rect
      x="45"
      y="26"
      width="10"
      height="48"
      rx="1"
      fill={color}
      style={{ transition: "fill 0.3s ease" }}
      stroke="#fff"
      strokeWidth="1"
    />
    <rect x="12" y="32" width="2" height="36" rx="0.5" fill="#C0C0C2" />
    <rect x="86" y="32" width="2" height="36" rx="0.5" fill="#C0C0C2" />
  </svg>
);

// Mocks locais para garantir que o código rode direto sem quebras de imports externos ruins
const PALETTE_PRESET_COLORS = [
  { hex: "#E3C1B5", name: "Rosé Terracota" },
  { hex: "#BDA88D", name: "Nude Fendi" },
  { hex: "#A3B19B", name: "Verde Sálvia" },
  { hex: "#A8C3D4", name: "Azul Serenity" },
  { hex: "#F7E7C8", name: "Champagne" },
  { hex: "#D9A0A0", name: "Blush Pink" },
  { hex: "#4A5D4E", name: "Verde Musgo" },
  { hex: "#2B3E50", name: "Azul Marinho" },
  { hex: "#FFFDF5", name: "Off White" },
  { hex: "#E5E1D1", name: "Areia" },
];

const canAddPaletteColor = (p: any[]) => p.length < 5;
const isDuplicatedPaletteColor = (p: any[], hex: string) =>
  p.some((x) => x.hex.toLowerCase() === hex.toLowerCase());

// ==========================================
// 2. COMPONENTE PRINCIPAL
// ==========================================

interface PaletteColor {
  id: number;
  hex: string;
  name: string;
  isPrimary?: boolean;
}

interface PalettePageProps {
  palette: PaletteColor[];
  setPalette: React.Dispatch<React.SetStateAction<PaletteColor[]>>;
}

const PalettePage: React.FC<PalettePageProps> = ({ palette, setPalette }) => {
  const [showModal, setShowModal] = useState(false);
  const [newColor, setNewColor] = useState("#E3C1B5");
  const [newName, setNewName] = useState("");

  const isMobile = useMediaQuery("(max-width: 768px)");

  // --- ENGINE DE DISTRIBUIÇÃO DAS CORES NA PRÉVIA ---
  const primaryColor =
    palette.find((c) => c.isPrimary)?.hex || palette[0]?.hex || "#E3C1B5";
  const secondaryColor =
    palette.filter((c) => !c.isPrimary)[0]?.hex || palette[1]?.hex || "#F7E7C8";

  const getColorAt = (index: number, fallback: string) => {
    if (palette.length === 0) return fallback;
    return palette[index % palette.length].hex;
  };

  const livePreview = [
    {
      label: "Convite Oficinal",
      render: (c: string) => <InvitationSvg color={c} />,
      color: primaryColor,
    },
    {
      label: "Mesa Posta",
      render: (c: string) => <TableSvg color={c} />,
      color: getColorAt(1, "#F7E7C8"),
    },
    {
      label: "Vestido Madrinhas",
      render: (c: string) => <DressSvg color={c} />,
      color: getColorAt(4, "#BDA88D"),
    },
    {
      label: "Bolo de Casamento",
      render: (c: string) => <CakeSvg color={c} />,
      color: primaryColor,
    },
  ];

  const addColor = () => {
    if (!canAddPaletteColor(palette)) return;
    setPalette((p) => [
      ...p,
      {
        id: Date.now(),
        hex: newColor,
        name: newName || newColor,
        isPrimary: p.length < 1,
      },
    ]);
    setShowModal(false);
    setNewName("");
  };

  return (
    <Stack p="md" gap="xl">
      <PageSectionHeader
        eyebrow="Identidade do Casamento"
        title="Paleta de Cores"
        description="Defina as cores que vao guiar toda a estetica do seu casamento. Escolha ate 5 cores que representam o seu estilo."
        actions={
          <Badge color="yellow" variant="light">
            {palette.length}/5 cores
          </Badge>
        }
        filters={
          <Group gap="sm" wrap="wrap">
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              <Icon name="plus" size={14} color="#fff" /> Adicionar Cor
            </button>
          </Group>
        }
      />

      <Grid gutter="xl">
        <Grid.Col>
          <Card withBorder radius="lg" padding="lg">
            <Stack gap="md">
              <Text
                fw={700}
                size="sm"
                tt="uppercase"
                c="dimmed"
                style={{ letterSpacing: 1.2 }}
              >
                Suas Cores ({palette.length}/5)
              </Text>

              <SimpleGrid cols={{ base: 2, sm: 3, md: 5 }} spacing="md" mb={20}>
                {palette.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        aspectRatio: "1",
                        borderRadius: 14,
                        background: c.hex,
                        boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
                        cursor: "pointer",
                        position: "relative",
                      }}
                    >
                      {c.isPrimary && (
                        <span
                          style={{
                            position: "absolute",
                            top: 6,
                            right: 6,
                            background: "rgba(255,255,255,0.9)",
                            borderRadius: "50%",
                            width: 18,
                            height: 18,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 10,
                            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                          }}
                        >
                          ★
                        </span>
                      )}
                    </div>
                    <div style={{ textAlign: "center", width: "100%" }}>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: "var(--marriplan-text)",
                        }}
                      >
                        {c.hex}
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          color: "var(--marriplan-muted)",
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {c.name}
                      </div>
                    </div>
                    <button
                      className="btn-ghost"
                      style={{ fontSize: 10, padding: "4px 8px" }}
                      onClick={() =>
                        setPalette((p) => p.filter((x) => x.id !== c.id))
                      }
                    >
                      Remover
                    </button>
                  </div>
                ))}

                {palette.length < 5 && (
                  <div
                    onClick={() => setShowModal(true)}
                    style={{
                      aspectRatio: "1",
                      borderRadius: 14,
                      border: "2px dashed var(--marriplan-border, #CBD5E1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      color: "var(--marriplan-muted, #64748B)",
                      fontSize: 24,
                      transition: "all 0.15s",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.borderColor =
                        "var(--marriplan-gold, #D4AF37)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.borderColor =
                        "var(--marriplan-border, #CBD5E1)";
                    }}
                  >
                    +
                  </div>
                )}
              </SimpleGrid>

              {/* Barra do Gradiente Geral */}
              <div
                style={{
                  marginTop: 20,
                  padding: 16,
                  background: "#F8FAFC",
                  borderRadius: 12,
                  border: "1px solid #F1F5F9",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#94A3B8",
                    marginBottom: 10,
                    letterSpacing: 0.5,
                  }}
                >
                  GRADIENTE DA PALETA
                </div>
                <div
                  style={{
                    height: 28,
                    borderRadius: 20,
                    transition: "background 0.4s ease",
                    background:
                      palette.length > 1
                        ? `linear-gradient(90deg, ${palette
                            .map((c) => c.hex)
                            .join(", ")})`
                        : palette.length === 1
                        ? palette[0].hex
                        : "#E2E8F0",
                  }}
                />
              </div>

              <div style={{ marginTop: 16 }}>
                <Text
                  fw={700}
                  size="sm"
                  tt="uppercase"
                  c="dimmed"
                  style={{ letterSpacing: 1.2 }}
                >
                  Cores Sugeridas
                </Text>
                <SimpleGrid
                  cols={{ base: 5, sm: 8, md: 10 }}
                  spacing={8}
                  mt={8}
                >
                  {PALETTE_PRESET_COLORS.map((c) => (
                    <div
                      key={c.hex}
                      title={c.name}
                      onClick={() => {
                        if (
                          canAddPaletteColor(palette) &&
                          !isDuplicatedPaletteColor(palette, c.hex)
                        ) {
                          setPalette((p) => [
                            ...p,
                            {
                              id: Date.now(),
                              hex: c.hex,
                              name: c.name,
                              isPrimary: p.length < 1,
                            },
                          ]);
                        }
                      }}
                      style={{
                        aspectRatio: "1",
                        borderRadius: 10,
                        background: c.hex,
                        cursor: "pointer",
                        border: palette.find(
                          (p) => p.hex.toLowerCase() === c.hex.toLowerCase(),
                        )
                          ? "2px solid #000"
                          : "2px solid transparent",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                        transition: "all 0.15s",
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = "scale(1.1)";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                      }}
                    />
                  ))}
                </SimpleGrid>
              </div>
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      {/* MODAL PARA COR CUSTOMIZADA */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">Adicionar Nova Cor</div>
            <div className="modal-sub">
              Escolha uma cor personalizada para sua paleta
            </div>
            <div className="form-group">
              <label className="form-label">Cor</label>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <input
                  type="color"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  style={{
                    width: 52,
                    height: 52,
                    border: "none",
                    borderRadius: 10,
                    cursor: "pointer",
                    padding: 0,
                  }}
                />
                <input
                  className="wi-input"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  placeholder="#E3C1B5"
                  style={{ fontFamily: "monospace" }}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Nome da Cor</label>
              <input
                className="wi-input"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex: Rose Antigo"
              />
            </div>
            <div
              style={{
                width: "100%",
                height: 60,
                borderRadius: 12,
                background: newColor,
                marginBottom: 20,
                transition: "background 0.2s",
              }}
            />
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </button>
              <button className="btn-primary" onClick={addColor}>
                <Icon name="plus" size={14} color="#fff" /> Adicionar
              </button>
            </div>
          </div>
        </div>
      )}
    </Stack>
  );
};

export default PalettePage;

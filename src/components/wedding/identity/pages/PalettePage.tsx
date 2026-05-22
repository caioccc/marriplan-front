import PageSectionHeader from "@/components/PageSectionHeader";
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  ColorInput,
  Grid,
  Group,
  Modal,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  UnstyledButton,
} from "@mantine/core";
import React, { useState } from "react";
import Icon from "../Icon";
import { primaryButtonStyles } from "@/styles";
import {
  DRESS_CODE_COLOR_MAP,
  getDressCodeSuggestedPalette,
} from "@/constants/weddingIdentityData";

const canAddPaletteColor = (p: PaletteColor[]) => p.length < 5;
const isDuplicatedPaletteColor = (p: PaletteColor[], hex: string) =>
  p.some((x) => x.hex.toLowerCase() === hex.toLowerCase());

// ==========================================
// 2. COMPONENTE PRINCIPAL
// ==========================================

interface PaletteColor {
  id: number;
  hex: string;
  name: string;
  isPrimary: boolean;
}

interface PalettePageProps {
  palette: PaletteColor[];
  setPalette: React.Dispatch<React.SetStateAction<PaletteColor[]>>;
  dressCode?: string;
  hideHeader?: boolean;
  compact?: boolean;
}

const PalettePage: React.FC<PalettePageProps> = ({
  palette,
  setPalette,
  dressCode,
  hideHeader = false,
  compact = false,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [newColor, setNewColor] = useState("#E3C1B5");
  const [newName, setNewName] = useState("");
  const dressCodeGuide = DRESS_CODE_COLOR_MAP[dressCode ?? "praia-formal"] ??
    DRESS_CODE_COLOR_MAP["praia-formal"];
  const suggestedColors = getDressCodeSuggestedPalette(dressCode);

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
    <Stack p={compact ? "xs" : "md"} gap={compact ? "md" : "xl"}>
      {!hideHeader && (
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
              <Button
                styles={primaryButtonStyles}
                onClick={() => setShowModal(true)}
                leftSection={<Icon name="plus" size={14} color="#fff" />}
              >
                Adicionar Cor
              </Button>
            </Group>
          }
        />
      )}

      <Grid gutter="lg">
        <Grid.Col>
          <Card withBorder radius="lg" padding="md">
            <Stack gap="sm">
              <Text
                fw={700}
                size="sm"
                tt="uppercase"
                c="dimmed"
                style={{ letterSpacing: 1.2 }}
              >
                Suas Cores ({palette.length}/5)
              </Text>

              <SimpleGrid cols={{ base: 3, sm: 4, md: 6 }} spacing="sm" mb={12}>
                {palette.map((c) => (
                  <Stack
                    key={c.id}
                    gap={6}
                    align="center"
                    style={{
                      width: "100%",
                    }}
                  >
                    <Card
                      withBorder
                      radius="md"
                      p={0}
                      style={{
                        width: "100%",
                        height: 84,
                        background: c.hex,
                        boxShadow: "0 2px 10px rgba(0,0,0,0.10)",
                        cursor: "pointer",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      {c.isPrimary && (
                        <Badge
                          size="xs"
                          color="gray"
                          variant="light"
                          style={{
                            position: "absolute",
                            top: 6,
                            right: 6,
                          }}
                        >
                          ★
                        </Badge>
                      )}
                    </Card>
                    <Stack gap={0} align="center" style={{ width: "100%" }}>
                      <Text size="10px" fw={700} c="dark.8">
                        {c.hex}
                      </Text>
                      <Text
                        size="9px"
                        c="dimmed"
                        ta="center"
                        style={{
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                          width: "100%",
                        }}
                      >
                        {c.name}
                      </Text>
                    </Stack>
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      size="sm"
                      aria-label={`Remover cor ${c.name}`}
                      onClick={() =>
                        setPalette((p) => p.filter((x) => x.id !== c.id))
                      }
                    >
                      <Icon name="x" size={12} color="currentColor" />
                    </ActionIcon>
                  </Stack>
                ))}

                {palette.length < 5 && (
                  <UnstyledButton
                    onClick={() => setShowModal(true)}
                    style={{
                      height: 84,
                      borderRadius: 10,
                      border: "2px dashed var(--mantine-color-gray-3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      color: "var(--mantine-color-gray-6)",
                      fontSize: 20,
                      transition: "all 0.15s",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.borderColor = "var(--mantine-color-yellow-6)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.borderColor = "var(--mantine-color-gray-3)";
                    }}
                  >
                    +
                  </UnstyledButton>
                )}
              </SimpleGrid>

              {/* Barra do Gradiente Geral */}
              <Card
                withBorder
                radius="md"
                p="sm"
                style={{
                  marginTop: 8,
                  background: "#F8FAFC",
                  borderColor: "#F1F5F9",
                }}
              >
                <Text
                  size="10px"
                  fw={700}
                  c="#94A3B8"
                  style={{
                    marginBottom: 8,
                    letterSpacing: 0.5,
                  }}
                >
                  GRADIENTE DA PALETA
                </Text>
                <Box
                  style={{
                    height: 20,
                    borderRadius: 14,
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
              </Card>

              <Stack gap={6} mt={10}>
                <Text
                  fw={700}
                  size="sm"
                  tt="uppercase"
                  c="dimmed"
                  style={{ letterSpacing: 1.2 }}
                >
                  Cores Sugeridas - {dressCodeGuide.title}
                </Text>
                <Text size="xs" c="dimmed">
                  Sugestões baseadas no dress code selecionado, com 10 opções dinâmicas.
                </Text>
                <SimpleGrid
                  cols={{ base: 5, sm: 5, md: 10 }}
                  spacing={6}
                  mt={6}
                >
                    {suggestedColors.map((c) => (
                    <UnstyledButton
                        key={`${c.hex}-${c.name}`}
                        aria-label={`Adicionar ${c.name}`}
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
                        height: 36,
                        borderRadius: 8,
                        background: c.hex,
                        cursor: "pointer",
                        border: palette.find(
                          (p) => p.hex.toLowerCase() === c.hex.toLowerCase(),
                        )
                          ? "2px solid var(--mantine-color-dark-9)"
                          : "1px solid rgba(0,0,0,0.08)",
                        boxShadow: "0 1px 6px rgba(0,0,0,0.08)",
                        transition: "all 0.15s",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.transform = "scale(1.03)";
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = "scale(1.04)";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                      }}
                    />
                  ))}
                </SimpleGrid>
              </Stack>
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      {/* MODAL PARA COR CUSTOMIZADA */}
      <Modal
        opened={showModal}
        onClose={() => setShowModal(false)}
        centered
        title="Adicionar Nova Cor"
        radius="lg"
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Escolha uma cor personalizada para sua paleta
          </Text>
          <Group gap="sm" align="flex-end" grow>
            <ColorInput
              label="Cor"
              value={newColor}
              onChange={setNewColor}
              placeholder="#E3C1B5"
              format="hex"
            />
            <TextInput
              label="Hex"
              value={newColor}
              onChange={(e) => setNewColor(e.currentTarget.value)}
              placeholder="#E3C1B5"
              styles={{ input: { fontFamily: "monospace" } }}
            />
          </Group>
          <TextInput
            label="Nome da Cor"
            value={newName}
            onChange={(e) => setNewName(e.currentTarget.value)}
            placeholder="Ex: Rose Antigo"
          />
          <Card
            withBorder
            radius="md"
            p={0}
            style={{ width: "100%", height: 52, background: newColor }}
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button
              styles={primaryButtonStyles}
              onClick={addColor}
              leftSection={<Icon name="plus" size={14} color="#fff" />}
            >
              Adicionar
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
};

export default PalettePage;

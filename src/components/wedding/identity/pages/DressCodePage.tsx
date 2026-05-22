import PageSectionHeader from "@/components/PageSectionHeader";
import {
  DRESS_CODE_COLOR_MAP,
  DRESS_CODE_OPTIONS,
  DRESS_CODE_REFERENCE_IMAGES,
} from "@/constants/weddingIdentityData";
import { DressCodePageProps } from "@/types/weddingIdentity";
import {
  Badge,
  Box,
  Card,
  Grid,
  Group,
  Image,
  SimpleGrid,
  Stack,
  Text,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import React from "react";
import EmptyState from "../EmptyState";

type IdentityDressCodeProps = DressCodePageProps & {
  hideHeader?: boolean;
  compact?: boolean;
};

const DressCodePage: React.FC<IdentityDressCodeProps> = ({
  dressCode,
  setDressCode,
  hideHeader = false,
  compact = false,
}) => {
  const selected = DRESS_CODE_OPTIONS.find((d) => d.id === dressCode);
  const referenceImages = DRESS_CODE_REFERENCE_IMAGES[selected?.id ?? ""];
  const colorGuide = DRESS_CODE_COLOR_MAP[selected?.id ?? "praia-formal"];
  const isCompactLayout = useMediaQuery("(max-width: 1024px)");
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <Stack p={compact ? "xs" : "md"} gap={compact ? "md" : "xl"}>
      {!hideHeader && (
        <PageSectionHeader
          eyebrow="Identidade do Casamento"
          title="Dress Code"
          description="Defina o codigo de vestimenta para orientar seus convidados sobre a indumentaria esperada para a celebracao."
        />
      )}

      <Grid gutter="lg">
        <Grid.Col span={isMobile ? 12 : 5}>
          <Stack gap="md">
            <Text
              fw={700}
              size="sm"
              tt="uppercase"
              c="dimmed"
              style={{ letterSpacing: 1.2 }}
            >
              Nivel de Formalidade
            </Text>

            <SimpleGrid
              cols={isMobile ? 1 : isCompactLayout ? 2 : 1}
              spacing="sm"
            >
              {DRESS_CODE_OPTIONS.map((opt) => (
                <Card
                  key={opt.id}
                  withBorder
                  radius="lg"
                  padding="sm"
                  onClick={() => setDressCode(opt.id)}
                  style={{
                    cursor: "pointer",
                    borderColor:
                      dressCode === opt.id
                        ? "var(--mantine-color-pink-5)"
                        : "var(--mantine-color-gray-3)",
                    background:
                      dressCode === opt.id
                        ? "rgba(196,117,106,0.08)"
                        : "var(--mantine-color-body)",
                    boxShadow:
                      dressCode === opt.id
                        ? "0 0 0 1px rgba(196,117,106,0.2)"
                        : "none",
                  }}
                >
                  <Group justify="space-between" align="center" mb={4}>
                    <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
                      <Text fw={700} size="xs" mb={0}>
                        {opt.label}
                      </Text>
                      <Text size="10px" c="dimmed" lh={1.35} mb={2}>
                        {opt.desc}
                      </Text>
                    </Stack>
                    {dressCode === opt.id && (
                      <Badge color="pink" variant="light" size="xs">
                        ✦
                      </Badge>
                    )}
                  </Group>

                  <Group gap={4} wrap="nowrap">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Box
                        key={i}
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          background:
                            i <= opt.formality
                              ? opt.color
                              : "var(--mantine-color-gray-3)",
                        }}
                      />
                    ))}
                  </Group>
                </Card>
              ))}
            </SimpleGrid>
          </Stack>
        </Grid.Col>

        <Grid.Col span={isMobile ? 12 : 7}>
          {selected ? (
            <SimpleGrid cols={isMobile ? 1 : 2} spacing="md">
              <Card withBorder radius="lg" padding="sm">
                <Text fw={700} size="sm" mb="xs">
                  Referencia Visual - Casal
                </Text>
                <Group gap="sm" wrap="nowrap">
                  <Stack gap={6} style={{ flex: 1 }}>
                    <Card
                      withBorder
                      radius="md"
                      p={0}
                      style={{ overflow: "hidden" }}
                    >
                      {referenceImages?.noivo ? (
                        <Image
                          src={referenceImages.noivo}
                          alt="Noivo"
                          h={isMobile ? 150 : 170}
                          fit="cover"
                        />
                      ) : (
                        <Box
                          h={isMobile ? 150 : 170}
                          style={{
                            background:
                              "linear-gradient(135deg,#1a1a1a,#3a3a3a)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 28,
                          }}
                        >
                          🤵
                        </Box>
                      )}
                    </Card>
                    <Text size="10px" ta="center" c="dimmed" fw={600}>
                      Noivo
                    </Text>
                  </Stack>

                  <Stack gap={6} style={{ flex: 1 }}>
                    <Card
                      withBorder
                      radius="md"
                      p={0}
                      style={{ overflow: "hidden" }}
                    >
                      {referenceImages?.noiva ? (
                        <Image
                          src={referenceImages.noiva}
                          alt="Noiva"
                          h={isMobile ? 150 : 170}
                          fit="cover"
                        />
                      ) : (
                        <Box
                          h={isMobile ? 150 : 170}
                          style={{
                            background: `linear-gradient(135deg,${selected.color}88,${selected.color}44)`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 28,
                          }}
                        >
                          👰
                        </Box>
                      )}
                    </Card>
                    <Text size="10px" ta="center" c="dimmed" fw={600}>
                      Noiva
                    </Text>
                  </Stack>
                </Group>
              </Card>

              <Card withBorder radius="lg" padding="sm">
                <Text fw={700} size="sm" mb="xs">
                  Referencias - Convidados
                </Text>
                <Group gap="sm" wrap="nowrap">
                  <Stack gap={6} style={{ flex: 1 }}>
                    <Card
                      withBorder
                      radius="md"
                      p={0}
                      style={{ overflow: "hidden" }}
                    >
                      {referenceImages?.madrinhas ? (
                        <Image
                          src={referenceImages.madrinhas}
                          alt="Madrinhas"
                          h={isMobile ? 150 : 170}
                          fit="cover"
                        />
                      ) : (
                        <Box
                          h={isMobile ? 150 : 170}
                          style={{
                            background: `linear-gradient(135deg,${selected.color}55,${selected.color}22)`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 28,
                          }}
                        >
                          💃
                        </Box>
                      )}
                    </Card>
                    <Text size="10px" ta="center" c="dimmed" fw={600}>
                      Madrinhas
                    </Text>
                  </Stack>

                  <Stack gap={6} style={{ flex: 1 }}>
                    <Card
                      withBorder
                      radius="md"
                      p={0}
                      style={{ overflow: "hidden" }}
                    >
                      {referenceImages?.padrinhos ? (
                        <Image
                          src={referenceImages.padrinhos}
                          alt="Padrinhos"
                          h={isMobile ? 150 : 170}
                          fit="cover"
                        />
                      ) : (
                        <Box
                          h={isMobile ? 150 : 170}
                          style={{
                            background:
                              "linear-gradient(135deg,#2a2a3a,#3a3a5a)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 28,
                          }}
                        >
                          🕺
                        </Box>
                      )}
                    </Card>
                    <Text size="10px" ta="center" c="dimmed" fw={600}>
                      Padrinhos
                    </Text>
                  </Stack>
                </Group>
              </Card>

              <Card withBorder radius="lg" padding="sm">
                <Text fw={700} size="sm" mb={4}>
                  Cores Proibidas
                </Text>
                <Text size="xs" c="dimmed" mb="sm">
                  {colorGuide.description}
                </Text>
                <Group gap={6} wrap="wrap">
                  {colorGuide.forbiddenColors.map((item, i) => (
                    <Badge
                      key={`${item.name}-${i}`}
                      variant="light"
                      color="gray"
                      size="lg"
                      styles={{ root: { textTransform: "none" } }}
                    >
                      <Group gap={4} align="center" wrap="nowrap">
                        {item.hex ? (
                          <Box
                            style={{
                              width: 12,
                              height: 12,
                              borderRadius: "50%",
                              background: item.hex,
                              border: "1px solid rgba(0,0,0,0.1)",
                              marginRight: 5,
                            }}
                          />
                        ) : null}
                        <Text size="xs" ff="monospace">
                          {item.name}
                        </Text>
                      </Group>
                    </Badge>
                  ))}
                </Group>
              </Card>

              <Card withBorder radius="lg" padding="sm">
                <Text fw={700} size="sm" mb={4}>
                  Cores Sugeridas
                </Text>
                <Text size="xs" c="dimmed" mb="sm">
                  Cores que combinam com o visual do casamento
                </Text>
                <Group gap={6} wrap="wrap">
                  {colorGuide.suggestedColors.map((item, i) => (
                    <Badge
                      key={`${item.name}-${i}`}
                      variant="light"
                      color="gray"
                      size="lg"
                      styles={{ root: { textTransform: "none" } }}
                    >
                       <Group gap={4} align="center" wrap="nowrap">
                        {item.hex ? (
                          <Box
                            style={{
                              width: 12,
                              height: 12,
                              borderRadius: "50%",
                              background: item.hex,
                              border: "1px solid rgba(0,0,0,0.1)",
                              marginRight: 5,
                            }}
                          />
                        ) : null}
                        <Text size="xs" ff="monospace">
                          {item.name}
                        </Text>
                      </Group>
                    </Badge>
                  ))}
                </Group>
              </Card>
            </SimpleGrid>
          ) : (
            <EmptyState
              icon="👗"
              title="Nenhum dress code selecionado"
              message="Escolha um nivel de formalidade ao lado para orientar seus convidados."
            />
          )}
        </Grid.Col>
      </Grid>
    </Stack>
  );
};

export default DressCodePage;

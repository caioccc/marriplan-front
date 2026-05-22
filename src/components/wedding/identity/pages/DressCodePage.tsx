import PageSectionHeader from "@/components/PageSectionHeader";
import {
  DRESS_CODE_COLOR_MAP,
  DRESS_CODE_OPTIONS,
  DRESS_CODE_REFERENCE_IMAGES,
} from "@/constants/weddingIdentityData";
import { DressCodePageProps } from "@/types/weddingIdentity";
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
import React from "react";
import EmptyState from "../EmptyState";
import FakeImage from "../FakeImage";

const DressCodePage: React.FC<DressCodePageProps> = ({
  dressCode,
  setDressCode,
}) => {
  const selected = DRESS_CODE_OPTIONS.find((d) => d.id === dressCode);
  const referenceImages = DRESS_CODE_REFERENCE_IMAGES[selected?.id ?? ""];
  const colorGuide = DRESS_CODE_COLOR_MAP[selected?.id ?? "praia-formal"];
  const isCompactLayout = useMediaQuery("(max-width: 1024px)");
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <Stack p="md" gap="xl">
      <PageSectionHeader
        eyebrow="Identidade do Casamento"
        title="Dress Code"
        description="Defina o codigo de vestimenta para orientar seus convidados sobre a indumentaria esperada para a celebracao."
      />

      {/* Se for mobile, usamos o layout original (empilhado). Se for tablet/desktop, ativa o Grid lado a lado */}
      <Grid gutter="xl">
        {/* COLUNA DA ESQUERDA (Opções) */}
        {/* No mobile ocupa a tela toda (12). No tablet/desktop ocupa 5 colunas */}
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

            {/* Se for mobile/compact, mantemos a grade original (2 ou 3 colunas). No tablet/desktop vira lista vertical (1 coluna) */}
            <SimpleGrid
              cols={isMobile ? 1 : isCompactLayout ? 2 : 1}
              spacing="md"
            >
              {DRESS_CODE_OPTIONS.map((opt) => (
                <Card
                  key={opt.id}
                  className={`dress-code-card ${
                    dressCode === opt.id ? "selected" : ""
                  }`}
                  withBorder
                  radius="lg"
                  padding="lg"
                  onClick={() => setDressCode(opt.id)}
                  style={{ cursor: "pointer" }}
                >
                  <Group justify="space-between" align="flex-start" mb="sm">
                    <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
                      <Text fw={700} size="md" mb={6}>
                        {opt.label}
                      </Text>
                      <Text size="sm" c="dimmed" lh={1.5} mb="sm">
                        {opt.desc}
                      </Text>
                    </Stack>
                    {dressCode === opt.id && (
                      <Badge color="pink" variant="light">
                        ✦
                      </Badge>
                    )}
                  </Group>

                  <Group gap={3} wrap="nowrap">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="dress-code-dot"
                        style={{
                          background:
                            i <= opt.formality
                              ? opt.color
                              : "var(--marriplan-border)",
                        }}
                      />
                    ))}
                  </Group>
                </Card>
              ))}
            </SimpleGrid>
          </Stack>
        </Grid.Col>

        {/* COLUNA DA DIREITA (Resultados) */}
        {/* No mobile ocupa a tela toda (12) e vai para baixo. No tablet/desktop ocupa 7 colunas ao lado */}
        <Grid.Col span={isMobile ? 12 : 7}>
          {selected ? (
            /* Mantém o comportamento de 2 colunas para os cards de resultado, mas se o espaço for muito apertado no tablet, empilha em 1 */
            <SimpleGrid cols={isMobile ? 1 : 2} spacing="lg">
              {/* Referência Visual — Casal */}
              <div className="marriplan-card" style={{ padding: 24 }}>
                <div className="wi-section-title">
                  Referência Visual — Casal
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <FakeImage
                    emoji="🤵"
                    imageUrl={referenceImages?.noivo}
                    color="linear-gradient(135deg,#1a1a1a,#3a3a3a)"
                    aspectRatio="9 / 16"
                    label="Noivo"
                    style={{ flex: 1, borderRadius: 12 }}
                    h={isMobile ? 300 : 300}
                  />
                  <FakeImage
                    emoji="👰"
                    imageUrl={referenceImages?.noiva}
                    color={`linear-gradient(135deg,${selected.color}88,${selected.color}44)`}
                    aspectRatio="9 / 16"
                    label="Noiva"
                    style={{ flex: 1, borderRadius: 12 }}
                    h={isMobile ? 300 : 300}
                  />
                </div>
              </div>

              {/* Referências — Convidados */}
              <div className="marriplan-card" style={{ padding: 24 }}>
                <div className="wi-section-title">Referências — Convidados</div>
                <div style={{ display: "flex", gap: 12 }}>
                  <FakeImage
                    emoji="💃"
                    imageUrl={referenceImages?.madrinhas}
                    color={`linear-gradient(135deg,${selected.color}55,${selected.color}22)`}
                    aspectRatio="9 / 16"
                    label="Madrinhas"
                    style={{ flex: 1, borderRadius: 12 }}
                    h={isMobile ? 300 : 300}
                  />
                  <FakeImage
                    emoji="🕺"
                    imageUrl={referenceImages?.padrinhos}
                    color="linear-gradient(135deg,#2a2a3a,#3a3a5a)"
                    aspectRatio="9 / 16"
                    label="Padrinhos"
                    style={{ flex: 1, borderRadius: 12 }}
                    h={isMobile ? 300 : 300}
                  />
                </div>
              </div>

              {/* Cores Proibidas */}
              <div className="marriplan-card" style={{ padding: 24 }}>
                <div className="wi-section-title">Cores Proibidas</div>
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--marriplan-muted)",
                    marginBottom: 16,
                  }}
                >
                  {colorGuide.description}
                </p>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {colorGuide.forbiddenColors.map((item, i) => (
                    <div
                      key={`${item.name}-${i}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        background: "var(--marriplan-surface-muted)",
                        borderRadius: 8,
                        padding: "8px 12px",
                        border: "1px solid var(--marriplan-border)",
                      }}
                    >
                      {item.hex ? (
                        <div
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            background: item.hex,
                            border: "1px solid rgba(0,0,0,0.1)",
                          }}
                        />
                      ) : null}
                      <span style={{ fontSize: 12, fontFamily: "monospace" }}>
                        {item.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cores Sugeridas */}
              <div className="marriplan-card" style={{ padding: 24 }}>
                <div className="wi-section-title">Cores Sugeridas</div>
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--marriplan-muted)",
                    marginBottom: 16,
                  }}
                >
                  Cores que combinam com o visual do casamento
                </p>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {colorGuide.suggestedColors.map((item, i) => (
                    <div
                      key={`${item.name}-${i}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        background: "var(--marriplan-surface-muted)",
                        borderRadius: 8,
                        padding: "8px 12px",
                        border: "1px solid var(--marriplan-border)",
                      }}
                    >
                      {item.hex ? (
                        <div
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            background: item.hex,
                          }}
                        />
                      ) : null}
                      <span style={{ fontSize: 12, fontFamily: "monospace" }}>
                        {item.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </SimpleGrid>
          ) : (
            <EmptyState
              icon="👗"
              title="Nenhum dress code selecionado"
              message="Escolha um nível de formalidade ao lado para orientar seus convidados."
            />
          )}
        </Grid.Col>
      </Grid>
    </Stack>
  );
};

export default DressCodePage;

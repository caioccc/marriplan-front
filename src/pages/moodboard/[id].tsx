import {
  DRESS_CODE_OPTIONS,
  DRESS_CODE_REFERENCE_IMAGES,
  STYLE_IMAGE_MAP,
  WEDDING_SIZES,
  WEDDING_STYLES,
} from "@/constants/weddingIdentityData";
import api from "@/services/api"; // Seu axios configurado
import { PALETTE } from "@/styles";
import {
  PaletteColor,
  WeddingIdentityInspirationApiItem,
} from "@/types/weddingIdentity";
import {
  Box,
  Card,
  Container,
  Group,
  Image,
  SimpleGrid,
  Stack,
  Text,
} from "@mantine/core";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

type PublicMoodboardData = {
  selected_style?: string;
  dress_code?: string;
  wedding_size?: string;
  palette?: PaletteColor[];
  inspirations?: WeddingIdentityInspirationApiItem[];
};

export default function PublicMoodboardPage() {
  const router = useRouter();
  const { id } = router.query;
  const [data, setData] = useState<PublicMoodboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const token = Array.isArray(id) ? id[0] : id;

  useEffect(() => {
    if (!token) return;

    // Faz a chamada para um endpoint público específico do seu Django
    api
      .get(`/api/public/wedding-identity/${token}/`)
      .then((res) => setData(res.data))
      .catch((err) => console.error("Erro ao carregar moodboard público", err))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading)
    return (
      <Container py="xl">
        <Text ta="center">Carregando moodboard...</Text>
      </Container>
    );
  if (!data)
    return (
      <Container py="xl">
        <Text ta="center">Moodboard não encontrado ou privado.</Text>
      </Container>
    );

  // Mapeia os dados estáticos baseados no retorno do banco
  const styleData = WEDDING_STYLES.find((s) => s.id === data.selected_style);
  const dressData = DRESS_CODE_OPTIONS.find((d) => d.id === data.dress_code);
  const sizeData = WEDDING_SIZES.find((size) => size.id === data.wedding_size);
  const inspirations = data.inspirations ?? [];
  const styleImage =
    STYLE_IMAGE_MAP[data.selected_style || ""] ||
    "https://via.placeholder.com/600x400?text=Estilo+Nao+Definido";
  const dressesImage = data.dress_code
    ? DRESS_CODE_REFERENCE_IMAGES[data.dress_code]
    : undefined;

  const renderFallbackVisual = (
    label: string,
    emoji: string,
    background: string,
  ) => (
    <Card.Section
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
    </Card.Section>
  );

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Stack gap={4}>
          <Group justify="space-between" align="center" gap={4} mb={"xl"}>
            <Text
              fw={800}
              size="lg"
              c={PALETTE.ink}
              onClick={() => router.push("/")}
              style={{ letterSpacing: -0.5, cursor: "pointer" }}
            >
              Marriplan<span style={{ color: PALETTE.roseGold }}>.</span>
            </Text>
            <Text size="xs" tt="uppercase" fw={700} c="dimmed" lts={1}>
              ✦ Inspiração Geral
            </Text>
          </Group>
          <Text size="2xl" fw={800}>
            Identidade Visual do Casamento
          </Text>
        </Stack>

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
          <Card withBorder radius="lg" p="lg">
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
              {data.palette?.length || 0}
            </Text>
            <Text size="sm" c="dimmed">
              cores selecionadas
            </Text>
            <Group gap={4} wrap="nowrap" mt={10}>
              {data.palette?.map((c: PaletteColor) => (
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

          <Card withBorder radius="lg" p="lg">
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
              {sizeData?.label || "-"}
            </Text>
            <Text size="sm" c="dimmed">
              {sizeData?.guestRange || "Selecione o porte do evento"}
            </Text>
          </Card>

          <Card withBorder radius="lg" p="lg">
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
              {styleData?.label || "-"}
            </Text>
            <Text size="sm" c="dimmed">
              {styleData?.subtitle || ""}
            </Text>
          </Card>

          <Card withBorder radius="lg" p="lg">
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
              {dressData?.label || "-"}
            </Text>
            <Text size="sm" c="dimmed">
              {dressData?.desc?.slice(0, 30) + "..." || ""}
            </Text>
          </Card>
        </SimpleGrid>

        <Card withBorder radius="lg" p="lg">
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
            <Group gap={10} align="flex-start" wrap="nowrap">
              {data.palette?.map((c) => (
                <Stack key={c.id} gap={8} align="center" style={{ flex: 1 }}>
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

        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
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
                <Text c="white" fw={700} size="xl" style={{ lineHeight: 1.1 }}>
                  {styleData?.label || "Estilo Nao Definido"}
                </Text>
                <Text c="rgba(255,255,255,0.8)" size="sm">
                  {styleData?.subtitle || ""}
                </Text>
              </Stack>
            </Box>
          </Card>

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
                                dressData?.color || "#C9A96E"
                              }88,${dressData?.color || "#C9A96E"}44)`
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
        </SimpleGrid>

        {inspirations.length > 0 && (
          <Stack gap="md">
            <Text size="sm" c="dimmed" tt="uppercase" fw={700} lts={1.2}>
              Mural de Inspirações Favoritadas
            </Text>
            <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="sm">
              {inspirations.map((item: WeddingIdentityInspirationApiItem) => (
                <Card
                  key={item.id}
                  withBorder
                  radius="md"
                  p={0}
                  style={{ overflow: "hidden" }}
                >
                  <Image
                    src={item.image_url}
                    fit="cover"
                    style={{ height: "350px" }}
                    alt="Inspiração salva"
                  />
                </Card>
              ))}
            </SimpleGrid>
          </Stack>
        )}
      </Stack>
    </Container>
  );
}

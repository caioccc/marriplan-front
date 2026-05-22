import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Stack, SimpleGrid, Card, Text, Group, Image, Box, Container } from "@mantine/core";
import { WEDDING_STYLES, DRESS_CODE_OPTIONS } from "@/constants/weddingIdentityData";
import { PaletteColor, WeddingIdentityInspirationApiItem } from "@/types/weddingIdentity";
import api from "@/services/api"; // Seu axios configurado

type PublicMoodboardData = {
  selected_style?: string;
  dress_code?: string;
  palette?: PaletteColor[];
  inspirations?: WeddingIdentityInspirationApiItem[];
};

export default function PublicMoodboardPage() {
  const router = useRouter();
  const { id } = router.query;
  const [data, setData] = useState<PublicMoodboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    // Faz a chamada para um endpoint público específico do seu Django
    api.get(`/api/public/wedding-identity/${id}/`)
      .then((res) => setData(res.data))
      .catch((err) => console.error("Erro ao carregar moodboard público", err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Container py="xl"><Text ta="center">Carregando moodboard...</Text></Container>;
  if (!data) return <Container py="xl"><Text ta="center">Moodboard não encontrado ou privado.</Text></Container>;

  // Mapeia os dados estáticos baseados no retorno do banco
  const styleData = WEDDING_STYLES.find((s) => s.id === data.selected_style);
  const dressData = DRESS_CODE_OPTIONS.find((d) => d.id === data.dress_code);
  const inspirations = data.inspirations ?? [];

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Stack gap={4}>
          <Text size="xs" tt="uppercase" fw={700} c="dimmed" lts={1}>✦ Inspiração Geral</Text>
          <Text size="2xl" fw={800}>Identidade Visual do Casamento</Text>
        </Stack>

        {/* Grid de Informações Básicas */}
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
          <Card withBorder radius="lg" p="md">
            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Estilo</Text>
            <Text fw={700} size="lg" mt={4}>{styleData?.label || "-"}</Text>
          </Card>
          <Card withBorder radius="lg" p="md">
            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Formalidade / Dress Code</Text>
            <Text fw={700} size="lg" mt={4}>{dressData?.label || "-"}</Text>
          </Card>
          <Card withBorder radius="lg" p="md">
            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Paleta de Cores</Text>
            <Group gap={6} mt={8}>
              {data.palette?.map((c: PaletteColor) => (
                <Box key={c.id} style={{ width: 24, height: 24, borderRadius: 6, background: c.hex }} />
              ))}
            </Group>
          </Card>
        </SimpleGrid>

        {/* Mural de Fotos Salvas */}
        {inspirations.length > 0 && (
          <Stack gap="md">
            <Text size="sm" c="dimmed" tt="uppercase" fw={700} lts={1.2}>Mural de Inspirações</Text>
            <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="sm">
              {inspirations.map((item: WeddingIdentityInspirationApiItem) => (
                <Card key={item.id} withBorder radius="md" p={0} style={{ overflow: "hidden" }}>
                  <Image src={item.image_url} height={250} fit="cover" alt="Inspiração" />
                </Card>
              ))}
            </SimpleGrid>
          </Stack>
        )}
      </Stack>
    </Container>
  );
}
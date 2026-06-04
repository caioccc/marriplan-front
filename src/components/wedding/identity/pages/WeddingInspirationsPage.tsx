import {
  searchWeddingInspirations,
  WeddingIdentityInspirationPayload,
} from "@/services/weddingIdentity.service";
import { FreePlanLimitBanner } from "@/components/billing/FreePlanLimitBanner";
import {
  FEATURE_LABELS,
  getFeatureLimit,
  isFeatureLimitReached,
} from "@/constants/plans";
import {
  ActionIcon,
  Button,
  Card,
  Center,
  Group,
  Image,
  Loader,
  Overlay,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconHeart,
  IconHeartFilled,
  IconMaximize,
  IconSearch,
} from "@tabler/icons-react";
import React, { useEffect, useRef, useState } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { softButtonStyles } from "@/styles";

interface WeddingInspirationsPageProps {
  selectedStyle: string;
  dressCode: string;
  selectedImages: WeddingIdentityInspirationPayload[];
  setSelectedImages: React.Dispatch<
    React.SetStateAction<WeddingIdentityInspirationPayload[]>
  >;
  onOpenImageFullscreen?: (src: string, alt: string) => void;
}

export const WeddingInspirationsPage: React.FC<
  WeddingInspirationsPageProps
> = ({
  selectedStyle,
  dressCode,
  selectedImages,
  setSelectedImages,
  onOpenImageFullscreen,
}) => {
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState(""); // Controla o termo submetido de fato
  const [images, setImages] = useState<WeddingIdentityInspirationPayload[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);

  // Estados para controle de paginação infinita
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const { isPremium } = useSubscription();

  const pageSize = 12;
  const hasMore = images.length < total;
  const initialLoading = loading && images.length === 0;
  const loadingMore = loading && images.length > 0;
  const inspirationLimit = getFeatureLimit("inspirations");
  const selectedUniqueCount = selectedImages.reduce(
    (acc, item) => {
      if (acc.seen.has(item.image_url)) {
        return acc;
      }

      acc.seen.add(item.image_url);
      acc.count += 1;
      return acc;
    },
    { seen: new Set<string>(), count: 0 },
  ).count;
  const inspirationLimitReached = isFeatureLimitReached(
    "inspirations",
    selectedUniqueCount,
    isPremium,
  );

  // Carregamento assíncrono dos dados (idêntico ao padrão adotado em Fornecedores)
  useEffect(() => {
    let mounted = true;

    async function loadInspirations() {
      setLoading(true);
      setLoadError(false);
      try {
        const data = await searchWeddingInspirations({
          selectedStyle,
          dressCode,
          query: activeQuery || undefined,
          numImages: pageSize, // Se a sua API aceitar paginação por parâmetro dinâmico
          // Caso seu endpoint use page numérico tradicional: page,
        });

        if (!mounted) return;

        // Se sua API envelopar o retorno com paginação DRF (.results e .count)
        const results = data.results || [];
        const totalCount = data.count || results.length || 0;

        setImages((currentItems) =>
          page === 1 ? results : [...currentItems, ...results],
        );
        setTotal(totalCount);
      } catch {
        if (mounted) {
          setLoadError(true);
          notifications.show({
            color: "red",
            message: "Não foi possível carregar mais imagens de inspiração.",
          });
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadInspirations();

    return () => {
      mounted = false;
    };
  }, [page, activeQuery, selectedStyle, dressCode]);

  // Efeito do IntersectionObserver para capturar a rolagem da div sentinela
  useEffect(() => {
    const sentinel = loadMoreRef.current;
    if (!sentinel || !hasMore || loading || loadError) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting) {
          setPage((currentPage) => currentPage + 1);
        }
      },
      { rootMargin: "180px 0px" }, // Ajustado margem ligeiramente menor para encaixe em containers modais
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loading, loadError]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reseta para a primeira página na nova busca
    setActiveQuery(searchQuery);
  };

  const toggleImageSelection = (item: WeddingIdentityInspirationPayload) => {
    const imageUrl = typeof item === "string" ? item : item.image_url;
    const isAlreadySelected = selectedImages.some(
      (img) => img.image_url === imageUrl,
    );

    if (isAlreadySelected) {
      setSelectedImages((prev) =>
        prev.filter((img) => img.image_url !== imageUrl),
      );
    } else {
      if (inspirationLimitReached) {
        notifications.show({
          color: "orange",
          message: "Você atingiu o limite de inspirações do plano gratuito.",
        });
        return;
      }

      const payload: WeddingIdentityInspirationPayload = {
        image_url: imageUrl,
        title: item.title || `Inspiração ${selectedStyle}`,
        description: item.description || "",
        selected_style: selectedStyle,
        dress_code: dressCode,
        is_favorite: true,
        is_liked: true,
        query: activeQuery || undefined,
        thumbnail_url: item.thumbnail_url || imageUrl,
      };
      setSelectedImages((prev) => [...prev, payload]);
    }
  };

  return (
    <Stack gap="md" style={{ minHeight: "450px" }}>
      {inspirationLimitReached ? (
        <FreePlanLimitBanner
          featureLabel={FEATURE_LABELS.inspirations}
          limit={typeof inspirationLimit === "number" ? inspirationLimit : 0}
          currentUsage={selectedUniqueCount}
          title="Você atingiu o limite do plano gratuito para inspirações"
          description="No plano Free você pode manter até 5 inspirações. Para buscar e salvar novas referências, faça upgrade para o Premium."
        />
      ) : (
        <form onSubmit={handleSearchSubmit}>
          <Group align="flex-end">
            <TextInput
              placeholder="Ex: buquê de rosas brancas, altar ao ar livre..."
              label="Buscar mais inspirações"
              description="Refine a busca gerada pela IA para o seu estilo"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
              style={{ flex: 1 }}
              leftSection={<IconSearch size={16} />}
            />
            <Button
              styles={softButtonStyles}
              type="submit"
              variant="light"
              loading={loading && page === 1}
              leftSection={<IconSearch size={16} />}
            >
              Buscar
            </Button>
          </Group>
        </form>
      )}

      {initialLoading ? (
        <Center py="xl" style={{ flex: 1 }}>
          <Stack align="center" gap="xs">
            <Loader size="md" type="dots" />
            <Text size="sm" c="dimmed">
              Buscando referências perfeitas...
            </Text>
          </Stack>
        </Center>
      ) : images.length === 0 ? (
        <Center py="xl">
          <Text c="dimmed" size="sm">
            Nenhuma imagem encontrada para os critérios atuais.
          </Text>
        </Center>
      ) : (
        <>
          {/* Grid de renderização das imagens */}
          <SimpleGrid cols={{ base: 1, sm: 3, md: 4 }} spacing="md">
            {images.map((item, index) => {
              const url = typeof item === "string" ? item : item.image_url;
              const isSelected = selectedImages.some(
                (img) => img.image_url === url,
              );

              return (
                <Card
                  key={`${url}-${index}`}
                  shadow="sm"
                  padding="0"
                  radius="md"
                  withBorder
                  style={{
                    cursor: "pointer",
                    overflow: "hidden",
                    position: "relative",
                    transform: isSelected ? "scale(0.98)" : "none",
                    transition: "transform 0.2s ease",
                    borderColor: isSelected
                      ? "var(--mantine-color-blue-filled)"
                      : undefined,
                  }}
                  onClick={() => toggleImageSelection(item)}
                >
                  <Image
                    src={url}
                    fit="cover"
                    style={{ height: "350px" }}
                    alt={`Inspiração ${index + 1}`}
                    fallbackSrc="https://placehold.co/600x400?text=Sem+Imagem"
                  />

                  {isSelected && (
                    <Overlay color="#000" opacity={0.15} zIndex={1} />
                  )}

                  {onOpenImageFullscreen ? (
                    <ActionIcon
                      variant="filled"
                      color="dark"
                      radius="xl"
                      size="md"
                      aria-label="Abrir imagem em fullscreen"
                      style={{
                        position: "absolute",
                        top: "10px",
                        left: "10px",
                        zIndex: 2,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenImageFullscreen(url, `Inspiração ${index + 1}`);
                      }}
                    >
                      <IconMaximize size={16} />
                    </ActionIcon>
                  ) : null}

                  <ActionIcon
                    variant={isSelected ? "filled" : "white"}
                    color="red"
                    radius="xl"
                    size="md"
                    style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      zIndex: 2,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleImageSelection(item);
                    }}
                  >
                    {isSelected ? (
                      <IconHeartFilled size={16} />
                    ) : (
                      <IconHeart size={16} />
                    )}
                  </ActionIcon>
                </Card>
              );
            })}
          </SimpleGrid>

          {/* Controlador visual e Div Sentinela da rolagem infinita */}
          <Stack gap="sm" align="center" py="md">
            <div ref={loadMoreRef} />
            {loadingMore ? (
              <Group gap="sm" py="sm">
                <Loader size="sm" />
                <Text size="sm" c="dimmed">
                  Carregando mais inspirações...
                </Text>
              </Group>
            ) : hasMore ? (
              <Text size="sm" c="dimmed">
                Role para carregar mais
              </Text>
            ) : (
              <Text size="sm" c="dimmed">
                Você visualizou todas as referências para este estilo
              </Text>
            )}
          </Stack>
        </>
      )}
    </Stack>
  );
};

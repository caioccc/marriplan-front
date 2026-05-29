import BaseLayout from "@/components/Layout/_BaseLayout";
import { FreePlanLimitBanner } from "@/components/billing/FreePlanLimitBanner";
import {
  FEATURE_LABELS,
  getFeatureLimit,
  isFeatureLimitReached,
} from "@/constants/plans";
import PageSectionHeader from "@/components/PageSectionHeader";
import { GiftFormModal } from "@/components/GiftFormModal";
import { giftsService } from "@/services/giftsService";
import {
  MarketplaceProduct,
  productsMarketplaceService,
} from "@/services/productsMarketplace";
import { inputStyles, primaryButtonStyles, softButtonStyles } from "@/styles";
import { Gift } from "@/types/gift";
import {
  Badge,
  Box,
  Button,
  Card,
  Group,
  Loader,
  Pagination,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconArrowLeft,
  IconCheck,
  IconPlus,
  IconSearch,
} from "@tabler/icons-react";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSubscription } from "@/hooks/useSubscription";

const pageSize = 12;

const paginationThemeStyles = `
  .product-pagination .mantine-Pagination-control {
    border-radius: 12px;
    border-color: var(--marriplan-border);
    color: var(--marriplan-text);
  }

  .product-pagination .mantine-Pagination-control[data-active] {
    background-color: var(--marriplan-rose);
    border-color: var(--marriplan-rose);
    color: #fff;
  }
`;

function normalizeKey(value?: string | null) {
  return (value || "").trim().toLowerCase();
}

function parseMarketplacePrice(value?: string) {
  if (!value) return 0;

  const cleanedValue = value.replace(/\s+/g, "").match(/-?[\d.,]+/)?.[0];
  if (!cleanedValue) return 0;

  let normalized = cleanedValue;

  if (normalized.includes(",") && normalized.includes(".")) {
    normalized = normalized.replace(/\./g, "").replace(",", ".");
  } else if (normalized.includes(",")) {
    normalized = normalized.replace(/\./g, "").replace(",", ".");
  } else if (/^\d{1,3}(?:\.\d{3})+$/.test(normalized)) {
    normalized = normalized.replace(/\./g, "");
  }

  const numeric = Number(normalized);
  return Number.isFinite(numeric) ? numeric : 0;
}

function getGiftCategoryFromMarketplace(category?: string) {
  switch (normalizeKey(category)) {
    case "cozinha":
      return "kitchen";
    case "banheiro":
      return "home";
    case "moveis":
      return "furniture";
    case "eletrodomesticos":
      return "electronics";
    case "decoracao":
      return "decor";
    case "tecnologia":
      return "electronics";
    case "lavanderia":
      return "home";
    case "lua_de_mel":
      return "travel";
    default:
      return "home";
  }
}

function getMarketplaceCategoryLabel(category?: string) {
  switch (normalizeKey(category)) {
    case "cozinha":
      return "Cozinha";
    case "banheiro":
      return "Banheiro";
    case "moveis":
      return "Móveis";
    case "eletrodomesticos":
      return "Eletrodomésticos";
    case "decoracao":
      return "Decoração";
    case "tecnologia":
      return "Tecnologia";
    case "lavanderia":
      return "Lavanderia";
    case "lua_de_mel":
      return "Lua de Mel";
    case "quarto":
      return "Quarto";
    default:
      return category || "Outros";
  }
}

function formatPrice(value?: string) {
  const amount = parseMarketplacePrice(value);
  if (!amount) return "Preço sob consulta";
  return amount.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function getGradientBackground(name: string) {
  const palette = [
    "linear-gradient(135deg, #b58b7a 0%, #d9b08c 45%, #f4d5a6 100%)",
    "linear-gradient(135deg, #8e7e6f 0%, #b58b7a 45%, #e4c7a6 100%)",
    "linear-gradient(135deg, #a87f76 0%, #cba27c 50%, #edd8b5 100%)",
    "linear-gradient(135deg, #9f6f73 0%, #c08f7f 50%, #f1d3bc 100%)",
  ];

  const hash = name
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  return palette[hash % palette.length];
}

function dedupeProducts(items: MarketplaceProduct[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = normalizeKey(item.product_url) || normalizeKey(item.title);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function MarketplaceProductCard({
  product,
  alreadyAdded,
  adding,
  canAdd,
  onAdd,
}: {
  product: MarketplaceProduct;
  alreadyAdded: boolean;
  adding: boolean;
  canAdd: boolean;
  onAdd?: (product: MarketplaceProduct) => void;
}) {
  const imageUrl = product.image_url || "";
  const categoryLabel = getMarketplaceCategoryLabel(product.category);
  const priceLabel = formatPrice(product.price);

  return (
    <Card
      radius="xl"
      withBorder
      shadow="sm"
      style={{ overflow: "hidden", background: "rgba(255,255,255,0.92)" }}
    >
      <Box style={{ position: "relative" }}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.title}
            style={{
              width: "100%",
              height: 220,
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : (
          <Box
            style={{
              height: 220,
              background: getGradientBackground(product.title),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 24,
            }}
          >
            <Text
              fw={800}
              c="#fff"
              ta="center"
              size="xl"
              lineClamp={2}
              style={{ textShadow: "0 8px 24px rgba(0, 0, 0, 0.28)" }}
            >
              {product.title}
            </Text>
          </Box>
        )}

        <Box
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            right: 12,
            display: "flex",
            justifyContent: "space-between",
            gap: 8,
            alignItems: "flex-start",
          }}
        >
          <Group gap={6} wrap="wrap">
            <Badge radius="xl" color="orange" variant="filled">
              {categoryLabel}
            </Badge>
            <Badge radius="xl" color="gray" variant="light">
              {product.store || "Amazon Brasil"}
            </Badge>
          </Group>
        </Box>
      </Box>

      <Stack gap="sm" p="md">
        <Stack gap={4}>
          <Text fw={700} size="lg" lineClamp={2}>
            {product.title}
          </Text>
          <Text size="sm" c="dimmed" lineClamp={3}>
            {product.description || "Produto encontrado no marketplace."}
          </Text>
        </Stack>

        <Stack gap={4} align="center" mt="xs">
          <Text size="xs" tt="uppercase" fw={700} c="dimmed" ta="center">
            {alreadyAdded ? "Já está na lista" : "Pronto para adicionar"}
          </Text>
          <Text
            fw={800}
            size="xl"
            ta="center"
            c="var(--marriplan-rose)"
            style={{ letterSpacing: "-0.02em" }}
          >
            {priceLabel}
          </Text>
          {canAdd ? (
            <Button
              size="md"
              styles={primaryButtonStyles}
              leftSection={alreadyAdded ? <IconCheck size={16} /> : <IconPlus size={16} />}
              loading={adding}
              disabled={alreadyAdded}
              onClick={() => onAdd?.(product)}
              fullWidth
            >
              {alreadyAdded ? "Adicionado" : "Adicionar à lista"}
            </Button>
          ) : (
            <Text size="sm" c="dimmed" ta="center">
              Seu plano Free não permite adicionar novos presentes.
            </Text>
          )}
        </Stack>
      </Stack>
    </Card>
  );
}

export default function ProductMarketplacePage() {
  const router = useRouter();
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [existingGiftKeys, setExistingGiftKeys] = useState<Set<string>>(
    new Set(),
  );
  const [existingGiftCount, setExistingGiftCount] = useState(0);
  const [addingProductKey, setAddingProductKey] = useState<string | null>(null);
  const pageTopRef = useRef<HTMLDivElement>(null);
  const { isPremium } = useSubscription();
  const giftLimit = getFeatureLimit("gifts");
  const giftLimitReached = isFeatureLimitReached(
    "gifts",
    existingGiftCount,
    isPremium,
  );

  useEffect(() => {
    let mounted = true;

    async function loadExistingGifts() {
      try {
        const response = await giftsService.listAllGifts();
        const items = (response.results || []) as Gift[];
        const keys = new Set<string>();

        items.forEach((gift) => {
          if (gift.link) keys.add(normalizeKey(gift.link));
          if (gift.name) keys.add(normalizeKey(gift.name));
        });

        if (mounted) setExistingGiftKeys(keys);
        if (mounted) setExistingGiftCount(items.length);
      } catch {
        // ignore load errors and keep the marketplace usable
      }
    }

    loadExistingGifts();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadProducts() {
      setLoading(true);
      try {
        let results: MarketplaceProduct[] = [];

        if (searchTerm.trim()) {
          const response = await productsMarketplaceService.searchProducts(
            searchTerm.trim(),
            12,
          );
          results = response.results || [];
        } else {
          const response = await productsMarketplaceService.listFeaturedProducts(3);
          results = response.results || [];
        }

        if (mounted) {
          setProducts(dedupeProducts(results));
        }
      } catch {
        if (mounted) {
          setProducts([]);
          notifications.show({
            color: "red",
            message: "Não foi possível carregar os produtos do marketplace.",
          });
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadProducts();

    return () => {
      mounted = false;
    };
  }, [searchTerm]);

  const handleSearch = () => {
    setPage(1);
    setSearchTerm(searchInput.trim());
  };

  useEffect(() => {
    pageTopRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [page]);

  const visibleProducts = useMemo(() => {
    const start = (page - 1) * pageSize;
    return products.slice(start, start + pageSize);
  }, [page, products]);

  const totalPages = Math.max(1, Math.ceil(products.length / pageSize));

  const handleAddToList = async (product: MarketplaceProduct) => {
    const productKey = normalizeKey(product.product_url) || normalizeKey(product.title);
    if (!productKey) return;

    if (existingGiftKeys.has(productKey)) {
      notifications.show({
        color: "blue",
        message: "Este produto já está na sua lista.",
      });
      return;
    }

    setAddingProductKey(productKey);
    try {
      const savedGift = await giftsService.createGift({
        name: product.title,
        value: parseMarketplacePrice(product.price),
        link: product.product_url,
        description: product.description || "",
        category: getGiftCategoryFromMarketplace(product.category),
        image: product.image_url || "",
        status: "available",
      });

      setExistingGiftKeys((current) => {
        const next = new Set(current);
        if (savedGift.link) next.add(normalizeKey(savedGift.link));
        if (savedGift.name) next.add(normalizeKey(savedGift.name));
        next.add(productKey);
        return next;
      });

      notifications.show({
        color: "green",
        message: "Produto adicionado à sua lista.",
      });
    } catch (error) {
      const errorMessage =
        (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "Não foi possível adicionar este produto.";
      notifications.show({
        color: "red",
        message: errorMessage,
      });
    } finally {
      setAddingProductKey(null);
    }
  };

  const handleManualGiftSaved = (gift: Gift) => {
    const keys = new Set(existingGiftKeys);
    if (gift.link) keys.add(normalizeKey(gift.link));
    if (gift.name) keys.add(normalizeKey(gift.name));
    setExistingGiftKeys(keys);
    notifications.show({
      color: "green",
      message: "Produto personalizado criado com sucesso.",
    });
  };

  return (
    <BaseLayout>
      <Stack gap="lg" py="md">
        <div ref={pageTopRef} style={{ scrollMarginTop: "20px" }} />
        <PageSectionHeader
          eyebrow="Marketplace do casal"
          title="Marketplace de Produtos"
          description="Busque produtos da Amazon, adicione itens sugeridos ao seu casamento e cadastre um novo produto quando quiser."
          actions={
            <Group gap="xs">
              <Button
                variant="default"
                styles={softButtonStyles}
                leftSection={<IconArrowLeft size={18} />}
                onClick={() => router.push("/gifts")}
              >
                Voltar
              </Button>
              {!giftLimitReached ? (
                <Button
                  leftSection={<IconPlus size={18} />}
                  styles={primaryButtonStyles}
                  onClick={() => setManualModalOpen(true)}
                >
                  Adicionar Novo Produto
                </Button>
              ) : null}
            </Group>
          }
        />

        {giftLimitReached ? (
          <FreePlanLimitBanner
            featureLabel={FEATURE_LABELS.gifts}
            limit={typeof giftLimit === "number" ? giftLimit : 0}
            currentUsage={existingGiftCount}
            title="Você atingiu o limite do plano gratuito para presentes"
            description="No plano Free você pode manter até 5 presentes. Para adicionar novos itens ao marketplace ou salvar produtos sugeridos, faça upgrade para o Premium."
          />
        ) : null}

        <Card radius="xl" p="md" withBorder>
          <Stack gap="md">
            <Group gap="sm" align="flex-end" wrap="nowrap">
              <TextInput
                label="Buscar produtos"
                placeholder="Nome, descrição ou categoria"
                leftSection={<IconSearch size={16} />}
                value={searchInput}
                onChange={(event) => setSearchInput(event.currentTarget.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleSearch();
                  }
                }}
                style={{ flex: 1, minWidth: 0 }}
                styles={inputStyles}
              />
              <Button
                styles={primaryButtonStyles}
                leftSection={<IconSearch size={16} />}
                onClick={handleSearch}
                loading={loading}
              >
                Buscar
              </Button>
            </Group>

            <Group justify="space-between" align="center" wrap="wrap">
              <Text size="sm" c="dimmed">
                {searchTerm.trim()
                  ? `${products.length} produto(s) encontrados para "${searchTerm.trim()}"`
                  : `${products.length} produtos sugeridos para começar sua lista`}
              </Text>
              <Text size="sm" c="dimmed">
                Paginação de {pageSize} itens por página
              </Text>
            </Group>
          </Stack>
        </Card>

        {loading ? (
          <Card radius="xl" p="xl" withBorder>
            <Group justify="center" py="xl">
              <Loader />
            </Group>
          </Card>
        ) : products.length === 0 ? (
          <Card radius="xl" p="xl" withBorder>
            <Stack align="center" gap="sm" py="xl">
              <Badge radius="xl" color="gray" variant="light">
                Nenhum resultado
              </Badge>
              <Title order={4}>Nenhum produto encontrado</Title>
              <Text c="dimmed" ta="center" maw={460}>
                Tente buscar por outro termo ou crie um produto manualmente.
              </Text>
              {!giftLimitReached ? (
                <Button
                  leftSection={<IconPlus size={18} />}
                  styles={primaryButtonStyles}
                  onClick={() => setManualModalOpen(true)}
                >
                  Adicionar Novo Produto
                </Button>
              ) : null}
            </Stack>
          </Card>
        ) : (
          <>
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
              {visibleProducts.map((product) => {
                const productKey =
                  normalizeKey(product.product_url) || normalizeKey(product.title);
                const alreadyAdded = existingGiftKeys.has(productKey);

                return (
                  <MarketplaceProductCard
                    key={product.product_url || product.title}
                    product={product}
                    alreadyAdded={alreadyAdded}
                    adding={addingProductKey === productKey}
                    canAdd={!giftLimitReached}
                    onAdd={handleAddToList}
                  />
                );
              })}
            </SimpleGrid>

            {totalPages > 1 ? (
              <Group justify="center">
                <Pagination
                    className="product-pagination"
                  value={page}
                  onChange={setPage}
                  total={totalPages}
                />
              </Group>
            ) : null}
          </>
        )}
      </Stack>

      <GiftFormModal
        opened={manualModalOpen}
        onClose={() => setManualModalOpen(false)}
        onSave={handleManualGiftSaved}
        title="Adicionar Novo Produto"
      />

      <style>{paginationThemeStyles}</style>
    </BaseLayout>
  );
}
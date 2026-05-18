import BaseLayout from "@/components/Layout/_BaseLayout";
import PageSectionHeader from "@/components/PageSectionHeader";
import { SupplierCard } from "@/components/SupplierCard";
import { SupplierFormModal } from "@/components/SupplierFormModal";
import { useAuth } from "@/contexts/AuthContext";
import {
  deleteWeddingSupplier,
  listSupplierCategories,
  listWeddingSuppliers,
  Supplier,
  SupplierCategory,
  WeddingSupplier,
} from "@/services/suppliers";
import {
  inputStyles,
  primaryButtonStyles,
  segmentedTabsStyles,
  softButtonStyles,
} from "@/styles";
import {
  Badge,
  Button,
  Card,
  Group,
  Loader,
  Modal,
  Pagination,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
  SegmentedControl,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconCards,
  IconPlus,
  IconSearch,
  IconTable,
} from "@tabler/icons-react";
import { DataTable } from "mantine-datatable";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

function formatCurrency(value?: string | number | null) {
  if (value === undefined || value === null || value === "")
    return "A combinar";
  const numeric = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(numeric)) return "A combinar";
  return numeric.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function MySuppliersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [items, setItems] = useState<WeddingSupplier[]>([]);
  const [categories, setCategories] = useState<SupplierCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "cards" | "gallery">(
    "cards",
  );
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [supplierModalOpen, setSupplierModalOpen] = useState(false);
  const [supplierModalMode, setSupplierModalMode] = useState<"create" | "edit">(
    "edit",
  );
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null,
  );
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [supplierToRemove, setSupplierToRemove] =
    useState<WeddingSupplier | null>(null);
  const pageSize = 12;

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const [weddingData, categoriesData] = await Promise.all([
          listWeddingSuppliers({
            page,
            page_size: pageSize,
            search,
            status,
            favorite: favoriteOnly ? "true" : "",
            ordering: "-is_favorite,-updated_at",
          }),
          listSupplierCategories(),
        ]);
        if (!mounted) return;
        setItems(weddingData.results || []);
        setTotal(weddingData.count || 0);
        setCategories(categoriesData.results || categoriesData || []);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [page, search, status, favoriteOnly]);

  const handleOpenEditSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setSupplierModalMode("edit");
    setSupplierModalOpen(true);
  };

  const handleRemoveWeddingSupplier = (weddingSupplier: WeddingSupplier) => {
    setSupplierToRemove(weddingSupplier);
    setRemoveModalOpen(true);
  };

  const handleSavedSupplier = (savedSupplier: Supplier) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.supplier_detail?.id === savedSupplier.id
          ? { ...item, supplier_detail: savedSupplier }
          : item,
      ),
    );
  };

  const handleConfirmRemove = async () => {
    if (!supplierToRemove) return;

    try {
      await deleteWeddingSupplier(supplierToRemove.id);
      setItems((currentItems) =>
        currentItems.filter((item) => item.id !== supplierToRemove.id),
      );
      setTotal((currentTotal) => Math.max(0, currentTotal - 1));
      notifications.show({
        color: "green",
        message: "Fornecedor removido do casamento.",
      });
      setRemoveModalOpen(false);
      setSupplierToRemove(null);
    } catch {
      notifications.show({
        color: "red",
        message: "Não foi possível remover este fornecedor do casamento.",
      });
    }
  };

  const rows = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        supplier_name: item.supplier_detail?.name || "-",
        category_name: item.supplier_detail?.category_detail?.name || "-",
        location:
          [item.supplier_detail?.city, item.supplier_detail?.state]
            .filter(Boolean)
            .join(" • ") || "-",
      })),
    [items],
  );

  return (
    <BaseLayout>
      <Stack gap="lg" py="md">
        <PageSectionHeader
          eyebrow="Gestão do casamento"
          title="Meus Fornecedores"
          description="Acompanhe status, valores, favoritos e contratos no mesmo lugar."
          actions={
            <Group gap="sm">
              <Button
                variant="default"
                styles={softButtonStyles}
                onClick={() => router.push("/meus-fornecedores/fornecedores")}
              >
                Ir ao marketplace
              </Button>
              <Button
                leftSection={<IconPlus size={18} />}
                styles={primaryButtonStyles}
                onClick={() => router.push("/meus-fornecedores/fornecedores")}
              >
                Adicionar fornecedor
              </Button>
            </Group>
          }
          filters={
            <Stack gap="md">
              <Group grow align="flex-end" wrap="wrap">
                <TextInput
                  label="Buscar"
                  placeholder="Nome do fornecedor"
                  leftSection={<IconSearch size={16} />}
                  value={search}
                  onChange={(event) => {
                    setSearch(event.currentTarget.value);
                    setPage(1);
                  }}
                  styles={inputStyles}
                />
                <Select
                  label="Status"
                  data={[
                    { value: "", label: "Todos" },
                    { value: "QUOTING", label: "Cotando" },
                    { value: "NEGOTIATING", label: "Negociando" },
                    { value: "HIRED", label: "Contratado" },
                    { value: "PAID", label: "Pago" },
                    { value: "CANCELED", label: "Cancelado" },
                  ]}
                  value={status}
                  onChange={(value) => {
                    setStatus(value || "");
                    setPage(1);
                  }}
                  styles={inputStyles}
                />
                <Select
                  label="Favoritos"
                  data={[
                    { value: "all", label: "Todos" },
                    { value: "only", label: "Somente favoritos" },
                  ]}
                  value={favoriteOnly ? "only" : "all"}
                  onChange={(value) => {
                    setFavoriteOnly(value === "only");
                    setPage(1);
                  }}
                  styles={inputStyles}
                />
              </Group>
              <Group justify="space-between" wrap="wrap">
                <Text size="sm" c="dimmed">
                  {total} fornecedores no casamento
                </Text>
              </Group>
            </Stack>
          }
        />

        {loading ? (
          <Card radius="xl" p="xl" withBorder>
            <Group justify="center" py="xl">
              <Loader />
            </Group>
          </Card>
        ) : items.length === 0 ? (
          <Card radius="xl" p="xl" withBorder>
            <Stack align="center" gap="sm" py="xl">
              <Badge radius="xl" color="gray" variant="light">
                Lista vazia
              </Badge>
              <Title order={4}>Você ainda não adicionou fornecedores</Title>
              <Text c="dimmed" ta="center" maw={480}>
                Comece pelo marketplace e acompanhe tudo em uma visão simples
                depois.
              </Text>
              <Button
                style={softButtonStyles}
                variant="default"
                leftSection={<IconPlus size={18} />}
                onClick={() => router.push("/meus-fornecedores/fornecedores")}
              >
                Ir para marketplace
              </Button>
            </Stack>
          </Card>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
            {items.map((item) => (
              <SupplierCard
                key={item.id}
                supplier={item.supplier_detail!}
                weddingSupplier={item}
                onView={(supplier) =>
                  router.push(`/meus-fornecedores/fornecedores/${supplier.id}`)
                }
                onAdd={(supplier) =>
                  router.push(`/meus-fornecedores/fornecedores/${supplier.id}`)
                }
                onEdit={handleOpenEditSupplier}
                onRemove={() => handleRemoveWeddingSupplier(item)}
                canEdit={item.supplier_detail?.created_by_user === user?.id}
              />
            ))}
          </SimpleGrid>
        )}

        {total > pageSize ? (
          <Group justify="center">
            <Pagination
              value={page}
              onChange={setPage}
              total={Math.max(1, Math.ceil(total / pageSize))}
            />
          </Group>
        ) : null}
      </Stack>

      <SupplierFormModal
        opened={supplierModalOpen}
        mode={supplierModalMode}
        supplier={selectedSupplier}
        categories={categories}
        onClose={() => setSupplierModalOpen(false)}
        onSaved={handleSavedSupplier}
      />

      <Modal
        opened={removeModalOpen}
        onClose={() => setRemoveModalOpen(false)}
        title="Remover do casamento"
        centered
      >
        <Stack gap="md">
          <Text>
            Tem certeza que deseja remover este fornecedor do casamento?
          </Text>
          <Text size="sm" c="dimmed">
            Esta ação remove apenas a relação com o casamento. O fornecedor
            original não será excluído.
          </Text>
          <Group justify="flex-end">
            <Button
              variant="default"
              styles={softButtonStyles}
              onClick={() => setRemoveModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button color="red" onClick={handleConfirmRemove}>
              Remover
            </Button>
          </Group>
        </Stack>
      </Modal>
    </BaseLayout>
  );
}

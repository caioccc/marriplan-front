import BaseLayout from "@/components/Layout/_BaseLayout";
import { SupplierCard } from "@/components/SupplierCard";
import { SupplierFormModal } from "@/components/SupplierFormModal";
import { deleteWeddingSupplier, listSupplierCategories, listWeddingSuppliers, Supplier, SupplierCategory, WeddingSupplier } from "@/services/suppliers";
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
  Pagination,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
  SegmentedControl,
  Modal,
} from "@mantine/core";
import {
  IconCards,
  IconLayoutGrid,
  IconPlus,
  IconSearch,
  IconTable,
} from "@tabler/icons-react";
import { DataTable } from "mantine-datatable";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { notifications } from "@mantine/notifications";

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
  const [supplierModalMode, setSupplierModalMode] = useState<"create" | "edit">("edit");
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [supplierToRemove, setSupplierToRemove] = useState<WeddingSupplier | null>(null);
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
      setItems((currentItems) => currentItems.filter((item) => item.id !== supplierToRemove.id));
      setTotal((currentTotal) => Math.max(0, currentTotal - 1));
      notifications.show({
        color: "green",
        message: "Fornecedor removido do casamento.",
      });
      setRemoveModalOpen(false);
      setSupplierToRemove(null);
    } catch (error) {
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
    <BaseLayout title="Meus Fornecedores">
      <Stack gap="lg" py="md">
        <Card
          radius="xl"
          p="xl"
          withBorder
          style={{
            background: "linear-gradient(135deg, #fffdf9 0%, #f6eee4 100%)",
          }}
        >
          <Group justify="space-between" align="center" wrap="wrap" gap="md">
            <Stack gap={4} style={{ maxWidth: 680 }}>
              <Text
                size="xs"
                tt="uppercase"
                fw={700}
                c="dimmed"
                style={{ letterSpacing: 1.2 }}
              >
                Gestão do casamento
              </Text>
              <Title order={2}>Meus Fornecedores</Title>
              <Text c="dimmed">
                Acompanhe status, valores, favoritos e contratos no mesmo lugar.
              </Text>
            </Stack>
          </Group>
          <Group justify="flex-end" mt="md">
            <Group gap="sm">
              <Button
                variant="default"
                styles={softButtonStyles}
                onClick={() => router.push("/fornecedores")}
              >
                Ir ao marketplace
              </Button>
              <Button
                leftSection={<IconPlus size={18} />}
                styles={primaryButtonStyles}
                onClick={() => router.push("/fornecedores")}
              >
                Adicionar fornecedor
              </Button>
            </Group>
          </Group>
        </Card>

        <Card
          radius="xl"
          p="md"
          withBorder
          style={{
            background: "var(--marriplan-surface)",
            border: "1px solid var(--marriplan-border)",
            padding: "12px 14px",
            borderRadius: 16,
          }}
        >
          <Group mb="md" justify="right">
            <SegmentedControl
              value={viewMode}
              onChange={(value) => setViewMode(value as typeof viewMode)}
              data={[
                { value: "table", label: <IconTable size={16} /> },
                { value: "cards", label: <IconCards size={16} /> },
              ]}
              styles={segmentedTabsStyles}
            />
          </Group>
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
          <Group justify="space-between" mt="md" wrap="wrap">
            <Text size="sm" c="dimmed">
              {total} fornecedores no casamento
            </Text>
          </Group>
        </Card>

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
                leftSection={<IconPlus size={18} />}
                onClick={() => router.push("/fornecedores")}
              >
                Ir para marketplace
              </Button>
            </Stack>
          </Card>
        ) : viewMode === "cards" ? (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
            {items.map((item) => (
              <SupplierCard
                key={item.id}
                supplier={item.supplier_detail!}
                weddingSupplier={item}
                onView={(supplier) => router.push(`/fornecedores/${supplier.id}`)}
                onAdd={(supplier) => router.push(`/fornecedores/${supplier.id}`)}
                onEdit={handleOpenEditSupplier}
                onRemove={() => handleRemoveWeddingSupplier(item)}
                canEdit={item.supplier_detail?.created_by_user === user?.id}
              />
            ))}
          </SimpleGrid>
        ) : (
          <Card radius="xl" p="sm" withBorder>
            <DataTable
              records={rows}
              columns={[
                { accessor: "supplier_name", title: "Fornecedor" },
                { accessor: "category_name", title: "Categoria" },
                { accessor: "location", title: "Cidade/Estado" },
                {
                  accessor: "status",
                  title: "Status",
                  render: (record) => (
                    <Badge
                      color={
                        record.status === "HIRED" || record.status === "PAID"
                          ? "green"
                          : record.status === "CANCELED"
                          ? "red"
                          : "yellow"
                      }
                      variant="light"
                    >
                      {record.status === "QUOTING" && "Cotando"}
                      {record.status === "NEGOTIATING" && "Negociando"}
                      {record.status === "HIRED" && "Contratado"}
                      {record.status === "PAID" && "Pago"}
                      {record.status === "CANCELED" && "Cancelado"}
                    </Badge>
                  ),
                },
                {
                  accessor: "values",
                  title: "Valores",
                  render: (record) => (
                    <Stack gap={2}>
                      <Text size="xs" c="dimmed">
                        {formatCurrency(record.estimated_price)}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {formatCurrency(record.negotiated_price)}
                      </Text>
                    </Stack>
                  ),
                },
                {
                  accessor: "actions",
                  title: "",
                  render: (record) => (
                    <Button
                      size="xs"
                      variant="light"
                      onClick={() =>
                        router.push(
                          `/fornecedores/${
                            record.supplier_detail?.id || record.id
                          }`,
                        )
                      }
                    >
                      Abrir
                    </Button>
                  ),
                },
              ]}
            />
          </Card>
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
            Esta ação remove apenas a relação com o casamento. O fornecedor original não será excluído.
          </Text>
          <Group justify="flex-end">
            <Button variant="default" styles={softButtonStyles} onClick={() => setRemoveModalOpen(false)}>
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

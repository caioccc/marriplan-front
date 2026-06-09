import { GalleryView } from "@/components/GalleryView";
import { GiftFormModal } from "@/components/GiftFormModal";
import ImportGiftsModal from "@/components/ImportGiftsModal";
import BaseLayout from "@/components/Layout/_BaseLayout";
import { ListView } from "@/components/ListView";
import { MarkAsPurchasedModal } from "@/components/MarkAsPurchasedModal";
import { MarriplanStatusBadge } from "@/components/MarriplanStatusBadge";
import PageSectionHeader from "@/components/PageSectionHeader";
import { PixSettingsModal } from "@/components/gifts/pix/PixSettingsModal";
import { useAuth } from "@/contexts/AuthContext";
import {
  getAllCategoryOptions,
  getCategoryLabel,
  getCategoryOptionsFromSlugs,
} from "@/lib/giftCategories";
import { giftsService } from "@/services/giftsService";
import { guests_list } from "@/services/guests";
import {
  inputStyles,
  primaryButtonStyles,
  segmentedTabsStyles,
  softButtonStyles,
} from "@/styles";
import { Gift } from "@/types/gift";
import {
  formatCurrency,
  getStatusBadgeStyle,
  STATUS_LABELS,
} from "@/utils/gifts";
import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Group,
  Menu,
  Modal,
  Pagination,
  SegmentedControl,
  Select,
  Skeleton,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IconBrandFacebook,
  IconBrandWhatsapp,
  IconCards,
  IconCheck,
  IconCopy,
  IconDotsVertical,
  IconDownload,
  IconEdit,
  IconExternalLink,
  IconEye,
  IconFileTypePdf,
  IconFilter,
  IconGift,
  IconGiftFilled,
  IconLayoutGrid,
  IconList,
  IconSearch,
  IconShare,
  IconStatusChange,
  IconTrash,
  IconUpload,
  IconWorldPin,
} from "@tabler/icons-react";
import { DataTable } from "mantine-datatable";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
const statusOptions = [
  { label: "Todos", value: "" },
  { label: "Disponíveis", value: "available" },
  { label: "Comprados", value: "purchased" },
  { label: "Reservados", value: "reserved" },
];

const statusLabels: Record<string, { label: string }> = {
  available: { label: "Disponível" },
  purchased: { label: "Comprado" },
  reserved: { label: "Reservado" },
};

// categoryOptions will be populated from backend gifts (unique categories)

const paginationThemeStyles = `
  .gifts-pagination .mantine-Pagination-control,
  .gifts-table .mantine-DataTable-pagination .mantine-Pagination-control,
  .gifts-table .mantine-Pagination-control {
    border-radius: 12px;
    border-color: var(--marriplan-border);
    color: var(--marriplan-text);
  }

  .gifts-pagination .mantine-Pagination-control[data-active],
  .gifts-table .mantine-DataTable-pagination .mantine-Pagination-control[data-active],
  .gifts-table .mantine-Pagination-control[data-active] {
    background-color: var(--marriplan-rose);
    border-color: var(--marriplan-rose);
    color: #fff;
  }
`;

const GiftsPage: NextPage = () => {
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 600px)");
  const { user } = useAuth();
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGift, setEditingGift] = useState<Gift | undefined>();
  const [shareModal, setShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [pixSettingsModalOpen, setPixSettingsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [draftCategory, setDraftCategory] = useState("");
  const [draftStatus, setDraftStatus] = useState("");
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);
  const [markModal, setMarkModal] = useState<{ open: boolean; gift?: Gift }>({
    open: false,
  });
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    gift?: Gift;
  }>({ open: false });
  const [guests, setGuests] = useState<{ id: string; name: string }[]>([]);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [generatingBasicGifts, setGeneratingBasicGifts] = useState(false);
  const [exporting, setExporting] = useState<"csv" | "xlsx" | "pdf" | null>(
    null,
  );
  const [viewMode, setViewMode] = useState<"table" | "cards" | "gallery">(
    "gallery",
  );
  const isCompactLayout = useMediaQuery("(max-width: 1024px)");
  const pageSize = 10;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categoryOptions, setCategoryOptions] = useState(
    getAllCategoryOptions(),
  );
  const pageTopRef = useRef<HTMLDivElement>(null);
  const pixSettingsAutoOpenedRef = useRef(false);
  const coupleName = user?.wedding_profile
    ? `${user.wedding_profile.nome_noivo || "Noivo"}${
        user.wedding_profile.nome_noivo && user.wedding_profile.nome_noiva
          ? " & "
          : ""
      }${user.wedding_profile.nome_noiva || "Noiva"}`
    : "Noivos";

  useEffect(() => {
    if (!router.isReady) return;
    if (router.query.openPixSettings !== "1") return;
    if (pixSettingsAutoOpenedRef.current) return;

    pixSettingsAutoOpenedRef.current = true;
    setPixSettingsModalOpen(true);
  }, [router.isReady, router.query.openPixSettings]);

  useEffect(() => {
    let mounted = true;
    async function loadAllCategories() {
      try {
        const res = await giftsService.listAllGifts();
        const items = (res.results || []) as Gift[];
        const cats = Array.from(
          new Set(
            items
              .map((g: Gift) => g.category)
              .filter(
                (c): c is string => typeof c === "string" && c.length > 0,
              ),
          ),
        );
        const opts = getCategoryOptionsFromSlugs(cats);
        if (mounted) setCategoryOptions(opts);
      } catch {
        // silently ignore
      }
    }
    loadAllCategories();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (advancedFiltersOpen) {
      setDraftCategory(category);
      setDraftStatus(status);
    }
  }, [advancedFiltersOpen, category, status]);

  useEffect(() => {
    if (isCompactLayout && viewMode === "table") {
      setViewMode("cards");
    }
  }, [isCompactLayout, viewMode]);

  useEffect(() => {
    pageTopRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [page]);

  function translateStatus(g: Gift) {
    switch (g.status) {
      case "available":
        return "Disponível";
      case "purchased":
        return "Comprado";
      case "reserved":
        return "Reservado";
    }
    return "Disponível";
  }

  async function fetchAllGifts() {
    let currentPage = 1;
    let results: Gift[] = [];
    let count = 0;
    while (true) {
      const data = await giftsService.listGifts({ page: currentPage });
      if (currentPage === 1) count = data.count || 0;
      results = results.concat(data.results || []);
      if (!data.results?.length || results.length >= count) break;
      currentPage += 1;
    }
    return { results, count };
  }

  async function refreshGiftList() {
    const res = await giftsService.listGifts({
      page,
      status,
      search,
      category,
    });
    setGifts(res.results);
    setTotal(res.count);
    return res;
  }

  useEffect(() => {
    setLoading(true);
    giftsService
      .listGifts({ page, status, search, category })
      .then((res) => {
        setGifts(res.results);
        setTotal(res.count);
      })
      .finally(() => setLoading(false));
    guests_list({ page_size: 1000 }).then((res) => {
      setGuests(
        res.results.map((g: { id: string; name: string }) => ({
          id: g.id,
          name: g.name,
        })),
      );
    });
  }, [status, page, search, category]);

  const handleMarkAsPurchased = (gift: Gift) => {
    setMarkModal({ open: true, gift });
  };
  const handleMarkAsAvailable = async (gift: Gift) => {
    setLoading(true);
    await giftsService.updateGift(gift.id, {
      status: "available",
      purchased_by: "",
      reserved_by: "",
      reserved_message: "",
    });
    refreshGiftList().finally(() => setLoading(false));
  };
  const handleConfirmMark = async (purchasedBy: string) => {
    if (!markModal.gift) return;
    setLoading(true);
    await giftsService
      .markAsPurchased(markModal.gift.id, {
        purchased_by: purchasedBy,
      })
      .then(() => {
        refreshGiftList().finally(() => setLoading(false));
        setMarkModal({ open: false });
      })
      .catch(() => {
        notifications.show({
          color: "red",
          message: "Não foi possível marcar o presente como comprado.",
        });
      });
  };

  const handleConfirmDeleteGift = async () => {
    if (!deleteModal.gift) return;
    setLoading(true);
    try {
      await giftsService.deleteGift(deleteModal.gift.id);
      await refreshGiftList();
      setDeleteModal({ open: false });
      notifications.show({
        color: "green",
        message: "Presente excluído com sucesso.",
      });
    } catch (err) {
      notifications.show({
        color: "red",
        message:
          (err as { response?: { data?: { detail?: string } } })?.response?.data
            ?.detail || "Não foi possível excluir o presente.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBasicGifts = async () => {
    setGeneratingBasicGifts(true);
    setLoading(true);
    try {
      const res = await giftsService.generateBasicGifts();
      await refreshGiftList();
      notifications.show({
        color: "green",
        message:
          res.detail ||
          `${res.created || 0} presente(s) adicionados à lista básica.`,
      });
    } catch (err) {
      notifications.show({
        color: "red",
        message:
          (err as { response?: { data?: { detail?: string } } })?.response?.data
            ?.detail || "Não foi possível gerar a lista básica.",
      });
    } finally {
      setGeneratingBasicGifts(false);
      setLoading(false);
    }
  };

  const handleShare = async () => {
    setLoading(true);
    try {
      const res = await giftsService.getShareToken();
      const token = res.token;
      setShareUrl(`${window.location.origin}/gifts/share/${token}`);
      setShareModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    setLoading(true);
    try {
      const blob = await giftsService.downloadTemplate();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "modelo_lista_presentes.xlsx");
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch {
      // Tratar erro
    } finally {
      setLoading(false);
    }
  };

  const handleImportChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setImporting(true);
    setImportError(null);
    setImportSuccess(null);
    const formData = new FormData();
    formData.append("file", e.target.files[0]);
    try {
      await giftsService.importGifts(formData);
      setImportSuccess("Importação realizada com sucesso!");
      // Atualiza lista
      giftsService.listGifts({ page, status, search, category }).then((res) => {
        setGifts(res.results);
        setTotal(res.count);
      });
    } catch (err) {
      setImportError(
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || "Erro ao importar planilha.",
      );
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleExportPDF = async () => {
    setLoading(true);
    try {
      const blob = await giftsService.exportPDF({ status, search, category });
      const url = window.URL.createObjectURL(
        new Blob([blob], { type: "application/pdf" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "lista_presentes.pdf");
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch {
      // Tratar erro
    } finally {
      setLoading(false);
    }
  };

  // Função para o modal de importação: upload do arquivo final
  const handleFinalizeImport = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await giftsService.importGifts(formData);
    if (res.errors && res.errors.length > 0)
      return { success: false, errors: res.errors };
    // Atualiza lista após sucesso
    giftsService.listGifts({ page, status, search, category }).then((res) => {
      setGifts(res.results);
      setTotal(res.count);
    });
    // atualiza categorias (pode ter vindo nova categoria da importação)
    try {
      const res = await giftsService.listAllGifts();
      const items = (res.results || []) as Gift[];
      const cats = Array.from(
        new Set(
          items
            .map((g: Gift) => g.category)
            .filter((c): c is string => typeof c === "string" && c.length > 0),
        ),
      );
      const opts = getCategoryOptionsFromSlugs(cats);
      setCategoryOptions(opts);
    } catch {
      // silently ignore
    }
    return { success: true };
  };

  // Exportar convidados
  async function handleExport(format: "csv" | "xlsx" | "pdf") {
    setExporting(format);
    try {
      if (format === "pdf") {
        const [{ jsPDF }, autoTableModule] = await Promise.all([
          import("jspdf"),
          import("jspdf-autotable"),
        ]);
        const autoTable = autoTableModule.default;
        const data = await fetchAllGifts();

        const doc = new jsPDF("p", "mm", "a4");
        doc.setFontSize(14);
        doc.text("Lista de Presentes", 14, 18);

        const body = (data.results || []).map((g) => [
          g.name,
          g.value,
          g.description || "-",
          translateStatus(g) || "-",
        ]);

        autoTable(doc, {
          startY: 26,
          head: [["Nome", "Valor", "Descrição", "Status"]],
          body,
          styles: { fontSize: 9 },
          headStyles: { fillColor: [246, 238, 228], textColor: "#000" },
          theme: "grid",
        });

        doc.save("presentes.pdf");
        notifications.show({
          color: "green",
          message: "Exportação PDF concluída!",
        });
        return;
      }

      handleExportPDF();
    } catch {
      notifications.show({
        color: "red",
        message: "Erro ao exportar convidados.",
      });
    } finally {
      setExporting(null);
    }
  }

  return (
    <BaseLayout>
      <Stack gap="lg">
        <div ref={pageTopRef} style={{ scrollMarginTop: "20px" }} />
        <PageSectionHeader
          eyebrow="Gestão do casamento"
          title="Lista de Presentes"
          description="Acompanhe a vitrine, compartilhe a lista e organize os presentes em um layout padronizado."
          actions={
            <Group gap="sm">
              {!isCompactLayout && (
                <>
                  <Button
                    leftSection={<IconCards size={18} />}
                    styles={softButtonStyles}
                    onClick={() => setPixSettingsModalOpen(true)}
                  >
                    Configurações PIX
                  </Button>
                  {/* <Button
                    leftSection={<IconFileTypePdf size={18} />}
                    styles={softButtonStyles}
                    onClick={() => handleExport("pdf")}
                    loading={exporting === "pdf"}
                  >
                    Exportar PDF
                  </Button> */}
                  <Button
                    leftSection={<IconWorldPin size={18} />}
                    styles={softButtonStyles}
                    onClick={async () => {
                      const res = await giftsService.getShareToken();
                      const token = res.token;
                      setShareUrl(
                        `${window.location.origin}/gifts/share/${token}`,
                      );
                      window.open(
                        `${window.location.origin}/gifts/share/${token}`,
                        "_blank",
                      );
                    }}
                  >
                    Ver Vitrine
                  </Button>
                  {/* <Button
                    leftSection={<IconShare size={18} />}
                    styles={softButtonStyles}
                    onClick={handleShare}
                  >
                    Compartilhar lista
                  </Button> */}
                </>
              )}
              <Button
                leftSection={<IconGiftFilled size={18} />}
                styles={primaryButtonStyles}
                onClick={() => {
                  router.push("/gifts/marketplace");
                }}
              >
                Ir ao marketplace
              </Button>
              <Menu shadow="md" width={220} position="bottom-end">
                <Menu.Target>
                  <Button
                    styles={softButtonStyles}
                    px={8}
                    style={{ minWidth: 44 }}
                  >
                    <IconDotsVertical size={22} />
                  </Button>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item
                    leftSection={<IconCards size={18} />}
                    onClick={() => setPixSettingsModalOpen(true)}
                  >
                    Configurações PIX
                  </Menu.Item>
                  <Menu.Item
                    leftSection={<IconWorldPin size={18} />}
                    onClick={async () => {
                      const res = await giftsService.getShareToken();
                      const token = res.token;
                      setShareUrl(
                        `${window.location.origin}/gifts/share/${token}`,
                      );
                      window.open(
                        `${window.location.origin}/gifts/share/${token}`,
                        "_blank",
                      );
                    }}
                  >
                    Ver Vitrine
                  </Menu.Item>
                  <Menu.Item
                    leftSection={<IconShare size={18} />}
                    onClick={handleShare}
                  >
                    Compartilhar lista
                  </Menu.Item>
                  <Menu.Item
                    leftSection={<IconDownload size={18} />}
                    onClick={handleDownloadTemplate}
                  >
                    Baixar modelo de planilha
                  </Menu.Item>
                  <Menu.Item
                    leftSection={<IconUpload size={18} />}
                    onClick={() => setImportModalOpen(true)}
                    disabled={importing}
                  >
                    Importar planilha
                  </Menu.Item>
                  <Menu.Item
                    leftSection={<IconGift size={18} />}
                    onClick={handleGenerateBasicGifts}
                    disabled={generatingBasicGifts}
                  >
                    Gerar lista básica
                  </Menu.Item>
                  <Menu.Item
                    leftSection={<IconFileTypePdf size={18} />}
                    onClick={() => handleExport("pdf")}
                  >
                    Exportar PDF
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleImportChange}
              />
            </Group>
          }
          filters={
            isCompactLayout ? (
              <Stack gap="sm">
                <Group align="flex-end" gap="xs" wrap="nowrap">
                  <TextInput
                    leftSection={<IconSearch size={16} />}
                    placeholder="Buscar presente..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.currentTarget.value);
                      setPage(1);
                    }}
                    style={{ flex: 1 }}
                    styles={inputStyles}
                  />
                  <Tooltip label="Filtros avançados" withArrow>
                    <ActionIcon
                      variant="default"
                      size="lg"
                      aria-label="Filtros avançados"
                      onClick={() => setAdvancedFiltersOpen(true)}
                    >
                      <IconFilter size={18} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
                <Group justify="flex-end" gap="xs" wrap="wrap">
                  <SegmentedControl
                    value={viewMode === "table" ? "cards" : viewMode}
                    onChange={(v) =>
                      setViewMode(v as "table" | "cards" | "gallery")
                    }
                    data={[
                      { value: "cards", label: <IconCards size={16} /> },
                      { value: "gallery", label: <IconLayoutGrid size={16} /> },
                    ]}
                    styles={segmentedTabsStyles}
                  />
                </Group>
              </Stack>
            ) : (
              <Stack gap="sm">
                <Group justify="space-between">
                  <Group gap="sm" align="center" wrap="wrap">
                    <TextInput
                      leftSection={<IconSearch size={16} />}
                      placeholder="Buscar presente..."
                      value={search}
                      onChange={(e) => {
                        setSearch(e.currentTarget.value);
                        setPage(1);
                      }}
                      w={{ base: "100%", sm: 260 }}
                      styles={inputStyles}
                    />
                    <Select
                      placeholder="Categoria"
                      value={category}
                      onChange={(value) => {
                        setCategory(value || "");
                        setPage(1);
                      }}
                      data={categoryOptions}
                      w={{ base: "100%", sm: 200 }}
                      clearable
                      styles={inputStyles}
                    />
                    <SegmentedControl
                      data={statusOptions.map((opt) => ({
                        ...opt,
                        label: statusLabels[opt.value]?.label || opt.label,
                      }))}
                      value={status}
                      onChange={(value) => {
                        setStatus(value);
                        setPage(1);
                      }}
                      styles={segmentedTabsStyles}
                    />
                  </Group>
                  <SegmentedControl
                    value={viewMode}
                    onChange={(v) =>
                      setViewMode(v as "table" | "cards" | "gallery")
                    }
                    data={[
                      { value: "table", label: <IconList size={16} /> },
                      { value: "cards", label: <IconCards size={16} /> },
                      { value: "gallery", label: <IconLayoutGrid size={16} /> },
                    ]}
                    styles={segmentedTabsStyles}
                  />
                </Group>
              </Stack>
            )
          }
        />
        {!isCompactLayout && viewMode === "table" && (
          <Box className="gifts-table">
            <DataTable
              records={gifts}
              columns={[
                {
                  accessor: "name",
                  title: "Nome",
                  // 1. Definimos uma largura (ex: 250 ou uma porcentagem) ou usamos a prop 'width' do Mantine DataTable
                  // para ajudar a delimitar o espaço se necessário.
                  width: 300,
                  render: (g) => {
                    const isLocked = g.status !== "available";
                    return (
                      // Adicionamos style={{ flexWrap: 'nowrap', minWidth: 0 }} para forçar o flex container a aceitar o truncamento dos filhos
                      <Group
                        gap={4}
                        style={{ flexWrap: "nowrap", minWidth: 0 }}
                      >
                        {g.image ? (
                          <Avatar src={g.image} alt={g.name} />
                        ) : (
                          <Avatar
                            name={g.name}
                            size={38}
                            color="var(--mantine-color-gray-5)"
                            allowedInitialsColors={[
                              "var(--mantine-color-gray-5), var(--mantine-color-gray-6), var(--mantine-color-gray-7)",
                            ]}
                          />
                        )}
                        <Tooltip label={g.name} withArrow>
                          <Text
                            size="sm"
                            // 2. Passamos o 'truncate' como prop direta
                            truncate="end"
                            style={{
                              ...(isLocked
                                ? { textDecoration: "line-through" }
                                : {}),
                              // Removido o truncate daqui
                            }}
                          >
                            {g.name}
                          </Text>
                        </Tooltip>
                      </Group>
                    );
                  },
                },
                {
                  accessor: "value",
                  title: "Valor",
                  render: (g) => {
                    const isLocked = g.status !== "available";
                    return (
                      <Text
                        size="sm"
                        style={{
                          ...(isLocked
                            ? { textDecoration: "line-through" }
                            : {}),
                        }}
                      >
                        R$ {g.value}
                      </Text>
                    );
                  },
                },
                {
                  accessor: "category",
                  title: "Categoria",
                  render: (g) => {
                    const isLocked = g.status !== "available";
                    return (
                      <Text
                        size="sm"
                        style={{
                          ...(isLocked
                            ? { textDecoration: "line-through" }
                            : {}),
                        }}
                      >
                        {categoryOptions.find((c) => c.value === g.category)
                          ?.label || g.category}
                      </Text>
                    );
                  },
                },
                {
                  accessor: "status",
                  title: "Status",
                  render: (g) => (
                    <MarriplanStatusBadge kind="gift" status={g.status} />
                  ),
                },
                {
                  accessor: "actions",
                  title: "",
                  render: (g) => (
                    <Group gap={4}>
                      {g.status !== "purchased" && (
                        <Tooltip label="Marcar como comprado">
                          <ActionIcon
                            variant="subtle"
                            color="green"
                            onClick={() => handleMarkAsPurchased(g)}
                          >
                            <IconCheck size={18} />
                          </ActionIcon>
                        </Tooltip>
                      )}
                      {(g.status === "purchased" ||
                        g.status === "reserved") && (
                        <Tooltip label="Marcar como disponível">
                          <ActionIcon
                            variant="subtle"
                            color="gray"
                            onClick={() => handleMarkAsAvailable(g)}
                          >
                            <IconStatusChange size={18} />
                          </ActionIcon>
                        </Tooltip>
                      )}
                      {g.link && (
                        <Tooltip label="Ver presente">
                          <ActionIcon
                            variant="subtle"
                            color="blue"
                            onClick={() => window.open(g.link, "_blank")}
                          >
                            <IconEye size={18} />
                          </ActionIcon>
                        </Tooltip>
                      )}
                      <Tooltip label="Editar">
                        <ActionIcon
                          variant="subtle"
                          color="orange"
                          onClick={() => {
                            setEditingGift(g);
                            setModalOpen(true);
                          }}
                        >
                          <IconEdit size={18} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Excluir presente">
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          onClick={() =>
                            setDeleteModal({ open: true, gift: g })
                          }
                        >
                          <IconTrash size={18} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  ),
                },
              ]}
              fetching={loading}
              totalRecords={total}
              page={page}
              onPageChange={setPage}
              recordsPerPage={pageSize}
              minHeight={300}
              highlightOnHover
              withTableBorder
              borderRadius="xl"
              verticalSpacing="sm"
              horizontalSpacing="md"
              striped
              noRecordsText="Nenhum presente cadastrado."
              paginationText={({ from, to, totalRecords }) =>
                `${from}–${to} de ${totalRecords}`
              }
            />
          </Box>
        )}
        {viewMode === "cards" && (
          <>
            {gifts.length === 0 && !loading && (
              <Card
                radius="xl"
                withBorder
                p="xl"
                style={{
                  position: "relative",
                  overflow: "hidden",
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(246,238,228,0.92) 100%)",
                  border: "1px solid var(--marriplan-border)",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: "auto -36px -36px auto",
                    width: 180,
                    height: 180,
                    borderRadius: "50%",
                    background:
                      "radial-gradient(circle, rgba(181,139,122,0.18), transparent 68%)",
                    pointerEvents: "none",
                  }}
                />
                <Stack gap="md" align="center" style={{ position: "relative" }}>
                  <div
                    style={{
                      width: 92,
                      height: 92,
                      borderRadius: 28,
                      background:
                        "linear-gradient(135deg, #f7efe7 0%, #ead7ca 100%)",
                      display: "grid",
                      placeItems: "center",
                      boxShadow: "inset 0 0 0 1px rgba(181, 139, 122, 0.16)",
                    }}
                  >
                    <IconGift size={64} />
                  </div>

                  <Stack gap={4} align="center" ta="center" maw={520}>
                    <Title order={3}>Lista de presentes vazia</Title>
                    <Text c="dimmed">
                      Parece que ainda não há presentes cadastrados. Clique no
                      botão abaixo para adicionar o primeiro presente à lista!
                    </Text>
                  </Stack>

                  <Group justify="center" wrap="wrap">
                    <Button
                      onClick={() => {
                        router.push("/gifts/marketplace");
                      }}
                      styles={primaryButtonStyles}
                      leftSection={<IconGiftFilled size={18} />}
                    >
                      Ir ao marketplace
                    </Button>
                  </Group>
                </Stack>
              </Card>
            )}
            <Skeleton visible={loading} radius="xl">
              <ListView
                items={gifts}
                getItemId={(g) => g.id}
                getImageUrl={(g) => g.image}
                fallbackIcon={(g) => (
                  <IconGift size={48} color="var(--mantine-color-gray-5)" />
                )}
                renderSoloActions={(g) => (
                  <Group gap={4}>
                    {g.status !== "purchased" && (
                      <Tooltip label="Marcar como comprado">
                        <Button
                          styles={softButtonStyles}
                          px={4}
                          style={{ minWidth: 38 }}
                          onClick={() => handleMarkAsPurchased(g)}
                        >
                          <IconCheck size={18} />
                        </Button>
                      </Tooltip>
                    )}
                    {(g.status === "purchased" || g.status === "reserved") && (
                      <Tooltip label="Marcar como disponível">
                        <Button
                          styles={softButtonStyles}
                          px={4}
                          style={{ minWidth: 38 }}
                          onClick={() => handleMarkAsAvailable(g)}
                        >
                          <IconStatusChange size={18} />
                        </Button>
                      </Tooltip>
                    )}
                  </Group>
                )}
                renderContent={(g) => {
                  const isLocked = g.status !== "available";
                  return (
                    <>
                      <Text
                        fw={500}
                        lineClamp={2}
                        style={{
                          ...(isLocked
                            ? { textDecoration: "line-through", color: "#888" }
                            : {}),
                        }}
                      >
                        {g.name}
                      </Text>
                      <Text
                        size="sm"
                        c="dimmed"
                        style={{
                          ...(isLocked
                            ? { textDecoration: "line-through" }
                            : {}),
                        }}
                      >
                        Categoria:{" "}
                        {categoryOptions.find((c) => c.value === g.category)
                          ?.label || g.category}
                      </Text>
                      <Stack gap={4} my={4}>
                        <Text
                          size="md"
                          lineClamp={2}
                          style={{
                            ...(isLocked
                              ? { textDecoration: "line-through" }
                              : {}),
                          }}
                        >
                          R$ {g.value}
                        </Text>
                        <MarriplanStatusBadge kind="gift" status={g.status} />
                      </Stack>
                    </>
                  );
                }}
                renderActions={(g) => (
                  <>
                    {g.status === "available" && (
                      <Menu.Item
                        leftSection={<IconCheck size={14} />}
                        onClick={() => handleMarkAsPurchased(g)}
                      >
                        Marcar como comprado
                      </Menu.Item>
                    )}
                    {(g.status === "purchased" || g.status === "reserved") && (
                      <Menu.Item
                        leftSection={<IconStatusChange size={14} />}
                        onClick={() => handleMarkAsAvailable(g)}
                      >
                        Marcar como disponível
                      </Menu.Item>
                    )}
                    {g.link && (
                      <Menu.Item
                        leftSection={<IconEye size={14} />}
                        onClick={() => window.open(g.link, "_blank")}
                      >
                        Ver presente
                      </Menu.Item>
                    )}
                    <Menu.Item
                      leftSection={<IconEdit size={14} />}
                      onClick={() => {
                        setEditingGift(g);
                        setModalOpen(true);
                      }}
                    >
                      Editar
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<IconTrash size={14} />}
                      color="red"
                      onClick={() => setDeleteModal({ open: true, gift: g })}
                    >
                      Excluir
                    </Menu.Item>
                  </>
                )}
              />
            </Skeleton>
          </>
        )}
        {viewMode === "gallery" && (
          <>
            {gifts.length === 0 && !loading && (
              <Card
                radius="xl"
                withBorder
                p="xl"
                style={{
                  position: "relative",
                  overflow: "hidden",
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(246,238,228,0.92) 100%)",
                  border: "1px solid var(--marriplan-border)",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: "auto -36px -36px auto",
                    width: 180,
                    height: 180,
                    borderRadius: "50%",
                    background:
                      "radial-gradient(circle, rgba(181,139,122,0.18), transparent 68%)",
                    pointerEvents: "none",
                  }}
                />
                <Stack gap="md" align="center" style={{ position: "relative" }}>
                  <div
                    style={{
                      width: 92,
                      height: 92,
                      borderRadius: 28,
                      background:
                        "linear-gradient(135deg, #f7efe7 0%, #ead7ca 100%)",
                      display: "grid",
                      placeItems: "center",
                      boxShadow: "inset 0 0 0 1px rgba(181, 139, 122, 0.16)",
                    }}
                  >
                    <IconGift size={64} />
                  </div>

                  <Stack gap={4} align="center" ta="center" maw={520}>
                    <Title order={3}>Lista de presentes vazia</Title>
                    <Text c="dimmed">
                      Parece que ainda não há presentes cadastrados. Clique no
                      botão abaixo para adicionar o primeiro presente à lista!
                    </Text>
                  </Stack>

                  <Group justify="center" wrap="wrap">
                    <Button
                      onClick={() => {
                        router.push("/gifts/marketplace");
                      }}
                      styles={primaryButtonStyles}
                      leftSection={<IconGiftFilled size={18} />}
                    >
                      Ir ao marketplace
                    </Button>
                  </Group>
                </Stack>
              </Card>
            )}
            <Skeleton visible={loading} radius="xl">
              <GalleryView
                items={gifts}
                getItemId={(g) => g.id}
                getImageUrl={(g) => g.image}
                cols={
                  isCompactLayout ? { base: 1, sm: 1, md: 1, lg: 1 } : undefined
                }
                fallbackIcon={(g) => (
                  <IconGift size={48} color="var(--mantine-color-gray-5)" />
                )}
                renderContent={(gift) => {
                  const isLocked = gift.status !== "available";
                  return (
                    <Flex direction="column" gap="xs">
                      <Tooltip
                        label={
                          gift.name +
                          (gift.description ? ": " + gift.description : "")
                        }
                        withArrow
                        position="top"
                      >
                        <Title
                          order={4}
                          mt="sm"
                          style={{
                            ...(isLocked
                              ? {
                                  textDecoration: "line-through",
                                  color: "#888",
                                }
                              : {}),
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "clip",
                          }}
                        >
                          {gift.name}
                        </Title>
                      </Tooltip>
                      <Text
                        size="sm"
                        color="dimmed"
                        style={{
                          ...(isLocked
                            ? { textDecoration: "line-through" }
                            : {}),
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "clip",
                        }}
                      >
                        {gift.description}
                      </Text>
                      <Text
                        mt="xs"
                        style={
                          isLocked ? { textDecoration: "line-through" } : {}
                        }
                      >
                        <b>Valor:</b>{" "}
                        {gift.value
                          ? formatCurrency(gift.value)
                          : "não informado"}
                      </Text>
                      {gift.category ? (
                        <Text
                          style={
                            isLocked ? { textDecoration: "line-through" } : {}
                          }
                        >
                          <b>Categoria:</b> {getCategoryLabel(gift.category)}
                        </Text>
                      ) : (
                        <Text
                          style={
                            isLocked ? { textDecoration: "line-through" } : {}
                          }
                        >
                          <b>Categoria:</b> não informado
                        </Text>
                      )}
                      <Group mt="xs" justify="space-between" align="center">
                        <Badge style={getStatusBadgeStyle(gift.status)}>
                          {STATUS_LABELS[gift.status] || gift.status}
                        </Badge>
                        {gift.link && (
                          <Tooltip
                            label="Abrir link do produto"
                            withArrow
                            position="top"
                          >
                            <Button
                              component="a"
                              href={gift.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              leftSection={<IconExternalLink size={16} />}
                              size="xs"
                              styles={softButtonStyles}
                            >
                              Ver Produto
                            </Button>
                          </Tooltip>
                        )}
                      </Group>
                    </Flex>
                  );
                }}
                renderActions={(g) => (
                  <>
                    {g.status === "available" && (
                      <Menu.Item
                        leftSection={<IconCheck size={14} />}
                        onClick={() => handleMarkAsPurchased(g)}
                      >
                        Marcar como comprado
                      </Menu.Item>
                    )}
                    {(g.status === "purchased" || g.status === "reserved") && (
                      <Menu.Item
                        leftSection={<IconStatusChange size={14} />}
                        onClick={() => handleMarkAsAvailable(g)}
                      >
                        Marcar como disponível
                      </Menu.Item>
                    )}
                    {g.link && (
                      <Menu.Item
                        leftSection={<IconEye size={14} />}
                        onClick={() => window.open(g.link, "_blank")}
                      >
                        Ver presente
                      </Menu.Item>
                    )}
                    <Menu.Item
                      leftSection={<IconEdit size={14} />}
                      onClick={() => {
                        setEditingGift(g);
                        setModalOpen(true);
                      }}
                    >
                      Editar
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<IconTrash size={14} />}
                      color="red"
                      onClick={() => setDeleteModal({ open: true, gift: g })}
                    >
                      Excluir
                    </Menu.Item>
                  </>
                )}
              />
            </Skeleton>
          </>
        )}
        {(viewMode === "cards" || viewMode === "gallery") && (
          <Group justify="center" mt="md">
            <Pagination
              className="gifts-pagination"
              total={Math.max(1, Math.ceil(total / pageSize))}
              value={page}
              onChange={setPage}
            />
          </Group>
        )}
        <Modal
          opened={advancedFiltersOpen}
          onClose={() => setAdvancedFiltersOpen(false)}
          title="Filtros avançados"
          centered
          size="sm"
        >
          <Stack gap="md">
            <Select
              label="Categoria"
              placeholder="Todas"
              value={draftCategory}
              onChange={(value) => setDraftCategory(value || "")}
              data={categoryOptions}
              clearable
              styles={inputStyles}
            />
            <Select
              label="Status"
              placeholder="Todos"
              value={draftStatus}
              onChange={(value) => setDraftStatus(value || "")}
              data={statusOptions.map((opt) => ({
                value: opt.value,
                label: statusLabels[opt.value]?.label || opt.label,
              }))}
              clearable
              styles={inputStyles}
            />
            <Group justify="space-between" mt="sm">
              <Button
                variant="light"
                styles={softButtonStyles}
                onClick={() => {
                  setDraftCategory("");
                  setDraftStatus("");
                  setCategory("");
                  setStatus("");
                  setPage(1);
                  setAdvancedFiltersOpen(false);
                }}
              >
                Limpar filtros
              </Button>
              <Button
                styles={primaryButtonStyles}
                onClick={() => {
                  setCategory(draftCategory);
                  setStatus(draftStatus);
                  setPage(1);
                  setAdvancedFiltersOpen(false);
                }}
              >
                Aplicar
              </Button>
            </Group>
          </Stack>
        </Modal>
        <GiftFormModal
          opened={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={() => {
            setLoading(true);
            giftsService
              .listGifts({ page, status, search, category })
              .then((res) => {
                setGifts(res.results);
                setTotal(res.count);
              })
              .finally(() => setLoading(false));
            setModalOpen(false);
            setEditingGift(undefined);
          }}
          initial={editingGift}
        />
        <MarkAsPurchasedModal
          opened={markModal.open}
          onClose={() => setMarkModal({ open: false })}
          onConfirm={handleConfirmMark}
          guests={guests}
        />
        <Modal
          opened={deleteModal.open}
          onClose={() => setDeleteModal({ open: false })}
          title="Excluir presente?"
          centered
        >
          <Text mb="md">
            Tem certeza que deseja excluir este presente?
            <br />
            <b>Essa ação não pode ser desfeita.</b>
          </Text>
          <Group justify="flex-end">
            <Button
              variant="default"
              onClick={() => setDeleteModal({ open: false })}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              color="red"
              onClick={handleConfirmDeleteGift}
              loading={loading}
            >
              Excluir
            </Button>
          </Group>
        </Modal>
        <Modal
          opened={shareModal}
          onClose={() => setShareModal(false)}
          title="Compartilhar Lista de Presentes"
          centered
          size="lg"
          padding="lg"
          overlayProps={{ blur: 2 }}
        >
          <Text c="dimmed">Compartilhe sua lista com convidados:</Text>
          <TextInput mt="md" value={shareUrl} readOnly styles={inputStyles} />
          <Group mt="md" wrap="wrap">
            <Button
              leftSection={<IconCopy size={16} />}
              styles={primaryButtonStyles}
              onClick={() => {
                navigator.clipboard.writeText(shareUrl);
                notifications.show({
                  color: "green",
                  title: "Link copiado!",
                  message:
                    "O link público da sua lista de presentes foi copiado para a área de transferência.",
                });
              }}
            >
              Copiar link
            </Button>
            <Button
              leftSection={<IconBrandWhatsapp size={16} />}
              styles={softButtonStyles}
              component="a"
              href={`https://wa.me/?text=${encodeURIComponent(
                "Veja nossa lista de presentes: " + shareUrl,
              )}`}
              target="_blank"
            >
              WhatsApp
            </Button>
            <Button
              leftSection={<IconBrandFacebook size={16} />}
              styles={softButtonStyles}
              component="a"
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                shareUrl,
              )}`}
              target="_blank"
            >
              Facebook
            </Button>
          </Group>
        </Modal>
        <ImportGiftsModal
          opened={importModalOpen}
          onClose={() => setImportModalOpen(false)}
          onSuccess={() => setImportModalOpen(false)}
          downloadTemplate={handleDownloadTemplate}
          finalizeImport={handleFinalizeImport}
        />
        <PixSettingsModal
          opened={pixSettingsModalOpen}
          onClose={() => setPixSettingsModalOpen(false)}
          coupleName={coupleName}
        />
        {importError && (
          <Text color="red" size="sm">
            {importError}
          </Text>
        )}
        {importSuccess && (
          <Text color="green" size="sm">
            {importSuccess}
          </Text>
        )}
        <style>{paginationThemeStyles}</style>
      </Stack>
    </BaseLayout>
  );
};

export default GiftsPage;

import { GalleryView } from "@/components/GalleryView";
import ImportGuestsModal from "@/components/ImportGuestsModal";
import { ListView } from "@/components/ListView";
import {
  guests_create,
  guests_delete,
  guests_export,
  guests_generate_confirmation_link,
  guests_list_all,
  guests_partial_update,
  guests_update,
} from "@/services/guests";
import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Checkbox,
  Group,
  Menu,
  Modal,
  RangeSlider,
  rem,
  SegmentedControl,
  Select,
  SimpleGrid,
  Stack,
  ThemeIcon,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import {
  IconBrandWhatsapp,
  IconAlertTriangle,
  IconCards,
  IconCheck,
  IconDotsVertical,
  IconDownload,
  IconEdit,
  IconFileTypePdf,
  IconFilter,
  IconLayoutGrid,
  IconLink,
  IconList,
  IconMail,
  IconPlus,
  IconSearch,
  IconUsers,
  IconX,
  IconTrash,
  IconUpload,
  IconUser,
  IconClock,
} from "@tabler/icons-react";
import { DataTable, type DataTableSortStatus } from "mantine-datatable";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMediaQuery } from "@mantine/hooks";

import {
  actionIconDangerStyles,
  actionIconEditStyles,
  actionIconStyles,
  inputStyles,
  primaryButtonStyles,
  segmentedTabsStyles,
  softButtonStyles,
} from "@/styles";
import { Pagination } from "@mantine/core";
import PageSectionHeader from "./PageSectionHeader";
import { toSentenceCase, toUpperCamelWords } from "@/lib/text";
import { ImageDropzone } from "@/components/ImageUpload";
import { uploadCloudinaryImage } from "@/services/weddingImage";

interface Guest {
  [key: string]: unknown;
  id: number;
  name: string;
  phone: string;
  whatsapp: string; // agora é string (número)
  photo_url?: string;
  photo_public_id?: string;
  email: string;
  alergias?: string;
  acompanhantes?: number;
  observacoes?: string;
  status_presenca?: "Pending" | "Confirmed" | "Refused";
}

function validateEmail(email: string) {
  return /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);
}

function BadgeStatus(guest: Guest) {
  const statusColors: Record<string, string> = {
    Pending: "yellow",
    Confirmed: "green",
    Refused: "red",
  };
  const statusLabels: Record<string, string> = {
    Pending: "Pendente",
    Confirmed: "Confirmado",
    Refused: "Recusado",
  };

  return (
    <Badge
      size="sm"
      variant="light"
      color={statusColors[guest.status_presenca || ""] || "gray"}
    >
      {statusLabels[guest.status_presenca || ""] || "Desconhecido"}
    </Badge>
  );
}

export default function GuestTable() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [allGuests, setAllGuests] = useState<Guest[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Guest | null>(null);
  const [exporting, setExporting] = useState<"csv" | "xlsx" | "pdf" | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus<Guest>>({
    columnAccessor: "name",
    direction: "asc",
  });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("table");
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [advancedFilterOpen, setAdvancedFilterOpen] = useState(false);
  const [companionsRange, setCompanionsRange] = useState<[number, number]>([
    0, 10,
  ]);
  const [whatsappFilter, setWhatsappFilter] = useState<
    "all" | "with" | "without"
  >("all");
  const [allergyFilter, setAllergyFilter] = useState<
    "all" | "with" | "without"
  >("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "Pending" | "Confirmed" | "Refused"
  >("all");
  const [presencaModalOpen, setPresencaModalOpen] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [guestToDelete, setGuestToDelete] = useState<Guest | null>(null);
  const [deletingGuest, setDeletingGuest] = useState(false);
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [confirmationData, setConfirmationData] = useState<{
    confirmation_url?: string;
    whatsapp_link?: string;
    token?: string;
  } | null>(null);
  const isCompactLayout = useMediaQuery("(max-width: 1024px)");
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(min-width: 768px)");

  const pageTopRef = useRef<HTMLDivElement>(null);

  const loadGuests = useCallback(async () => {
    setLoading(true);
    try {
      const data = await guests_list_all();
      const loadedGuests = data.results || [];
      setGuests(loadedGuests);
      setAllGuests(loadedGuests);
    } finally {
      setLoading(false);
    }
  }, []);

  const form = useForm({
    initialValues: {
      name: "",
      phone: "",
      hasWhatsapp: false,
      whatsapp: "",
      photo_url: "",
      photo_public_id: "",
      email: "",
      alergias: "",
      acompanhantes: "",
      observacoes: "",
      status_presenca: "",
    },
    validate: {
      name: (value) => (value.trim() ? null : "Nome obrigatório"),
      phone: (value) =>
        value.replace(/\D/g, "").length >= 10 ? null : "Telefone inválido",
      whatsapp: (value, values) =>
        values.hasWhatsapp && value.replace(/\D/g, "").length < 10
          ? "WhatsApp inválido"
          : null,
      email: (value) =>
        value === "" || validateEmail(value) ? null : "Email inválido",
      acompanhantes: (value) =>
        value === "" || (!isNaN(Number(value)) && Number(value) >= 0)
          ? null
          : "Acompanhantes inválido",
    },
  });

  const maxCompanionsValue = Math.max(
    10,
    ...guests.map((g) => g.acompanhantes ?? 0),
  );
  const searchQuery = search.trim().toLowerCase();
  const filtersActive =
    companionsRange[0] > 0 ||
    companionsRange[1] < maxCompanionsValue ||
    whatsappFilter !== "all" ||
    allergyFilter !== "all" ||
    statusFilter !== "all";
  const hasFilteredView = Boolean(searchQuery) || filtersActive;


  useEffect(() => {
    pageTopRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [page]);

  useEffect(() => {
    void loadGuests();
  }, [loadGuests]);

  useEffect(() => {
    setPage(1);
  }, [search, companionsRange, whatsappFilter, allergyFilter, statusFilter]);

  const filteredGuests = useMemo(() => {
    return guests.filter((guest) => {
      if (
        searchQuery &&
        ![
          guest.name,
          guest.email,
          guest.phone,
          guest.whatsapp,
        ].some((value) => (value || "").toLowerCase().includes(searchQuery))
      ) {
        return false;
      }

      if (
        companionsRange[0] > 0 &&
        (guest.acompanhantes === undefined ||
          guest.acompanhantes < companionsRange[0])
      ) {
        return false;
      }
      if (
        companionsRange[1] < maxCompanionsValue &&
        (guest.acompanhantes === undefined ||
          guest.acompanhantes > companionsRange[1])
      ) {
        return false;
      }

      if (whatsappFilter === "with" && !guest.whatsapp) return false;
      if (whatsappFilter === "without" && guest.whatsapp) return false;

      const hasAllergy = !!guest.alergias?.trim();
      if (allergyFilter === "with" && !hasAllergy) return false;
      if (allergyFilter === "without" && hasAllergy) return false;

      if (statusFilter !== "all" && guest.status_presenca !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [
    guests,
    searchQuery,
    companionsRange,
    maxCompanionsValue,
    whatsappFilter,
    allergyFilter,
    statusFilter,
  ]);

  const sortedGuests = useMemo(() => {
    const nextGuests = [...filteredGuests];
    const accessor = sortStatus.columnAccessor;
    if (!accessor) {
      return nextGuests;
    }

    nextGuests.sort((left, right) => {
      const leftValue = left[accessor as keyof Guest];
      const rightValue = right[accessor as keyof Guest];

      const leftText = String(leftValue ?? "");
      const rightText = String(rightValue ?? "");
      const comparison = leftText.localeCompare(rightText, "pt-BR", {
        numeric: true,
        sensitivity: "base",
      });

      return sortStatus.direction === "desc" ? -comparison : comparison;
    });

    return nextGuests;
  }, [filteredGuests, sortStatus]);

  useEffect(() => {
    if (filtersActive) {
      setPage(1);
    }
  }, [
    companionsRange,
    whatsappFilter,
    allergyFilter,
    statusFilter,
    filtersActive,
  ]);

  useEffect(() => {
    if (isMobile && viewMode === "table") {
      setViewMode("cards");
    }
  }, [isMobile, viewMode]);

  useEffect(() => {
    setCompanionsRange((prev) => {
      const nextMax = maxCompanionsValue;
      const nextMin = Math.min(prev[0], nextMax);
      const nextHigh = prev[1] > nextMax ? nextMax : prev[1];
      return [nextMin, nextHigh];
    });
  }, [maxCompanionsValue]);

  function handleAdd() {
    setEditing(null);
    form.setValues({
      name: "",
      phone: "",
      hasWhatsapp: false,
      whatsapp: "",
      photo_url: "",
      photo_public_id: "",
      email: "",
      alergias: "",
      acompanhantes: "",
      observacoes: "",
      status_presenca: "",
    });
    setModalOpen(true);
  }

  function handleEdit(guest: Guest) {
    setEditing(guest);
    form.setValues({
      name: guest.name,
      phone: guest.phone,
      hasWhatsapp: !!guest.whatsapp,
      whatsapp: guest.whatsapp || "",
      photo_url: guest.photo_url || "",
      photo_public_id: guest.photo_public_id || "",
      email: guest.email,
      alergias: guest.alergias || "",
      acompanhantes: guest.acompanhantes?.toString() || "",
      observacoes: guest.observacoes || "",
      status_presenca: guest.status_presenca || "",
    });
    setModalOpen(true);
  }

  async function handleSubmit(values: typeof form.values) {
    const payload: Record<string, string | number | null | undefined> = {
      name: toUpperCamelWords(values.name),
      phone: values.phone,
      whatsapp: values.hasWhatsapp ? values.whatsapp : "",
      photo_url: values.photo_url || "",
      photo_public_id: values.photo_public_id || "",
      email: values.email,
      alergias: toSentenceCase(values.alergias),
      acompanhantes:
        values.acompanhantes === "" ? null : Number(values.acompanhantes),
      observacoes: toSentenceCase(values.observacoes),
    };
    if (values.status_presenca) {
      payload.status_presenca = values.status_presenca;
    }
    if (editing) {
      await guests_update(editing.id, payload);
    } else {
      await guests_create(payload);
    }
    await loadGuests();
    setModalOpen(false);
    form.reset();
  }

  function openDeleteConfirm(guest: Guest) {
    setGuestToDelete(guest);
    setDeleteModalOpen(true);
  }

  async function handleDeleteConfirmed() {
    if (!guestToDelete) return;

    setDeletingGuest(true);
    try {
      await guests_delete(guestToDelete.id);
      await loadGuests();
      setDeleteModalOpen(false);
      setGuestToDelete(null);
      notifications.show({
        color: "green",
        message: "Convidado removido com sucesso.",
      });
    } catch {
      notifications.show({
        color: "red",
        message: "Não foi possível remover o convidado.",
      });
    } finally {
      setDeletingGuest(false);
    }
  }

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
        const data = { results: sortedGuests, count: sortedGuests.length };

        const doc = new jsPDF("p", "mm", "a4");
        doc.setFontSize(14);
        doc.text("Lista de Convidados", 14, 18);

        const body = (data.results || []).map((g) => [
          g.name,
          g.whatsapp || "-",
          g.email || "-",
          g.acompanhantes ?? "-",
          g.alergias || "-",
        ]);

        autoTable(doc, {
          startY: 26,
          head: [["Nome", "WhatsApp", "Email", "Acompanhantes", "Alergias"]],
          body,
          styles: { fontSize: 9 },
          headStyles: { fillColor: [246, 238, 228], textColor: "#000" },
          theme: "grid",
        });

        doc.save("convidados.pdf");
        notifications.show({
          color: "green",
          message: "Exportação PDF concluída!",
        });
        return;
      }

      // const res = await guests_export(format, { search, ordering });
      const res = await guests_export(format);
      let filename = `convidados.${format}`;
      if (format === "xlsx") filename = "convidados.xlsx";
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      notifications.show({
        color: "green",
        message: `Exportação ${format.toUpperCase()} concluída!`,
      });
    } catch {
      notifications.show({
        color: "red",
        message: "Erro ao exportar convidados.",
      });
    } finally {
      setExporting(null);
    }
  }

  const paginatedGuests = sortedGuests.slice(
    (page - 1) * recordsPerPage,
    page * recordsPerPage,
  );

  const derivedTotalRecords = sortedGuests.length;

  const summaryGuests = hasFilteredView ? sortedGuests : allGuests;
  const guestSummary = useMemo(
    () =>
      summaryGuests.reduce(
        (acc, guest) => {
          acc.total += 1;
          if (guest.status_presenca === "Confirmed") acc.confirmed += 1;
          if (guest.status_presenca === "Refused") acc.refused += 1;
          if (guest.status_presenca === "Pending") acc.pending += 1;
          return acc;
        },
        {
          total: 0,
          confirmed: 0,
          refused: 0,
          pending: 0,
        },
      ),
    [summaryGuests],
  );

  const guestStatusCards = [
    {
      key: "total",
      label: "Total",
      value: guestSummary.total,
      helper: hasFilteredView
        ? "Resultado dos filtros atuais"
        : "Todos os convidados cadastrados",
      icon: IconUsers,
      color: "blue",
    },
    {
      key: "confirmed",
      label: "Confirmados",
      value: guestSummary.confirmed,
      helper: "Presentes confirmados no sistema",
      icon: IconCheck,
      color: "green",
    },
    {
      key: "refused",
      label: "Recusados",
      value: guestSummary.refused,
      helper: "Convites recusados ou não aceitos",
      icon: IconX,
      color: "red",
    },
    {
      key: "pending",
      label: "Pendentes",
      value: guestSummary.pending,
      helper: "Aguardando resposta dos convidados",
      icon: IconClock,
      color: "yellow",
    },
  ] as const;

  return (
    <Stack gap="lg" py="md">
      <div ref={pageTopRef} style={{ scrollMarginTop: "-50px" }} />
      <PageSectionHeader
        eyebrow="Gestão do casamento"
        title="Meus Convidados"
        description="Gerencie presença, contatos e importações em uma área padronizada da aplicação."
        actions={
          <Group gap="sm">
            <Button
              leftSection={<IconPlus size={18} />}
              onClick={handleAdd}
              styles={primaryButtonStyles}
            >
              Adicionar convidado
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
                  leftSection={<IconDownload size={18} />}
                  onClick={() => setImportModalOpen(true)}
                >
                  Baixar modelo de planilha
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconUpload size={18} />}
                  onClick={() => setImportModalOpen(true)}
                >
                  Importar convidados
                </Menu.Item>
                {!isCompactLayout && (
                  <Menu.Item
                    leftSection={<IconFileTypePdf size={18} />}
                    onClick={() => handleExport("pdf")}
                  >
                    Exportar PDF
                  </Menu.Item>
                )}
              </Menu.Dropdown>
            </Menu>
            {!isCompactLayout && (
              <Button
                leftSection={<IconFileTypePdf size={18} />}
                styles={softButtonStyles}
                onClick={() => handleExport("pdf")}
                loading={exporting === "pdf"}
              >
                Exportar PDF
              </Button>
            )}
          </Group>
        }
        filters={
          isTablet ? (
            <Group gap="sm" align="center" wrap="nowrap">
              <TextInput
                leftSection={<IconSearch size={16} />}
                placeholder="Buscar por nome, e-mail, telefone..."
                value={search}
                onChange={(e) => {
                  setSearch(e.currentTarget.value);
                  setPage(1);
                }}
                style={{ flex: 1, minWidth: 0 }}
                styles={inputStyles}
              />
              {isCompactLayout ? (
                <Tooltip label="Filtro avançado">
                  <ActionIcon
                    aria-label="Abrir filtro avançado"
                    onClick={() => setAdvancedFilterOpen(true)}
                    styles={actionIconStyles}
                    size="lg"
                    variant="light"
                  >
                    <IconFilter size={16} />
                  </ActionIcon>
                </Tooltip>
              ) : (
                <Button
                  leftSection={<IconFilter size={16} />}
                  styles={softButtonStyles}
                  onClick={() => setAdvancedFilterOpen(true)}
                >
                  Filtro avançado
                </Button>
              )}
              <SegmentedControl
                value={viewMode}
                onChange={setViewMode}
                data={
                  isMobile
                    ? [
                        { value: "gallery", label: <IconCards size={16} /> },
                        { value: "cards", label: <IconList size={16} /> },
                      ]
                    : [
                        { value: "table", label: <IconList size={16} /> },
                        { value: "cards", label: <IconCards size={16} /> },
                        {
                          value: "gallery",
                          label: <IconLayoutGrid size={16} />,
                        },
                      ]
                }
                styles={segmentedTabsStyles}
              />
            </Group>
          ) : (
            <Stack gap="sm">
              <Group gap="sm" align="center" wrap="nowrap">
                <TextInput
                  leftSection={<IconSearch size={16} />}
                  placeholder="Buscar por nome, e-mail, telefone..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.currentTarget.value);
                    setPage(1);
                  }}
                  style={{ flex: 1, minWidth: 0 }}
                  styles={inputStyles}
                />
                {isCompactLayout ? (
                  <Tooltip label="Filtro avançado">
                    <ActionIcon
                      aria-label="Abrir filtro avançado"
                      onClick={() => setAdvancedFilterOpen(true)}
                      styles={actionIconStyles}
                      size="lg"
                      variant="light"
                    >
                      <IconFilter size={16} />
                    </ActionIcon>
                  </Tooltip>
                ) : (
                  <Button
                    leftSection={<IconFilter size={16} />}
                    styles={softButtonStyles}
                    onClick={() => setAdvancedFilterOpen(true)}
                  >
                    Filtro avançado
                  </Button>
                )}
              </Group>
              <Group justify="flex-end">
                <SegmentedControl
                  value={viewMode}
                  onChange={setViewMode}
                  data={
                    isMobile
                      ? [
                          { value: "gallery", label: <IconCards size={16} /> },
                          { value: "cards", label: <IconList size={16} /> },
                        ]
                      : [
                          { value: "table", label: <IconList size={16} /> },
                          { value: "cards", label: <IconCards size={16} /> },
                          {
                            value: "gallery",
                            label: <IconLayoutGrid size={16} />,
                          },
                        ]
                  }
                  styles={segmentedTabsStyles}
                />
              </Group>
            </Stack>
          )
        }
      />
      {isMobile ? (
        <Card
          radius="xl"
          p="lg"
          className="marriplan-card"
          style={{ background: "var(--marriplan-surface)" }}
        >
          <Stack gap="md">
            <Stack gap="sm">
              {guestStatusCards.map((card) => {
                const Icon = card.icon;

                return (
                  <Group
                    key={card.key}
                    justify="space-between"
                    align="center"
                    gap="md"
                    p="sm"
                    style={{
                      border: "1px solid var(--marriplan-border)",
                      borderRadius: 14,
                      background: "var(--marriplan-surface-muted)",
                    }}
                  >
                    <Group gap="sm" align="center" style={{ minWidth: 0 }}>
                      <ThemeIcon size={34} radius="xl" variant="light" color={card.color}>
                        <Icon size={18} />
                      </ThemeIcon>
                      <Stack gap={1} style={{ minWidth: 0 }}>
                        <Text fw={700} size="sm" c="var(--marriplan-text)">
                          {card.label}
                        </Text>
                        <Text size="xs" c="dimmed" lineClamp={2}>
                          {card.helper}
                        </Text>
                      </Stack>
                    </Group>

                    <Text fw={700} size="xl" c="var(--marriplan-text)">
                      {card.value}
                    </Text>
                  </Group>
                );
              })}
            </Stack>
          </Stack>
        </Card>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
          {guestStatusCards.map((card) => {
            const Icon = card.icon;

            return (
              <Card
                key={card.key}
                radius="xl"
                p="lg"
                className="marriplan-card"
                style={{ background: "var(--marriplan-surface)" }}
              >
                <Group justify="space-between" align="flex-start" gap="md">
                  <Stack gap={6} style={{ minWidth: 0 }}>
                    <Text
                      size="xs"
                      c="dimmed"
                      tt="uppercase"
                      fw={700}
                      style={{ letterSpacing: 1.1 }}
                    >
                      {card.label}
                    </Text>
                    <Text fw={700} size="2xl" c="var(--marriplan-text)">
                      {card.value}
                    </Text>
                    <Text size="sm" c="dimmed">
                      {card.helper}
                    </Text>
                  </Stack>
                  <ThemeIcon size={44} radius="xl" variant="light" color={card.color}>
                    <Icon size={22} />
                  </ThemeIcon>
                </Group>
              </Card>
            );
          })}
        </SimpleGrid>
      )}
      {!isMobile && viewMode === "table" && (
        <DataTable<Guest>
          className="guest-table"
          withTableBorder
          borderRadius="xl"
          highlightOnHover
          verticalSpacing="sm"
          horizontalSpacing="md"
          minHeight={200}
          noRecordsText="Nenhum convidado cadastrado."
          columns={[
            { accessor: "name", title: "Nome", width: 140, sortable: true },
            {
              accessor: "whatsapp",
              title: "WhatsApp",
              width: 110,
              render: (g) =>
                (g as Guest).whatsapp ? (g as Guest).whatsapp : "-",
              textAlign: "center",
              sortable: true,
            },
            { accessor: "email", title: "Email", width: 160, sortable: true },
            {
              accessor: "acompanhantes",
              title: "Acompanhantes",
              width: 80,
              render: (g) => (g as Guest).acompanhantes ?? "-",
              sortable: true,
            },
            {
              accessor: "status_presenca",
              title: "Status",
              width: 120,
              render: (guest: Guest) => {
                const statusColors: Record<string, string> = {
                  Pending: "yellow",
                  Confirmed: "green",
                  Refused: "red",
                };
                const statusLabels: Record<string, string> = {
                  Pending: "Pendente",
                  Confirmed: "Confirmado",
                  Refused: "Recusado",
                };
                return (
                  <Badge
                    size="sm"
                    variant="light"
                    color={statusColors[guest.status_presenca || ""] || "gray"}
                  >
                    {statusLabels[guest.status_presenca || ""] ||
                      "Desconhecido"}
                  </Badge>
                );
              },
            },
            {
              accessor: "actions",
              title: "",
              width: 130,
              render: (guest: Guest) => {
                return (
                  <Group gap={4}>
                    {guest.status_presenca === "Pending" && (
                      <Tooltip label="Confirmar Presença">
                        <ActionIcon
                          size="sm"
                          variant="light"
                          color="blue"
                          onClick={() => {
                            setSelectedGuest(guest);
                            setPresencaModalOpen(true);
                          }}
                        >
                          <IconCheck size={16} />
                        </ActionIcon>
                      </Tooltip>
                    )}
                    {guest.whatsapp && guest.status_presenca === "Pending" && (
                      <Tooltip label="Enviar RSVP por WhatsApp">
                        <ActionIcon
                          variant="subtle"
                          color="green"
                          component="a"
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Enviar RSVP por WhatsApp"
                          onClick={async () => {
                            try {
                              const res =
                                await guests_generate_confirmation_link(
                                  guest.id,
                                );
                              setConfirmationData({
                                confirmation_url: res.confirmation_url,
                                whatsapp_link: res.whatsapp_link,
                                token: res.token,
                              });
                              setConfirmationModalOpen(true);
                            } catch {
                              notifications.show({
                                color: "red",
                                message: "Erro ao gerar link de confirmação.",
                              });
                            }
                          }}
                        >
                          <IconBrandWhatsapp size={18} />
                        </ActionIcon>
                      </Tooltip>
                    )}
                    {guest.status_presenca !== "Pending" && (
                      <Tooltip label="Gerar link de confirmação">
                        <ActionIcon
                          size="sm"
                          variant="light"
                          color="blue"
                          onClick={async () => {
                            try {
                              const res =
                                await guests_generate_confirmation_link(
                                  guest.id,
                                );
                              setConfirmationData({
                                confirmation_url: res.confirmation_url,
                                whatsapp_link: res.whatsapp_link,
                                token: res.token,
                              });
                              setConfirmationModalOpen(true);
                            } catch {
                              notifications.show({
                                color: "red",
                                message: "Erro ao gerar link de confirmação.",
                              });
                            }
                          }}
                        >
                          <IconLink size={16} />
                        </ActionIcon>
                      </Tooltip>
                    )}
                    {guest.email && (
                      <Tooltip label="Enviar RSVP por Email">
                        <ActionIcon
                          variant="subtle"
                          color="gray"
                          component="a"
                          href={`mailto:${
                            guest.email
                          }?subject=${encodeURIComponent(
                            "Confirmação de Presença - Casamento",
                          )}&body=${encodeURIComponent(
                            "Olá! Por gentileza, confirme sua presença no nosso casamento respondendo este e-mail ou pelo site. O convite formal será enviado via papelaria. Obrigado!",
                          )}`}
                          title="Enviar RSVP por Email"
                        >
                          <IconMail size={18} />
                        </ActionIcon>
                      </Tooltip>
                    )}
                    <Tooltip label="Editar Convidado">
                      <ActionIcon
                        variant="subtle"
                        styles={actionIconEditStyles}
                        onClick={() => handleEdit(guest)}
                      >
                        <IconEdit size={18} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Excluir Convidado">
                      <ActionIcon
                        variant="subtle"
                        styles={actionIconDangerStyles}
                        onClick={() => openDeleteConfirm(guest)}
                      >
                        <IconTrash size={18} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                );
              },
            },
          ]}
          records={paginatedGuests}
          totalRecords={derivedTotalRecords}
          page={page}
          onPageChange={setPage}
          recordsPerPage={recordsPerPage}
          onRecordsPerPageChange={setRecordsPerPage}
          recordsPerPageOptions={[10, 20, 50]}
          sortStatus={sortStatus}
          onSortStatusChange={setSortStatus}
          rowStyle={() => ({ background: "#f8f9fa" })}
          styles={{
            table: { fontSize: rem(15) },
          }}
          striped
          fetching={loading}
          paginationText={({ from, to, totalRecords }) =>
            `${from}–${to} de ${totalRecords}`
          }
        />
      )}
      <Modal
        opened={confirmationModalOpen}
        onClose={() => setConfirmationModalOpen(false)}
        title="Link de Confirmação"
        centered
      >
        <Stack gap="sm">
          <Text size="sm">
            Link criado. Você pode copiar e colar na sua mensagem do WhatsApp ou
            abrir direto no WhatsApp abaixo.
          </Text>
          <Text size="sm" style={{ wordBreak: "break-all" }}>
            {confirmationData?.confirmation_url}
          </Text>
          <Group>
            <Button
              styles={softButtonStyles}
              onClick={async () => {
                if (!confirmationData?.confirmation_url) return;
                try {
                  await navigator.clipboard.writeText(
                    confirmationData.confirmation_url,
                  );
                  notifications.show({
                    color: "green",
                    message: "Link copiado para a área de transferência.",
                  });
                } catch {
                  notifications.show({
                    color: "red",
                    message: "Falha ao copiar. Copie manualmente.",
                  });
                }
              }}
            >
              Copiar link
            </Button>
            {confirmationData?.whatsapp_link && (
              <Button
                component="a"
                target="_blank"
                rel="noopener noreferrer"
                href={confirmationData.whatsapp_link}
                styles={primaryButtonStyles}
              >
                Abrir WhatsApp
              </Button>
            )}
          </Group>
        </Stack>
      </Modal>
      <Modal
        opened={deleteModalOpen}
        onClose={() => {
          if (!deletingGuest) {
            setDeleteModalOpen(false);
            setGuestToDelete(null);
          }
        }}
        title="Confirmar exclusão"
        centered
        size="sm"
        overlayProps={{ blur: 2 }}
      >
        <Stack gap="md">
          <Group gap="sm" align="flex-start" wrap="nowrap">
            <IconAlertTriangle size={22} color="var(--mantine-color-red-6)" />
            <Text size="sm">
              {guestToDelete
                ? `Tem certeza que deseja remover ${guestToDelete.name}? Essa ação não pode ser desfeita.`
                : "Tem certeza que deseja remover este convidado? Essa ação não pode ser desfeita."}
            </Text>
          </Group>
          <Group justify="flex-end">
            <Button
              variant="default"
              onClick={() => {
                if (deletingGuest) return;
                setDeleteModalOpen(false);
                setGuestToDelete(null);
              }}
              styles={softButtonStyles}
              disabled={deletingGuest}
            >
              Cancelar
            </Button>
            <Button
              color="red"
              leftSection={<IconTrash size={16} />}
              onClick={handleDeleteConfirmed}
              loading={deletingGuest}
            >
              Remover
            </Button>
          </Group>
        </Stack>
      </Modal>
      {viewMode === "cards" && (
        <ListView
          items={paginatedGuests}
          getItemId={(g) => g.id}
          getImageUrl={(g) => g.photo_url || undefined}
          fallbackIcon={
            <IconUser size={48} color="var(--mantine-color-gray-5)" />
          }
          renderContent={(g) => (
            <>
              <Text fw={500} lineClamp={2}>
                {g.name}
              </Text>
              <Group my="xs">
                <BadgeStatus {...g} />
              </Group>
              {g.whatsapp && (
                <Text size="sm" c="dimmed">
                  WhatsApp: {g.whatsapp}
                </Text>
              )}
              {g.acompanhantes !== undefined && (
                <Text size="sm" c="dimmed">
                  Acompanhantes: {g.acompanhantes}
                </Text>
              )}
            </>
          )}
          renderActions={(g) => (
            <>
              {g.status_presenca === "Pending" && (
                <Tooltip label="Confirmar Presença">
                  <Menu.Item
                    leftSection={<IconCheck size={16} />}
                    onClick={() => {
                      setSelectedGuest(g);
                      setPresencaModalOpen(true);
                    }}
                  >
                    Confirmar Presença
                  </Menu.Item>
                </Tooltip>
              )}
              {g.whatsapp && g.status_presenca === "Pending" && (
                <Tooltip label="Enviar RSVP por WhatsApp">
                  <Menu.Item
                    leftSection={<IconBrandWhatsapp size={16} />}
                    onClick={async () => {
                      try {
                        const res = await guests_generate_confirmation_link(
                          g.id,
                        );
                        setConfirmationData({
                          confirmation_url: res.confirmation_url,
                          whatsapp_link: res.whatsapp_link,
                          token: res.token,
                        });
                        setConfirmationModalOpen(true);
                      } catch {
                        notifications.show({
                          color: "red",
                          message: "Erro ao gerar link de confirmação.",
                        });
                      }
                    }}
                  >
                    Enviar RSVP
                  </Menu.Item>
                </Tooltip>
              )}
              {g.status_presenca !== "Pending" && (
                <Tooltip label="Gerar link de confirmação">
                  <Menu.Item
                    leftSection={<IconLink size={16} />}
                    onClick={async () => {
                      try {
                        const res = await guests_generate_confirmation_link(
                          g.id,
                        );
                        setConfirmationData({
                          confirmation_url: res.confirmation_url,
                          whatsapp_link: res.whatsapp_link,
                          token: res.token,
                        });
                        setConfirmationModalOpen(true);
                      } catch {
                        notifications.show({
                          color: "red",
                          message: "Erro ao gerar link de confirmação.",
                        });
                      }
                    }}
                  >
                    Gerar Link
                  </Menu.Item>
                </Tooltip>
              )}
              {g.email && (
                <Tooltip label="Enviar RSVP por Email" position="right">
                  <Menu.Item
                    leftSection={<IconMail size={14} />}
                    component="a"
                    href={`mailto:${g.email}?subject=${encodeURIComponent(
                      "Confirmação de Presença - Casamento",
                    )}&body=${encodeURIComponent(
                      "Olá! Por gentileza, confirme sua presença no nosso casamento respondendo este e-mail ou pelo site. O convite formal será enviado via papelaria. Obrigado!",
                    )}`}
                  >
                    Email
                  </Menu.Item>
                </Tooltip>
              )}
              <Tooltip label="Editar convidado" position="right">
                <Menu.Item
                  leftSection={
                    <IconEdit size={14} color="var(--marriplan-rose)" />
                  }
                  onClick={() => handleEdit(g)}
                >
                  Editar
                </Menu.Item>
              </Tooltip>
              <Tooltip label="Excluir convidado" position="right">
                <Menu.Item
                  leftSection={
                    <IconTrash size={14} color="var(--marriplan-rose)" />
                  }
                  onClick={() => openDeleteConfirm(g)}
                  color="red"
                >
                  Excluir
                </Menu.Item>
              </Tooltip>
            </>
          )}
        />
      )}
      {viewMode === "gallery" && (
        <GalleryView
          items={paginatedGuests}
          getItemId={(g) => g.id}
          getImageUrl={(g) => g.photo_url || undefined}
          fallbackIcon={
            <IconUser size={48} color="var(--mantine-color-gray-5)" />
          }
          renderContent={(g) => (
            <Stack gap="xs">
              <Text fw={500} lineClamp={2}>
                {g.name}
              </Text>
              <BadgeStatus {...g} />
              {g.whatsapp && (
                <Text size="sm" c="dimmed">
                  WhatsApp: {g.whatsapp}
                </Text>
              )}
              {g.acompanhantes !== undefined && (
                <Text size="sm" c="dimmed">
                  Acompanhantes: {g.acompanhantes}
                </Text>
              )}
            </Stack>
          )}
          renderActions={(g) => (
            <>
              {g.status_presenca === "Pending" && (
                <Tooltip label="Confirmar Presença">
                  <Menu.Item
                    leftSection={<IconCheck size={16} />}
                    onClick={() => {
                      setSelectedGuest(g);
                      setPresencaModalOpen(true);
                    }}
                  >
                    Confirmar Presença
                  </Menu.Item>
                </Tooltip>
              )}
              {g.whatsapp && g.status_presenca === "Pending" && (
                <Tooltip label="Enviar RSVP por WhatsApp">
                  <Menu.Item
                    leftSection={<IconBrandWhatsapp size={16} />}
                    onClick={async () => {
                      try {
                        const res = await guests_generate_confirmation_link(
                          g.id,
                        );
                        setConfirmationData({
                          confirmation_url: res.confirmation_url,
                          whatsapp_link: res.whatsapp_link,
                          token: res.token,
                        });
                        setConfirmationModalOpen(true);
                      } catch {
                        notifications.show({
                          color: "red",
                          message: "Erro ao gerar link de confirmação.",
                        });
                      }
                    }}
                  >
                    Enviar RSVP
                  </Menu.Item>
                </Tooltip>
              )}
              {g.status_presenca !== "Pending" && (
                <Tooltip label="Gerar link de confirmação">
                  <Menu.Item
                    leftSection={<IconLink size={16} />}
                    onClick={async () => {
                      try {
                        const res = await guests_generate_confirmation_link(
                          g.id,
                        );
                        setConfirmationData({
                          confirmation_url: res.confirmation_url,
                          whatsapp_link: res.whatsapp_link,
                          token: res.token,
                        });
                        setConfirmationModalOpen(true);
                      } catch {
                        notifications.show({
                          color: "red",
                          message: "Erro ao gerar link de confirmação.",
                        });
                      }
                    }}
                  >
                    Gerar Link
                  </Menu.Item>
                </Tooltip>
              )}
              {g.email && (
                <Tooltip label="Enviar RSVP por Email" position="right">
                  <Menu.Item
                    leftSection={<IconMail size={14} />}
                    component="a"
                    href={`mailto:${g.email}?subject=${encodeURIComponent(
                      "Confirmação de Presença - Casamento",
                    )}&body=${encodeURIComponent(
                      "Olá! Por gentileza, confirme sua presença no nosso casamento respondendo este e-mail ou pelo site. Esperamos você! 🥂",
                    )}`}
                  >
                    Email
                  </Menu.Item>
                </Tooltip>
              )}
              <Tooltip label="Editar convidado" position="right">
                <Menu.Item
                  leftSection={
                    <IconEdit size={14} color="var(--marriplan-rose)" />
                  }
                  onClick={() => handleEdit(g)}
                >
                  Editar
                </Menu.Item>
              </Tooltip>
              <Tooltip label="Excluir convidado" position="right">
                <Menu.Item
                  leftSection={
                    <IconTrash size={14} color="var(--marriplan-rose)" />
                  }
                  onClick={() => openDeleteConfirm(g)}
                  color="red"
                >
                  Excluir
                </Menu.Item>
              </Tooltip>
            </>
          )}
        />
      )}
      {(viewMode === "cards" || viewMode === "gallery") && (
        <Group justify="center" mt="md">
          <Pagination
            className="guest-pagination"
            total={Math.ceil(derivedTotalRecords / recordsPerPage)}
            value={page}
            onChange={setPage}
          />
        </Group>
      )}
      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Editar convidado" : "Adicionar convidado"}
        centered
        size="xl"
        overlayProps={{ blur: 2 }}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="Nome"
              required
              {...form.getInputProps("name")}
              autoFocus
              styles={inputStyles}
            />
            <TextInput
              label="Telefone"
              required
              maxLength={15}
              value={form.values.phone}
              onChange={(e) => {
                // Aplica máscara ao digitar
                const raw = e.currentTarget.value.replace(/\D/g, "");
                let masked = "";
                if (raw.length <= 10) {
                  masked = raw
                    .replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3")
                    .replace(/-$/, "");
                } else {
                  masked = raw
                    .replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3")
                    .replace(/-$/, "");
                }
                form.setFieldValue("phone", masked);
              }}
              error={form.errors.phone}
              placeholder="(11) 99999-9999"
              styles={inputStyles}
            />
            <Checkbox
              label="Possui WhatsApp?"
              checked={form.values.hasWhatsapp}
              onChange={(e) =>
                form.setFieldValue("hasWhatsapp", e.currentTarget.checked)
              }
            />
            {form.values.hasWhatsapp && (
              <TextInput
                label="Número do WhatsApp"
                required
                maxLength={15}
                value={form.values.whatsapp}
                onChange={(e) => {
                  const raw = e.currentTarget.value.replace(/\D/g, "");
                  let masked = "";
                  if (raw.length <= 10) {
                    masked = raw
                      .replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3")
                      .replace(/-$/, "");
                  } else {
                    masked = raw
                      .replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3")
                      .replace(/-$/, "");
                  }
                  form.setFieldValue("whatsapp", masked);
                }}
                error={form.errors.whatsapp}
                placeholder="(11) 98888-8888"
                styles={inputStyles}
              />
            )}
            <ImageDropzone
              title="Foto do convidado"
              label="Adicionar foto"
              value={form.values.photo_url || null}
              uploadFile={async (file) => {
                try {
                  return await uploadCloudinaryImage(file, "guest-photos");
                } catch (error: unknown) {
                  const normalizedError = error as {
                    response?: { data?: { error?: string } };
                  };
                  notifications.show({
                    color: "red",
                    message:
                      normalizedError?.response?.data?.error ||
                      "Não foi possível enviar a foto.",
                  });
                  return null;
                }
              }}
              onChange={async (image: unknown) => {
                const uploaded = image as
                  | { url?: string; id_cloudinary?: string; public_id?: string }
                  | string
                  | null;
                form.setFieldValue(
                  "photo_url",
                  typeof uploaded === "string" ? uploaded : uploaded?.url || "",
                );
                form.setFieldValue(
                  "photo_public_id",
                  typeof uploaded === "string"
                    ? ""
                    : uploaded?.id_cloudinary || uploaded?.public_id || "",
                );
              }}
              onRemove={async () => {
                form.setFieldValue("photo_url", "");
                form.setFieldValue("photo_public_id", "");
              }}
              public_id={form.values.photo_public_id}
            />
            <TextInput
              label="Email"
              type="email"
              {...form.getInputProps("email")}
              error={form.errors.email}
              placeholder="exemplo@email.com"
              styles={inputStyles}
            />
            <TextInput
              label="Alergias"
              {...form.getInputProps("alergias")}
              placeholder="Ex: Amendoim, frutos do mar..."
              styles={inputStyles}
            />
            <TextInput
              label="Acompanhantes"
              type="number"
              min={0}
              {...form.getInputProps("acompanhantes")}
              placeholder="0"
              styles={inputStyles}
            />
            <TextInput
              label="Observações"
              {...form.getInputProps("observacoes")}
              placeholder="Observações adicionais"
              styles={inputStyles}
            />
            <Select
              label="Status de Presença"
              placeholder="Selecione o status"
              data={[
                { value: "Pending", label: "Pendente" },
                { value: "Confirmed", label: "Confirmado" },
                { value: "Refused", label: "Recusado" },
              ]}
              {...form.getInputProps("status_presenca")}
              styles={inputStyles}
            />
            <Group justify="flex-end" mt="md">
              <Button
                variant="default"
                onClick={() => setModalOpen(false)}
                type="button"
                styles={softButtonStyles}
              >
                Cancelar
              </Button>
              <Button type="submit" styles={primaryButtonStyles}>
                Salvar
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
      <Modal
        opened={advancedFilterOpen}
        onClose={() => setAdvancedFilterOpen(false)}
        title="Filtro avançado"
        centered
        size="sm"
        overlayProps={{ blur: 2 }}
      >
        <Stack gap="md">
          <Group gap="sm" grow>
            <Stack gap="xs" style={{ flex: 1 }}>
              <Text size="sm" fw={600}>
                Acompanhantes
              </Text>
              <RangeSlider
                min={0}
                max={maxCompanionsValue}
                value={companionsRange}
                onChange={setCompanionsRange}
                minRange={0}
                label={(value) => `${value}`}
                styles={{
                  track: { backgroundColor: "var(--marriplan-border)" },
                  bar: { backgroundColor: "var(--marriplan-rose)" },
                  thumb: { borderColor: "var(--marriplan-rose)" },
                }}
              />
              <Text size="xs" c="dimmed">
                {companionsRange[0]} a {companionsRange[1]} acompanhantes
              </Text>
            </Stack>
          </Group>
          <Stack gap="xs">
            <Text size="sm" fw={600}>
              Status de Presença
            </Text>
            <Select
              value={statusFilter}
              onChange={(value) =>
                setStatusFilter((value as typeof statusFilter) || "all")
              }
              data={[
                { value: "all", label: "Todos os status" },
                { value: "Pending", label: "Pendente" },
                { value: "Confirmed", label: "Confirmado" },
                { value: "Refused", label: "Recusado" },
              ]}
              w={{ base: "100%" }}
              styles={inputStyles}
            />
          </Stack>
          <Stack gap="xs">
            <Text size="sm" fw={600}>
              WhatsApp
            </Text>
            <Select
              value={whatsappFilter}
              onChange={(value) =>
                setWhatsappFilter(
                  (value as "all" | "with" | "without") || "all",
                )
              }
              data={[
                { value: "all", label: "Todos" },
                { value: "with", label: "Com WhatsApp" },
                { value: "without", label: "Sem WhatsApp" },
              ]}
              styles={inputStyles}
            />
          </Stack>
          <Stack gap="xs">
            <Text size="sm" fw={600}>
              Alergia
            </Text>
            <Select
              value={allergyFilter}
              onChange={(value) =>
                setAllergyFilter((value as "all" | "with" | "without") || "all")
              }
              data={[
                { value: "all", label: "Todos" },
                { value: "with", label: "Com alergia" },
                { value: "without", label: "Sem alergia" },
              ]}
              styles={inputStyles}
            />
          </Stack>
          <Group justify="space-between" mt="sm">
            <Button
              variant="light"
              styles={softButtonStyles}
              onClick={() => {
                setCompanionsRange([0, maxCompanionsValue]);
                setWhatsappFilter("all");
                setAllergyFilter("all");
                setStatusFilter("all");
              }}
            >
              Limpar filtros
            </Button>
            <Button
              styles={primaryButtonStyles}
              onClick={() => setAdvancedFilterOpen(false)}
            >
              Aplicar
            </Button>
          </Group>
        </Stack>
      </Modal>
      <Modal
        opened={presencaModalOpen}
        onClose={() => setPresencaModalOpen(false)}
        title="Confirmar Presença do Convidado"
        centered
        size="sm"
        overlayProps={{ blur: 2 }}
      >
        <Stack>
          {selectedGuest && (
            <>
              <Text fw={500} size="lg">
                {selectedGuest.name}
              </Text>
              <Text size="sm" c="dimmed">
                Selecione o status de presença:
              </Text>
              <Group grow>
                <Button
                  color="green"
                  onClick={async () => {
                    try {
                      await guests_partial_update(selectedGuest.id, {
                        status_presenca: "Confirmed",
                      });
                      notifications.show({
                        title: "Sucesso",
                        message: "Presença confirmada",
                        color: "green",
                      });
                      setPresencaModalOpen(false);
                      await loadGuests();
                    } catch {
                      notifications.show({
                        title: "Erro",
                        message: "Falha ao confirmar presença",
                        color: "red",
                      });
                    }
                  }}
                >
                  Confirmar
                </Button>
                <Button
                  color="red"
                  onClick={async () => {
                    try {
                      await guests_partial_update(selectedGuest.id, {
                        status_presenca: "Refused",
                      });
                      notifications.show({
                        title: "Sucesso",
                        message: "Presença recusada",
                        color: "red",
                      });
                      setPresencaModalOpen(false);
                      await loadGuests();
                    } catch {
                      notifications.show({
                        title: "Erro",
                        message: "Falha ao recusar presença",
                        color: "red",
                      });
                    }
                  }}
                >
                  Recusar
                </Button>
                <Button
                  variant="default"
                  onClick={() => setPresencaModalOpen(false)}
                  styles={softButtonStyles}
                >
                  Cancelar
                </Button>
              </Group>
            </>
          )}
        </Stack>
      </Modal>
      <ImportGuestsModal
        opened={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onSuccess={async () => {
          setImportModalOpen(false);
          await loadGuests();
        }}
      />
      {/* Responsividade customizada para mobile */}
      <style>{`
        @media (max-width: 600px) {
          .mantine-DataTable-table {
            font-size: 13px;
          }
          .mantine-DataTable-table th, .mantine-DataTable-table-td {
            padding: 8px 4px;
          }
        }
        .guest-table .mantine-Pagination-control {
          border-radius: 12px;
          border-color: var(--marriplan-border);
          color: var(--marriplan-text);
        }
        .guest-table .mantine-Pagination-control[data-active] {
          background-color: var(--marriplan-rose);
          border-color: var(--marriplan-rose);
          color: #fff;
        }
        .guest-pagination .mantine-Pagination-control {
          border-radius: 12px;
          border-color: var(--marriplan-border);
          color: var(--marriplan-text);
        }
        .guest-pagination .mantine-Pagination-control[data-active] {
          background-color: var(--marriplan-rose);
          border-color: var(--marriplan-rose);
          color: #fff;
        }
      `}</style>
    </Stack>
  );
}

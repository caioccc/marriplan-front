import BaseLayout from "@/components/Layout/_BaseLayout";
import { FreePlanLimitBanner } from "@/components/billing/FreePlanLimitBanner";
import { PaymentPlanModal } from "@/components/financeiro/PaymentPlanModal";
import {
  FEATURE_LABELS,
  getFeatureLimit,
  isFeatureLimitReached,
} from "@/constants/plans";
import { useSubscription } from "@/hooks/useSubscription";
import { handleValueChange, toSentenceCase } from "@/lib/text";
import {
  FormaPagamento,
  ParcelaPagamento,
  ParcelaStatus,
  atualizarParcelaPagamento,
  registrarPagamento,
  removerParcelaPagamento,
  reverterPagamento,
} from "@/services/financeiro";
import {
  Supplier,
  WeddingSupplier,
  getSupplier,
  getWeddingSupplier,
  listWeddingSuppliers,
  selectSupplierForWedding,
  updateWeddingSupplier,
  uploadSupplierContract,
} from "@/services/suppliers";
import { inputStyles, primaryButtonStyles, softButtonStyles } from "@/styles";
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
  Group,
  Image,
  Loader,
  Menu,
  Modal,
  ScrollArea,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title
} from "@mantine/core";
import { DatePickerInput, DatesProvider } from "@mantine/dates";
import { useMediaQuery } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IconArrowLeft,
  IconDotsVertical,
  IconEdit,
  IconHeart,
  IconMapPin,
  IconPaperclip,
  IconSparkles,
  IconTrash,
  IconUpload,
} from "@tabler/icons-react";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";

function formatCurrencyInput(value: string) {
  const normalized = value.replace(/[^\d,.-]/g, "").replace(",", ".");
  return normalized;
}

function parseCombinedValue(value: string) {
  const numeric = Number(formatCurrencyInput(value));
  return Number.isNaN(numeric) ? 0 : numeric;
}

export default function SupplierDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [weddingSupplier, setWeddingSupplier] =
    useState<WeddingSupplier | null>(null);
  const [weddingSupplierCount, setWeddingSupplierCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [contractPreviewOpen, setContractPreviewOpen] = useState(false);
  const [contractFile, setContractFile] = useState<File | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentModalMode, setPaymentModalMode] = useState<"plan" | "manual">(
    "plan",
  );
  const [parcelActionOpen, setParcelActionOpen] = useState(false);
  const [parcelEditOpen, setParcelEditOpen] = useState(false);
  const [activeParcela, setActiveParcela] = useState<ParcelaPagamento | null>(
    null,
  );
  const [parcelPaymentForm, setParcelPaymentForm] = useState({
    data_pagamento: new Date().toISOString().slice(0, 10),
    valor: "",
    observacao: "",
  });
  const [parcelEditForm, setParcelEditForm] = useState({
    numero_parcela: 1,
    descricao: "",
    valor: "",
    data_vencimento: new Date().toISOString().slice(0, 10),
    forma_pagamento: "pix" as FormaPagamento,
    status: "a_vencer" as ParcelaStatus,
    observacao: "",
  });
  const [parcelActionLoading, setParcelActionLoading] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [parcelaToDelete, setParcelaToDelete] =
    useState<ParcelaPagamento | null>(null);
  const [confirmRevertOpen, setConfirmRevertOpen] = useState(false);
  const [parcelaToRevert, setParcelaToRevert] =
    useState<ParcelaPagamento | null>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { isPremium } = useSubscription();
  const supplierLimit = getFeatureLimit("suppliers");
  const supplierLimitReached =
    !weddingSupplier &&
    isFeatureLimitReached("suppliers", weddingSupplierCount, isPremium);
  const [form, setForm] = useState({
    status: "QUOTING" as NonNullable<WeddingSupplier["status"]>,
    is_favorite: false,
    valor_combinado: "",
    notes: "",
  });

  useEffect(() => {
    if (!id) return;
    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        const supplierData = await getSupplier(Number(id));
        const [weddingData, weddingCountData] = await Promise.all([
          listWeddingSuppliers({
            supplier: Number(id),
            page_size: 1,
          }),
          listWeddingSuppliers({
            page_size: 1,
          }),
        ]);
        if (!mounted) return;
        setSupplier(supplierData);
        const relation = weddingData.results?.[0] || null;
        setWeddingSupplier(relation);
        setWeddingSupplierCount(weddingCountData.count || 0);
        if (relation) {
          setForm({
            status: relation.status || "QUOTING",
            is_favorite: !!relation.is_favorite,
            valor_combinado:
              relation.valor_combinado && Number(relation.valor_combinado) > 0
                ? String(relation.valor_combinado)
                : "",
            notes: relation.notes || "",
          });
        }
      } catch (error) {
        console.error(error);
        notifications.show({
          color: "red",
          message: "Não foi possível carregar o fornecedor.",
        });
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  const refreshWeddingSupplier = async (weddingSupplierId: number) => {
    try {
      const fresh = await getWeddingSupplier(weddingSupplierId);
      setWeddingSupplier(fresh);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSave = async () => {
    if (!supplier) return;
    if (!weddingSupplier && supplierLimitReached) return;
    if (
      form.status === "HIRED" &&
      !Boolean(weddingSupplier?.parcelas?.length)
    ) {
      notifications.show({
        color: "red",
        message:
          "Para salvar como contratado é necessário criar ou associar um plano de pagamento.",
      });
      return;
    }
    setSaving(true);
    try {
      let relation = weddingSupplier;
      const weddingPayload = {
        status: form.status,
        is_favorite: form.is_favorite,
        valor_combinado: formatCurrencyInput(form.valor_combinado),
        notes: toSentenceCase(form.notes),
      };

      if (!relation) {
        relation = await selectSupplierForWedding({
          supplier_id: supplier.id,
          ...weddingPayload,
        });
      } else {
        relation = await updateWeddingSupplier(relation.id, weddingPayload);
      }

      if (!relation) {
        throw new Error("Não foi possível salvar a relação do fornecedor.");
      }

      const savedRelation = relation;
      let finalRelation = savedRelation;

      if (contractFile) {
        const uploaded = await uploadSupplierContract(contractFile);
        finalRelation = await updateWeddingSupplier(savedRelation.id, {
          contract_file_url: uploaded.url,
          contract_file_public_id: uploaded.public_id,
        });
      }

      setWeddingSupplier(finalRelation);
      notifications.show({
        color: "green",
        message: finalRelation.contract_file_url
          ? "Fornecedor adicionado ao casamento com contrato anexado."
          : "Fornecedor adicionado ao casamento com sucesso.",
      });
    } catch (error) {
      console.error(error);
      const errorMessage =
        (error as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || "Não foi possível salvar o fornecedor.";
      notifications.show({
        color: "red",
        message: errorMessage,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleOpenPaymentModal = (mode: "plan" | "manual") => {
    if (!weddingSupplier) {
      notifications.show({
        color: "red",
        message: "Adicione o fornecedor ao casamento para criar o plano.",
      });
      return;
    }
    setPaymentModalMode(mode);
    setPaymentModalOpen(true);
  };

  const openParcelPayment = (parcela: ParcelaPagamento) => {
    setActiveParcela(parcela);
    setParcelPaymentForm({
      data_pagamento: new Date().toISOString().slice(0, 10),
      valor: String(parcela.valor),
      observacao: parcela.observacao || "",
    });
    setParcelActionOpen(true);
  };

  const openParcelEdit = (parcela: ParcelaPagamento) => {
    setActiveParcela(parcela);
    setParcelEditForm({
      numero_parcela: parcela.numero_parcela,
      descricao: parcela.descricao,
      valor: String(parcela.valor),
      data_vencimento: parcela.data_vencimento,
      forma_pagamento: parcela.forma_pagamento,
      status: parcela.status,
      observacao: parcela.observacao || "",
    });
    setParcelEditOpen(true);
  };

  const handleRegisterParcelPayment = async () => {
    if (!activeParcela) return;
    setParcelActionLoading(true);
    try {
      await registrarPagamento(activeParcela.id, {
        data_pagamento: parcelPaymentForm.data_pagamento,
        valor: parcelPaymentForm.valor,
        observacao: parcelPaymentForm.observacao,
        forma_pagamento: activeParcela.forma_pagamento,
      });
      notifications.show({ color: "green", message: "Pagamento registrado." });
      setParcelActionOpen(false);
      if (weddingSupplier?.id) {
        const fresh = await getWeddingSupplier(weddingSupplier.id);
        setWeddingSupplier(fresh);
      }
    } catch {
      notifications.show({
        color: "red",
        message: "Não foi possível registrar o pagamento.",
      });
    } finally {
      setParcelActionLoading(false);
    }
  };

  const handleRevertParcelPayment = async (parcela: ParcelaPagamento) => {
    setParcelActionLoading(true);
    try {
      await reverterPagamento(parcela.id);
      notifications.show({ color: "green", message: "Pagamento revertido." });
      if (weddingSupplier?.id) {
        const fresh = await getWeddingSupplier(weddingSupplier.id);
        setWeddingSupplier(fresh);
      }
    } catch {
      notifications.show({
        color: "red",
        message: "Não foi possível reverter o pagamento.",
      });
    } finally {
      setParcelActionLoading(false);
    }
  };

  const handleUpdateParcel = async () => {
    if (!activeParcela) return;
    setParcelActionLoading(true);
    try {
      await atualizarParcelaPagamento(activeParcela.id, {
        numero_parcela: parcelEditForm.numero_parcela,
        descricao: parcelEditForm.descricao,
        valor: parcelEditForm.valor,
        data_vencimento: parcelEditForm.data_vencimento,
        forma_pagamento: parcelEditForm.forma_pagamento,
        status: parcelEditForm.status,
        observacao: parcelEditForm.observacao,
      });
      notifications.show({ color: "green", message: "Parcela atualizada." });
      setParcelEditOpen(false);
      if (weddingSupplier?.id) {
        const fresh = await getWeddingSupplier(weddingSupplier.id);
        setWeddingSupplier(fresh);
      }
    } catch {
      notifications.show({
        color: "red",
        message: "Não foi possível atualizar a parcela.",
      });
    } finally {
      setParcelActionLoading(false);
    }
  };

  const handleDeleteParcel = async (parcela: ParcelaPagamento) => {
    setParcelActionLoading(true);
    try {
      await removerParcelaPagamento(parcela.id);
      notifications.show({ color: "green", message: "Parcela removida." });
      if (weddingSupplier?.id) {
        const fresh = await getWeddingSupplier(weddingSupplier.id);
        setWeddingSupplier(fresh);
      }
    } catch {
      notifications.show({
        color: "red",
        message: "Não foi possível remover a parcela.",
      });
    } finally {
      setParcelActionLoading(false);
    }
  };

  const confirmDeleteParcel = async () => {
    if (!parcelaToDelete) return;
    setConfirmDeleteOpen(false);
    try {
      await handleDeleteParcel(parcelaToDelete);
    } finally {
      setParcelaToDelete(null);
    }
  };

  const confirmRevertParcel = async () => {
    if (!parcelaToRevert) return;
    setConfirmRevertOpen(false);
    try {
      await handleRevertParcelPayment(parcelaToRevert);
    } finally {
      setParcelaToRevert(null);
    }
  };

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

  const FORMA_OPTIONS: Array<{ value: FormaPagamento; label: string }> = [
    { value: "pix", label: "PIX" },
    { value: "boleto", label: "Boleto" },
    { value: "cartao_credito", label: "Cartão de Crédito" },
    { value: "cartao_debito", label: "Cartão de Débito" },
    { value: "transferencia", label: "Transferência" },
    { value: "dinheiro", label: "Dinheiro" },
    { value: "cheque", label: "Cheque" },
    { value: "outro", label: "Outro" },
  ];

  function statusLabel(status?: ParcelaStatus) {
    if (status === "pago") return "Pago";
    if (status === "em_atraso") return "Em atraso";
    return "A vencer";
  }

  function statusColor(status?: ParcelaStatus) {
    if (status === "pago") return "green";
    if (status === "em_atraso") return "red";
    return "yellow";
  }

  function dueColor(parcela: {
    status?: ParcelaStatus;
    data_vencimento: string;
  }) {
    const calculated = parcela.status;
    if (calculated === "pago") return "green";
    if (calculated === "em_atraso") return "red";
    const dueDate = new Date(`${parcela.data_vencimento}T00:00:00`);
    const diffDays = Math.ceil(
      (dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );
    if (diffDays <= 7) return "yellow";
    return "teal";
  }

  const contractUrl = weddingSupplier?.contract_file_url || "";

  const isImageContract = useMemo(
    () => /\.(png|jpe?g|gif|webp|bmp|svg)(\?.*)?$/i.test(contractUrl),
    [contractUrl],
  );

  const isHired = form.status === "HIRED";
  const hasPaymentPlan = Boolean(weddingSupplier?.parcelas?.length);
  const saveDisabled = isHired && !hasPaymentPlan;


  

  const handleDownloadContract = () => {
    if (!contractUrl) return;

    const link = document.createElement("a");
    link.href = contractUrl;
    link.setAttribute(
      "download",
      `${supplier?.name?.replace(/[^a-z0-9-_]+/gi, "_") || "contrato"}`,
    );
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noreferrer");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <BaseLayout>
        <Card radius="xl" p="xl" withBorder>
          <Group justify="center" py="xl">
            <Loader />
          </Group>
        </Card>
      </BaseLayout>
    );
  }

  if (!supplier) {
    return (
      <BaseLayout>
        <Card radius="xl" p="xl" withBorder>
          <Stack align="center" gap="sm" py="xl">
            <Title order={3}>Fornecedor não encontrado</Title>
            <Text c="dimmed">Volte ao marketplace e tente novamente.</Text>
            <Button
              leftSection={<IconArrowLeft size={18} />}
              onClick={() => router.push("/meus-fornecedores/fornecedores")}
            >
              Voltar
            </Button>
          </Stack>
        </Card>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout>
      <Stack gap="lg" py="md">
        {supplierLimitReached ? (
          <FreePlanLimitBanner
            featureLabel={FEATURE_LABELS.suppliers}
            limit={typeof supplierLimit === "number" ? supplierLimit : 0}
            currentUsage={weddingSupplierCount}
            title="Você atingiu o limite do plano gratuito para fornecedores"
            description="No plano Free você pode manter até 3 fornecedores. Para adicionar este parceiro ao casamento, faça upgrade para o Premium."
          />
        ) : null}
        {isMobile ? (
          <>
            <Card radius="xl" p="xl" withBorder>
              <Group justify="space-between" align="flex-start" wrap="wrap">
                <Stack gap={4} style={{ maxWidth: 660 }}>
                  <Text
                    size="xs"
                    tt="uppercase"
                    fw={700}
                    c="dimmed"
                    style={{ letterSpacing: 1.2 }}
                  >
                    Detalhe do fornecedor
                  </Text>
                  <Title order={2}>{supplier.name}</Title>
                  <Text c="dimmed">
                    Adicione ao casamento, ajuste os valores e anexe o contrato
                    opcional.
                  </Text>
                </Stack>
                <Group>
                  <Button
                    variant="default"
                    styles={softButtonStyles}
                    leftSection={<IconArrowLeft size={18} />}
                    onClick={() => router.back()}
                  >
                    Voltar
                  </Button>
                  {!supplierLimitReached || weddingSupplier ? (
                    <Button
                      leftSection={<IconUpload size={18} />}
                      styles={primaryButtonStyles}
                      onClick={handleSave}
                      loading={saving}
                      disabled={saveDisabled}
                    >
                      {weddingSupplier
                        ? "Salvar alterações"
                        : "Adicionar ao casamento"}
                    </Button>
                  ) : null}
                </Group>
              </Group>
            </Card>

            <Card
              radius="xl"
              withBorder
              shadow="sm"
              style={{
                overflow: "hidden",
                background: "rgba(255,255,255,0.92)",
              }}
            >
              <Stack gap="lg">
                <Box style={{ position: "relative" }}>
                  <Image
                    src={
                      supplier.cover_image_url ||
                      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80"
                    }
                    alt={supplier.name}
                    style={{
                      height: 280,
                      width: "100%",
                      objectFit: "cover",
                      display: "block",
                      filter: weddingSupplier ? "brightness(0.85)" : "none",
                    }}
                  />
                  <Box
                    style={{
                      position: "absolute",
                      top: 12,
                      left: 12,
                      right: 12,
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 8,
                      flexWrap: "wrap",
                    }}
                  >
                    <Badge
                      radius="xl"
                      color={supplier.is_featured ? "orange" : "gray"}
                      variant="filled"
                    >
                      {supplier.is_featured
                        ? "Destaque"
                        : supplier.category_detail?.name || "Fornecedor"}
                    </Badge>
                  </Box>
                </Box>

                <Stack gap="sm">
                  <Stack gap={2}>
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                      Nome
                    </Text>
                    <Text fw={700} size="lg">
                      {supplier.name}
                    </Text>
                  </Stack>

                  <Stack gap={2}>
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                      Descrição
                    </Text>
                    <Text size="sm">
                      {supplier.description ||
                        supplier.company_name ||
                        "Descrição em breve."}
                    </Text>
                  </Stack>

                  <Stack gap={2}>
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                      Localização
                    </Text>
                    <Text size="sm">
                      {[supplier.city, supplier.state]
                        .filter(Boolean)
                        .join(" • ") || "Local não informado"}
                    </Text>
                  </Stack>

                  {weddingSupplier &&
                  weddingSupplier.status_financeiro !== "Sem plano" ? (
                    <>
                      <Stack gap={2}>
                        <Text size="xs" c="dimmed">
                          Valor combinado
                        </Text>
                        <Text fw={600}>
                          {formatCurrency(weddingSupplier.valor_combinado)}
                        </Text>
                      </Stack>
                      <Stack gap={2}>
                        <Text size="xs" c="dimmed">
                          Valor Pago
                        </Text>
                        <Text fw={600}>
                          {formatCurrency(weddingSupplier.valor_pago)}
                        </Text>
                      </Stack>
                      <Stack gap={2}>
                        <Text size="xs" c="dimmed">
                          Saldo devedor
                        </Text>
                        <Text fw={600}>
                          {formatCurrency(weddingSupplier.saldo_devedor)}
                        </Text>
                      </Stack>
                      <Stack gap={2}>
                        <Text size="xs" c="dimmed">
                          Status financeiro
                        </Text>
                        <Text fw={600}>
                          {weddingSupplier.status_financeiro || "Sem plano"}
                        </Text>
                      </Stack>
                    </>
                  ) : null}

                  <Stack gap={2}>
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                      Categoria
                    </Text>
                    <Group gap="xs" wrap="wrap">
                      <Badge
                        variant="light"
                        leftSection={<IconSparkles size={12} />}
                      >
                        {supplier.category_detail?.name || "Fornecedor"}
                      </Badge>
                      {weddingSupplier?.is_favorite ? (
                        <Badge
                          color="pink"
                          variant="light"
                          leftSection={<IconHeart size={12} />}
                        >
                          Favorito
                        </Badge>
                      ) : null}
                      {weddingSupplier?.contract_file_url ? (
                        <Badge
                          color="blue"
                          variant="light"
                          leftSection={<IconPaperclip size={12} />}
                        >
                          Contrato anexado
                        </Badge>
                      ) : null}
                    </Group>
                  </Stack>

                  {weddingSupplier?.contract_file_url ? (
                    <Group gap="xs" wrap="wrap">
                      <Button
                        size="xs"
                        variant="default"
                        onClick={() => setContractPreviewOpen(true)}
                      >
                        Visualizar contrato
                      </Button>
                      <Button
                        size="xs"
                        styles={primaryButtonStyles}
                        radius="xl"
                        onClick={handleDownloadContract}
                      >
                        Baixar contrato
                      </Button>
                    </Group>
                  ) : null}
                </Stack>
              </Stack>
            </Card>

            <Card radius="xl" withBorder>
              <Stack gap="md">
                <Select
                  label="Status"
                  data={[
                    { value: "QUOTING", label: "Cotando" },
                    { value: "NEGOTIATING", label: "Negociando" },
                    { value: "HIRED", label: "Contratado" },
                  ]}
                  value={form.status}
                  onChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      status: (value || "QUOTING") as typeof form.status,
                    }))
                  }
                  styles={inputStyles}
                />

                <Checkbox
                  label="Favorito"
                  checked={form.is_favorite}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      is_favorite: event.currentTarget.checked,
                    }))
                  }
                />

                <TextInput
                  label="Valor combinado"
                  value={form.valor_combinado}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      valor_combinado: event.currentTarget.value,
                    }))
                  }
                  styles={inputStyles}
                />

                {isHired && weddingSupplier && !hasPaymentPlan ? (
                  <Stack gap="xs">
                    <Button
                      variant="default"
                      styles={softButtonStyles}
                      onClick={() => handleOpenPaymentModal("plan")}
                      disabled={parseCombinedValue(form.valor_combinado) <= 0}
                    >
                      Criar Plano
                    </Button>
                    {/* <Button
                      variant="light"
                      styles={primaryButtonStyles}
                      onClick={() => handleOpenPaymentModal("manual")}
                      disabled={parseCombinedValue(form.valor_combinado) <= 0}
                    >
                      Add manualmente
                    </Button> */}
                  </Stack>
                ) : null}

                {isHired &&
                !hasPaymentPlan &&
                parseCombinedValue(form.valor_combinado) <= 0 ? (
                  <Text size="sm" c="red" mt="xs">
                    Informe o valor combinado maior que zero para criar ou
                    adicionar o plano de pagamento.
                  </Text>
                ) : null}

                <Textarea
                  label="Observações"
                  minRows={4}
                  value={form.notes}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      notes: event.currentTarget.value,
                    }))
                  }
                  styles={inputStyles}
                />

                {hasPaymentPlan ? (
                  <Card radius="lg" withBorder p="md" mt="md">
                    <Stack gap="sm">
                      <Group justify="space-between" align="center">
                        <Text fw={700}>Plano de pagamento associado</Text>
                        <Badge
                          color={
                            weddingSupplier?.status_financeiro === "Quitado"
                              ? "green"
                              : weddingSupplier?.status_financeiro ===
                                "Em atraso"
                              ? "red"
                              : "yellow"
                          }
                          variant="light"
                        >
                          {weddingSupplier?.status_financeiro || "Sem plano"}
                        </Badge>
                      </Group>
                      <Text size="sm" c="dimmed">
                        Este plano está vinculado ao fornecedor e mostra as
                        parcelas previstas.
                      </Text>
                      <ScrollArea
                        type="auto"
                        styles={{ viewport: { paddingBottom: 12 } }}
                      >
                        <Stack gap="sm">
                          {weddingSupplier?.parcelas
                            ?.slice()
                            .sort((a, b) => a.numero_parcela - b.numero_parcela)
                            .map((parcela) => {
                              const parcelaStatus =
                                parcela.status || "a_vencer";
                              return (
                                <Card key={parcela.id} radius="md" withBorder>
                                  <Group noWrap align="center" position="apart">
                                    <Stack
                                      gap={2}
                                      style={{ minWidth: 0, flex: 1 }}
                                    >
                                      <Text fw={700} lineClamp={1}>
                                        {parcela.descricao}
                                      </Text>
                                      <Group spacing={8} align="center">
                                        <Text size="xs" c="dimmed">
                                          Venc:
                                        </Text>
                                        <Text
                                          size="sm"
                                          c={
                                            parcelaStatus === "em_atraso"
                                              ? "red"
                                              : dueColor(parcela)
                                          }
                                          fw={600}
                                        >
                                          {new Date(
                                            `${parcela.data_vencimento}T00:00:00`,
                                          ).toLocaleDateString("pt-BR")}
                                        </Text>
                                      </Group>
                                      <Text size="sm" fw={600}>
                                        {formatCurrency(parcela.valor)}
                                      </Text>
                                      <Text size="xs">
                                        {FORMA_OPTIONS.find(
                                          (item) =>
                                            item.value ===
                                            parcela.forma_pagamento,
                                        )?.label || parcela.forma_pagamento}
                                      </Text>
                                    </Stack>

                                    <Group spacing={8} noWrap>
                                      {/* <Badge color={statusColor(parcelaStatus)}>
                                        {statusLabel(parcelaStatus)}
                                      </Badge> */}
                                      {parcelaStatus === "pago" ? (
                                        <Button
                                          variant="light"
                                          color="orange"
                                          size="xs"
                                          onClick={() => {
                                            setParcelaToRevert(parcela);
                                            setConfirmRevertOpen(true);
                                          }}
                                        >
                                          Reverter
                                        </Button>
                                      ) : (
                                        <Button
                                          variant="light"
                                          color="green"
                                          size="xs"
                                          onClick={() =>
                                            openParcelPayment(parcela)
                                          }
                                        >
                                          Pagar
                                        </Button>
                                      )}
                                      <Menu withinPortal position="bottom-end">
                                        <Menu.Target>
                                          <ActionIcon
                                            variant="light"
                                            aria-label="Mais opções"
                                          >
                                            <IconDotsVertical size={18} />
                                          </ActionIcon>
                                        </Menu.Target>
                                        <Menu.Dropdown>
                                          <Menu.Item
                                            leftSection={<IconEdit size={14} />}
                                            onClick={() =>
                                              openParcelEdit(parcela)
                                            }
                                            disabled={parcelaStatus === "pago"}
                                          >
                                            Editar
                                          </Menu.Item>
                                          <Menu.Item
                                            leftSection={
                                              <IconTrash size={14} />
                                            }
                                            color="red"
                                            onClick={() => {
                                              setParcelaToDelete(parcela);
                                              setConfirmDeleteOpen(true);
                                            }}
                                            disabled={parcelaStatus === "pago"}
                                          >
                                            Excluir
                                          </Menu.Item>
                                        </Menu.Dropdown>
                                      </Menu>
                                    </Group>
                                  </Group>
                                  {parcela.observacao ? (
                                    <Text size="sm" c="dimmed" mt="xs">
                                      {parcela.observacao}
                                    </Text>
                                  ) : null}
                                </Card>
                              );
                            })}
                        </Stack>
                      </ScrollArea>
                    </Stack>
                  </Card>
                ) : null}

                <Card
                  radius="lg"
                  withBorder
                  p="md"
                  style={{ background: "rgba(246,238,228,0.45)" }}
                >
                  <Stack gap="sm">
                    <Group justify="space-between" align="center" wrap="wrap">
                      <Group gap="xs">
                        <IconPaperclip size={16} />
                        <Text fw={600}>Contrato opcional</Text>
                      </Group>
                      <Button
                        variant="default"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Escolher arquivo
                      </Button>
                    </Group>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="application/pdf,image/*"
                      style={{ display: "none" }}
                      onChange={(event) =>
                        setContractFile(event.currentTarget.files?.[0] || null)
                      }
                    />
                    <Text size="sm" c="dimmed">
                      Envie PDF ou imagem. Se houver um contrato antigo, ele
                      será substituído no próximo salvamento.
                    </Text>
                    {contractFile ? (
                      <Badge color="blue" variant="light">
                        {contractFile.name}
                      </Badge>
                    ) : weddingSupplier?.contract_file_url ? (
                      <Badge color="green" variant="light">
                        Contrato já anexado
                      </Badge>
                    ) : null}
                  </Stack>
                </Card>
              </Stack>
              <Group mt="lg" justify="center">
                <Group>
                  <Button
                    variant="default"
                    styles={softButtonStyles}
                    leftSection={<IconArrowLeft size={18} />}
                    onClick={() => router.back()}
                  >
                    Voltar
                  </Button>
                  {!supplierLimitReached || weddingSupplier ? (
                    <Button
                      leftSection={<IconUpload size={18} />}
                      styles={primaryButtonStyles}
                      onClick={handleSave}
                      loading={saving}
                      disabled={saveDisabled}
                    >
                      {weddingSupplier
                        ? "Salvar alterações"
                        : "Adicionar ao casamento"}
                    </Button>
                  ) : null}
                </Group>
              </Group>
            </Card>
          </>
        ) : (
          <>
            <Card radius="xl" p="xl" withBorder>
              <Group justify="space-between" align="flex-start" wrap="wrap">
                <Stack gap={4} style={{ maxWidth: 660 }}>
                  <Text
                    size="xs"
                    tt="uppercase"
                    fw={700}
                    c="dimmed"
                    style={{ letterSpacing: 1.2 }}
                  >
                    Detalhe do fornecedor
                  </Text>
                  <Title order={2}>{supplier.name}</Title>
                  <Text c="dimmed">
                    Adicione ao casamento, ajuste os valores e anexe o contrato
                    opcional.
                  </Text>
                </Stack>
                <Group>
                  <Button
                    variant="default"
                    styles={softButtonStyles}
                    leftSection={<IconArrowLeft size={18} />}
                    onClick={() => router.back()}
                  >
                    Voltar
                  </Button>
                  {!supplierLimitReached || weddingSupplier ? (
                    <Button
                      leftSection={<IconUpload size={18} />}
                      styles={primaryButtonStyles}
                      onClick={handleSave}
                      loading={saving}
                      disabled={saveDisabled}
                    >
                      {weddingSupplier
                        ? "Salvar alterações"
                        : "Adicionar ao casamento"}
                    </Button>
                  ) : null}
                </Group>
              </Group>
            </Card>

            <Card
              radius="xl"
              withBorder
              shadow="sm"
              style={{
                overflow: "hidden",
                background: "rgba(255,255,255,0.92)",
              }}
            >
              <Group align="flex-start" gap="md">
                <Box style={{ position: "relative" }}>
                  <Image
                    src={
                      supplier.cover_image_url ||
                      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80"
                    }
                    alt={supplier.name}
                    style={{
                      height: 220,
                      width: 220,
                      objectFit: "cover",
                      display: "block",
                      filter: weddingSupplier ? "brightness(0.8)" : "none",
                      borderRadius: "8px",
                    }}
                  />
                  <Box
                    style={{
                      position: "absolute",
                      top: 12,
                      left: 12,
                      right: 12,
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 8,
                      flexWrap: "wrap",
                    }}
                  >
                    <Badge
                      radius="xl"
                      color={supplier.is_featured ? "orange" : "gray"}
                      variant="filled"
                    >
                      {supplier.is_featured
                        ? "Destaque"
                        : supplier.category_detail?.name || "Fornecedor"}
                    </Badge>
                  </Box>
                </Box>
                <Stack gap="sm" style={{ flex: 1 }}>
                  <Stack gap={4}>
                    <Text fw={700} size={"lg"} lineClamp={1}>
                      {supplier.name}
                    </Text>
                    <Text size="sm" c="dimmed" lineClamp={2}>
                      {supplier.description ||
                        supplier.company_name ||
                        "Descrição em breve."}
                    </Text>
                  </Stack>
                  <Group gap="xs" wrap="wrap">
                    <Badge
                      variant="light"
                      leftSection={<IconMapPin size={12} />}
                    >
                      {[supplier.city, supplier.state]
                        .filter(Boolean)
                        .join(" • ") || "Local não informado"}
                    </Badge>
                    {weddingSupplier?.is_favorite ? (
                      <Badge
                        color="pink"
                        variant="light"
                        leftSection={<IconHeart size={12} />}
                      >
                        Favorito
                      </Badge>
                    ) : null}
                    {weddingSupplier?.contract_file_url ? (
                      <Group gap="xs" wrap="wrap">
                        <Badge
                          color="blue"
                          variant="light"
                          leftSection={<IconPaperclip size={12} />}
                        >
                          Contrato
                        </Badge>
                        <Button
                          size="xs"
                          variant="default"
                          styles={softButtonStyles}
                          onClick={() => setContractPreviewOpen(true)}
                        >
                          Visualizar contrato
                        </Button>
                        <Button
                          size="xs"
                          styles={primaryButtonStyles}
                          radius="xl"
                          onClick={handleDownloadContract}
                        >
                          Baixar contrato
                        </Button>
                      </Group>
                    ) : null}
                  </Group>
                  {weddingSupplier ? (
                    <Group justify="space-between" gap="sm" wrap="wrap" mr="lg">
                      <Stack gap={2}>
                        <Text size="xs" c="dimmed">
                          Valor combinado
                        </Text>
                        <Text fw={600}>
                          {formatCurrency(weddingSupplier.valor_combinado)}
                        </Text>
                      </Stack>
                      <Stack gap={2}>
                        <Text size="xs" c="dimmed">
                          Valor Pago
                        </Text>
                        <Text fw={600}>
                          {formatCurrency(weddingSupplier.valor_pago)}
                        </Text>
                      </Stack>
                      <Stack gap={2}>
                        <Text size="xs" c="dimmed">
                          Saldo devedor
                        </Text>
                        <Text fw={600}>
                          {formatCurrency(weddingSupplier.saldo_devedor)}
                        </Text>
                      </Stack>
                      <Stack gap={2}>
                        <Text size="xs" c="dimmed">
                          Status financeiro
                        </Text>
                        <Text fw={600}>
                          {weddingSupplier.status_financeiro || "Sem plano"}
                        </Text>
                      </Stack>
                    </Group>
                  ) : null}
                  <Group gap="xs" justify="space-between" wrap="wrap" mt="xs">
                    <Group gap={6}>
                      <IconSparkles size={14} color="var(--marriplan-rose)" />
                      <Text size="xs" c="dimmed" lineClamp={1}>
                        {supplier.category_detail?.name || "Fornecedor"}
                      </Text>
                    </Group>
                  </Group>
                </Stack>
              </Group>
            </Card>

            <Card radius="xl" p="xl" withBorder>
              <Stack gap="md">
                <Group grow align="flex-start" wrap="wrap">
                  <Select
                    label="Status"
                    data={[
                      { value: "QUOTING", label: "Cotando" },
                      { value: "NEGOTIATING", label: "Negociando" },
                      { value: "HIRED", label: "Contratado" },
                      { value: "PAID", label: "Pago" },
                      { value: "CANCELED", label: "Cancelado" },
                    ]}
                    value={form.status}
                    onChange={(value) =>
                      setForm((prev) => ({
                        ...prev,
                        status: (value || "QUOTING") as typeof form.status,
                      }))
                    }
                    styles={inputStyles}
                  />
                  <Checkbox
                    mt={28}
                    label="Favorito"
                    checked={form.is_favorite}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        is_favorite: event.currentTarget.checked,
                      }))
                    }
                  />
                </Group>

                <Group grow align="flex-start" wrap="wrap">
                  <TextInput
                    label="Valor combinado"
                    value={form.valor_combinado}
                    onChange={(event) => {
                      const val = handleValueChange(event.currentTarget.value);
                      setForm((prev) => ({ ...prev, valor_combinado: val }));
                    }}
                    placeholder="0.00"
                    rightSection={<span style={{ paddingRight: 8 }}>R$</span>}
                    styles={inputStyles}
                  />
                </Group>

                {isHired && weddingSupplier && !hasPaymentPlan ? (
                  <Group gap="sm" wrap="wrap">
                    <Button
                      variant="default"
                      styles={softButtonStyles}
                      onClick={() => handleOpenPaymentModal("plan")}
                      disabled={parseCombinedValue(form.valor_combinado) <= 0}
                    >
                      Criar plano de pagamento
                    </Button>
                    {/* <Button
                      variant="light"
                      styles={primaryButtonStyles}
                      onClick={() => handleOpenPaymentModal("manual")}
                      disabled={parseCombinedValue(form.valor_combinado) <= 0}
                    >
                      Adicionar manualmente
                    </Button> */}
                  </Group>
                ) : null}

                {isHired && !hasPaymentPlan ? (
                  <Text size="sm" c="red" mt="xs">
                    Para salvar como contratado é necessário criar ou associar
                    um plano de pagamento.
                  </Text>
                ) : null}

                <Textarea
                  label="Observações"
                  minRows={4}
                  value={form.notes}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      notes: event.currentTarget.value,
                    }))
                  }
                  styles={inputStyles}
                />

                {hasPaymentPlan ? (
                  <Card radius="lg" withBorder p="md" mt="md">
                    <Stack gap="sm">
                      <Group justify="space-between" align="center">
                        <Text fw={700}>Plano de pagamento associado</Text>
                        <Badge
                          color={
                            weddingSupplier?.status_financeiro === "Quitado"
                              ? "green"
                              : weddingSupplier?.status_financeiro ===
                                "Em atraso"
                              ? "red"
                              : "yellow"
                          }
                          variant="light"
                        >
                          {weddingSupplier?.status_financeiro || "Sem plano"}
                        </Badge>
                      </Group>
                      <Text size="sm" c="dimmed">
                        Este plano está vinculado ao fornecedor e mostra as
                        parcelas previstas.
                      </Text>
                      <ScrollArea
                        type="auto"
                        styles={{ viewport: { paddingBottom: 12 } }}
                      >
                        <Stack gap="sm">
                          {weddingSupplier?.parcelas?.map((parcela) => {
                            const parcelaStatus = parcela.status || "a_vencer";
                            return (
                              <Card key={parcela.id} radius="md" withBorder>
                                <Group noWrap align="center" position="apart">
                                  <Stack
                                    spacing={2}
                                    style={{ minWidth: 0, flex: 1 }}
                                  >
                                    <Text fw={700} lineClamp={1}>
                                      {parcela.descricao}
                                    </Text>
                                    <Group spacing={8} align="center">
                                      <Text size="xs" c="dimmed">
                                        Venc:
                                      </Text>
                                      <Text
                                        size="sm"
                                        c={
                                          parcelaStatus === "em_atraso"
                                            ? "red"
                                            : dueColor(parcela)
                                        }
                                        fw={600}
                                      >
                                        {new Date(
                                          `${parcela.data_vencimento}T00:00:00`,
                                        ).toLocaleDateString("pt-BR")}
                                      </Text>
                                      <Text size="xs" c="dimmed">
                                        •
                                      </Text>
                                      <Text size="sm" fw={600}>
                                        {formatCurrency(parcela.valor)}
                                      </Text>
                                      <Text size="xs" c="dimmed">
                                        •
                                      </Text>
                                      <Text size="xs">
                                        {FORMA_OPTIONS.find(
                                          (item) =>
                                            item.value ===
                                            parcela.forma_pagamento,
                                        )?.label || parcela.forma_pagamento}
                                      </Text>
                                    </Group>
                                  </Stack>

                                  <Group spacing={8} noWrap>
                                    <Badge color={statusColor(parcelaStatus)}>
                                      {statusLabel(parcelaStatus)}
                                    </Badge>
                                    {parcelaStatus === "pago" ? (
                                      <Button
                                        variant="light"
                                        color="orange"
                                        size="xs"
                                        onClick={() => {
                                          setParcelaToRevert(parcela);
                                          setConfirmRevertOpen(true);
                                        }}
                                      >
                                        Reverter
                                      </Button>
                                    ) : (
                                      <Button
                                        variant="light"
                                        color="green"
                                        size="xs"
                                        onClick={() =>
                                          openParcelPayment(parcela)
                                        }
                                      >
                                        Pagar
                                      </Button>
                                    )}
                                    <Menu withinPortal position="bottom-end">
                                      <Menu.Target>
                                        <ActionIcon
                                          variant="light"
                                          aria-label="Mais opções"
                                        >
                                          <IconDotsVertical size={18} />
                                        </ActionIcon>
                                      </Menu.Target>
                                      <Menu.Dropdown>
                                        <Menu.Item
                                          leftSection={<IconEdit size={14} />}
                                          onClick={() =>
                                            openParcelEdit(parcela)
                                          }
                                          disabled={parcelaStatus === "pago"}
                                        >
                                          Editar
                                        </Menu.Item>
                                        <Menu.Item
                                          leftSection={<IconTrash size={14} />}
                                          color="red"
                                          onClick={() => {
                                            setParcelaToDelete(parcela);
                                            setConfirmDeleteOpen(true);
                                          }}
                                          disabled={parcelaStatus === "pago"}
                                        >
                                          Excluir
                                        </Menu.Item>
                                      </Menu.Dropdown>
                                    </Menu>
                                  </Group>
                                </Group>
                                {parcela.observacao ? (
                                  <Text size="sm" c="dimmed" mt="xs">
                                    {parcela.observacao}
                                  </Text>
                                ) : null}
                              </Card>
                            );
                          })}
                        </Stack>
                      </ScrollArea>
                    </Stack>
                  </Card>
                ) : null}

                <Card
                  radius="lg"
                  withBorder
                  p="md"
                  style={{ background: "rgba(246,238,228,0.45)" }}
                >
                  <Stack gap="sm">
                    <Group justify="space-between" align="center" wrap="wrap">
                      <Group gap="xs">
                        <IconPaperclip size={16} />
                        <Text fw={600}>Contrato opcional</Text>
                      </Group>
                      <Button
                        variant="default"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Escolher arquivo
                      </Button>
                    </Group>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="application/pdf,image/*"
                      style={{ display: "none" }}
                      onChange={(event) =>
                        setContractFile(event.currentTarget.files?.[0] || null)
                      }
                    />
                    <Text size="sm" c="dimmed">
                      Envie PDF ou imagem. Se houver um contrato antigo, ele
                      será substituído no próximo salvamento.
                    </Text>
                    {contractFile ? (
                      <Badge color="blue" variant="light">
                        {contractFile.name}
                      </Badge>
                    ) : weddingSupplier?.contract_file_url ? (
                      <Badge color="green" variant="light">
                        Contrato já anexado
                      </Badge>
                    ) : null}
                  </Stack>
                </Card>
              </Stack>
            </Card>
          </>
        )}

        <Modal
          opened={contractPreviewOpen}
          onClose={() => setContractPreviewOpen(false)}
          title="Pré-visualização do contrato"
          centered
          size="100%"
        >
          {contractUrl ? (
            <Stack gap="md">
              <Text size="sm" c="dimmed">
                Visualize o arquivo antes de baixar ou compartilhar.
              </Text>
              <Card radius="lg" withBorder p="sm" style={{ minHeight: 640 }}>
                {isImageContract ? (
                  <Image
                    src={contractUrl}
                    alt={`Contrato de ${supplier.name}`}
                    fit="contain"
                    style={{ minHeight: 620 }}
                  />
                ) : (
                  <iframe
                    title={`Contrato de ${supplier.name}`}
                    src={contractUrl}
                    style={{ width: "100%", height: 620, border: 0 }}
                  />
                )}
              </Card>
              <Group justify="flex-end">
                <Button
                  variant="default"
                  styles={softButtonStyles}
                  radius="xl"
                  onClick={() => setContractPreviewOpen(false)}
                >
                  Fechar
                </Button>
                <Button
                  styles={primaryButtonStyles}
                  radius="xl"
                  onClick={handleDownloadContract}
                >
                  Baixar contrato
                </Button>
              </Group>
            </Stack>
          ) : null}
        </Modal>

        <Modal
          opened={parcelActionOpen}
          onClose={() => setParcelActionOpen(false)}
          title="Registrar pagamento"
          centered
          size="md"
        >
          <Stack gap="md">
            <DatesProvider settings={{ locale: "pt-br" }}>
              <DatePickerInput
                value={parcelPaymentForm.data_pagamento}
                onChange={(event) =>
                  setParcelPaymentForm((prev) => ({
                    ...prev,
                    data_pagamento: event,
                  }))
                }
                label="Data do pagamento"
                valueFormat="DD/MM/YYYY"
                styles={inputStyles}
              />
            </DatesProvider>
            <TextInput
              label="Valor"
              value={parcelPaymentForm.valor}
              onChange={(event) =>
                setParcelPaymentForm((prev) => ({
                  ...prev,
                  valor: event.currentTarget.value,
                }))
              }
              styles={inputStyles}
            />
            <Textarea
              label="Observação"
              minRows={3}
              value={parcelPaymentForm.observacao}
              onChange={(event) =>
                setParcelPaymentForm((prev) => ({
                  ...prev,
                  observacao: event.currentTarget.value,
                }))
              }
              styles={inputStyles}
            />
            <Group justify="flex-end" mt="md">
              <Button
                variant="default"
                styles={softButtonStyles}
                onClick={() => setParcelActionOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                styles={primaryButtonStyles}
                onClick={handleRegisterParcelPayment}
                loading={parcelActionLoading}
              >
                Registrar pagamento
              </Button>
            </Group>
          </Stack>
        </Modal>

        <Modal
          opened={parcelEditOpen}
          onClose={() => setParcelEditOpen(false)}
          title="Editar parcela"
          centered
          size="md"
        >
          <Stack gap="md">
            <TextInput
              label="Descrição"
              value={parcelEditForm.descricao}
              onChange={(event) =>
                setParcelEditForm((prev) => ({
                  ...prev,
                  descricao: event.currentTarget.value,
                }))
              }
              styles={inputStyles}
            />
            <TextInput
              label="Valor"
              value={parcelEditForm.valor}
              onChange={(event) =>
                setParcelEditForm((prev) => ({
                  ...prev,
                  valor: event.currentTarget.value,
                }))
              }
              styles={inputStyles}
            />
            <DatesProvider settings={{ locale: "pt-br" }}>
              <DatePickerInput
                valueFormat="DD/MM/YYYY"
                label="Vencimento"
                value={parcelEditForm.data_vencimento}
                onChange={(event) => {
                  setParcelEditForm((prev) => ({
                    ...prev,
                    data_vencimento: event,
                  }));
                }}
                styles={inputStyles}
              />
            </DatesProvider>
            <Select
              label="Forma de pagamento"
              data={[
                { value: "pix", label: "Pix" },
                { value: "boleto", label: "Boleto" },
                { value: "cartao_credito", label: "Cartão de crédito" },
                { value: "cartao_debito", label: "Cartão de débito" },
                { value: "transferencia", label: "Transferência" },
                { value: "dinheiro", label: "Dinheiro" },
                { value: "cheque", label: "Cheque" },
                { value: "outro", label: "Outro" },
              ]}
              value={parcelEditForm.forma_pagamento}
              onChange={(value) =>
                setParcelEditForm((prev) => ({
                  ...prev,
                  forma_pagamento: (value || "pix") as FormaPagamento,
                }))
              }
              styles={inputStyles}
            />
            <Select
              label="Status"
              data={[
                { value: "a_vencer", label: "A vencer" },
                { value: "em_atraso", label: "Em atraso" },
                { value: "pago", label: "Pago" },
              ]}
              value={parcelEditForm.status}
              onChange={(value) =>
                setParcelEditForm((prev) => ({
                  ...prev,
                  status: (value || "a_vencer") as ParcelaStatus,
                }))
              }
              styles={inputStyles}
            />
            <Textarea
              label="Observação"
              minRows={3}
              value={parcelEditForm.observacao}
              onChange={(event) =>
                setParcelEditForm((prev) => ({
                  ...prev,
                  observacao: event.currentTarget.value,
                }))
              }
              styles={inputStyles}
            />
            <Group justify="flex-end" mt="md">
              <Button
                variant="default"
                styles={softButtonStyles}
                onClick={() => setParcelEditOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                styles={primaryButtonStyles}
                onClick={handleUpdateParcel}
                loading={parcelActionLoading}
              >
                Salvar alterações
              </Button>
            </Group>
          </Stack>
        </Modal>

        <Modal
          opened={confirmDeleteOpen}
          onClose={() => {
            setConfirmDeleteOpen(false);
            setParcelaToDelete(null);
          }}
          title="Excluir parcela"
          centered
          size="sm"
        >
          <Stack gap="md">
            <Text>
              Tem certeza que deseja excluir esta parcela? Esta ação não pode
              ser revertida.
            </Text>
            <Group position="right" spacing="sm">
              <Button
                variant="default"
                styles={softButtonStyles}
                onClick={() => {
                  setConfirmDeleteOpen(false);
                  setParcelaToDelete(null);
                }}
              >
                Cancelar
              </Button>
              <Button
                color="red"
                styles={primaryButtonStyles}
                onClick={confirmDeleteParcel}
                loading={parcelActionLoading}
              >
                Excluir parcela
              </Button>
            </Group>
          </Stack>
        </Modal>

        <Modal
          opened={confirmRevertOpen}
          onClose={() => {
            setConfirmRevertOpen(false);
            setParcelaToRevert(null);
          }}
          title="Reverter pagamento"
          centered
          size="sm"
        >
          <Stack gap="md">
            <Text>Deseja reverter o pagamento desta parcela?</Text>
            <Group position="right" spacing="sm">
              <Button
                variant="default"
                styles={softButtonStyles}
                onClick={() => {
                  setConfirmRevertOpen(false);
                  setParcelaToRevert(null);
                }}
              >
                Cancelar
              </Button>
              <Button
                styles={primaryButtonStyles}
                onClick={confirmRevertParcel}
                loading={parcelActionLoading}
              >
                Reverter pagamento
              </Button>
            </Group>
          </Stack>
        </Modal>

        <PaymentPlanModal
          opened={paymentModalOpen}
          mode={paymentModalMode}
          weddingSupplierId={weddingSupplier?.id}
          valorCombinadoOverride={form.valor_combinado}
          onClose={() => setPaymentModalOpen(false)}
          onSaved={() => {
            if (weddingSupplier?.id) {
              void refreshWeddingSupplier(weddingSupplier.id);
            }
          }}
        />
      </Stack>
    </BaseLayout>
  );
}

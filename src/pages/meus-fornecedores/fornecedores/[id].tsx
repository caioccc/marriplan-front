import BaseLayout from "@/components/Layout/_BaseLayout";
import {
  getSupplier,
  listWeddingSuppliers,
  selectSupplierForWedding,
  updateWeddingSupplier,
  uploadSupplierContract,
  Supplier,
  WeddingSupplier,
} from "@/services/suppliers";
import { inputStyles, primaryButtonStyles, softButtonStyles } from "@/styles";
import {
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
  Group,
  Image,
  Loader,
  Modal,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconArrowLeft,
  IconHeart,
  IconMapPin,
  IconPaperclip,
  IconSparkles,
  IconUpload,
} from "@tabler/icons-react";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useMediaQuery } from "@mantine/hooks";

function formatCurrencyInput(value: string) {
  const normalized = value.replace(/[^\d,.-]/g, "").replace(",", ".");
  return normalized;
}

export default function SupplierDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [weddingSupplier, setWeddingSupplier] =
    useState<WeddingSupplier | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [contractPreviewOpen, setContractPreviewOpen] = useState(false);
  const [contractFile, setContractFile] = useState<File | null>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [form, setForm] = useState({
    status: "QUOTING" as NonNullable<WeddingSupplier["status"]>,
    is_favorite: false,
    estimated_price: "",
    negotiated_price: "",
    paid_amount: "",
    notes: "",
  });

  useEffect(() => {
    if (!id) return;
    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        const supplierData = await getSupplier(Number(id));
        const weddingData = await listWeddingSuppliers({
          supplier: Number(id),
          page_size: 1,
        });
        if (!mounted) return;
        setSupplier(supplierData);
        const relation = weddingData.results?.[0] || null;
        setWeddingSupplier(relation);
        if (relation) {
          setForm({
            status: relation.status || "QUOTING",
            is_favorite: !!relation.is_favorite,
            estimated_price: relation.estimated_price
              ? String(relation.estimated_price)
              : "",
            negotiated_price: relation.negotiated_price
              ? String(relation.negotiated_price)
              : "",
            paid_amount: relation.paid_amount
              ? String(relation.paid_amount)
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

  const handleSave = async () => {
    if (!supplier) return;
    setSaving(true);
    try {
      let relation = weddingSupplier;
      const weddingPayload = {
        status: form.status,
        is_favorite: form.is_favorite,
        estimated_price: formatCurrencyInput(form.estimated_price),
        negotiated_price: formatCurrencyInput(form.negotiated_price),
        paid_amount: formatCurrencyInput(form.paid_amount),
        notes: form.notes,
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
      router.push("/meus-fornecedores");
    } catch (error) {
      console.error(error);
      notifications.show({
        color: "red",
        message: "Não foi possível salvar o fornecedor.",
      });
    } finally {
      setSaving(false);
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

  const contractUrl = weddingSupplier?.contract_file_url || "";

  const isImageContract = useMemo(
    () => /\.(png|jpe?g|gif|webp|bmp|svg)(\?.*)?$/i.test(contractUrl),
    [contractUrl],
  );

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
                  <Button
                    leftSection={<IconUpload size={18} />}
                    styles={primaryButtonStyles}
                    onClick={handleSave}
                    loading={saving}
                  >
                    {weddingSupplier
                      ? "Salvar alterações"
                      : "Adicionar ao casamento"}
                  </Button>
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

                  {weddingSupplier ? (
                    <Stack gap={2}>
                      <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                        Valores
                      </Text>
                      <Text size="sm">
                        Estimado:{" "}
                        {formatCurrency(weddingSupplier.estimated_price)}
                      </Text>
                      <Text size="sm">
                        Negociado:{" "}
                        {formatCurrency(weddingSupplier.negotiated_price)}
                      </Text>
                      <Text size="sm">
                        Pago: {formatCurrency(weddingSupplier.paid_amount)}
                      </Text>
                    </Stack>
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

            <Card radius="xl" p="xl" withBorder>
              <Stack gap="md">
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
                  label="Valor estimado"
                  value={form.estimated_price}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      estimated_price: event.currentTarget.value,
                    }))
                  }
                  styles={inputStyles}
                />

                <TextInput
                  label="Valor negociado"
                  value={form.negotiated_price}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      negotiated_price: event.currentTarget.value,
                    }))
                  }
                  styles={inputStyles}
                />

                <TextInput
                  label="Valor pago"
                  value={form.paid_amount}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      paid_amount: event.currentTarget.value,
                    }))
                  }
                  styles={inputStyles}
                />

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
                  <Button
                    leftSection={<IconUpload size={18} />}
                    styles={primaryButtonStyles}
                    onClick={handleSave}
                    loading={saving}
                  >
                    {weddingSupplier
                      ? "Salvar alterações"
                      : "Adicionar ao casamento"}
                  </Button>
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
                  <Button
                    leftSection={<IconUpload size={18} />}
                    styles={primaryButtonStyles}
                    onClick={handleSave}
                    loading={saving}
                  >
                    {weddingSupplier
                      ? "Salvar alterações"
                      : "Adicionar ao casamento"}
                  </Button>
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
                          Estimado
                        </Text>
                        <Text fw={600}>
                          {formatCurrency(weddingSupplier.estimated_price)}
                        </Text>
                      </Stack>
                      <Stack gap={2}>
                        <Text size="xs" c="dimmed">
                          Negociado
                        </Text>
                        <Text fw={600}>
                          {formatCurrency(weddingSupplier.negotiated_price)}
                        </Text>
                      </Stack>
                      <Stack gap={2}>
                        <Text size="xs" c="dimmed">
                          Pago
                        </Text>
                        <Text fw={600}>
                          {formatCurrency(weddingSupplier.paid_amount)}
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
                    label="Valor estimado"
                    value={form.estimated_price}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        estimated_price: event.currentTarget.value,
                      }))
                    }
                    styles={inputStyles}
                  />
                  <TextInput
                    label="Valor negociado"
                    value={form.negotiated_price}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        negotiated_price: event.currentTarget.value,
                      }))
                    }
                    styles={inputStyles}
                  />
                  <TextInput
                    label="Valor pago"
                    value={form.paid_amount}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        paid_amount: event.currentTarget.value,
                      }))
                    }
                    styles={inputStyles}
                  />
                </Group>

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
      </Stack>
    </BaseLayout>
  );
}

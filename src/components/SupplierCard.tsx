import { Supplier, WeddingSupplier } from "@/services/suppliers";
import { badgeStyles, softButtonStyles } from "@/styles";
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Group,
  Image,
  Menu,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import {
  IconBrandInstagram,
  IconBrandWhatsapp,
  IconCalendar,
  IconDotsVertical,
  IconEdit,
  IconHeart,
  IconPaperclip,
  IconPhone,
  IconTrash,
  IconWorldWww,
} from "@tabler/icons-react";
import { useRouter } from "next/router";

interface SupplierCardProps {
  supplier: Supplier;
  weddingSupplier?: WeddingSupplier | null;
  compact?: boolean;
  variant?: "default" | "dashboard";
  onView?: (supplier: Supplier) => void;
  onAdd?: (supplier: Supplier) => void;
  onEdit?: (supplier: Supplier) => void;
  onRemove?: (supplier: Supplier) => void;
  onCreatePlan?: (
    supplier: Supplier,
    weddingSupplier?: WeddingSupplier | null,
  ) => void;
  onViewPlan?: (
    supplier: Supplier,
    weddingSupplier?: WeddingSupplier | null,
  ) => void;
  onAddManual?: (
    supplier: Supplier,
    weddingSupplier?: WeddingSupplier | null,
  ) => void;
  canEdit?: boolean;
}

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

function normalizeExternalUrl(value?: string | null) {
  if (!value) return "";

  const trimmed = value.trim();
  if (!trimmed) return "";

  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed.replace(/^\/+/, "")}`;
}

function getInstagramUrl(instagram?: string | null) {
  if (!instagram) return "";

  const trimmed = instagram.trim();
  if (!trimmed) return "";

  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  const handle = trimmed.replace(/^@/, "").replace(/^instagram\.com\//i, "");
  return `https://instagram.com/${handle.replace(/^\/+/, "")}`;
}

function getWhatsAppUrl(whatsapp?: string | null) {
  if (!whatsapp) return "";

  const digits = whatsapp.replace(/\D/g, "");
  if (!digits) return "";

  return `https://wa.me/${digits}`;
}

function getPhoneUrl(phone?: string | null) {
  if (!phone) return "";

  const trimmed = phone.trim();
  if (!trimmed) return "";

  return `tel:${trimmed.replace(/\s+/g, "")}`;
}

const themeBadgeBaseStyle = {
  textTransform: "none",
  fontWeight: 700,
  letterSpacing: "0.01em",
  borderRadius: 999,
} as const;

const locationBadgeStyle = {
  ...themeBadgeBaseStyle,
  backgroundColor: "rgba(181, 139, 122, 0.14)",
  color: "var(--marriplan-rose)",
  border: "1px solid rgba(181, 139, 122, 0.24)",
} as const;

const contractBadgeStyle = {
  ...themeBadgeBaseStyle,
  backgroundColor: "rgba(200, 176, 138, 0.18)",
  color: "var(--marriplan-gold)",
  border: "1px solid rgba(200, 176, 138, 0.3)",
} as const;

const imageFrameStyle = {
  borderRadius: 16,
} as const;

function ContactLinks({ supplier }: { supplier: Supplier }) {
  const contactActionStyles = {
    root: {
      backgroundColor: "var(--marriplan-rose)",
      color: "#fff",
      borderRadius: 12,
      transition: "all 160ms ease",
      "&:hover": {
        backgroundColor: "#a57b6c",
      },
      "&:focus-visible": {
        outline: "2px solid rgba(181, 139, 122, 0.45)",
        outlineOffset: 2,
      },
    },
  } as const;

  const links = [
    {
      href: getInstagramUrl(supplier.instagram),
      label: "Instagram",
      icon: IconBrandInstagram,
      target: "_blank" as const,
      rel: "noopener noreferrer",
    },
    {
      href: getWhatsAppUrl(supplier.whatsapp),
      label: "WhatsApp",
      icon: IconBrandWhatsapp,
      target: "_blank" as const,
      rel: "noopener noreferrer",
    },
    {
      href: normalizeExternalUrl(supplier.website),
      label: "Website",
      icon: IconWorldWww,
      target: "_blank" as const,
      rel: "noopener noreferrer",
    },
    {
      href: getPhoneUrl(supplier.phone),
      label: "Telefone",
      icon: IconPhone,
    },
  ].filter((item) => !!item.href);

  if (!links.length) return null;

  return (
    <Group gap={8} wrap="nowrap" mt="xs" justify="center">
      {links.map(({ href, label, icon: Icon, target, rel }) => (
        <Tooltip key={label} label={label} withArrow>
          <ActionIcon
            component="a"
            href={href}
            target={target}
            rel={rel}
            variant="filled"
            styles={contactActionStyles}
            radius="xl"
            size="lg"
            aria-label={label}
          >
            <Icon size={16} />
          </ActionIcon>
        </Tooltip>
      ))}
    </Group>
  );
}

export function SupplierCard({
  supplier,
  weddingSupplier,
  compact = false,
  variant = "default",
  onAdd,
  onEdit,
  onRemove,
  onCreatePlan,
  onViewPlan,
  onAddManual,
  canEdit = false,
}: SupplierCardProps) {
  const router = useRouter();
  const imageUrl = supplier.cover_image_url || "";
  const categoryLabel = supplier.category_detail?.name || "Fornecedor";
  const cityLabel =
    [supplier.city, supplier.state].filter(Boolean).join(" • ") ||
    "Local não informado";
  const canShowMenu = (canEdit && !!onEdit) || !!onRemove;
  const cardHeight = compact ? 168 : 220;

  if (variant === "dashboard") {
    const hasImage = !!imageUrl;

    return (
      <Card
        radius="xl"
        withBorder
        shadow="sm"
        padding={0}
        style={{ overflow: "hidden", background: "rgba(255,255,255,0.92)" }}
      >
        <Box
          style={{
            position: "relative",
            height: cardHeight,
            background: hasImage
              ? undefined
              : getGradientBackground(supplier.name),
          }}
        >
          {hasImage ? (
            <Image
              src={imageUrl}
              alt={supplier.name}
              height={cardHeight}
              style={{
                width: "100%",
                height: cardHeight,
                objectFit: "cover",
                display: "block",
                ...imageFrameStyle,
              }}
            />
          ) : (
            <Box
              style={{
                height: "100%",
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 20,
                backgroundImage:
                  "radial-gradient(circle at top right, rgba(255,255,255,0.22), transparent 40%), radial-gradient(circle at bottom left, rgba(255,255,255,0.12), transparent 30%)",
                ...imageFrameStyle,
              }}
            >
              <Text
                fw={800}
                c="#fff"
                ta="center"
                size="xl"
                lineClamp={2}
                style={{
                  textShadow: "0 8px 24px rgba(0, 0, 0, 0.28)",
                  maxWidth: "90%",
                }}
              >
                {supplier.name}
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
              alignItems: "flex-start",
              gap: 8,
            }}
          >
            <Group gap={6} wrap="wrap">
              <Badge
                radius="xl"
                color={supplier.is_featured ? "orange" : "gray"}
                variant="filled"
              >
                {supplier.is_featured ? "Destaque" : categoryLabel}
              </Badge>
            </Group>
            {canShowMenu ? (
              <Menu shadow="md" width={220} position="bottom-end" withinPortal>
                <Menu.Target>
                  <Button
                    variant="white"
                    color="dark"
                    radius="xl"
                    size="xs"
                    px={10}
                    style={{
                      boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    <IconDotsVertical size={14} />
                  </Button>
                </Menu.Target>
                <Menu.Dropdown>
                  {canEdit && onEdit ? (
                    <Menu.Item
                      leftSection={<IconEdit size={14} />}
                      onClick={() => onEdit(supplier)}
                    >
                      Editar
                    </Menu.Item>
                  ) : null}
                  {onRemove ? (
                    <Menu.Item
                      color="red"
                      leftSection={<IconTrash size={14} />}
                      onClick={() => onRemove(supplier)}
                    >
                      Remover do casamento
                    </Menu.Item>
                  ) : null}
                </Menu.Dropdown>
              </Menu>
            ) : null}
          </Box>

          {hasImage ? (
            <Box
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                padding: "56px 14px 14px",
                background:
                  "linear-gradient(180deg, rgba(18, 14, 11, 0) 0%, rgba(18, 14, 11, 0.68) 100%)",
              }}
            >
              <Text
                fw={800}
                c="#fff"
                size="lg"
                lineClamp={2}
                style={{ textShadow: "0 8px 20px rgba(0,0,0,0.3)" }}
              >
                {supplier.name}
              </Text>
            </Box>
          ) : null}

          {onAdd ? (
            <Box
              style={{
                position: "absolute",
                left: 12,
                right: 12,
                top: 12,
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              {weddingSupplier &&
              weddingSupplier.status_financeiro === "Sem plano" ? (
                <Button
                  size="xs"
                  radius="xl"
                  onClick={() => onAdd(supplier)}
                  variant="default"
                  type="button"
                  styles={softButtonStyles}
                >
                  Contratar
                </Button>
              ) : (
                <Button
                  size="xs"
                  radius="xl"
                  onClick={() => onAdd(supplier)}
                  style={{
                    backgroundColor: "var(--marriplan-rose)",
                    color: "#fff",
                    boxShadow: "0 10px 24px rgba(181, 139, 122, 0.26)",
                  }}
                >
                  {weddingSupplier ? "Gerenciar" : "Adicionar ao casamento"}
                </Button>
              )}
            </Box>
          ) : null}
        </Box>
      </Card>
    );
  }

  const border =
    weddingSupplier?.status_financeiro === "Sem plano"
      ? { borderColor: "var(--marriplan-rose)", borderWidth: 2, borderStyle: "solid" }
      : undefined;

  return (
    <Card
      radius="xl"
      withBorder
      shadow="sm"
      style={{ overflow: "hidden", background: "rgba(255,255,255,0.92)", ...border }}
    >
      <Box style={{ position: "relative" }}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={supplier.name}
            height={cardHeight}
            style={{
              width: "100%",
              height: cardHeight,
              objectFit: "cover",
              display: "block",
              filter: weddingSupplier ? "brightness(0.8)" : "none",
              ...imageFrameStyle,
            }}
          />
        ) : (
          <Box
            style={{
              height: cardHeight,
              background: getGradientBackground(supplier.name),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 20,
              ...imageFrameStyle,
            }}
          >
            <Text
              fw={800}
              c="#fff"
              ta="center"
              size={compact ? "lg" : "xl"}
              lineClamp={2}
              style={{ textShadow: "0 8px 24px rgba(0, 0, 0, 0.28)" }}
            >
              {supplier.name}
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
          }}
        >
          <Group gap={6} wrap="wrap">
            <Badge
              radius="xl"
              color={supplier.is_featured ? "orange" : "gray"}
              variant="filled"
            >
              {supplier.is_featured ? "Destaque" : categoryLabel}
            </Badge>
            {/* <Badge radius="xl" color={visibilityColor} variant="light">
              {visibilityLabel}
            </Badge> */}
          </Group>
          {canShowMenu ? (
            <Menu shadow="md" width={220} position="bottom-end" withinPortal>
              <Menu.Target>
                <Button
                  variant="white"
                  color="dark"
                  radius="xl"
                  size="xs"
                  px={10}
                  style={{
                    boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <IconDotsVertical size={14} />
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                {weddingSupplier &&
                (weddingSupplier.parcelas?.length ||
                  (weddingSupplier.status_financeiro &&
                    weddingSupplier.status_financeiro !== "Sem plano")) ? (
                  <Menu.Item
                    leftSection={<IconCalendar size={14} />}
                    onClick={() => {
                      if (onViewPlan)
                        return onViewPlan(supplier, weddingSupplier);
                      // fallback: open financeiro manager modal via route
                      if (weddingSupplier?.id) {
                        void router.push({
                          pathname: "/financeiro",
                          query: { fornecedor: String(weddingSupplier.id) },
                        });
                      }
                    }}
                  >
                    Ver Plano
                  </Menu.Item>
                ) : null}
                {canEdit && onEdit ? (
                  <Menu.Item
                    leftSection={<IconEdit size={14} />}
                    onClick={() => onEdit(supplier)}
                  >
                    Editar
                  </Menu.Item>
                ) : null}
                {onRemove ? (
                  <Menu.Item
                    color="red"
                    leftSection={<IconTrash size={14} />}
                    onClick={() => onRemove(supplier)}
                  >
                    Remover do casamento
                  </Menu.Item>
                ) : null}
              </Menu.Dropdown>
            </Menu>
          ) : null}
        </Box>
        <Box
          style={{
            position: "absolute",
            bottom: 12,
            left: 12,
            right: 12,
            display: "flex",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <Group gap="xs" wrap="wrap">
            <Badge
              style={
                weddingSupplier?.status_financeiro === "Quitado"
                  ? badgeStyles.success.root
                  : weddingSupplier?.status_financeiro === "Em atraso"
                  ? badgeStyles.danger.root
                  : weddingSupplier?.status_financeiro === "A vencer"
                  ? badgeStyles.warning.root
                  : badgeStyles.neutral.root
              }
            >
              {weddingSupplier?.status_financeiro || cityLabel}
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
                variant="light"
                leftSection={<IconPaperclip size={12} />}
                style={contractBadgeStyle}
              >
                Contrato
              </Badge>
            ) : null}
          </Group>
        </Box>
      </Box>
      <Stack gap="sm" p="md">
        <Stack gap={4}>
          <Text fw={700} size={compact ? "md" : "lg"} lineClamp={1}>
            {supplier.name}
          </Text>
          {weddingSupplier?.status_financeiro !== "Sem plano" &&
          weddingSupplier?.proxima_parcela ? (
            <Text size="sm" c="dimmed" ta="left" style={{ width: "100%" }}>
              {weddingSupplier.proxima_parcela.status === "em_atraso"
                ? `Em atraso desde ${new Date(
                    `${weddingSupplier.proxima_parcela.data_vencimento}T00:00:00`,
                  ).toLocaleDateString("pt-BR")}`
                : `Próxima parcela (${
                    weddingSupplier.proxima_parcela.descricao
                  }) com vencimento em ${new Date(
                    `${weddingSupplier.proxima_parcela.data_vencimento}T00:00:00`,
                  ).toLocaleDateString("pt-BR")}`}
            </Text>
          ) : (
            <Text size="sm" c="dimmed" lineClamp={2}>
              {supplier.description || supplier.company_name || ""}
            </Text>
          )}
        </Stack>
        {weddingSupplier &&
        weddingSupplier.status_financeiro !== "Sem plano" ? (
          <>
            <Group align="center" spacing="md" style={{ width: "100%" }}>
              <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                <Text size="xs" c="dimmed">
                  Valor combinado
                </Text>
                <Text size="xs" fw={600}>
                  {formatCurrency(weddingSupplier.valor_combinado)}
                </Text>
              </Stack>
              <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                <Text size="xs" c="dimmed">
                  Valor Pago
                </Text>
                <Text size="xs" fw={600}>
                  {formatCurrency(weddingSupplier.valor_pago)}
                </Text>
              </Stack>
              <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                <Text size="xs" c="dimmed">
                  Saldo devedor
                </Text>
                <Text size="xs" fw={600}>
                  {formatCurrency(weddingSupplier.saldo_devedor)}
                </Text>
              </Stack>
            </Group>
          </>
        ) : null}
        {/* {weddingSupplier && (onCreatePlan || onAddManual) ? (
          <Group grow mt="xs">
            {onCreatePlan ? (
              <Button radius="xl" variant="light" onClick={() => onCreatePlan(supplier, weddingSupplier)}>
                Criar Plano
              </Button>
            ) : null}
            {onAddManual ? (
              <Button radius="xl" variant="default" onClick={() => onAddManual(supplier, weddingSupplier)}>
                Adicionar Manualmente
              </Button>
            ) : null}
          </Group>
        ) : null} */}
        <ContactLinks supplier={supplier} />
        {/* <Group gap="xs" justify="space-between" wrap="wrap" mt="xs">
          <Group gap={6}>
            <IconSparkles size={14} color="var(--marriplan-rose)" />
            <Text size="xs" c="dimmed" lineClamp={1}>
              {categoryLabel}
            </Text>
          </Group>
          <Group gap={6}>
            <IconCalendar size={14} color="var(--marriplan-gold)" />
            <Text size="xs" c="dimmed">{supplier.created_at ? new Date(supplier.created_at).toLocaleDateString('pt-BR') : 'Novo'}</Text>
          </Group>
        </Group> */}
        <Group grow mt="xs">
          {/* <Button variant="default" radius="xl" onClick={() => onView?.(supplier)}>
            Visualizar
          </Button> */}
          {onAdd ? (
            <Button
              radius="xl"
              onClick={() => onAdd(supplier)}
              style={{
                backgroundColor: "var(--marriplan-rose)",
                color: "#fff",
                boxShadow: "0 10px 24px rgba(181, 139, 122, 0.26)",
              }}
            >
              {weddingSupplier ? "Gerenciar" : "Adicionar ao casamento"}
            </Button>
          ) : null}
        </Group>
      </Stack>
    </Card>
  );
}

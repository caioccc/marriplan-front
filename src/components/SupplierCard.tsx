import { Supplier, WeddingSupplier } from "@/services/suppliers";
import {
  Badge,
  Box,
  Button,
  Card,
  Group,
  Image,
  Menu,
  Stack,
  Text,
} from "@mantine/core";
import {
  IconDotsVertical,
  IconEdit,
  IconHeart,
  IconMapPin,
  IconPaperclip,
  IconSparkles,
  IconTrash,
} from "@tabler/icons-react";

interface SupplierCardProps {
  supplier: Supplier;
  weddingSupplier?: WeddingSupplier | null;
  compact?: boolean;
  variant?: "default" | "dashboard";
  onView?: (supplier: Supplier) => void;
  onAdd?: (supplier: Supplier) => void;
  onEdit?: (supplier: Supplier) => void;
  onRemove?: (supplier: Supplier) => void;
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

export function SupplierCard({
  supplier,
  weddingSupplier,
  compact = false,
  variant = "default",
  onView,
  onAdd,
  onEdit,
  onRemove,
  canEdit = false,
}: SupplierCardProps) {
  const imageUrl = supplier.cover_image_url || "";
  const categoryLabel = supplier.category_detail?.name || "Fornecedor";
  const cityLabel =
    [supplier.city, supplier.state].filter(Boolean).join(" • ") ||
    "Local não informado";
  const visibilityLabel = supplier.visibility === "SOLO" ? "Solo" : "Global";
  const visibilityColor = supplier.visibility === "SOLO" ? "pink" : "green";
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
        </Box>
      </Card>
    );
  }

  return (
    <Card
      radius="xl"
      withBorder
      shadow="sm"
      style={{ overflow: "hidden", background: "rgba(255,255,255,0.92)" }}
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
            <Badge radius="xl" color={visibilityColor} variant="light">
              {visibilityLabel}
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
      </Box>
      <Stack gap="sm" p="md">
        <Stack gap={4}>
          <Text fw={700} size={compact ? "md" : "lg"} lineClamp={1}>
            {supplier.name}
          </Text>
          <Text size="sm" c="dimmed" lineClamp={2}>
            {supplier.description ||
              supplier.company_name ||
              "Descrição em breve."}
          </Text>
        </Stack>
        <Group gap="xs" wrap="wrap">
          <Badge variant="light" leftSection={<IconMapPin size={12} />}>
            {cityLabel}
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
              Contrato
            </Badge>
          ) : null}
        </Group>
        {weddingSupplier ? (
          <Group justify="space-between" gap="sm" wrap="wrap">
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
              {categoryLabel}
            </Text>
          </Group>
          {/* <Group gap={6}>
            <IconCalendar size={14} color="var(--marriplan-gold)" />
            <Text size="xs" c="dimmed">{supplier.created_at ? new Date(supplier.created_at).toLocaleDateString('pt-BR') : 'Novo'}</Text>
          </Group> */}
        </Group>
        <Group grow mt="xs">
          {/* <Button variant="default" radius="xl" onClick={() => onView?.(supplier)}>
            Visualizar
          </Button> */}
          {onAdd ? (
            <Button radius="xl" onClick={() => onAdd(supplier)}>
              {weddingSupplier ? "Gerenciar" : "Adicionar ao casamento"}
            </Button>
          ) : null}
        </Group>
      </Stack>
    </Card>
  );
}

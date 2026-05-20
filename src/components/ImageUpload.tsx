import {
  ActionIcon,
  Box,
  Card,
  Group,
  Image,
  Skeleton,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconPhoto, IconTrash, IconUpload } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useMediaQuery } from "@mantine/hooks";
import { useDropzone } from "react-dropzone";
import { deleteWeddingImage } from "@/services/weddingImage";

type UploadedImageLike = {
  url?: string;
  src?: string;
  preview?: string;
  id_cloudinary?: string;
  photo_public_id?: string;
  cover_image_public_id?: string;
  public_id?: string;
  name?: string;
};

type ImageItem = File | string | UploadedImageLike;

type PreviewImageItem = UploadedImageLike & {
  file?: File;
  preview?: string;
};

type ImageDropzoneProps = {
  multiple?: boolean;
  value?: ImageItem | ImageItem[] | null;
  onChange: (value: ImageItem | ImageItem[] | null) => Promise<void> | void;
  onRemove?: (value: ImageItem) => Promise<void> | void;
  uploadFile?: (file: File) => Promise<ImageItem | null | undefined>;
  maxSizeMB?: number;
  label?: string;
  title?: string;
  hint?: string;
  loading?: boolean;
  public_id?: string; // para casos de item único, onde o public_id pode ser passado diretamente para otimizar a remoção sem precisar inferir do item
};

function getPreviewSource(item: ImageItem | null | undefined) {
  if (!item) return "";
  if (typeof item === "string") return item;
  if (item instanceof File) return URL.createObjectURL(item);
  if (item.url) return item.url;
  if (item.src) return item.src;
  if (item.preview) return item.preview;
  return "";
}

function getItemKey(item: ImageItem | null | undefined) {
  if (!item || typeof item === "string") return item || "";
  if (item instanceof File) return item.name;
  return (
    item.id_cloudinary ||
    item.photo_public_id ||
    item.cover_image_public_id ||
    item.public_id ||
    item.name ||
    item.url ||
    item.src ||
    item.preview ||
    ""
  );
}

function getItemPublicId(
  item: ImageItem | null | undefined,
  fallbackPublicId = "",
) {
  if (!item || typeof item === "string") {
    return fallbackPublicId || inferCloudinaryPublicIdFromUrl(item || "");
  }

  if (item instanceof File) return fallbackPublicId;

  return (
    item.id_cloudinary ||
    item.photo_public_id ||
    item.cover_image_public_id ||
    item.public_id ||
    fallbackPublicId ||
    inferCloudinaryPublicIdFromUrl(item.url || item.src || item.preview || "")
  );
}

function inferCloudinaryPublicIdFromUrl(url: string) {
  if (!url) return "";

  let pathname = url;
  try {
    pathname = new URL(url).pathname;
  } catch {
    pathname = url;
  }

  const uploadMarker = "/upload/";
  const uploadIndex = pathname.indexOf(uploadMarker);
  if (uploadIndex < 0) return "";

  const afterUpload = pathname.slice(uploadIndex + uploadMarker.length);
  const segments = afterUpload.split("/").filter(Boolean);
  const versionIndex = segments.findIndex((segment) => /^v\d+$/.test(segment));
  const publicSegments =
    versionIndex >= 0 ? segments.slice(versionIndex + 1) : segments;
  if (publicSegments.length === 0) return "";

  const lastSegment = publicSegments[publicSegments.length - 1].replace(
    /\.[^.]+$/,
    "",
  );
  const prefixSegments = publicSegments.slice(0, -1);
  return [...prefixSegments, lastSegment].filter(Boolean).join("/");
}

function normalizeImageItem(item: ImageItem): PreviewImageItem {
  if (typeof item === "string") {
    return {
      url: item,
      id_cloudinary: inferCloudinaryPublicIdFromUrl(item),
    };
  }

  if (item instanceof File) {
    return {
      file: item,
      name: item.name,
      preview: URL.createObjectURL(item),
    };
  }

  return item;
}

function normalizeItems(value: ImageDropzoneProps["value"], multiple: boolean) {
  if (multiple) {
    if (Array.isArray(value)) return value.filter(Boolean).map(normalizeImageItem);
    return value ? [normalizeImageItem(value)] : [];
  }

  if (!value || Array.isArray(value)) return [];
  return [normalizeImageItem(value)];
}

function sameItems(
  currentItems: PreviewImageItem[],
  nextItems: PreviewImageItem[],
) {
  if (currentItems.length !== nextItems.length) return false;
  return currentItems.every(
    (item, index) => getItemKey(item) === getItemKey(nextItems[index]),
  );
}

async function deleteCloudinaryItem(
  item: PreviewImageItem | null | undefined,
  public_id?: string,
) {
  if (!item) return;

  const publicId = getItemPublicId(item, public_id);

  if (!publicId) return;

  try {
    await deleteWeddingImage(publicId);
  } catch {
    // segue o fluxo local mesmo se a limpeza remota falhar
  }
}

function PreviewCard({
  item,
  index,
  onRemove,
  removing,
  loading,
  onPreviewLoad,
  publicId,
  isMobile,
}: {
  item: PreviewImageItem;
  index: number;
  onRemove?: (value: PreviewImageItem) => Promise<void> | void;
  removing: boolean;
  loading: boolean;
  onPreviewLoad: () => void;
  publicId?: string;
  isMobile: boolean;
}) {
  const preview = getPreviewSource(item);
  const itemPublicId = getItemPublicId(item, publicId);

  return (
    <Card
      withBorder
      radius="lg"
      p={12}
      style={{
        width: "100%",
        overflow: "hidden",
        background: "linear-gradient(180deg, #fff 0%, #f8f4ef 100%)",
        position: "relative",
      }}
    >
      <Group
        align={isMobile ? "stretch" : "flex-start"}
        wrap={isMobile ? "wrap" : "nowrap"}
        gap={isMobile ? "sm" : "md"}
      >
        <Box
          style={{
            position: "relative",
            width: isMobile ? "100%" : 100,
            height: isMobile ? 180 : 100,
            flex: isMobile ? "1 1 100%" : "0 0 100px",
            borderRadius: 16,
            overflow: "hidden",
            background: "rgba(255,255,255,0.85)",
            border: "1px solid var(--marriplan-border)",
          }}
        >
          {preview ? (
            <>
              <Image
                src={preview}
                alt={`Pré-visualização ${index + 1}`}
                fit="cover"
                style={{ width: "100%", height: "100%" }}
                onLoad={onPreviewLoad}
                onError={onPreviewLoad}
              />
              {loading ? (
                <Box
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(255,255,255,0.72)",
                  }}
                >
                  <Skeleton height={isMobile ? 180 : 100} width="100%" radius="sm" />
                </Box>
              ) : null}
            </>
          ) : (
            <Stack h={isMobile ? 180 : 100} align="center" justify="center" gap={4}>
              <IconPhoto size={22} color="var(--marriplan-rose)" />
              <Text size="xs" c="dimmed">
                Previa
              </Text>
            </Stack>
          )}
        </Box>

        <Stack gap={isMobile ? 2 : 4} style={{ flex: 1, minWidth: 0 }}>
          <Text size="sm" fw={700} c="var(--marriplan-text)">
            Imagem carregada
          </Text>
          {isMobile ? (
            <Text size="xs" c="dimmed">
              Substitua ou remova a imagem no botão ao lado.
            </Text>
          ) : (
            <>
              <Text size="xs" c="dimmed">
                O preview é exibido em formato quadrado para manter a consistência visual.
              </Text>
              <Text size="xs" fw={600} c="var(--marriplan-text)">
                Public ID
              </Text>
              <Text size="xs" c="dimmed" style={{ wordBreak: "break-word" }}>
                {itemPublicId || "Sem public_id disponível"}
              </Text>
              <Text size="xs" c="dimmed">
                Você pode substituir ou remover a imagem a qualquer momento.
              </Text>
            </>
          )}
        </Stack>
      </Group>

      {onRemove ? (
        <ActionIcon
          color="var(--marriplan-rose)"
          variant="filled"
          size="sm"
          style={{ position: "absolute", top: 10, right: 10, zIndex: 3 }}
          tabIndex={-1}
          onMouseDown={(event) => {
            event.stopPropagation();
            event.preventDefault();
          }}
          onClick={async (event) => {
            event.stopPropagation();
            event.preventDefault();
            await onRemove(item);
          }}
          aria-label="Remover imagem"
          loading={removing}
        >
          <IconTrash size={14} />
        </ActionIcon>
      ) : null}
    </Card>
  );
}

export function ImageDropzone({
  multiple = false,
  value = multiple ? [] : null,
  public_id = "",
  onChange,
  onRemove,
  uploadFile,
  maxSizeMB = 10,
  label = "Adicionar imagem",
  title = "",
  hint = "",
  loading = false,
}: ImageDropzoneProps) {
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const isMobile = useMediaQuery("(max-width: 640px)") ?? false;
  const [loadedPreviews, setLoadedPreviews] = useState<Record<string, boolean>>(
    {},
  );
  const [items, setItems] = useState<PreviewImageItem[]>(() =>
    normalizeItems(value, multiple),
  );

  const busy = loading || uploading;

  useEffect(() => {
    const nextItems = normalizeItems(value, multiple);
    setItems((current) =>
      sameItems(current, nextItems) ? current : nextItems,
    );
  }, [value, multiple]);

  useEffect(() => {
    const activeKeys = items.map((item) => getItemKey(item)).filter(Boolean);
    setLoadedPreviews((current) => {
      const next: Record<string, boolean> = {};
      for (const key of activeKeys) {
        if (current[key]) next[key] = true;
      }
      return next;
    });
  }, [items]);

  function markPreviewLoaded(item: PreviewImageItem) {
    const key = getItemKey(item);
    if (!key) return;
    setLoadedPreviews((current) => ({ ...current, [key]: true }));
  }

  const onDrop = async (acceptedFiles: File[]) => {
    setError("");
    const validFiles = acceptedFiles.filter(
      (file) =>
        file.size <= maxSizeMB * 1024 * 1024 && !file.name.endsWith(".svg"),
    );

    if (validFiles.length !== acceptedFiles.length) {
      setError("Apenas imagens (exceto SVG) até 10MB são permitidas.");
    }

    if (validFiles.length === 0) return;

    setUploading(true);
    try {
      if (uploadFile) {
        if (multiple) {
          const uploaded: PreviewImageItem[] = [];
          for (const file of validFiles) {
            const result = await uploadFile(file);
            if (result) uploaded.push(normalizeImageItem(result));
          }
          const nextItems = [...items, ...uploaded];
          setItems(nextItems);
          await onChange(nextItems);
        } else {
          const previousItem = items[0];
          const result = await uploadFile(validFiles[0]);
          if (result) {
            const nextItem = normalizeImageItem(result);
            await deleteCloudinaryItem(previousItem);
            setItems([nextItem]);
            await onChange(nextItem);
          }
        }
        return;
      }

      if (multiple) {
        const nextItems = [...items, ...validFiles.map(normalizeImageItem)];
        setItems(nextItems);
        await onChange(nextItems);
      } else {
        const nextItem = normalizeImageItem(validFiles[0]);
        setItems([nextItem]);
        await onChange(nextItem);
      }
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [
        ".jpg",
        ".jpeg",
        ".png",
        ".webp",
        ".gif",
        ".bmp",
        ".tiff",
        ".ico",
      ],
    },
    maxSize: maxSizeMB * 1024 * 1024,
    multiple,
    disabled: busy,
  });

  async function handleRemove(item: PreviewImageItem) {
    if (!onRemove) return;

    const key = getItemKey(item);
    setRemovingId(key);

    try {
      console.log(
        "Removendo item com public_id:",
        public_id,
        "e item details:",
        item,
      );
      await deleteCloudinaryItem(item, public_id);

      try {
        await onRemove(item);
        setItems((current) =>
          current.filter((currentItem) => getItemKey(currentItem) !== key),
        );
      } catch {
        setError("Não foi possível remover a imagem.");
      }
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <Box>
      {title ? (
        <Title order={6} mb={8} c="var(--marriplan-text)">
          {title}
        </Title>
      ) : null}

      <Card
        {...getRootProps()}
        withBorder
        radius="xl"
        p="md"
        style={{
          border: "2px dashed var(--marriplan-border)",
          background: isDragActive
            ? "linear-gradient(180deg, rgba(181,139,122,0.10) 0%, rgba(246,239,231,1) 100%)"
            : "var(--marriplan-surface-muted)",
          cursor: "pointer",
          minHeight: 150,
          display: "flex",
          alignItems: "center",
          gap: 14,
          flexWrap: "wrap",
          boxShadow: "0 10px 26px rgba(70,56,43,0.05)",
        }}
      >
        <input {...getInputProps()} />

        {multiple ? (
          <Group
            justify="space-between"
            wrap="wrap"
            style={{ width: "100%", flexDirection: isMobile ? "column" : "row" }}
          >
            <Box
              style={{
                width: isMobile ? "100%" : 116,
                minHeight: isMobile ? 96 : 116,
                borderRadius: 18,
                background: "rgba(255,255,255,0.84)",
                border: "1px solid var(--marriplan-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 6,
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.5)",
              }}
            >
              <IconUpload size={28} color="var(--marriplan-rose)" />
              <Text size={isMobile ? "xs" : "sm"} fw={600} ta="center" c="var(--marriplan-rose)">
                {label}
              </Text>
              {hint ? (
                <Text size="xs" ta="center" c="dimmed" px={8}>
                  {hint}
                </Text>
              ) : null}
            </Box>

            <Stack gap={6} style={{ flex: 1, minWidth: 0 }}>
              <Text size={isMobile ? "xs" : "sm"} fw={600} c="var(--marriplan-text)">
                {isDragActive
                  ? "Solte a imagem aqui"
                  : "Arraste ou clique para enviar"}
              </Text>
              <Text size="xs" c="dimmed">
                Você pode enviar mais de uma imagem.
              </Text>
              {error ? (
                <Text size="xs" c="red">
                  {error}
                </Text>
              ) : null}
              {busy && !items.length ? (
                <Skeleton height={84} width={112} radius="lg" />
              ) : null}
            </Stack>
          </Group>
        ) : items.length ? (
          <Box
            style={{
              width: "100%",
              minHeight: 132,
              borderRadius: 20,
              overflow: "hidden",
              position: "relative",
              border: "1px solid var(--marriplan-border)",
              background: "rgba(255,255,255,0.85)",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.5)",
            }}
          >
            <PreviewCard
              item={items[0]}
              index={0}
              onRemove={onRemove ? handleRemove : undefined}
              removing={removingId === getItemKey(items[0])}
              loading={!loadedPreviews[getItemKey(items[0])] || busy}
              onPreviewLoad={() => markPreviewLoaded(items[0])}
              publicId={public_id}
              isMobile={isMobile}
            />
          </Box>
        ) : (
          <Group
            justify="space-between"
            wrap="wrap"
            style={{ width: "100%", flexDirection: isMobile ? "column" : "row" }}
          >
            <Box
              style={{
                width: isMobile ? "100%" : 116,
                minHeight: isMobile ? 96 : 116,
                borderRadius: 18,
                background: "rgba(255,255,255,0.84)",
                border: "1px solid var(--marriplan-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 6,
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.5)",
              }}
            >
              <IconUpload size={28} color="var(--marriplan-rose)" />
              <Text size={isMobile ? "xs" : "sm"} fw={600} ta="center" c="var(--marriplan-rose)">
                {label}
              </Text>
              {hint ? (
                <Text size="xs" ta="center" c="dimmed" px={8}>
                  {hint}
                </Text>
              ) : null}
            </Box>

            <Stack gap={6} style={{ flex: 1, minWidth: 0 }}>
              <Text size={isMobile ? "xs" : "sm"} fw={600} c="var(--marriplan-text)">
                {isDragActive
                  ? "Solte a imagem aqui"
                  : "Arraste ou clique para enviar"}
              </Text>
              <Text size="xs" c="dimmed">
                Uma imagem por vez, com pré-visualização imediata.
              </Text>
              {error ? (
                <Text size="xs" c="red">
                  {error}
                </Text>
              ) : null}
              {busy && !items.length ? (
                <Skeleton height={72} width={96} radius="lg" />
              ) : null}
            </Stack>
          </Group>
        )}

        {multiple ? (
          <Group gap="sm" wrap="wrap" style={{ width: "100%" }}>
            {items.map((item, index) => (
              <PreviewCard
                key={getItemKey(item) || index}
                item={item}
                index={index}
                onRemove={onRemove ? handleRemove : undefined}
                removing={removingId === getItemKey(item)}
                loading={!loadedPreviews[getItemKey(item)]}
                onPreviewLoad={() => markPreviewLoaded(item)}
                publicId={public_id}
                isMobile={isMobile}
              />
            ))}
            {busy ? <Skeleton height={72} width={96} radius="lg" /> : null}
          </Group>
        ) : null}
      </Card>
    </Box>
  );
}

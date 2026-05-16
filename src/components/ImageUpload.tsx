import {
  ActionIcon,
  Box,
  Card,
  Image,
  Skeleton,
  Text,
  Title
} from "@mantine/core";
import { IconTrash, IconUpload } from "@tabler/icons-react";
import { useState } from "react";
import { useDropzone } from "react-dropzone";

export function ImageDropzone({
  multiple = false,
  value = [],
  onChange,
  onRemove,
  loading = false,
  maxSizeMB = 10,
  accept = "image/*",
  label = "Adicionar Imagem",
  title = "",
}) {
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const onDrop = async (acceptedFiles, rejectedFiles) => {
    setError("");
    const validFiles = acceptedFiles.filter(
      (f) => f.size <= maxSizeMB * 1024 * 1024 && !f.name.endsWith(".svg"),
    );
    if (validFiles.length !== acceptedFiles.length) {
      setError("Apenas imagens (exceto SVG) até 10MB são permitidas.");
    }
    if (validFiles.length === 0) return;
    setUploading(true);
    if (multiple) {
      await onChange([...(value || []), ...validFiles]);
    } else {
      await onChange(validFiles[0]);
    }
    setUploading(false);
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
  });
  // Corrige o clique do botão de remover para não acionar o input file do dropzone
  function GalleryImage({ img, index, onRemove, removing }) {
    return (
      <div
        style={{
          display: "inline-block",
          marginRight: 8,
          marginBottom: 8,
          position: "relative",
        }}
      >
        <Card
          shadow="sm"
          radius="md"
          withBorder
          style={{
            width: 100,
            position: "relative",
            opacity: removing ? 0.5 : 1,
          }}
        >
          <Image
            src={img.url || URL.createObjectURL(img)}
            alt={`Foto ${index + 1}`}
            height={60}
            radius="sm"
          />
          {img.id_cloudinary && (
            <ActionIcon
              color="red"
              variant="filled"
              size="sm"
              style={{ position: "absolute", top: 4, right: 4, zIndex: 3 }}
              tabIndex={-1}
              onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
              onClick={async (e) => {
                e.stopPropagation();
                e.preventDefault();
                await onRemove(img);
              }}
              aria-label="Remover imagem"
              loading={removing}
            >
              <IconTrash size={14} />
            </ActionIcon>
          )}
        </Card>
      </div>
    );
  }
  // Altere o onRemove para controlar loading
  async function handleRemove(img) {
    setRemovingId(img.id_cloudinary || img.name || img.url);
    await onRemove(img);
    setRemovingId(null);
  }
  return (
    <Box>
      {title && (
        <Title order={5} mb={8}>
          {title}
        </Title>
      )}
      <Box
        {...getRootProps()}
        style={{
          border: "2px dashed #228be6",
          borderRadius: 8,
          padding: 16,
          minHeight: 120,
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 8,
          background: isDragActive ? "#e7f5ff" : "#f8f9fa",
          cursor: "pointer",
          justifyContent: "flex-start",
        }}
      >
        <input {...getInputProps()} />
        <Box
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: 80,
            height: 80,
            border: "1px solid #228be6",
            borderRadius: 8,
            background: "#fff",
            marginRight: 8,
            cursor: "pointer",
            position: "relative",
          }}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            document.querySelector("input[type=file]")?.click();
          }}
        >
          <IconUpload size={32} style={{ marginBottom: 2, color: "#228be6" }} />
          <Text
            size="10px"
            style={{ marginTop: 2, textAlign: "center", color: "#228be6" }}
          >
            {label}
          </Text>
        </Box>
        {(!multiple && !(value && (value.url || value.name))) ||
        (multiple && (!value || value.length === 0)) ? (
          <Text size="xs" c="dimmed" style={{ marginLeft: 8 }}>
            Clique no botão ou arraste {multiple ? "imagens" : "uma imagem"}{" "}
            para esta área.
          </Text>
        ) : null}
        {multiple ? (
          <Box style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {value.map((img, i) => (
              <GalleryImage
                key={img.id_cloudinary || img.name || img.url}
                img={img}
                index={i}
                onRemove={handleRemove}
                removing={
                  removingId === (img.id_cloudinary || img.name || img.url)
                }
              />
            ))}
            {uploading && <Skeleton height={60} width={100} radius="md" />}
          </Box>
        ) : uploading ? (
          <Skeleton height={60} width={100} radius="md" />
        ) : (
          value &&
          (value.url || value.name) && (
            <Card
              shadow="sm"
              radius="md"
              withBorder
              style={{ width: 100, display: "inline-block", marginLeft: 8 }}
            >
              <Image
                src={value.url || URL.createObjectURL(value)}
                alt="Foto"
                height={60}
                radius="sm"
              />
              {value.id_cloudinary && (
                <ActionIcon
                  color="red"
                  variant="filled"
                  size="sm"
                  style={{ position: "absolute", top: 4, right: 4, zIndex: 2 }}
                  onClick={async (e) => {
                    e.stopPropagation();
                    await handleRemove(value);
                  }}
                  aria-label="Remover imagem"
                  loading={
                    removingId ===
                    (value.id_cloudinary || value.name || value.url)
                  }
                >
                  <IconTrash size={14} />
                </ActionIcon>
              )}
            </Card>
          )
        )}
        {error && (
          <Text size="xs" color="red">
            {error}
          </Text>
        )}
      </Box>
    </Box>
  );
}

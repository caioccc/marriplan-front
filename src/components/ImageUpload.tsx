import { useDropzone } from 'react-dropzone';
import { DndContext, closestCenter, useSensor, useSensors, PointerSensor, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ActionIcon, Box, Button, Card, Image, Skeleton, Text, Title } from '@mantine/core';
import { IconTrash, IconUpload } from '@tabler/icons-react';
import { useState } from 'react';
import { deleteWeddingImage } from '@/services/weddingImage';

export function ImageDropzone({
  multiple = false,
  value = [],
  onChange,
  loading = false,
  maxSizeMB = 10,
  accept = 'image/*',
  label = 'Adicionar Imagem',
  title = '',
  onRemove,
}) {
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const onDrop = async (acceptedFiles, rejectedFiles) => {
    setError('');
    const validFiles = acceptedFiles.filter(f => f.size <= maxSizeMB * 1024 * 1024 && !f.name.endsWith('.svg'));
    if (validFiles.length !== acceptedFiles.length) {
      setError('Apenas imagens (exceto SVG) até 10MB são permitidas.');
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
      'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tiff', '.ico'],
    },
    maxSize: maxSizeMB * 1024 * 1024,
    multiple,
  });
  const sensors = useSensors(useSensor(PointerSensor));
  function handleDragEnd(event) {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = value.findIndex(img => img.id_cloudinary || img.name || img.url === active.id);
      const newIndex = value.findIndex(img => img.id_cloudinary || img.name || img.url === over.id);
      onChange(arrayMove(value, oldIndex, newIndex));
    }
  }
  function SortableImage({ img, index }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: img.id_cloudinary || img.name || img.url });
    return (
      <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, display: 'inline-block', marginRight: 8, marginBottom: 8, position: 'relative' }} {...attributes} {...listeners}>
        <Card shadow="sm" radius="md" withBorder style={{ width: 100, position: 'relative' }}>
          <Image src={img.url || URL.createObjectURL(img)} alt={`Foto ${index + 1}`} height={60} radius="sm" />
          {img.id_cloudinary && (
            <ActionIcon
              color="red"
              variant="filled"
              size="sm"
              style={{ position: 'absolute', top: 4, right: 4, zIndex: 2 }}
              onClick={async (e) => {
                e.stopPropagation();
                await onRemove(img);
              }}
              aria-label="Remover imagem"
            >
              <IconTrash size={14} />
            </ActionIcon>
          )}
        </Card>
      </div>
    );
  }
  return (
    <Box>
      {title && <Title order={5} mb={8}>{title}</Title>}
      <Box {...getRootProps()} style={{ border: '2px dashed #228be6', borderRadius: 8, padding: 16, minHeight: 120, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, background: isDragActive ? '#e7f5ff' : '#f8f9fa', cursor: 'pointer', justifyContent: 'flex-start' }}>
        <input {...getInputProps()} />
        <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: 80, height: 80, border: '1px solid #228be6', borderRadius: 8, background: '#fff', marginRight: 8, cursor: 'pointer', position: 'relative' }}
          onClick={e => { e.stopPropagation(); e.preventDefault(); document.querySelector('input[type=file]')?.click(); }}>
          <IconUpload size={32} style={{ marginBottom: 2, color: '#228be6' }} />
          <Text size="10px" style={{ marginTop: 2, textAlign: 'center', color: '#228be6' }}>{label}</Text>
        </Box>
        {(!multiple && !(value && (value.url || value.name))) || (multiple && (!value || value.length === 0)) ? (
          <Text size="xs" c="dimmed" style={{ marginLeft: 8 }}>
            Clique no botão ou arraste {multiple ? 'imagens' : 'uma imagem'} para esta área.
          </Text>
        ) : null}
        {multiple ? (
          uploading ? (
            <Skeleton height={60} width={100} radius="md" />
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={value.map(img => img.id_cloudinary || img.name || img.url)} strategy={verticalListSortingStrategy}>
                {value.map((img, i) => <SortableImage key={img.id_cloudinary || img.name || img.url} img={img} index={i} onRemove={onRemove} />)}
              </SortableContext>
            </DndContext>
          )
        ) : (
          uploading ? (
            <Skeleton height={60} width={100} radius="md" />
          ) : (
            value && (value.url || value.name) && (
              <Card shadow="sm" radius="md" withBorder style={{ width: 100, display: 'inline-block', marginLeft: 8 }}>
                <Image src={value.url || URL.createObjectURL(value)} alt="Foto" height={60} radius="sm" />
              </Card>
            )
          )
        )}
        {error && <Text size="xs" color="red">{error}</Text>}
      </Box>
    </Box>
  );
}

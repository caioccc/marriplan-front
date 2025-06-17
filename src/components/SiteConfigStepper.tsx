import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Box, Button, Card, FileInput, Group, Image, Loader, Select, Stepper, Switch, Text, TextInput, Textarea, Title, ActionIcon, Skeleton } from '@mantine/core';
import { useForm } from '@mantine/form';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { IconCheck, IconChevronLeft, IconChevronRight, IconDeviceFloppy, IconRocket, IconUpload, IconTrash } from '@tabler/icons-react';
import axios from 'axios';
import { uploadWeddingImage, deleteWeddingImage } from '@/services/weddingImage';
import { useDropzone } from 'react-dropzone';
import { DndContext, closestCenter, useSensor, useSensors, PointerSensor, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState, useEffect, useRef } from 'react';
import { IMaskInput } from 'react-imask';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import WeddingLanding from './WeddingLanding';
import { ImageDropzone } from './ImageUpload';

import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);
dayjs.locale('pt-br');

const templates = [
  { value: 'classico', label: 'Clássico', img: '/templates/classico.png' },
  { value: 'moderninho', label: 'Moderninho', img: '/templates/moderninho.png' },
  { value: 'rustico', label: 'Rústico', img: '/templates/rustico.png' },
];

const fonts = [
  { value: 'playfair', label: 'Playfair Display' },
  { value: 'montserrat', label: 'Montserrat' },
  { value: 'lora', label: 'Lora' },
];

const palettes = [
  { value: 'rosa', label: 'Tons de Rosa' },
  { value: 'dourado', label: 'Dourado' },
  { value: 'marfim', label: 'Marfim' },
  { value: 'azul', label: 'Azul Royal' },
  { value: 'verde', label: 'Verde Esmeralda' },
  { value: 'roxo', label: 'Roxo Lavanda' },
  { value: 'vermelho', label: 'Vermelho Clássico' },
  { value: 'prata', label: 'Prata' },
  { value: 'preto', label: 'Preto & Branco' },
  { value: 'amarelo', label: 'Amarelo Girassol' },
  { value: 'laranja', label: 'Laranja Outonal' },
  { value: 'azul_claro', label: 'Azul Serenity' },
];

// Componente de upload drag-drop com suporte a múltiplas imagens e reordenação
function ImageDropzone({
  multiple = false,
  value = [],
  onChange,
  loading = false,
  maxSizeMB = 10,
  accept = 'image/*',
  label = 'Adicionar Imagem',
  title = '',
}) {
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const onDrop = async (acceptedFiles: File[], rejectedFiles: any[]) => {
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

  // Drag and drop reordenação (apenas para múltiplo)
  const sensors = useSensors(useSensor(PointerSensor));
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = value.findIndex((img: any) => img.id_cloudinary || img.name || img.url === active.id);
      const newIndex = value.findIndex((img: any) => img.id_cloudinary || img.name || img.url === over.id);
      onChange(arrayMove(value, oldIndex, newIndex));
    }
  }
  function SortableImage({ img, index }: { img: any, index: number }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: img.id_cloudinary || img.name || img.url });
    return (
      <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, display: 'inline-block', marginRight: 8, marginBottom: 8 }} {...attributes} {...listeners}>
        <Card shadow="sm" radius="md" withBorder style={{ width: 100, position: 'relative' }}>
          <Image src={img.url || URL.createObjectURL(img)} alt={`Foto ${index + 1}`} height={60} radius="sm" />
        </Card>
      </div>
    );
  }

  return (
    <Box>
      {title && <Title order={6} mb={8}>{title}</Title>}
      <Box {...getRootProps()} style={{ border: '2px dashed #228be6', borderRadius: 8, padding: 16, minHeight: 120, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, background: isDragActive ? '#e7f5ff' : '#f8f9fa', cursor: 'pointer', justifyContent: 'flex-start' }}>
        <input {...getInputProps()} />
        {/* Botão de adicionar */}
        <Box
          style={{
            width: 80,
            height: 80,
            border: '1px solid #228be6',
            borderRadius: 8,
            background: '#fff',
            marginRight: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            position: 'relative',
          }}
          onClick={e => {
            e.stopPropagation();
            e.preventDefault();
            document.querySelector('input[type=file]')?.click();
          }}
        >
          <IconUpload size={32} style={{ marginBottom: 2, color: '#228be6' }} />
          <Text size="10px" style={{ marginTop: 2, textAlign: 'center', color: '#228be6' }}>{label}</Text>
        </Box>
        {/* Ajuda se não houver imagens */}
        {(!multiple && !(value && (value.url || value.name))) || (multiple && (!value || value.length === 0)) ? (
          <Text size="xs" c="dimmed" style={{ marginLeft: 8 }}>
            Clique no botão ou arraste {multiple ? 'imagens' : 'uma imagem'} para esta área.
          </Text>
        ) : null}
        {/* Imagens carregadas */}
        {multiple ? (
          uploading ? (
            <Skeleton height={60} width={100} radius="md" />
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={value.map((img: any) => img.id_cloudinary || img.name || img.url)} strategy={verticalListSortingStrategy}>
                {value.map((img: any, i: number) => <SortableImage key={img.id_cloudinary || img.name || img.url} img={img} index={i} />)}
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

export default function SiteConfigStepper({ initialData = {}, onSave, onPublish, loading }) {
  const { toast } = useToast();
  const [active, setActive] = useState(0);

  const [cepError, setCepError] = useState(null);
  const [cepLoading, setCepLoading] = useState(false);

  const { user } = useAuth();
  const weddingProfile = user?.wedding_profile || {};
  const [mapPosition, setMapPosition] = useState([weddingProfile.latitude || -14.235, weddingProfile.longitude || -51.9253]);

  // Formulário com validações
  const form = useForm({
    initialValues: {
      template: initialData.template || weddingProfile.template || 'classico',
      groom_name: initialData.groom_name || weddingProfile.nome_noivo || '',
      bride_name: initialData.bride_name || weddingProfile.nome_noiva || '',
      wedding_date: initialData.wedding_date || weddingProfile.data_casamento || '',
      wedding_time: initialData.wedding_time || weddingProfile.hora_casamento || '',
      local: initialData.local || weddingProfile.local || '',
      address: initialData.address || weddingProfile.endereco || '',
      about_us: initialData.about_us || '',
      rsvp_text: initialData.rsvp_text || '',
      gallery: initialData.gallery || [],
      cover_photo: initialData.cover_photo || '',
      palette: initialData.palette || 'rosa',
      font: initialData.font || 'playfair',
      countdown: initialData.countdown !== undefined ? initialData.countdown : true,
      map: initialData.map !== undefined ? initialData.map : true,
      social: initialData.social !== undefined ? initialData.social : true,
      number: initialData.number || weddingProfile.numero || '',
      district: initialData.district || weddingProfile.bairro || '',
      city: initialData.city || weddingProfile.cidade || '',
      state: initialData.state || weddingProfile.estado || '',
      latitude: initialData.latitude || weddingProfile.latitude || null,
      longitude: initialData.longitude || weddingProfile.longitude || null,
      postalcode: initialData.postalcode || weddingProfile.cep || '',
    },
    validate: {
      template: value => !value ? 'Selecione um template' : null,
      groom_name: value => !value ? 'Nome do noivo obrigatório' : null,
      bride_name: value => !value ? 'Nome da noiva obrigatório' : null,
      wedding_date: value => !value ? 'Data do casamento obrigatória' : null,
      wedding_time: value => !value ? 'Horário do casamento obrigatório' : null,
      local: value => !value ? 'Local obrigatório' : null,
      cover_photo: value => !value ? 'Foto de capa obrigatória' : null,
    },
  });

  // Componente para manipular o clique no mapa
  function LocationMarker() {
    return mapPosition ? <Marker position={mapPosition} icon={L.icon({ iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png', iconSize: [25, 41], iconAnchor: [12, 41] })} /> : null;
  }

  // Busca endereço pelo CEP
  const handleCepBlur = async () => {
    setCepError(null);
    const rawCep = form.values.postalcode.replace(/\D/g, '');
    if (rawCep.length !== 8) {
      setCepError('CEP inválido');
      return;
    }
    setCepLoading(true);
    try {
      const { data } = await axios.get(`https://viacep.com.br/ws/${rawCep}/json/`);
      if (!data.erro) {
        form.setFieldValue('address', data.logradouro ?? '');
        form.setFieldValue('district', data.bairro ?? '');
        form.setFieldValue('city', data.localidade ?? '');
        form.setFieldValue('state', data.uf ?? '');
        form.setFieldValue('postalcode', data.cep ?? rawCep);
      } else {
        setCepError('CEP não encontrado');
      }
    } catch {
      setCepError('Erro ao buscar CEP');
    }
    setCepLoading(false);
  };

  async function geocodeAddress(address: string) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data && data.length > 0) {
      form.setFieldValue('latitude', parseFloat(data[0].lat));
      form.setFieldValue('longitude', parseFloat(data[0].lon));
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    }
    return null;
  }

  useEffect(() => {
    if (form.values.postalcode && form.values.address && form.values.city) {
      const fullAddress = `${form.values.address}, ${form.values.number || ''}, ${form.values.district || ''}, ${form.values.city}, ${form.values.state || ''}`;
      geocodeAddress(fullAddress).then(coords => {
        if (coords) setMapPosition(coords as [number, number]);
      });
    }
  }, [form.values.postalcode, form.values.address, form.values.city, form.values.number, form.values.district, form.values.state]);

  function handleNext() {
    let stepFields: string[] = [];

    if (active === 0) {
      stepFields = ['template'];
    } else if (active === 1) {
      stepFields = ['groom_name', 'bride_name', 'about_us']
    } else if (active === 2) {
      stepFields = ['wedding_date', 'wedding_time', 'local',];
    }

    const validation = form.validateField(stepFields);
    const errors = validation?.errors || {};
    if (Object.keys(errors).length === 0) {
      setActive(a => a + 1);
    } else {
      toast({ title: 'Preencha os campos obrigatórios', description: 'Verifique os campos destacados.' });
    }
  }

  function handleBack() { setActive(a => a - 1); }

  const onSaveClick = async () => {
    const dataToSend = {
      ...form.values,
      wedding_date: form.values.wedding_date
        ? (typeof form.values.wedding_date === 'string'
          ? form.values.wedding_date.slice(0, 10)
          : form.values.wedding_date.toISOString().slice(0, 10))
        : '',
      wedding_time: form.values.wedding_time
        ? (typeof form.values.wedding_time === 'string'
          ? form.values.wedding_time.slice(0, 5)
          : (form.values.wedding_time instanceof Date
            ? form.values.wedding_time.toTimeString().slice(0, 5)
            : ''))
        : '',
    };
    if (onSave) {
      await onSave(dataToSend);
      toast({ title: 'Configurações salvas', description: 'Suas configurações foram salvas com sucesso.' });
    }
  }

  const onPublishClick = async () => {
    const dataToSend = {
      ...form.values,
      wedding_date: form.values.wedding_date
        ? (typeof form.values.wedding_date === 'string'
          ? form.values.wedding_date.slice(0, 10)
          : form.values.wedding_date.toISOString().slice(0, 10))
        : '',
      wedding_time: form.values.wedding_time
        ? (typeof form.values.wedding_time === 'string'
          ? form.values.wedding_time.slice(0, 5)
          : (form.values.wedding_time instanceof Date
            ? form.values.wedding_time.toTimeString().slice(0, 5)
            : ''))
        : '',
    };
    if (onPublish) {
      await onPublish(dataToSend);
      toast({ title: 'Site publicado', description: 'Seu site do casamento foi publicado com sucesso.' });
    }
  }

  // Componente de upload por botão
  function UploadButton({ label, onFile, accept = 'image/*', loading = false, fileName = '' }) {
    const inputRef = useRef<HTMLInputElement>(null);
    return (
      <Box>
        <Button
          leftSection={<IconUpload size={16} />}
          loading={loading}
          onClick={() => inputRef.current?.click()}
          variant="outline"
          color="blue"
          mb={4}
        >
          {label}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          style={{ display: 'none' }}
          onChange={e => {
            if (e.target.files && e.target.files[0]) {
              onFile(e.target.files[0]);
            }
          }}
        />
        {fileName && <Text size="xs" c="dimmed">{fileName}</Text>}
      </Box>
    );
  }

  return (
    <Box>
      <Stepper active={active} onStepClick={setActive} breakpoint="sm">
        <Stepper.Step label="Template" error={form.errors.template}>
          <Group>
            {templates.map(t => (
              <Card key={t.value} shadow={form.values.template === t.value ? 'md' : 'xs'} withBorder p="xs" style={{ borderColor: form.values.template === t.value ? '#228be6' : undefined, cursor: 'pointer', width: 160 }} onClick={() => form.setFieldValue('template', t.value)}>
                {/* <Image src={t.img} alt={t.label} height={80} fit="cover" radius="md" mb={8} /> */}
                <Text align="center" fw={700} c={form.values.template === t.value ? 'blue' : undefined}>{t.label}</Text>
                {form.values.template === t.value && <IconCheck size={18} color="#228be6" style={{ position: 'absolute', top: 8, right: 8 }} />}
              </Card>
            ))}
          </Group>
        </Stepper.Step>
        <Stepper.Step label="Dados do Casal">
          <Group grow>
            <TextInput label="Nome do noivo" {...form.getInputProps('groom_name')} required error={form.errors.groom_name} />
            <TextInput label="Nome da noiva" {...form.getInputProps('bride_name')} required error={form.errors.bride_name} />
          </Group>
          <Textarea label="Quem Somos" {...form.getInputProps('about_us')} minRows={3} autosize mb="md" error={form.errors.about_us} />
        </Stepper.Step>
        <Stepper.Step label="Sobre o Evento">
          <Group grow>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
              <Group
                gap="md"
                style={{
                  alignItems: 'flex-end',
                  flexWrap: 'nowrap',
                  width: '100%',
                  marginTop: 16,
                  marginBottom: 16,
                }}
              >
                <DatePicker
                  label="Data do casamento"
                  value={form.values.wedding_date ? new Date(form.values.wedding_date) : null}
                  onChange={date => form.setFieldValue('wedding_date', date)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      placeholder: 'Selecione a data',
                      sx: {
                        height: 36,
                        minHeight: 36,
                        '.MuiInputBase-input': {
                          height: 36,
                          minHeight: 36,
                          padding: '0 12px'
                        }
                      },
                      style: { flex: 1 }
                    }
                  }}
                  format="dd/MM/yyyy"
                />
                <TimePicker
                  label="Hora do casamento"
                  value={form.values.wedding_time}
                  onChange={value => form.setFieldValue('wedding_time', value)}
                  ampm={false}
                  minutesStep={1}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      placeholder: '00:00',
                      sx: {
                        height: 36,
                        minHeight: 36,
                        '.MuiInputBase-input': {
                          height: 36,
                          minHeight: 36,
                          padding: '0 12px'
                        }
                      },
                      style: { flex: 1 }
                    }
                  }}
                />
              </Group>
            </LocalizationProvider>
          </Group>
          <TextInput label="Local onde será realizado" {...form.getInputProps('local')} required mt="md" />
          <div style={{ height: 260, width: '100%', marginBottom: 16, marginTop: 16, borderRadius: 8, overflow: 'hidden' }}>
            <MapContainer center={mapPosition || [-14.235, -51.9253]} zoom={mapPosition ? 16 : 4} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <LocationMarker />
            </MapContainer>
          </div>
          <TextInput
            label="CEP"
            component={IMaskInput}
            mask="00000-000"
            {...form.getInputProps('postalcode')}
            maxLength={9}
            error={cepError ?? form.errors.cep}
            placeholder="Digite o CEP e saia do campo para buscar endereço"
            rightSection={cepLoading ? <Loader size="xs" /> : null}
            mt="md"
            onBlur={handleCepBlur}
            onAccept={value => {
              form.setFieldValue('postalcode', value ?? '');
              if (cepError) setCepError(null);
            }}
          />
          <TextInput label="Endereço" {...form.getInputProps('address')} mt="md" />
          <Group grow mt="md">
            <TextInput label="Número" {...form.getInputProps('number')} />
            <TextInput label="Bairro" {...form.getInputProps('district')} />
          </Group>
          <Group grow mt="md">
            <TextInput label="Cidade" {...form.getInputProps('city')} />
            <TextInput label="Estado" {...form.getInputProps('state')} />
          </Group>
        </Stepper.Step>
        <Stepper.Step label="Galeria">
           <ImageDropzone
            multiple={true}
            value={form.values.gallery || []}
            onChange={async (filesOrImages: any[]) => {
              // filesOrImages pode conter WeddingImage ou File
              const newImages = [];
              for (const item of filesOrImages) {
                if (item && item instanceof File) {
                  try {
                    const img = await uploadWeddingImage(item, 'wedding-gallery');
                    newImages.push(img);
                  } catch (err: any) {
                    toast({ title: 'Erro no upload', description: err.message || 'Falha ao enviar imagem.' });
                  }
                } else if (item && item.url) {
                  newImages.push(item);
                }
              }
              form.setFieldValue('gallery', newImages);
            }}
            label="Adicionar imagens à galeria"
            title="Adicionar imagens à galeria"
            loading={loading}
          />
        </Stepper.Step>
        <Stepper.Step label="Visual e Opções">
          <Select label="Paleta de Cores" data={palettes} {...form.getInputProps('palette')} mb="md" />
          <Select label="Fonte" data={fonts} {...form.getInputProps('font')} mb="md" />
          {
            form.values.wedding_date && form.values.wedding_time && (
              <Switch label="Contagem Regressiva" {...form.getInputProps('countdown', { type: 'checkbox' })} mb="md" />
            )
          }
          {
            form.values.latitude && form.values.longitude && form.values.address && form.values.number && form.values.district && form.values.city && form.values.state && (
              <Switch label="Mapa Interativo" {...form.getInputProps('map', { type: 'checkbox' })} mb="md" />
            )
          }
          <Switch label="Botão de Compartilhamento" {...form.getInputProps('social', { type: 'checkbox' })} mb="md" />

          {/* CAPA: Upload único */}
          <ImageDropzone
            multiple={false}
            value={form.values.cover_photo}
            onChange={async (file: File) => {
              if (file) {
                try {
                  if (form.values.cover_photo && form.values.cover_photo.id_cloudinary) {
                    await deleteWeddingImage(form.values.cover_photo.id_cloudinary);
                  }
                  const imageObj = await uploadWeddingImage(file, 'wedding-hero');
                  form.setFieldValue('cover_photo', imageObj);
                  toast({ title: 'Upload realizado', description: 'Imagem enviada com sucesso!' });
                } catch (err: any) {
                  toast({ title: 'Erro no upload', description: err.message || 'Falha ao enviar imagem.' });
                }
              }
            }}
            label="Foto de capa"
            title="Foto de Capa"
            loading={loading}
          />
        </Stepper.Step>
        <Stepper.Step label="Preview">
          <Box mb="md">
            <Title order={4} mb={8}>Prévia Dinâmica</Title>
            <Card shadow="sm" p="md" radius="md" withBorder>
              <WeddingLanding data={
                {
                  ...form.values,
                  wedding_date: form.values.wedding_date
                    ? (typeof form.values.wedding_date === 'string'
                      ? form.values.wedding_date.slice(0, 10)
                      : form.values.wedding_date.toISOString().slice(0, 10))
                    : '',
                  wedding_time: form.values.wedding_time
                    ? (typeof form.values.wedding_time === 'string'
                      ? form.values.wedding_time.slice(0, 5)
                      : (form.values.wedding_time instanceof Date
                        ? form.values.wedding_time.toTimeString().slice(0, 5)
                        : ''))
                    : '',
                }
              } />
            </Card>
          </Box>
        </Stepper.Step>
      </Stepper>
      <Group justify="space-between" mt="xl">
        <Button variant="default" onClick={handleBack} disabled={active === 0} leftSection={<IconChevronLeft size={16} />}>Voltar</Button>
        {active < 5 ? (
          <Button onClick={handleNext} rightSection={<IconChevronRight size={16} />}>Próximo</Button>
        ) : (
          <Group>
            <Button color="indigo" leftSection={<IconDeviceFloppy size={16} />} onClick={onSaveClick} loading={loading}>Salvar como Rascunho</Button>
            <Button color="green" leftSection={<IconRocket size={16} />} onClick={onPublishClick} loading={loading}>Publicar Agora</Button>
          </Group>
        )}
      </Group>
    </Box>
  );
}

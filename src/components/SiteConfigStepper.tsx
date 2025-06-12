import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { uploadWeddingSiteImage } from '@/services/weddingSite';
import { Box, Button, Card, FileInput, Group, Image, Select, Stepper, Switch, Text, TextInput, Textarea, Title } from '@mantine/core';
import { IconCheck, IconChevronLeft, IconChevronRight, IconDeviceFloppy, IconFont, IconPalette, IconRocket, IconUpload } from '@tabler/icons-react';
import 'leaflet/dist/leaflet.css';
import { useState } from 'react';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import WeddingLanding from './WeddingLanding';
import { Loader } from '@mantine/core';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import 'leaflet/dist/leaflet.css';
import { IMaskInput } from 'react-imask';
import { useForm } from '@mantine/form';

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

export default function SiteConfigStepper({ initialData = {}, onSave, onPublish, loading }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const weddingProfile = user?.wedding_profile || {};
  const [active, setActive] = useState(0);
  const [capaPreview, setCapaPreview] = useState(initialData.cover_photo || '');

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
    },
    validate: {
      template: value => !value ? 'Selecione um template' : null,
      groom_name: value => !value ? 'Nome do noivo obrigatório' : null,
      bride_name: value => !value ? 'Nome da noiva obrigatório' : null,
      wedding_date: value => !value ? 'Data do casamento obrigatória' : null,
      local: value => !value ? 'Local obrigatório' : null,
      cover_photo: value => !value ? 'Foto de capa obrigatória' : null,
      about_us: value => !value ? 'Campo obrigatório' : null,
      rsvp_text: value => !value ? 'Campo obrigatório' : null,
      address: value => !value ? 'Endereço obrigatório' : null,
    },
  });

  // Componente para manipular o clique no mapa
  function LocationMarker() {
    useMapEvents({
      click(e) {
        setMapPosition([e.latlng.lat, e.latlng.lng]);
        reverseGeocode(e.latlng.lat, e.latlng.lng).then(addr => {
          if (addr) {
            setDados(d => ({
              ...d,
              address: addr.road || '',
              district: addr.suburb || addr.neighbourhood || addr.village || addr.town || '',
              number: addr.house_number || '',
              postalcode: addr.postalcode || weddingProfile.cep || '',
              latitude: e.latlng.lat,
              longitude: e.latlng.lng,
              city: addr.city || '',
              state: addr.state || '',
            }));
          }
        });
      }
    });
    return mapPosition ? <Marker position={mapPosition} icon={L.icon({ iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png', iconSize: [25, 41], iconAnchor: [12, 41] })} /> : null;
  }

  function handleNext() {
    // Validação por etapa
    let fieldsToValidate: string[] = [];
    if (active === 0) {
      fieldsToValidate = ['template'];
    } else if (active === 1) {
      fieldsToValidate = ['groom_name', 'bride_name', 'wedding_date', 'wedding_time', 'local', ]
    } else if (active === 2) {
      fieldsToValidate = ['about_us', 'rsvp_text'];
    }
    // Valida apenas os campos da etapa
    const validation = form.validateField(fieldsToValidate);
    const hasError = fieldsToValidate.some(f => form.errors[f]);
    if (!hasError) {
      setActive(a => a + 1);
    } else {
      toast({ title: 'Preencha os campos obrigatórios', description: 'Verifique os campos destacados.' });
    }
  }
  function handleBack() { setActive(a => a - 1); }

  return (
    <Box>
      <Stepper active={active} onStepClick={setActive} breakpoint="sm">
        <Stepper.Step label="Template" error={form.errors.template}>
          <Group>
            {templates.map(t => (
              <Card key={t.value} shadow={form.values.template === t.value ? 'md' : 'xs'} withBorder p="xs" style={{ borderColor: form.values.template === t.value ? '#228be6' : undefined, cursor: 'pointer', width: 160 }} onClick={() => form.setFieldValue('template', t.value)}>
                <Image src={t.img} alt={t.label} height={80} fit="cover" radius="md" mb={8} />
                <Text align="center" fw={700} c={form.values.template === t.value ? 'blue' : undefined}>{t.label}</Text>
                {form.values.template === t.value && <IconCheck size={18} color="#228be6" style={{ position: 'absolute', top: 8, right: 8 }} />}
              </Card>
            ))}
          </Group>
        </Stepper.Step>
        <Stepper.Step label="Dados do Casal">
          <form onSubmit={form.onSubmit(() => setActive(a => a + 1))}>
            <Group grow>
              <TextInput label="Nome do noivo" {...form.getInputProps('groom_name')} required error={form.errors.groom_name} />
              <TextInput label="Nome da noiva" {...form.getInputProps('bride_name')} required error={form.errors.bride_name} />
            </Group>
            <Group grow mt="md">
              <TextInput label="Data do casamento" type="date" {...form.getInputProps('wedding_date')} required error={form.errors.wedding_date} />
              <TextInput label="Horário" type="time" {...form.getInputProps('wedding_time')} />
            </Group>
            <TextInput label="Local" {...form.getInputProps('local')} required error={form.errors.local} mt="md" />
            <TextInput label="Endereço" {...form.getInputProps('address')} required error={form.errors.address} mt="md" />
            <FileInput label="Foto de capa" accept="image/*" {...form.getInputProps('cover_photo')} error={form.errors.cover_photo} mt="md" icon={<IconUpload size={16} />} />
            {form.values.cover_photo && <Image src={form.values.cover_photo} alt="Capa" height={120} radius="md" mt={8} />}
          </form>
        </Stepper.Step>
        <Stepper.Step label="Sobre o Casal">
          <form onSubmit={form.onSubmit(() => setActive(a => a + 1))}>
            <Textarea label="Quem Somos" {...form.getInputProps('about_us')} required minRows={3} mb="md" error={form.errors.about_us} />
            <Textarea label="Texto RSVP" {...form.getInputProps('rsvp_text')} required minRows={2} mb="md" error={form.errors.rsvp_text} />
          </form>
        </Stepper.Step>
        <Stepper.Step label="Galeria">
          <form onSubmit={form.onSubmit(() => setActive(a => a + 1))}>
            <Textarea label="Galeria de Fotos (URLs separadas por vírgula)"
              value={Array.isArray(form.values.gallery) ? form.values.gallery.join(',') : form.values.gallery || ''}
              onChange={e => form.setFieldValue('gallery', e.currentTarget.value.split(',').map(s => s.trim()).filter(Boolean))}
              minRows={2} mb="md"
            />
            <Group mt={8}>
              {(Array.isArray(form.values.gallery) ? form.values.gallery : (form.values.gallery || '').split(',')).filter(Boolean).map((url, i) => <Image key={i} src={url} alt={`Foto ${i + 1}`} height={60} radius="sm" />)}
            </Group>
          </form>
        </Stepper.Step>
        <Stepper.Step label="Visual e Opções">
          <form onSubmit={form.onSubmit(() => setActive(a => a + 1))}>
            <Select label="Paleta de Cores" data={palettes} {...form.getInputProps('palette')} icon={<IconPalette size={16} />} mb="md" />
            <Select label="Fonte" data={fonts} {...form.getInputProps('font')} icon={<IconFont size={16} />} mb="md" />
            <Switch label="Contagem Regressiva" {...form.getInputProps('countdown', { type: 'checkbox' })} mb="md" />
            <Switch label="Mapa Interativo" {...form.getInputProps('map', { type: 'checkbox' })} mb="md" />
            <Switch label="Botão de Compartilhamento" {...form.getInputProps('social', { type: 'checkbox' })} mb="md" />
          </form>
        </Stepper.Step>
        <Stepper.Step label="Preview">
          <Box mb="md">
            <Title order={4} mb={8}>Prévia Dinâmica</Title>
            <Card shadow="sm" p="md" radius="md" withBorder>
              <WeddingLanding data={form.values} />
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
            <Button color="indigo" leftSection={<IconDeviceFloppy size={16} />} onClick={() => onSave && onSave(form.values)} loading={loading}>Salvar como Rascunho</Button>
            <Button color="green" leftSection={<IconRocket size={16} />} onClick={() => onPublish && onPublish()} loading={loading}>Publicar Agora</Button>
          </Group>
        )}
      </Group>
    </Box>
  );
}

import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api';
import { Button, Group, Loader, Modal, Stepper, TextInput, Textarea } from '@mantine/core';
import { useForm } from '@mantine/form';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import axios from 'axios';
import ptBR from 'date-fns/locale/pt-BR';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { IMaskInput } from 'react-imask';

import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);
dayjs.locale('pt-br');

// Importar dinamicamente os componentes do mapa apenas no client-side
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const useMapEvents = dynamic(() => import('react-leaflet').then(mod => mod.useMapEvents), { ssr: false });

// Importar L apenas no client-side
// let L: any = null;
// if (typeof window !== 'undefined') {
//   L = require('leaflet');
//   require('leaflet/dist/leaflet.css');
// }

export default function WeddingProfileOnboardingModal({ opened, onClose, onComplete }) {
  const { user, refreshUser } = useAuth();
  const initial = user?.wedding_profile ?? {};
  const { toast } = useToast();
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);
  const [mapPosition, setMapPosition] = useState<[number, number] | null>(null);

  const form = useForm({
    initialValues: {
      nome_noivo: initial.nome_noivo ?? '',
      email_noivo: initial.email_noivo ?? '',
      descricao_noivo: initial.descricao_noivo ?? '',
      facebook_noivo: initial.facebook_noivo ?? '',
      instagram_noivo: initial.instagram_noivo ?? '',
      nome_noiva: initial.nome_noiva ?? '',
      email_noiva: initial.email_noiva ?? '',
      descricao_noiva: initial.descricao_noiva ?? '',
      facebook_noiva: initial.facebook_noiva ?? '',
      instagram_noiva: initial.instagram_noiva ?? '',
      data_casamento: initial.data_casamento ?? '',
      hora_casamento: initial.hora_casamento ?? '',
      local: initial.local ?? '',
      endereco: initial.endereco ?? '',
      numero: initial.numero ?? '',
      bairro: initial.bairro ?? '',
      cidade: initial.cidade ?? '',
      estado: initial.estado ?? '',
      latitude: initial.latitude ?? null,
      longitude: initial.longitude ?? null,
      cep: initial.cep ?? '',
      cor_principal: initial.cor_principal ?? '',
      frase_casal: initial.frase_casal ?? '',
      historia: initial.historia ?? '',
      cep: initial.cep ?? '',
    },
    validate: {
      nome_noivo: v => !v ? 'Obrigatório' : null,
      nome_noiva: v => !v ? 'Obrigatório' : null,
      data_casamento: v => !v ? 'Obrigatório' : null,
      hora_casamento: v => !v ? 'Obrigatório' : null,
      local: v => !v ? 'Obrigatório' : null,
      // Todos os outros campos são opcionais
    },
  });

  useEffect(() => {
    if (opened) setActive(0);
  }, [opened]);

  // Inicializa o mapa com a latitude/longitude salvas, mas só atualiza se o usuário manipular o endereço/cep
  useEffect(() => {
    if (opened) {
      if (form.values.latitude && form.values.longitude) {
        setMapPosition([form.values.latitude, form.values.longitude]);
      } else {
        setMapPosition(null);
      }
    }
  }, [opened]);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Formata data e hora para o backend
      const dataToSend = {
        ...form.values,
        data_casamento: form.values.data_casamento
          ? (typeof form.values.data_casamento === 'string'
              ? form.values.data_casamento.slice(0, 10)
              : form.values.data_casamento.toISOString().slice(0, 10))
          : '',
        hora_casamento: form.values.hora_casamento
          ? (typeof form.values.hora_casamento === 'string'
              ? form.values.hora_casamento.slice(0, 5)
              : (form.values.hora_casamento instanceof Date
                  ? form.values.hora_casamento.toTimeString().slice(0, 5)
                  : ''))
          : '',
      };
      await api.patch('/api/wedding-profile/me/', dataToSend);
      await refreshUser();
      toast({ title: 'Perfil salvo!', description: 'Seu perfil de casamento foi atualizado.' });
      onComplete();
      onClose();
    } catch (e) {
      toast({ title: 'Erro', description: 'Não foi possível salvar o perfil.' });
    } finally {
      setLoading(false);
    }
  };

  // Busca endereço pelo CEP
  const handleCepBlur = async () => {
    setCepError(null);
    const rawCep = form.values.cep.replace(/\D/g, '');
    if (rawCep.length !== 8) {
      setCepError('CEP inválido');
      return;
    }
    setCepLoading(true);
    try {
      const { data } = await axios.get(`https://viacep.com.br/ws/${rawCep}/json/`);
      if (!data.erro) {
        form.setFieldValue('endereco', data.logradouro ?? '');
        form.setFieldValue('bairro', data.bairro ?? '');
        form.setFieldValue('cidade', data.localidade ?? '');
        form.setFieldValue('estado', data.uf ?? '');
        form.setFieldValue('cep', data.cep ?? rawCep);
      } else {
        setCepError('CEP não encontrado');
      }
    } catch {
      setCepError('Erro ao buscar CEP');
    }
    setCepLoading(false);
  };

  // Função para buscar coordenadas pelo endereço (usando Nominatim)
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

  // Função para buscar endereço pelas coordenadas (reverse geocode)
  async function reverseGeocode(lat: number, lon: number) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.address || {};
  }

  // Atualiza o mapa ao preencher o CEP ou endereço
  useEffect(() => {
    if (form.values.cep && form.values.endereco && form.values.cidade) {
      const fullAddress = `${form.values.endereco}, ${form.values.numero || ''}, ${form.values.bairro || ''}, ${form.values.cidade}, ${form.values.estado || ''}`;
      geocodeAddress(fullAddress).then(coords => {
        if (coords) setMapPosition(coords as [number, number]);
      });
    }
  }, [form.values.cep, form.values.endereco, form.values.cidade, form.values.numero, form.values.bairro, form.values.estado]);

  // Componente para manipular o clique no mapa
  function LocationMarker() {
    // Só renderiza no client
    if (typeof window === 'undefined' || !useMapEvents) return null;
    const mapEvents = useMapEvents({
      click(e) {
        setMapPosition([e.latlng.lat, e.latlng.lng]);
        reverseGeocode(e.latlng.lat, e.latlng.lng).then(addr => {
          if (addr) {
            form.setFieldValue('endereco', addr.road || '');
            form.setFieldValue('bairro', addr.suburb || addr.neighbourhood || addr.village || addr.town || '');
            form.setFieldValue('cidade', addr.city || addr.town || addr.village || '');
            form.setFieldValue('estado', addr.state || '');
            form.setFieldValue('numero', addr.house_number || '');
            form.setFieldValue('cep', addr.postcode || form.values.cep || '');
            form.setFieldValue('latitude', e.latlng.lat);
            form.setFieldValue('longitude', e.latlng.lng);
          }
        });
      }
    });
    return mapPosition && L ? (
      <Marker position={mapPosition} icon={L.icon({iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png', iconSize: [25, 41], iconAnchor: [12, 41]})} />
    ) : null;
  }

  // Função para checar se os campos obrigatórios do step atual estão preenchidos
  function isStepValid(step: number): boolean {
    if (step === 0) {
      return !!form.values.nome_noivo;
    }
    if (step === 1) {
      return !!form.values.nome_noiva;
    }
    if (step === 2) {
      return (
        !!form.values.data_casamento &&
        !!form.values.hora_casamento &&
        !!form.values.local
      );
    }
    return true;
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Complete seu perfil de casamento" size="xl" centered>
      <form onSubmit={form.onSubmit(handleSave)}>
        <Stepper active={active} onStepClick={setActive} breakpoint="sm">
          <Stepper.Step label="Dados do noivo">
            <TextInput label="Nome do noivo" {...form.getInputProps('nome_noivo')} required mb="md" />
            <TextInput label="Email do noivo" {...form.getInputProps('email_noivo')} mb="md" type="email" />
            <Textarea label="Descrição do noivo" {...form.getInputProps('descricao_noivo')} minRows={4} autosize mb="md" placeholder="Idade, estilo musical, religião, time do coração, hobbies, profissão, formação, temperamento etc." />
            <TextInput label="Facebook do noivo" {...form.getInputProps('facebook_noivo')} mb="md" placeholder="Link do Facebook" />
            <TextInput label="Instagram do noivo" {...form.getInputProps('instagram_noivo')} mb="md" placeholder="Link do Instagram" />
          </Stepper.Step>
          <Stepper.Step label="Dados da noiva">
            <TextInput label="Nome da noiva" {...form.getInputProps('nome_noiva')} required mb="md" />
            <TextInput label="Email da noiva" {...form.getInputProps('email_noiva')} mb="md" type="email" />
            <Textarea label="Descrição da noiva" {...form.getInputProps('descricao_noiva')} minRows={4} autosize mb="md" placeholder="Idade, estilo musical, religião, time do coração, hobbies, profissão, formação, temperamento etc." />
            <TextInput label="Facebook da noiva" {...form.getInputProps('facebook_noiva')} mb="md" placeholder="Link do Facebook" />
            <TextInput label="Instagram da noiva" {...form.getInputProps('instagram_noiva')} mb="md" placeholder="Link do Instagram" />
          </Stepper.Step>
          <Stepper.Step label="Evento">
            <TextInput label="Local onde será realizado" {...form.getInputProps('local')} required mt="md" />
           { mapPosition &&
             <div style={{ height: 260, width: '100%', marginBottom: 16, marginTop:16,  borderRadius: 8, overflow: 'hidden' }}>
              <MapContainer center={mapPosition || [-14.235, -51.9253]} zoom={mapPosition ? 16 : 4} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationMarker />
              </MapContainer>
            </div>
           }
            <TextInput
              label="CEP"
              component={IMaskInput}
              mask="00000-000"
              {...form.getInputProps('cep')}
              maxLength={9}
              error={cepError ?? form.errors.cep}
              placeholder="Digite o CEP e saia do campo para buscar endereço"
              rightSection={cepLoading ? <Loader size="xs" /> : null}
              mt="md"
              onBlur={handleCepBlur}
              onAccept={value => {
                form.setFieldValue('cep', value ?? '');
                if (cepError) setCepError(null);
              }}
            />
            <TextInput label="Endereço" {...form.getInputProps('endereco')} mt="md" />
            <Group grow mt="md">
              <TextInput label="Número" {...form.getInputProps('numero')} />
              <TextInput label="Bairro" {...form.getInputProps('bairro')} />
            </Group>
            <Group grow mt="md">
              <TextInput label="Cidade" {...form.getInputProps('cidade')} />
              <TextInput label="Estado" {...form.getInputProps('estado')} />
            </Group>
            <TextInput label="Cor principal do Casamento" {...form.getInputProps('cor_principal')} mt="md" />
            <TextInput label="Frase do Casal" {...form.getInputProps('frase_casal')} mt="md" placeholder="Alguma frase que representa a sua união." />
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
                    value={form.values.data_casamento ? new Date(form.values.data_casamento) : null}
                    onChange={date => form.setFieldValue('data_casamento', date)}
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
                    value={form.values.hora_casamento}
                    onChange={value => form.setFieldValue('hora_casamento', value)}
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
          </Stepper.Step>
          <Stepper.Step label="História">
            <Textarea label="Conte um pouco sobre a história do casal" minRows={2} autosize {...form.getInputProps('historia')} />
          </Stepper.Step>
        </Stepper>
        <Group justify="space-between" mt="xl">
          <Button variant="default" onClick={() => setActive(a => Math.max(a - 1, 0))} disabled={active === 0} type="button">Voltar</Button>
          {active < 3 ? (
            <Button type="button" onClick={() => setActive(a => Math.min(a + 1, 3))} disabled={!isStepValid(active)}>
              Próximo
            </Button>
          ) : (
            <Button type="button" loading={loading} disabled={!isStepValid(2)} onClick={handleSave}>
              Salvar
            </Button>
          )}
        </Group>
        {loading && <Loader mt="md" />}
      </form>
    </Modal>
  );
}

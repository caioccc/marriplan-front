import { useState, useEffect } from 'react';
import { DataTable } from 'mantine-datatable';
import {
  Button,
  Modal,
  TextInput,
  Checkbox,
  Group,
  Stack,
  ActionIcon,
  useMantineTheme,
  rem,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconEdit, IconTrash, IconPlus, IconBrandWhatsapp, IconMail } from '@tabler/icons-react';
import { guests_list, guests_create, guests_update, guests_delete } from '@/services/guests';

interface Guest {
  id: number;
  name: string;
  phone: string;
  whatsapp: string; // agora é string (número)
  email: string;
}

function validateEmail(email: string) {
  return /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);
}

function formatPhone(phone: string) {
  // Mascara para telefone brasileiro (11) 99999-9999
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length <= 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
  }
  return cleaned.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
}

export default function GuestTable() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Guest | null>(null);
  const theme = useMantineTheme();

  const form = useForm({
    initialValues: {
      name: '',
      phone: '',
      hasWhatsapp: false,
      whatsapp: '',
      email: '',
    },
    validate: {
      name: value => value.trim() ? null : 'Nome obrigatório',
      phone: value => value.replace(/\D/g, '').length >= 10 ? null : 'Telefone inválido',
      whatsapp: (value, values) => values.hasWhatsapp && value.replace(/\D/g, '').length < 10 ? 'WhatsApp inválido' : null,
      email: value => value === '' || validateEmail(value) ? null : 'Email inválido',
    },
  });

  useEffect(() => {
    async function fetchGuests() {
      const data = await guests_list();
      setGuests(Array.isArray(data) ? data : []);
    }
    fetchGuests();
  }, []);

  function handleAdd() {
    setEditing(null);
    form.setValues({ name: '', phone: '', hasWhatsapp: false, whatsapp: '', email: '' });
    setModalOpen(true);
  }

  function handleEdit(guest: Guest) {
    setEditing(guest);
    form.setValues({
      name: guest.name,
      phone: guest.phone,
      hasWhatsapp: !!guest.whatsapp,
      whatsapp: guest.whatsapp || '',
      email: guest.email,
    });
    setModalOpen(true);
  }

  async function handleSubmit(values: typeof form.values) {
    const payload = {
      name: values.name,
      phone: values.phone,
      whatsapp: values.hasWhatsapp ? values.whatsapp : '',
      email: values.email,
    };
    if (editing) {
      const updated = await guests_update(editing.id, payload);
      setGuests(guests => guests.map(g => g.id === editing.id ? updated : g));
    } else {
      const created = await guests_create(payload);
      setGuests(guests => [...guests, created]);
    }
    setModalOpen(false);
    form.reset();
  }

  async function handleDelete(id: number) {
    await guests_delete(id);
    setGuests(guests => guests.filter(g => g.id !== id));
  }

  return (
    <Stack spacing="md">
      <Group justify="space-between" mb="xs">
        <h2 style={{ margin: 0, fontWeight: 600 }}>Convidados</h2>
        <Button leftSection={<IconPlus size={18} />} onClick={handleAdd} variant="light">
          Adicionar convidado
        </Button>
      </Group>
      <DataTable
        withBorder
        borderRadius="md"
        highlightOnHover
        verticalSpacing="sm"
        horizontalSpacing="md"
        minHeight={200}
        noRecordsText="Nenhum convidado cadastrado."
        columns={[
          { accessor: 'name', title: 'Nome', width: 180 },
          { accessor: 'phone', title: 'Telefone', width: 140 },
          {
            accessor: 'whatsapp',
            title: 'WhatsApp',
            width: 140,
            render: g => g.whatsapp ? g.whatsapp : '-',
            textAlign: 'center',
          },
          { accessor: 'email', title: 'Email', width: 200 },
          {
            accessor: 'actions',
            title: '',
            width: 130,
            render: (g: Guest) => (
              <Group gap={4}>
                {g.whatsapp && (
                  <ActionIcon
                    variant="subtle"
                    color="green"
                    component="a"
                    href={`https://wa.me/55${g.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('🎉 Olá! Você está convidado para nosso casamento 💍. Por favor, confirme sua presença (RSVP) pelo site ou respondendo esta mensagem. Esperamos você! 🥂')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Enviar RSVP por WhatsApp"
                  >
                    <IconBrandWhatsapp size={18} />
                  </ActionIcon>
                )}
                {g.email && (
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    component="a"
                    href={`mailto:${g.email}?subject=${encodeURIComponent('Convite de Casamento - RSVP')}&body=${encodeURIComponent('🎉 Olá! Você está convidado para nosso casamento 💍. Por favor, confirme sua presença (RSVP) pelo site ou respondendo este e-mail. Esperamos você! 🥂')}`}
                    title="Enviar RSVP por Email"
                  >
                    <IconMail size={18} />
                  </ActionIcon>
                )}
                <ActionIcon variant="subtle" color="blue" onClick={() => handleEdit(g)}>
                  <IconEdit size={18} />
                </ActionIcon>
                <ActionIcon variant="subtle" color="red" onClick={() => handleDelete(g.id)}>
                  <IconTrash size={18} />
                </ActionIcon>
              </Group>
            ),
          },
        ]}
        records={guests}
        rowStyle={() => ({ background: theme.colorScheme === 'dark' ? theme.colors.dark[7] : '#f8f9fa' })}
        styles={{
          table: { fontSize: rem(15) },
        }}
        striped
        responsive
      />
      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar convidado' : 'Adicionar convidado'}
        centered
        size="xs"
        overlayProps={{ blur: 2 }}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="Nome"
              required
              {...form.getInputProps('name')}
              autoFocus
            />
            <TextInput
              label="Telefone"
              required
              maxLength={15}
              value={form.values.phone}
              onChange={e => {
                // Aplica máscara ao digitar
                const raw = e.currentTarget.value.replace(/\D/g, '');
                let masked = '';
                if (raw.length <= 10) {
                  masked = raw.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
                } else {
                  masked = raw.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
                }
                form.setFieldValue('phone', masked);
              }}
              error={form.errors.phone}
              placeholder="(11) 99999-9999"
            />
            <Checkbox
              label="Possui WhatsApp?"
              checked={form.values.hasWhatsapp}
              onChange={e => form.setFieldValue('hasWhatsapp', e.currentTarget.checked)}
            />
            {form.values.hasWhatsapp && (
              <TextInput
                label="Número do WhatsApp"
                required
                maxLength={15}
                value={form.values.whatsapp}
                onChange={e => {
                  const raw = e.currentTarget.value.replace(/\D/g, '');
                  let masked = '';
                  if (raw.length <= 10) {
                    masked = raw.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
                  } else {
                    masked = raw.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
                  }
                  form.setFieldValue('whatsapp', masked);
                }}
                error={form.errors.whatsapp}
                placeholder="(11) 98888-8888"
              />
            )}
            <TextInput
              label="Email"
              type="email"
              {...form.getInputProps('email')}
              error={form.errors.email}
              placeholder="exemplo@email.com"
            />
            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={() => setModalOpen(false)} type="button">
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </Group>
          </Stack>
        </form>
      </Modal>
      {/* Responsividade customizada para mobile */}
      <style>{`
        @media (max-width: 600px) {
          .mantine-DataTable-table {
            font-size: 13px;
          }
          .mantine-DataTable-table th, .mantine-DataTable-table td {
            padding: 8px 4px;
          }
        }
      `}</style>
    </Stack>
  );
}

import { ListView } from '@/components/ListView';
import { GalleryView } from '@/components/GalleryView';
import ImportGuestsModal from '@/components/ImportGuestsModal';
import { guests_create, guests_delete, guests_download_model, guests_export, guests_import, guests_list, guests_update } from '@/services/guests';
import {
  ActionIcon,
  Button,
  Checkbox,
  Group,
  Menu,
  Modal,
  RangeSlider,
  rem,
  Select,
  SegmentedControl,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
  useMantineTheme,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconBrandWhatsapp, IconCards, IconDotsVertical, IconDownload, IconEdit, IconFileTypePdf, IconFilter, IconLayoutGrid, IconList, IconMail, IconPlus, IconSearch, IconTrash, IconUpload, IconUser } from '@tabler/icons-react';
import { DataTable, type DataTableSortStatus } from 'mantine-datatable';
import { useEffect, useState } from 'react';

import { Pagination } from '@mantine/core';
import { actionIconDangerStyles, actionIconEditStyles, inputStyles, primaryButtonStyles, segmentedTabsStyles, softButtonStyles } from '@/styles';


interface Guest {
  id: number;
  name: string;
  phone: string;
  whatsapp: string; // agora é string (número)
  email: string;
  alergias?: string;
  acompanhantes?: number;
  observacoes?: string;
}

function validateEmail(email: string) {
  return /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);
}

export default function GuestTable() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Guest | null>(null);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState<'csv' | 'xlsx' | 'pdf' | null>(null);
  const [page, setPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'name', direction: 'asc' });
  const [search, setSearch] = useState('');
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('table');
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [advancedFilterOpen, setAdvancedFilterOpen] = useState(false);
  const [companionsRange, setCompanionsRange] = useState<[number, number]>([0, 10]);
  const [whatsappFilter, setWhatsappFilter] = useState<'all' | 'with' | 'without'>('all');
  const [allergyFilter, setAllergyFilter] = useState<'all' | 'with' | 'without'>('all');
  const theme = useMantineTheme();

  const maxCompanionsValue = Math.max(10, ...guests.map(g => g.acompanhantes ?? 0));
  const rangeIsDefault = companionsRange[0] === 0 && companionsRange[1] === maxCompanionsValue;
  const filtersActive = !rangeIsDefault || whatsappFilter !== 'all' || allergyFilter !== 'all';

  async function fetchAllGuests({ ordering }: { ordering: string }) {
    const pageSize = 200;
    let currentPage = 1;
    let results: Guest[] = [];
    let count = 0;
    while (true) {
      const data = await guests_list({ page: currentPage, page_size: pageSize, search, ordering });
      if (currentPage === 1) count = data.count || 0;
      results = results.concat(data.results || []);
      if (!data.results?.length || results.length >= count) break;
      currentPage += 1;
    }
    return { results, count };
  }

  const form = useForm({
    initialValues: {
      name: '',
      phone: '',
      hasWhatsapp: false,
      whatsapp: '',
      email: '',
      alergias: '',
      acompanhantes: '',
      observacoes: '',
    },
    validate: {
      name: value => value.trim() ? null : 'Nome obrigatório',
      phone: value => value.replace(/\D/g, '').length >= 10 ? null : 'Telefone inválido',
      whatsapp: (value, values) => values.hasWhatsapp && value.replace(/\D/g, '').length < 10 ? 'WhatsApp inválido' : null,
      email: value => value === '' || validateEmail(value) ? null : 'Email inválido',
      acompanhantes: value => value === '' || (!isNaN(Number(value)) && Number(value) >= 0) ? null : 'Acompanhantes inválido',
    },
  });

  // Busca convidados do backend conforme paginação, busca e ordenação
  useEffect(() => {
    async function fetchGuests() {
      setLoading(true);
      try {
        const ordering = sortStatus.columnAccessor
          ? `${sortStatus.direction === 'desc' ? '-' : ''}${sortStatus.columnAccessor}`
          : '';
        if (filtersActive) {
          const data = await fetchAllGuests({ ordering });
          setGuests(data.results || []);
          setTotalRecords(data.count || 0);
        } else {
          const data = await guests_list({
            page,
            page_size: recordsPerPage,
            search,
            ordering,
          });
          setGuests(data.results || []);
          setTotalRecords(data.count || 0);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchGuests();
  }, [page, recordsPerPage, search, sortStatus, filtersActive]);

  useEffect(() => {
    if (filtersActive) {
      setPage(1);
    }
  }, [companionsRange, whatsappFilter, allergyFilter, filtersActive]);

  useEffect(() => {
    setCompanionsRange(prev => {
      const nextMax = maxCompanionsValue;
      const nextMin = Math.min(prev[0], nextMax);
      const nextHigh = prev[1] > nextMax ? nextMax : prev[1];
      return [nextMin, nextHigh];
    });
  }, [maxCompanionsValue]);

  function handleAdd() {
    setEditing(null);
    form.setValues({ name: '', phone: '', hasWhatsapp: false, whatsapp: '', email: '', alergias: '', acompanhantes: '', observacoes: '' });
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
      alergias: guest.alergias || '',
      acompanhantes: guest.acompanhantes?.toString() || '',
      observacoes: guest.observacoes || '',
    });
    setModalOpen(true);
  }

  async function handleSubmit(values: typeof form.values) {
    const payload = {
      name: values.name,
      phone: values.phone,
      whatsapp: values.hasWhatsapp ? values.whatsapp : '',
      email: values.email,
      alergias: values.alergias,
      acompanhantes: values.acompanhantes === '' ? null : Number(values.acompanhantes),
      observacoes: values.observacoes,
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

  // Exportar convidados
  async function handleExport(format: 'csv' | 'xlsx' | 'pdf') {
    setExporting(format);
    try {
      const ordering = sortStatus.columnAccessor
        ? `${sortStatus.direction === 'desc' ? '-' : ''}${sortStatus.columnAccessor}`
        : '';
      if (format === 'pdf') {
        const [{ jsPDF }, autoTableModule] = await Promise.all([
          import('jspdf'),
          import('jspdf-autotable'),
        ]);
        const autoTable = autoTableModule.default;
        const data = filtersActive
          ? { results: filteredGuests, count: filteredGuests.length }
          : await fetchAllGuests({ ordering });

        const doc = new jsPDF('p', 'mm', 'a4');
        doc.setFontSize(14);
        doc.text('Lista de convidados', 14, 18);

        const body = (data.results || []).map(g => ([
          g.name,
          g.phone,
          g.whatsapp || '-',
          g.email || '-',
          g.acompanhantes ?? '-',
          g.alergias || '-',
        ]));

        autoTable(doc, {
          startY: 26,
          head: [['Nome', 'Telefone', 'WhatsApp', 'Email', 'Acompanhantes', 'Alergias']],
          body,
          styles: { fontSize: 9 },
          headStyles: { fillColor: [246, 238, 228], textColor: '#000' },
          theme: 'grid',
        });

        doc.save('convidados.pdf');
        notifications.show({ color: 'green', message: 'Exportação PDF concluída!' });
        return;
      }

      // const res = await guests_export(format, { search, ordering });
      const res = await guests_export(format);
      let filename = `convidados.${format}`;
      if (format === 'xlsx') filename = 'convidados.xlsx';
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      notifications.show({ color: 'green', message: `Exportação ${format.toUpperCase()} concluída!` });
    } catch {
      notifications.show({ color: 'red', message: 'Erro ao exportar convidados.' });
    } finally {
      setExporting(null);
    }
  }

  const filteredGuests = guests.filter(g => {
    if (companionsRange[0] > 0 && (g.acompanhantes === undefined || g.acompanhantes < companionsRange[0])) return false;
    if (companionsRange[1] < maxCompanionsValue && (g.acompanhantes === undefined || g.acompanhantes > companionsRange[1])) return false;

    if (whatsappFilter === 'with' && !g.whatsapp) return false;
    if (whatsappFilter === 'without' && g.whatsapp) return false;

    const hasAllergy = !!g.alergias?.trim();
    if (allergyFilter === 'with' && !hasAllergy) return false;
    if (allergyFilter === 'without' && hasAllergy) return false;

    return true;
  });

  const paginatedGuests = filtersActive
    ? filteredGuests.slice((page - 1) * recordsPerPage, page * recordsPerPage)
    : guests;

  const derivedTotalRecords = filtersActive ? filteredGuests.length : totalRecords;

  return (
    <Stack spacing="md">
      <Group justify="space-between" mb="md">
        <Title order={2}>Meus Convidados</Title>
        <Button leftSection={<IconFileTypePdf size={18} />} styles={softButtonStyles} onClick={() => handleExport('pdf')} loading={exporting === 'pdf'}>
          Exportar PDF
        </Button>
      </Group>
      <Group mb="md" align="center" justify="space-between" wrap="wrap" gap="sm">
        <Group gap="sm">
          <Button leftSection={<IconPlus size={18} />} onClick={handleAdd} styles={primaryButtonStyles}>
            Adicionar convidado
          </Button>
          <Menu shadow="md" width={220} position="bottom-end">
            <Menu.Target>
              <Button styles={softButtonStyles} px={8} style={{ minWidth: 44 }}>
                <IconDotsVertical size={22} />
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconDownload size={18} />}
                onClick={() => setImportModalOpen(true)}
              >
                Baixar modelo de planilha
              </Menu.Item>
              <Menu.Item
                leftSection={<IconUpload size={18} />}
                onClick={() => setImportModalOpen(true)}
              >
                Importar convidados
              </Menu.Item>
              <Menu.Item
                leftSection={<IconFileTypePdf size={18} />}
                onClick={() => handleExport('pdf')}
              >
                Exportar PDF
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
        <SegmentedControl
          value={viewMode}
          onChange={setViewMode}
          data={[
            { value: 'table', label: <IconList size={16} /> },
            { value: 'cards', label: <IconCards size={16} /> },
            { value: 'gallery', label: <IconLayoutGrid size={16} /> },
          ]}
          styles={segmentedTabsStyles}
        />
      </Group>
      <Group
        mb="md"
        gap="sm"
        align="center"
        wrap="wrap"
        style={{ background: 'var(--marriplan-surface)', border: '1px solid var(--marriplan-border)', padding: '12px 14px', borderRadius: 16 }}
      >
        <TextInput
          leftSection={<IconSearch size={16} />}
          placeholder="Buscar por nome, e-mail, telefone..."
          value={search}
          onChange={e => { setSearch(e.currentTarget.value); setPage(1); }}
          w={{ base: '100%', sm: 260 }}
          styles={inputStyles}
        />
        <Button leftSection={<IconFilter size={16} />} styles={softButtonStyles} onClick={() => setAdvancedFilterOpen(true)}>
          Filtro avançado
        </Button>
      </Group>
      {viewMode === 'table' && (
        <DataTable
          className="guest-table"
          withBorder
          borderRadius="xl"
          highlightOnHover
          verticalSpacing="sm"
          horizontalSpacing="md"
          minHeight={200}
          noRecordsText="Nenhum convidado cadastrado."
          columns={[
            { accessor: 'name', title: 'Nome', width: 140, sortable: true },
            { accessor: 'phone', title: 'Telefone', width: 110, sortable: true },
            { accessor: 'whatsapp', title: 'WhatsApp', width: 110, render: g => g.whatsapp ? g.whatsapp : '-', textAlign: 'center', sortable: true },
            { accessor: 'email', title: 'Email', width: 160, sortable: true },
            { accessor: 'acompanhantes', title: 'Acompanhantes', width: 80, render: g => g.acompanhantes ?? '-', sortable: true },
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
                      href={`https://wa.me/55${g.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('Olá! Por gentileza, confirme sua presença no nosso casamento respondendo esta mensagem ou pelo site. O convite formal será enviado via papelaria. Obrigado!')}`}
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
                      href={`mailto:${g.email}?subject=${encodeURIComponent('Confirmação de Presença - Casamento')}&body=${encodeURIComponent('Olá! Por gentileza, confirme sua presença no nosso casamento respondendo este e-mail ou pelo site. O convite formal será enviado via papelaria. Obrigado!')}`}
                      title="Enviar RSVP por Email"
                    >
                      <IconMail size={18} />
                    </ActionIcon>
                  )}
                  <ActionIcon variant="subtle" styles={actionIconEditStyles} onClick={() => handleEdit(g)}>
                    <IconEdit size={18} />
                  </ActionIcon>
                  <ActionIcon variant="subtle" styles={actionIconDangerStyles} onClick={() => handleDelete(g.id)}>
                    <IconTrash size={18} />
                  </ActionIcon>
                </Group>
              ),
            },
          ]}
          records={paginatedGuests}
          totalRecords={derivedTotalRecords}
          page={page}
          onPageChange={setPage}
          recordsPerPage={recordsPerPage}
          onRecordsPerPageChange={setRecordsPerPage}
          sortStatus={sortStatus}
          onSortStatusChange={setSortStatus}
          rowStyle={() => ({ background: theme.colorScheme === 'dark' ? theme.colors.dark[7] : '#f8f9fa' })}
          styles={{
            table: { fontSize: rem(15) },
          }}
          striped
          responsive
          fetching={loading}
          paginationText={({ from, to, totalRecords }) => `${from}–${to} de ${totalRecords}`}
        />
      )}
      {viewMode === 'cards' && (
        <ListView
          items={paginatedGuests}
          getItemId={(g) => g.id}
          getImageUrl={(g) => undefined} // Convidados não têm imagem, então é undefined
          fallbackIcon={<IconUser size={48} color="var(--mantine-color-gray-5)" />}
          renderContent={(g) => (
            <>
              <Text fw={500} lineClamp={2}>{g.name}</Text>
              <Text size="sm" c="dimmed">Telefone: {g.phone}</Text>
              {g.whatsapp && <Text size="sm" c="dimmed">WhatsApp: {g.whatsapp}</Text>}
              {g.email && <Text size="sm" c="dimmed">Email: {g.email}</Text>}
              {g.acompanhantes !== undefined && <Text size="sm" c="dimmed">Acompanhantes: {g.acompanhantes}</Text>}
              {g.alergias && <Text size="sm" c="dimmed">Alergias: {g.alergias}</Text>}
              {g.observacoes && <Text size="sm" c="dimmed">Observações: {g.observacoes}</Text>}
            </>
          )}
          renderActions={(g) => (
            <>
              {g.whatsapp && (
                <Tooltip label="Enviar RSVP por WhatsApp" position="right">
                  <Menu.Item
                    leftSection={<IconBrandWhatsapp size={14} />}
                    component="a"
                    href={`https://wa.me/55${g.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('Olá! Por gentileza, confirme sua presença no nosso casamento respondendo esta mensagem ou pelo site. O convite formal será enviado via papelaria. Obrigado!')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    WhatsApp
                  </Menu.Item>
                </Tooltip>
              )}
              {g.email && (
                <Tooltip label="Enviar RSVP por Email" position="right">
                  <Menu.Item
                    leftSection={<IconMail size={14} />}
                    component="a"
                    href={`mailto:${g.email}?subject=${encodeURIComponent('Confirmação de Presença - Casamento')}&body=${encodeURIComponent('Olá! Por gentileza, confirme sua presença no nosso casamento respondendo este e-mail ou pelo site. O convite formal será enviado via papelaria. Obrigado!')}`}
                  >
                    Email
                  </Menu.Item>
                </Tooltip>
              )}
              <Tooltip label="Editar convidado" position="right">
                <Menu.Item leftSection={<IconEdit size={14} color="var(--marriplan-rose)" />} onClick={() => handleEdit(g)}>
                  Editar
                </Menu.Item>
              </Tooltip>
              <Tooltip label="Excluir convidado" position="right">
                <Menu.Item leftSection={<IconTrash size={14} color="var(--marriplan-rose)" />} onClick={() => handleDelete(g.id)} color="red">
                  Excluir
                </Menu.Item>
              </Tooltip>
            </>
          )}
        />
      )}
      {viewMode === 'gallery' && (
        <GalleryView
          items={paginatedGuests}
          getItemId={(g) => g.id}
          getImageUrl={(g) => undefined} // Convidados não têm imagem, então é undefined
          fallbackIcon={<IconUser size={48} color="var(--mantine-color-gray-5)" />}
          renderContent={(g) => (
            <Stack gap="xs">
              <Text fw={500} lineClamp={2}>{g.name}</Text>
              <Text size="sm" c="dimmed">Telefone: {g.phone}</Text>
              {g.whatsapp && <Text size="sm" c="dimmed">WhatsApp: {g.whatsapp}</Text>}
              {g.email && <Text size="sm" c="dimmed">Email: {g.email}</Text>}
              {g.acompanhantes !== undefined && <Text size="sm" c="dimmed">Acompanhantes: {g.acompanhantes}</Text>}
              {g.alergias && <Text size="sm" c="dimmed">Alergias: {g.alergias}</Text>}
              {g.observacoes && <Text size="sm" c="dimmed">Observações: {g.observacoes}</Text>}
            </Stack>
          )}
          renderActions={(g) => (
            <>
              {g.whatsapp && (
                <Tooltip label="Enviar RSVP por WhatsApp" position="right">
                  <Menu.Item
                    leftSection={<IconBrandWhatsapp size={14} />}
                    component="a"
                    href={`https://wa.me/55${g.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('Olá! Por gentileza, confirme sua presença no nosso casamento respondendo esta mensagem ou pelo site. Esperamos você! 🥂')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    WhatsApp
                  </Menu.Item>
                </Tooltip>
              )}
              {g.email && (
                <Tooltip label="Enviar RSVP por Email" position="right">
                  <Menu.Item
                    leftSection={<IconMail size={14} />}
                      component="a"
                      href={`mailto:${g.email}?subject=${encodeURIComponent('Confirmação de Presença - Casamento')}&body=${encodeURIComponent('Olá! Por gentileza, confirme sua presença no nosso casamento respondendo este e-mail ou pelo site. Esperamos você! 🥂')}`}
                  >
                    Email
                  </Menu.Item>
                </Tooltip>
              )}
              <Tooltip label="Editar convidado" position="right">
                <Menu.Item leftSection={<IconEdit size={14} color="var(--marriplan-rose)" />} onClick={() => handleEdit(g)}>
                  Editar
                </Menu.Item>
              </Tooltip>
              <Tooltip label="Excluir convidado" position="right">
                <Menu.Item leftSection={<IconTrash size={14} color="var(--marriplan-rose)" />} onClick={() => handleDelete(g.id)} color="red">
                  Excluir
                </Menu.Item>
              </Tooltip>
            </>
          )}
        />
      )}
      {(viewMode === 'cards' || viewMode === 'gallery') && (
        <Group justify="center" mt="md">
          <Pagination
            className="guest-pagination"
            total={Math.ceil(derivedTotalRecords / recordsPerPage)}
            value={page}
            onChange={setPage}
          />
        </Group>
      )}
      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar convidado' : 'Adicionar convidado'}
        centered
        size="md"
        overlayProps={{ blur: 2 }}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="Nome"
              required
              {...form.getInputProps('name')}
              autoFocus
              styles={inputStyles}
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
              styles={inputStyles}
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
                styles={inputStyles}
              />
            )}
            <TextInput
              label="Email"
              type="email"
              {...form.getInputProps('email')}
              error={form.errors.email}
              placeholder="exemplo@email.com"
              styles={inputStyles}
            />
            <TextInput
              label="Alergias"
              {...form.getInputProps('alergias')}
              placeholder="Ex: Amendoim, frutos do mar..."
              styles={inputStyles}
            />
            <TextInput
              label="Acompanhantes"
              type="number"
              min={0}
              {...form.getInputProps('acompanhantes')}
              placeholder="0"
              styles={inputStyles}
            />
            <TextInput
              label="Observações"
              {...form.getInputProps('observacoes')}
              placeholder="Observações adicionais"
              styles={inputStyles}
            />
            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={() => setModalOpen(false)} type="button" styles={softButtonStyles}>
                Cancelar
              </Button>
              <Button type="submit" styles={primaryButtonStyles}>Salvar</Button>
            </Group>
          </Stack>
        </form>
      </Modal>
      <Modal
        opened={advancedFilterOpen}
        onClose={() => setAdvancedFilterOpen(false)}
        title="Filtro avançado"
        centered
        size="sm"
        overlayProps={{ blur: 2 }}
      >
        <Stack gap="md">
          <Group gap="sm" grow>
            <Stack gap="xs" style={{ flex: 1 }}>
              <Text size="sm" fw={600}>Acompanhantes</Text>
              <RangeSlider
                min={0}
                max={maxCompanionsValue}
                value={companionsRange}
                onChange={setCompanionsRange}
                minRange={0}
                label={value => `${value}`}
                styles={{ track: { backgroundColor: 'var(--marriplan-border)' }, bar: { backgroundColor: 'var(--marriplan-rose)' }, thumb: { borderColor: 'var(--marriplan-rose)' } }}
              />
              <Text size="xs" c="dimmed">{companionsRange[0]} a {companionsRange[1]} acompanhantes</Text>
            </Stack>
          </Group>
          <Stack gap="xs">
            <Text size="sm" fw={600}>WhatsApp</Text>
            <Select
              value={whatsappFilter}
              onChange={value => setWhatsappFilter((value as 'all' | 'with' | 'without') || 'all')}
              data={[
                { value: 'all', label: 'Todos' },
                { value: 'with', label: 'Com WhatsApp' },
                { value: 'without', label: 'Sem WhatsApp' },
              ]}
              styles={inputStyles}
            />
          </Stack>
          <Stack gap="xs">
            <Text size="sm" fw={600}>Alergia</Text>
            <Select
              value={allergyFilter}
              onChange={value => setAllergyFilter((value as 'all' | 'with' | 'without') || 'all')}
              data={[
                { value: 'all', label: 'Todos' },
                { value: 'with', label: 'Com alergia' },
                { value: 'without', label: 'Sem alergia' },
              ]}
              styles={inputStyles}
            />
          </Stack>
          <Group justify="space-between" mt="sm">
            <Button
              variant="default"
              styles={softButtonStyles}
              onClick={() => {
                setCompanionsRange([0, maxCompanionsValue]);
                setWhatsappFilter('all');
                setAllergyFilter('all');
              }}
            >
              Limpar filtros
            </Button>
            <Button styles={primaryButtonStyles} onClick={() => setAdvancedFilterOpen(false)}>
              Aplicar
            </Button>
          </Group>
        </Stack>
      </Modal>
      <ImportGuestsModal
        opened={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onSuccess={() => {
          setImportModalOpen(false);
          // Refresh guests list after successful import
          guests_list({ page, page_size: recordsPerPage, search, ordering: sortStatus.columnAccessor ? `${sortStatus.direction === 'desc' ? '-' : ''}${sortStatus.columnAccessor}` : '' })
            .then(data => {
              setGuests(data.results || []);
              setTotalRecords(data.count || 0);
            });
        }}
      />
      {/* Responsividade customizada para mobile */}
      <style>{`
        @media (max-width: 600px) {
          .mantine-DataTable-table {
            font-size: 13px;
          }
          .mantine-DataTable-table th, .mantine-DataTable-table-td {
            padding: 8px 4px;
          }
        }
        .guest-table .mantine-Pagination-control {
          border-radius: 12px;
          border-color: var(--marriplan-border);
          color: var(--marriplan-text);
        }
        .guest-table .mantine-Pagination-control[data-active] {
          background-color: var(--marriplan-rose);
          border-color: var(--marriplan-rose);
          color: #fff;
        }
        .guest-pagination .mantine-Pagination-control {
          border-radius: 12px;
          border-color: var(--marriplan-border);
          color: var(--marriplan-text);
        }
        .guest-pagination .mantine-Pagination-control[data-active] {
          background-color: var(--marriplan-rose);
          border-color: var(--marriplan-rose);
          color: #fff;
        }
      `}</style>
    </Stack>
  );
}

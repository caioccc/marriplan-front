import { GiftFormModal } from '@/components/GiftFormModal';
import BaseLayout from '@/components/Layout/_BaseLayout';
import { giftsService } from '@/services/giftsService';
import { guests_list } from '@/services/guests';
import { Gift } from '@/types/gift';
import { Box, Button, Group, Modal, SegmentedControl, Select, Text, TextInput, Title } from '@mantine/core';
import { IconBrandFacebook, IconBrandWhatsapp, IconCopy, IconGift, IconSearch, IconShare, IconCheck, IconEye, IconEdit, IconRefresh, IconShoppingCart, IconStatusChange } from '@tabler/icons-react';
import { DataTable } from 'mantine-datatable';
import { NextPage } from 'next';
import { useEffect, useRef, useState } from 'react';
import { Tooltip, Badge, ActionIcon } from '@mantine/core';
import { MarkAsPurchasedModal } from '@/components/MarkAsPurchasedModal';

const statusOptions = [
  { label: 'Todos', value: '' },
  { label: 'Disponíveis', value: 'available' },
  { label: 'Comprados', value: 'purchased' },
  { label: 'Reservados', value: 'reserved' },
];

const statusLabels: Record<string, { label: string; color: string }> = {
  available: { label: 'Disponível', color: 'gray' },
  purchased: { label: 'Comprado', color: 'green' },
  reserved: { label: 'Reservado', color: 'yellow' },
};

const categoryOptions = [
  { value: '', label: 'Todas' },
  { value: 'home', label: 'Casa' },
  { value: 'kitchen', label: 'Cozinha' },
  { value: 'decor', label: 'Decoração' },
];

const GiftsPage: NextPage = () => {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGift, setEditingGift] = useState<Gift | undefined>();
  const [shareModal, setShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [markModal, setMarkModal] = useState<{ open: boolean; gift?: Gift }>({ open: false });
  const [guests, setGuests] = useState<{ id: string; name: string }[]>([]); // Simulação, pode buscar do backend
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLoading(true);
    giftsService.listGifts({ page, status, search, category })
      .then((res) => {
        setGifts(res.results);
        setTotal(res.count);
      })
      .finally(() => setLoading(false));
    guests_list({ page_size: 1000 }).then(res => {
      setGuests(res.results.map((g: { id: string; name: string }) => ({ id: g.id, name: g.name })));
    });
  }, [status, page, search, category]);

  const handleMarkAsPurchased = (gift: Gift) => {
    setMarkModal({ open: true, gift });
  };
  const handleMarkAsAvailable = async (gift: Gift) => {
    setLoading(true);
    await giftsService.updateGift(gift.id, { status: 'available', purchased_by: '' });
    giftsService.listGifts({ page, status, search, category })
      .then((res) => {
        setGifts(res.results);
        setTotal(res.count);
      })
      .finally(() => setLoading(false));
  };
  const handleConfirmMark = async (purchasedBy: string) => {
    if (!markModal.gift) return;
    setLoading(true);
    await giftsService.markAsPurchased(markModal.gift.id, { purchased_by: purchasedBy });
    giftsService.listGifts({ page, status, search, category })
      .then((res) => {
        setGifts(res.results);
        setTotal(res.count);
      })
      .finally(() => setLoading(false));
    setMarkModal({ open: false });
  };

  const handleShare = async () => {
    setLoading(true);
    try {
      const res = await giftsService.getShareToken();
      const token = res.token;
      setShareUrl(`${window.location.origin}/gifts/share/${token}`);
      setShareModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    setLoading(true);
    try {
      const blob = await giftsService.downloadTemplate();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'modelo_lista_presentes.xlsx');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch {
      // Tratar erro
    } finally {
      setLoading(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setImporting(true);
    setImportError(null);
    setImportSuccess(null);
    const formData = new FormData();
    formData.append('file', e.target.files[0]);
    try {
      await giftsService.importGifts(formData);
      setImportSuccess('Importação realizada com sucesso!');
      // Atualiza lista
      giftsService.listGifts({ page, status, search, category })
        .then((res) => {
          setGifts(res.results);
          setTotal(res.count);
        });
    } catch (err) {
      setImportError((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Erro ao importar planilha.');
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleExportPDF = async () => {
    setLoading(true);
    try {
      const blob = await giftsService.exportPDF({ status, search, category });
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'lista_presentes.pdf');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch {
      // Tratar erro
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseLayout title="Lista de Presentes" loading={loading}>
      <Box>
        <Group justify="space-between" mb="md">

          <Title order={2}>
            Lista de Presentes
          </Title>
          <Group>
            <Button onClick={handleDownloadTemplate} variant="light">Baixar modelo</Button>
            <Button onClick={handleImportClick} loading={importing} variant="light">Importar planilha</Button>
            <input type="file" accept=".xlsx,.xls,.csv" ref={fileInputRef} style={{ display: 'none' }} onChange={handleImportChange} />
            <Button onClick={handleExportPDF} variant="light">Exportar PDF</Button>
            <Button leftSection={<IconShare size={18} />} variant="outline" onClick={handleShare}>Compartilhar lista</Button>
            <Button onClick={() => { setEditingGift(undefined); setModalOpen(true); }}>Adicionar Presente</Button>
          </Group>
        </Group>
        <Group mb="md">
          <TextInput
            leftSection={<IconSearch size={16} />}
            placeholder="Buscar presente..."
            value={search}
            onChange={e => setSearch(e.currentTarget.value)}
            w={220}
          />
          <Select
            placeholder="Categoria"
            value={category}
            onChange={setCategory}
            data={categoryOptions}
            w={160}
            clearable
          />
          <SegmentedControl
            data={statusOptions.map(opt => ({ ...opt, label: statusLabels[opt.value]?.label || opt.label }))}
            value={status}
            onChange={setStatus}
          />
        </Group>
        <DataTable
          records={gifts}
          columns={[
            { accessor: 'name', title: 'Nome' },
            { accessor: 'value', title: 'Valor', render: (g) => `R$ ${g.value}` },
            { accessor: 'category', title: 'Categoria', render: (g) => categoryOptions.find(c => c.value === g.category)?.label || g.category },
            { accessor: 'status', title: 'Status', render: (g) => <Badge color={statusLabels[g.status]?.color}>{statusLabels[g.status]?.label}</Badge> },
            {
              accessor: 'actions',
              title: 'Ações',
              render: (g) => (
                <Group gap={4}>
                  {g.status === 'available' && (
                    <Tooltip label="Marcar como comprado">
                      <ActionIcon color="green" onClick={() => handleMarkAsPurchased(g)}><IconCheck size={18} /></ActionIcon>
                    </Tooltip>
                  )}
                  {(g.status === 'purchased' || g.status === 'reserved') && (
                    <Tooltip label="Marcar como disponível">
                      <ActionIcon color="gray" onClick={() => handleMarkAsAvailable(g)}><IconStatusChange size={18} /></ActionIcon>
                    </Tooltip>
                  )}
                  {g.link && (
                    <Tooltip label="Ver presente">
                      <ActionIcon color="blue" onClick={() => window.open(g.link, '_blank')}><IconEye size={18} /></ActionIcon>
                    </Tooltip>
                  )}
                  <Tooltip label="Editar">
                    <ActionIcon color="orange" onClick={() => { setEditingGift(g); setModalOpen(true); }}><IconEdit size={18} /></ActionIcon>
                  </Tooltip>
                </Group>
              )
            },
          ]}
          fetching={loading}
          totalRecords={total}
          page={page}
          onPageChange={setPage}
          recordsPerPage={10}
          minHeight={300}
          highlightOnHover
          withBorder
        />
        <GiftFormModal
          opened={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={() => {
            setLoading(true);
            giftsService.listGifts({ page, status, search, category })
              .then((res) => {
                setGifts(res.results);
                setTotal(res.count);
              })
              .finally(() => setLoading(false));
            setModalOpen(false);
            setEditingGift(undefined);
          }}
          initial={editingGift}
        />
        <MarkAsPurchasedModal
          opened={markModal.open}
          onClose={() => setMarkModal({ open: false })}
          onConfirm={handleConfirmMark}
          guests={guests}
        />
        <Modal opened={shareModal} onClose={() => setShareModal(false)} title="Compartilhar Lista de Presentes">
          <Text>Compartilhe sua lista com convidados:</Text>
          <Group mt="md">
            <Button leftSection={<IconCopy size={16} />} onClick={() => { navigator.clipboard.writeText(shareUrl); }}>Copiar link</Button>
            <Button leftSection={<IconBrandWhatsapp size={16} />} component="a" href={`https://wa.me/?text=${encodeURIComponent('Veja nossa lista de presentes: ' + shareUrl)}`} target="_blank">WhatsApp</Button>
            <Button leftSection={<IconBrandFacebook size={16} />} component="a" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank">Facebook</Button>
          </Group>
          <Text mt="md" size="sm" color="dimmed">Link público: <a href={shareUrl} target="_blank" rel="noopener noreferrer">{shareUrl}</a></Text>
        </Modal>
        {importError && <Text color="red" size="sm">{importError}</Text>}
        {importSuccess && <Text color="green" size="sm">{importSuccess}</Text>}
      </Box>
    </BaseLayout>
  );
};

export default GiftsPage;

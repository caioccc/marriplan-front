import { giftsService } from '@/services/giftsService';
import { Gift } from '@/types/gift';
import { ActionIcon, Badge, Box, Button, Group, Modal as MantineModal, Modal, Notification, NumberInput, Select, Textarea, TextInput } from '@mantine/core';
import { IconBox, IconCheck, IconEye, IconGift, IconHeart, IconHome, IconStatusChange, IconTrash } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

interface GiftFormModalProps {
  opened: boolean;
  onClose: () => void;
  onSave: (gift: Gift) => void;
  initial?: Partial<Gift>;
}

export function GiftFormModal({ opened, onClose, onSave, initial }: GiftFormModalProps) {
  const [form, setForm] = useState<Partial<Gift>>(initial || {});
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Ícones disponíveis
  const iconOptions = [
    { value: 'gift', label: 'Presente', icon: <IconGift size={18} /> },
    { value: 'box', label: 'Caixa', icon: <IconBox size={18} /> },
    { value: 'home', label: 'Casa', icon: <IconHome size={18} /> },
    { value: 'heart', label: 'Coração', icon: <IconHeart size={18} /> },
    // Adicione mais se quiser
  ];

  const handleChange = (field: keyof Gift, value: any) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.name || !form.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (form.value === undefined || form.value === null || isNaN(Number(form.value))) newErrors.value = 'Valor é obrigatório';
    if (!form.category) newErrors.category = 'Categoria é obrigatória';
    return newErrors;
  };

  const handleSubmit = async () => {
    setErrors({});
    setSubmitError(null);
    const validation = validate();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }
    setLoading(true);
    try {
      let gift;
      if (form.id) {
        gift = await giftsService.updateGift(form.id, form);
      } else {
        gift = await giftsService.createGift(form);
      }
      onSave(gift);
      onClose();
    } catch (e: any) {
      setSubmitError(e?.response?.data?.detail || 'Erro ao salvar presente.');
    } finally {
      setLoading(false);
    }
  };

  // Limpa o formulário ao abrir para adicionar
  useEffect(() => {
    if (opened && (!initial || !initial.id)) {
      setForm({});
      setErrors({});
      setSubmitError(null);
    } else if (opened && initial) {
      setForm(initial);
      setErrors({});
      setSubmitError(null);
    }
  }, [opened, initial]);

  return (
    <Modal opened={opened} onClose={onClose} title={form.id ? 'Editar Presente' : 'Adicionar Presente'} size="xl">
      <Box>
        {submitError && <Notification color="red" mb="sm">{submitError}</Notification>}
        {/* Visualização de detalhes */}
        {/* {form.id && (
          <Group mb="sm">
            <ActionIcon color="blue" onClick={() => setShowDetails(true)} title="Ver detalhes"><IconEye /></ActionIcon>
            <ActionIcon color="red" onClick={async () => { setLoading(true); await giftsService.deleteGift(form.id!); setLoading(false); onClose(); }} title="Excluir"><IconTrash /></ActionIcon>
            {form.status !== 'purchased' ? (
              <ActionIcon color="green" onClick={async () => { setLoading(true); await giftsService.markAsPurchased(form.id!, {}); setLoading(false); onClose(); }} title="Marcar como comprado"><IconCheck /></ActionIcon>
            ) : (
              <ActionIcon color="gray" onClick={async () => { setLoading(true); await giftsService.unmarkAsPurchased(form.id!); setLoading(false); onClose(); }} title="Marcar como disponível"><IconStatusChange /></ActionIcon>
            )}
            <Badge color={form.status === 'purchased' ? 'green' : form.status === 'reserved' ? 'yellow' : 'gray'}>{form.status}</Badge>
          </Group>
        )} */}
        <TextInput label="Nome" required value={form.name || ''} onChange={e => handleChange('name', e.target.value)} mb="sm" error={errors.name} />
        <NumberInput label="Valor" required value={form.value || 0} onChange={v => handleChange('value', v)} mb="sm" min={0} prefix="R$ " error={errors.value} />
        <TextInput label="Link" value={form.link || ''} onChange={e => handleChange('link', e.target.value)} mb="sm" />
        <Textarea label="Descrição" value={form.description || ''} onChange={e => handleChange('description', e.target.value)} mb="sm" />
        <Select label="Categoria" required value={form.category || ''} onChange={v => handleChange('category', v)} data={[
          { value: 'home', label: 'Casa' },
          { value: 'travel', label: 'Viagem' },
          { value: 'money', label: 'Dinheiro' },
          { value: 'other', label: 'Outros' },
          { value: 'experience', label: 'Experiência' },
          { value: 'charity', label: 'Caridade' },
          { value: 'electronics', label: 'Eletrônicos' },
          { value: 'furniture', label: 'Móveis' },
          { value: 'kitchen', label: 'Cozinha' },
          { value: 'clothing', label: 'Roupas' },
          { value: 'books', label: 'Livros' },
          { value: 'toys', label: 'Brinquedos' },
          { value: 'jewelry', label: 'Joias' },
          { value: 'decor', label: 'Decoração' },
          { value: 'gift_card', label: 'Cartão Presente' },
        ]} mb="sm" error={errors.category} />
        <Select label="Ícone" value={form.icon || ''} onChange={v => handleChange('icon', v)} data={iconOptions.map(opt => ({ value: opt.value, label: opt.label, icon: opt.icon }))} itemComponent={({ value, label, ...rest }) => <Group><span>{iconOptions.find(i => i.value === value)?.icon}</span><span>{label}</span></Group>} mb="sm" />
        <Select label="Status" required value={form.status || 'available'} onChange={v => handleChange('status', v)} data={[
          { value: 'available', label: 'Disponível' },
          { value: 'purchased', label: 'Comprado' },
          { value: 'reserved', label: 'Reservado' },
        ]} mb="sm" error={errors.status} />
        {/* <ImageUpload label="Imagem" value={form.image} onChange={handleImageUpload} mb="sm" /> */}
        <Group mt="md" justify="flex-end">
          <Button onClick={onClose} variant="default">Cancelar</Button>
          <Button onClick={handleSubmit} loading={loading}>{form.id ? 'Salvar' : 'Adicionar'}</Button>
        </Group>
        {/* Modal de detalhes */}
        <MantineModal opened={showDetails} onClose={() => setShowDetails(false)} title="Detalhes do Presente" size="lg">
          <Box>
            <TextInput label="Nome" value={form.name || ''} readOnly mb="sm" />
            <TextInput label="Valor" value={form.value || ''} readOnly mb="sm" />
            <TextInput label="Categoria" value={form.category || ''} readOnly mb="sm" />
            <TextInput label="Status" value={form.status || ''} readOnly mb="sm" />
            <TextInput label="Comprado por" value={form.purchased_by || ''} readOnly mb="sm" />
            <TextInput label="Data da compra" value={form.purchase_date || ''} readOnly mb="sm" />
            <TextInput label="Código do produto" value={form.product_code || ''} readOnly mb="sm" />
            <Textarea label="Descrição" value={form.description || ''} readOnly mb="sm" />
          </Box>
        </MantineModal>
      </Box>
    </Modal>
  );
}

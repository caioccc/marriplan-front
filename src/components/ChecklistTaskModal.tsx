import { useEffect, useState } from 'react';
import { Modal, TextInput, Button, Group, Select, DateInput, FileInput, Textarea } from '@mantine/core';
import { ChecklistTask, ChecklistTaskPriority, ChecklistTaskStatus } from '@/types/checklist';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { primaryButtonStylesWithDisabled } from '@/styles';

const PRIORITY_OPTIONS = [
  { value: 'high', label: 'Alta' },
  { value: 'medium', label: 'Média' },
  { value: 'low', label: 'Baixa' },
];
const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pendente' },
  { value: 'in_progress', label: 'Em Andamento' },
  { value: 'done', label: 'Concluído' },
];

interface ChecklistTaskModalProps {
  opened: boolean;
  onClose: () => void;
  onSave: (task: Partial<ChecklistTask>, file?: File) => void;
  initial?: Partial<ChecklistTask>;
}

export default function ChecklistTaskModal({ opened, onClose, onSave, initial }: ChecklistTaskModalProps) {
  const [description, setDescription] = useState(initial?.description || '');
  const [startDate, setStartDate] = useState<Date | null>(initial?.start_date ? new Date(initial.start_date) : null);
  const [dueDate, setDueDate] = useState<Date | null>(initial?.due_date ? new Date(initial.due_date) : null);
  const [priority, setPriority] = useState<ChecklistTaskPriority>(initial?.priority || 'medium');
  const [status, setStatus] = useState<ChecklistTaskStatus>(initial?.status || 'pending');
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState(initial?.notes || '');

  const isEditing = Boolean(initial?.id);
  const isValid = Boolean(description.trim()) && !!startDate && !!dueDate;

  useEffect(() => {
    setDescription(initial?.description || '');
    setStartDate(initial?.start_date ? new Date(initial.start_date) : null);
    setDueDate(initial?.due_date ? new Date(initial.due_date) : null);
    setPriority(initial?.priority || 'medium');
    setStatus(initial?.status || 'pending');
    setFile(null);
    setNotes(initial?.notes || '');
  }, [initial, opened]);

  function handleSave() {
    onSave({
      description,
      start_date: startDate?.toISOString().slice(0, 10),
      due_date: dueDate?.toISOString().slice(0, 10),
      priority,
      status,
      notes,
    }, file || undefined);
  }

  return (
    <Modal opened={opened} onClose={onClose} title={isEditing ? 'Editar Tarefa' : 'Adicionar Tarefa'}>
      <TextInput label="Descrição" value={description} onChange={e => setDescription(e.currentTarget.value)} required mb="sm" />

      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
        <Group grow mb="sm">
          <DatePicker
            label="Início"
            value={startDate}
            onChange={setStartDate}
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
          <DatePicker
            label="Vencimento"
            value={dueDate}
            onChange={setDueDate}
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
        </Group>
      </LocalizationProvider>
      <Group grow mb="sm" mt="lg">
        <Select label="Prioridade" data={PRIORITY_OPTIONS} value={priority} onChange={v => setPriority(v as ChecklistTaskPriority)} required />
        <Select label="Status" data={STATUS_OPTIONS} value={status} onChange={v => setStatus(v as ChecklistTaskStatus)} required />
      </Group>
      <Textarea label="Notas" value={notes} onChange={e => setNotes(e.currentTarget.value)} mb="sm" />
      {/* <FileInput label="Anexo (opcional)" value={file} onChange={setFile} mb="sm" /> */}
      <Group position="right">
        <Button onClick={onClose} variant="default">Cancelar</Button>
        <Button onClick={handleSave} disabled={!isValid} styles={primaryButtonStylesWithDisabled}>
          {isEditing ? 'Salvar' : 'Adicionar'}
        </Button>
      </Group>
    </Modal>
  );
}

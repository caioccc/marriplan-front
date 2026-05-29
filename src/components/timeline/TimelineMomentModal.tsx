import { inputStyles, primaryButtonStylesWithDisabled, softButtonStyles } from '@/styles';
import { TimelineMoment, TimelineMomentPayload } from '@/types/timeline';
import { Button, Group, Modal, Textarea, TextInput } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { ptBR } from 'date-fns/locale/pt-BR';
import { useEffect, useMemo, useState } from 'react';
import { MobileFullscreenModal } from '@/components/MobileFullscreenModal';

type TimelineMomentModalProps = {
  opened: boolean;
  onClose: () => void;
  onSave: (payload: TimelineMomentPayload) => Promise<void> | void;
  initialMoment?: TimelineMoment | null;
};

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

function parseTimeToDate(value?: string | null) {
  if (!value) return null;
  const parts = String(value).split(':');
  const hours = Number(parts[0]);
  const minutes = Number(parts[1] ?? 0);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

export function TimelineMomentModal({
  opened,
  onClose,
  onSave,
  initialMoment,
}: TimelineMomentModalProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [time, setTime] = useState<Date | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<{ time?: string; title?: string }>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!opened) {
      return;
    }
    setTime(parseTimeToDate(initialMoment?.time ?? null));
    setTitle(initialMoment?.title ?? '');
    setDescription(initialMoment?.description ?? '');
    setErrors({});
  }, [opened, initialMoment]);

  const isValid = useMemo(() => {
    return Boolean(time) && title.trim().length > 0;
  }, [time, title]);

  const handleSave = async () => {
    const nextErrors: { time?: string; title?: string } = {};
    if (!time) {
      nextErrors.time = 'Informe um horário válido no formato 24h.';
    }
    if (!title.trim()) {
      nextErrors.title = 'O título é obrigatório.';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSaving(true);
    try {
      await onSave({
        time: time.toTimeString().slice(0, 5),
        title: title.trim(),
        description: description.trim(),
      });
    } finally {
      setSaving(false);
    }
  };

  const content = (
    <>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
        <TimePicker
          label="Horário"
          value={time}
          onChange={(value) => setTime(value)}
          ampm={false}
          minutesStep={1}
          slotProps={{
            textField: {
              fullWidth: true,
              placeholder: '00:00',
              error: Boolean(errors.time),
              helperText: errors.time,
            },
          }}
        />
      </LocalizationProvider>
      <TextInput
        label="Título"
        placeholder="Entrada da noiva"
        required
        value={title}
        onChange={(event) => setTitle(event.currentTarget.value)}
        error={errors.title}
        styles={inputStyles}
        mb="sm"
        mt="md"
      />
      <Textarea
        label="Descrição"
        placeholder="Detalhes do momento, observações para cerimonial, etc."
        value={description}
        onChange={(event) => setDescription(event.currentTarget.value)}
        minRows={4}
        styles={inputStyles}
      />
    </>
  );

  const footer = (
    <Group grow>
      <Button variant="default" onClick={onClose} styles={softButtonStyles}>
        Cancelar
      </Button>
      <Button onClick={handleSave} disabled={!isValid} loading={saving} styles={primaryButtonStylesWithDisabled}>
        Salvar
      </Button>
    </Group>
  );

  if (isMobile) {
    return (
      <MobileFullscreenModal
        opened={opened}
        onClose={onClose}
        title={initialMoment ? 'Editar momento' : 'Novo momento'}
        footer={footer}
      >
        {content}
      </MobileFullscreenModal>
    );
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={initialMoment ? 'Editar momento' : 'Novo momento'}
      centered
      radius="lg"
      size="lg"
    >
      {content}
      <Group justify="flex-end" mt="md">
        <Button variant="default" onClick={onClose} styles={softButtonStyles}>
          Cancelar
        </Button>
        <Button onClick={handleSave} disabled={!isValid} loading={saving} styles={primaryButtonStylesWithDisabled}>
          Salvar
        </Button>
      </Group>
    </Modal>
  );
}

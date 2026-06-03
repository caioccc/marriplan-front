import { MobileFullscreenModal } from "@/components/MobileFullscreenModal";
import { toSentenceCase } from "@/lib/text";
import { primaryButtonStylesWithDisabled } from "@/styles";
import {
  ChecklistTask,
  ChecklistTaskPriority,
  ChecklistTaskStatus,
} from "@/types/checklist";
import {
  Button,
  Group,
  Modal,
  Select,
  Textarea,
  TextInput,
} from "@mantine/core";
import { DatePickerInput, DatesProvider } from "@mantine/dates";
import { useMediaQuery } from "@mantine/hooks";
import { useEffect, useState } from "react";

function getDefaultTaskDates() {
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);

  const dueDate = new Date(startDate);
  dueDate.setDate(dueDate.getDate() + 1);

  return { startDate: startDate.toISOString().slice(0, 10), dueDate: dueDate.toISOString().slice(0, 10) };
}

const PRIORITY_OPTIONS = [
  { value: "high", label: "Alta" },
  { value: "medium", label: "Média" },
  { value: "low", label: "Baixa" },
];
const STATUS_OPTIONS = [
  { value: "pending", label: "Pendente" },
  { value: "in_progress", label: "Em Andamento" },
  { value: "done", label: "Concluído" },
];

interface ChecklistTaskModalProps {
  opened: boolean;
  onClose: () => void;
  onSave: (task: Partial<ChecklistTask>, file?: File) => void;
  initial?: Partial<ChecklistTask>;
}

export default function ChecklistTaskModal({
  opened,
  onClose,
  onSave,
  initial,
}: ChecklistTaskModalProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const defaultDates = getDefaultTaskDates();
  const [description, setDescription] = useState(initial?.description || "");
  const [startDate, setStartDate] = useState<string | null>(
    initial?.start_date ?initial.start_date : defaultDates.startDate,
  );
  const [dueDate, setDueDate] = useState<string | null>(
    initial?.due_date ? initial.due_date : defaultDates.dueDate,
  );
  const [priority, setPriority] = useState<ChecklistTaskPriority>(
    initial?.priority || "medium",
  );
  const [status, setStatus] = useState<ChecklistTaskStatus>(
    initial?.status || "pending",
  );
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState(initial?.notes || "");

  const isEditing = Boolean(initial?.id);
  const isValid = Boolean(description.trim()) && !!startDate && !!dueDate;

  useEffect(() => {
    const { startDate: nextStartDate, dueDate: nextDueDate } =
      getDefaultTaskDates();

    setDescription(initial?.description || "");
    setStartDate(
      initial?.start_date ? initial.start_date : nextStartDate,
    );
    setDueDate(initial?.due_date ? initial.due_date : nextDueDate);
    setPriority(initial?.priority || "medium");
    setStatus(initial?.status || "pending");
    setFile(null);
    setNotes(initial?.notes || "");
  }, [initial, opened]);

  function handleSave() {
    onSave(
      {
        description: toSentenceCase(description),
        start_date: startDate || undefined,
        due_date: dueDate || undefined,
        priority,
        status,
        notes: toSentenceCase(notes),
      },
      file || undefined,
    );
  }

  const formFields = (
    <>
      <TextInput
        label="Descrição"
        value={description}
        onChange={(e) => setDescription(e.currentTarget.value)}
        required
        mb="sm"
      />

      <Group grow mb="sm">
        <DatesProvider settings={{ locale: "pt-br" }}>
          <DatePickerInput
            label="Início"
            value={startDate}
            onChange={(date) => setStartDate(date || null)}
            valueFormat="DD/MM/YYYY"
          />
          <DatePickerInput
            label="Vencimento"
            value={dueDate}
            onChange={(date) => setDueDate(date || null)}
            valueFormat="DD/MM/YYYY"
          />
        </DatesProvider>
      </Group>
      <Group grow mb="sm" mt="lg">
        <Select
          label="Prioridade"
          data={PRIORITY_OPTIONS}
          value={priority}
          onChange={(v) => setPriority(v as ChecklistTaskPriority)}
          required
        />
        <Select
          label="Status"
          data={STATUS_OPTIONS}
          value={status}
          onChange={(v) => setStatus(v as ChecklistTaskStatus)}
          required
        />
      </Group>
      <Textarea
        label="Notas"
        value={notes}
        onChange={(e) => setNotes(e.currentTarget.value)}
        mb="sm"
      />
    </>
  );

  const formFooter = (
    <Group grow>
      <Button onClick={onClose} variant="default" fullWidth>
        Cancelar
      </Button>
      <Button
        onClick={handleSave}
        disabled={!isValid}
        styles={primaryButtonStylesWithDisabled}
        fullWidth
      >
        {isEditing ? "Salvar" : "Adicionar"}
      </Button>
    </Group>
  );

  if (isMobile) {
    return (
      <MobileFullscreenModal
        opened={opened}
        onClose={onClose}
        title={isEditing ? "Editar Tarefa" : "Adicionar Tarefa"}
        footer={formFooter}
      >
        {formFields}
      </MobileFullscreenModal>
    );
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEditing ? "Editar Tarefa" : "Adicionar Tarefa"}
    >
      {formFields}
      {/* <FileInput label="Anexo (opcional)" value={file} onChange={setFile} mb="sm" /> */}
      <Group justify="flex-end">
        <Button onClick={onClose} variant="default">
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          disabled={!isValid}
          styles={primaryButtonStylesWithDisabled}
        >
          {isEditing ? "Salvar" : "Adicionar"}
        </Button>
      </Group>
    </Modal>
  );
}

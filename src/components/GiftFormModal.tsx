import { getAllCategoryOptions, getCategoryLabel } from "@/lib/giftCategories";
import { toSentenceCase, toUpperCamelWords } from "@/lib/text";
import { giftsService } from "@/services/giftsService";
import { inputStyles, primaryButtonStylesWithDisabled } from "@/styles";
import { Gift } from "@/types/gift";
import {
  Box,
  Button,
  Group,
  Modal as MantineModal,
  Modal,
  Notification,
  Select,
  Textarea,
  TextInput,
} from "@mantine/core";
import { IconBox, IconGift, IconHeart, IconHome } from "@tabler/icons-react";
import { useEffect, useState } from "react";

interface GiftFormModalProps {
  opened: boolean;
  onClose: () => void;
  onSave: (gift: Gift) => void;
  initial?: Partial<Gift>;
}

export function GiftFormModal({
  opened,
  onClose,
  onSave,
  initial,
}: GiftFormModalProps) {
  const [form, setForm] = useState<Partial<Gift>>(initial || {});
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Ícones disponíveis
  const iconOptions = [
    { value: "gift", label: "Presente", icon: <IconGift size={18} /> },
    { value: "box", label: "Caixa", icon: <IconBox size={18} /> },
    { value: "home", label: "Casa", icon: <IconHome size={18} /> },
    { value: "heart", label: "Coração", icon: <IconHeart size={18} /> },
    // Adicione mais se quiser
  ];

  const handleChange = (field: keyof Gift, value: string | number | null) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const [valueStr, setValueStr] = useState<string>("");

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.name || !form.name.trim()) newErrors.name = "Nome é obrigatório";
    if (
      form.value === undefined ||
      form.value === null ||
      isNaN(Number(form.value))
    )
      newErrors.value = "Valor é obrigatório";
    if (!form.category) newErrors.category = "Categoria é obrigatória";
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
      const payload = {
        ...form,
        name: toUpperCamelWords(form.name || ""),
        description: toSentenceCase(form.description || ""),
      };
      if (form.id) {
        gift = await giftsService.updateGift(form.id, payload);
      } else {
        gift = await giftsService.createGift(payload);
      }
      onSave(gift);
      onClose();
    } catch (e: any) {
      const errorMessage =
        e?.response?.data?.detail || "Erro ao salvar presente.";
      setSubmitError(String(errorMessage));
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
      setValueStr("");
    } else if (opened && initial) {
      setForm(initial);
      setErrors({});
      setSubmitError(null);
      setValueStr(
        initial?.value !== undefined && initial?.value !== null
          ? String(initial.value)
          : "",
      );
    }
  }, [opened, initial]);

  // Validação simples: habilita o botão apenas se nome, valor numérico e categoria preenchidos
  const isValid = (() => {
    if (!form.name || !form.name.trim()) return false;
    if (!form.category) return false;
    if (
      form.value === undefined ||
      form.value === null ||
      Number.isNaN(Number(form.value))
    )
      return false;
    return true;
  })();

  function handleValueChange(raw: string) {
    // permite dígitos, ponto e vírgula; converte vírgula para ponto
    let v = raw.replace(/[^\d.,]/g, "");
    v = v.replace(/,/g, ".");
    // remover zeros à esquerda quando não houver parte decimal
    if (!v.includes(".")) {
      v = v.replace(/^0+(?=\d)/, "");
    } else {
      const parts = v.split(".");
      parts[0] = parts[0].replace(/^0+(?=\d)/, "") || "0";
      v = parts.join(".");
    }
    setValueStr(v);
    setForm((f) => ({ ...f, value: v === "" ? undefined : Number(v) }));
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={form.id ? "Editar Presente" : "Adicionar Presente"}
      size="xl"
    >
      <Box>
        {submitError && (
          <Notification color="red" mb="sm">
            {submitError}
          </Notification>
        )}
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
        <TextInput
          label="Nome"
          required
          value={form.name || ""}
          onChange={(e) => handleChange("name", e.target.value)}
          mb="sm"
          error={errors.name}
          styles={inputStyles}
        />
        <TextInput
          label="Valor"
          required
          value={valueStr}
          onChange={(e) => handleValueChange(e.currentTarget.value)}
          mb="sm"
          placeholder="0.00"
          rightSection={<span style={{ paddingRight: 8 }}>R$</span>}
          error={errors.value}
          styles={inputStyles}
        />
        <TextInput
          label="Link"
          value={form.link || ""}
          onChange={(e) => handleChange("link", e.target.value)}
          mb="sm"
        />
        <Textarea
          label="Descrição"
          value={form.description || ""}
          onChange={(e) => handleChange("description", e.target.value)}
          mb="sm"
        />
        <Select
          label="Categoria"
          required
          value={form.category || ""}
          onChange={(v) => handleChange("category", v)}
          data={getAllCategoryOptions()}
          mb="sm"
          error={errors.category}
        />
        <Select
          label="Ícone"
          value={form.icon || ""}
          onChange={(v) => handleChange("icon", v)}
          data={iconOptions.map((opt) => ({
            value: opt.value,
            label: opt.label,
            icon: opt.icon,
          }))}
          mb="sm"
        />
        <Select
          label="Status"
          required
          value={form.status || "available"}
          onChange={(v) => handleChange("status", v)}
          data={[
            { value: "available", label: "Disponível" },
            { value: "purchased", label: "Comprado" },
            { value: "reserved", label: "Reservado" },
          ]}
          mb="sm"
          error={errors.status}
        />
        {/* <ImageUpload label="Imagem" value={form.image} onChange={handleImageUpload} mb="sm" /> */}
        <Group mt="md" justify="flex-end">
          <Button onClick={onClose} variant="default">
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            loading={loading}
            styles={
              isValid
                ? primaryButtonStylesWithDisabled
                : primaryButtonStylesWithDisabled
            }
            disabled={!isValid}
          >
            {form.id ? "Salvar" : "Adicionar"}
          </Button>
        </Group>
        {/* Modal de detalhes */}
        <MantineModal
          opened={showDetails}
          onClose={() => setShowDetails(false)}
          title="Detalhes do Presente"
          size="lg"
        >
          <Box>
            <TextInput label="Nome" value={form.name || ""} readOnly mb="sm" />
            <TextInput
              label="Valor"
              value={form.value || ""}
              readOnly
              mb="sm"
            />
            <TextInput
              label="Categoria"
              value={getCategoryLabel(form.category || "")}
              readOnly
              mb="sm"
            />
            <TextInput
              label="Status"
              value={form.status || ""}
              readOnly
              mb="sm"
            />
            <TextInput
              label="Comprado por"
              value={form.purchased_by || ""}
              readOnly
              mb="sm"
            />
            <TextInput
              label="Data da compra"
              value={form.purchase_date || ""}
              readOnly
              mb="sm"
            />
            <TextInput
              label="Código do produto"
              value={form.product_code || ""}
              readOnly
              mb="sm"
            />
            <Textarea
              label="Descrição"
              value={form.description || ""}
              readOnly
              mb="sm"
            />
          </Box>
        </MantineModal>
      </Box>
    </Modal>
  );
}

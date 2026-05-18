import {
    createSupplier,
    Supplier,
    SupplierCategory,
    updateSupplier,
} from "@/services/suppliers";
import { inputStyles, primaryButtonStyles, softButtonStyles } from "@/styles";
import {
    Button,
    Group,
    Modal,
    Select,
    Stack,
    Text,
    Textarea,
    TextInput
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useEffect, useMemo, useState } from "react";

type SupplierFormModalProps = {
  opened: boolean;
  mode: "create" | "edit";
  supplier?: Supplier | null;
  categories: SupplierCategory[];
  onClose: () => void;
  onSaved?: (supplier: Supplier) => void;
};

type SupplierFormState = {
  category_id: string;
  name: string;
  company_name: string;
  description: string;
  phone: string;
  cnpj: string;
  whatsapp: string;
  email: string;
  instagram: string;
  website: string;
  city: string;
  state: string;
  cover_image_url: string;
};

const emptyForm: SupplierFormState = {
  category_id: "",
  name: "",
  company_name: "",
  description: "",
  phone: "",
  cnpj: "",
  whatsapp: "",
  email: "",
  instagram: "",
  website: "",
  city: "",
  state: "",
  cover_image_url: "",
};

function getCategoryId(supplier?: Supplier | null) {
  if (!supplier) return "";
  if (supplier.category_id) return String(supplier.category_id);
  if (typeof supplier.category === "number") return String(supplier.category);
  if (supplier.category && typeof supplier.category === "object")
    return String(supplier.category.id);
  if (supplier.category_detail?.id) return String(supplier.category_detail.id);
  return "";
}

function buildFormState(supplier?: Supplier | null): SupplierFormState {
  if (!supplier) return emptyForm;

  return {
    category_id: getCategoryId(supplier),
    name: supplier.name || "",
    company_name: supplier.company_name || "",
    description: supplier.description || "",
    phone: supplier.phone || "",
    cnpj: supplier.cnpj || "",
    whatsapp: supplier.whatsapp || "",
    email: supplier.email || "",
    instagram: supplier.instagram || "",
    website: supplier.website || "",
    city: supplier.city || "",
    state: supplier.state || "",
    cover_image_url: supplier.cover_image_url || "",
  };
}

export function SupplierFormModal({
  opened,
  mode,
  supplier,
  categories,
  onClose,
  onSaved,
}: SupplierFormModalProps) {
  const [form, setForm] = useState<SupplierFormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const categoryOptions = useMemo(
    () =>
      categories.map((item) => ({ value: String(item.id), label: item.name })),
    [categories],
  );

  useEffect(() => {
    if (opened) {
      setForm(buildFormState(supplier));
      return;
    }

    setForm(emptyForm);
  }, [opened, supplier]);

  const handleClose = () => {
    if (saving) return;
    onClose();
  };

  const handleSave = async () => {
    if (!form.category_id || !form.name.trim()) {
      notifications.show({
        color: "red",
        message: "Selecione uma categoria e informe o nome.",
      });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        category_id: Number(form.category_id),
      };

      const saved =
        mode === "edit" && supplier
          ? await updateSupplier(supplier.id, payload)
          : await createSupplier({
              ...payload,
              status: "PENDING",
              is_featured: false,
              visibility: "SOLO",
            });

      notifications.show({
        color: "green",
        message:
          mode === "edit"
            ? "Fornecedor atualizado com sucesso."
            : "Fornecedor criado com status solo.",
      });
      onSaved?.(saved);
      onClose();
    } catch (error) {
      notifications.show({
        color: "red",
        message:
          mode === "edit"
            ? "Não foi possível atualizar o fornecedor."
            : "Não foi possível criar o fornecedor.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={mode === "edit" ? "Editar fornecedor" : "Novo fornecedor"}
      centered
      size="lg"
    >
      <Stack gap="md">
        <Group justify="space-between" align="center" wrap="wrap">
          <Text size="sm" c="dimmed">
            {mode === "edit"
              ? "Atualize as informações visíveis do fornecedor."
              : "Fornecedores criados por usuários começam como Solo."}
          </Text>
          {/* <Badge radius="xl" color={mode === 'edit' ? (supplier?.visibility === 'SOLO' ? 'pink' : 'green') : 'pink'} variant="light">
            {mode === 'edit' ? (supplier?.visibility === 'SOLO' ? 'Solo' : 'Global') : 'Solo'}
          </Badge> */}
        </Group>

        <Select
          label="Categoria"
          data={categoryOptions}
          value={form.category_id}
          onChange={(value) =>
            setForm((prev) => ({ ...prev, category_id: value || "" }))
          }
          required
          styles={inputStyles}
        />

        <Group grow align="flex-start" wrap="wrap">
          <TextInput
            label="Nome"
            value={form.name}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, name: event.currentTarget.value }))
            }
            required
            styles={inputStyles}
          />
          <TextInput
            label="Empresa"
            value={form.company_name}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                company_name: event.currentTarget.value,
              }))
            }
            styles={inputStyles}
          />
        </Group>

        <Textarea
          label="Descrição"
          minRows={3}
          value={form.description}
          onChange={(event) =>
            setForm((prev) => ({
              ...prev,
              description: event.currentTarget.value,
            }))
          }
          styles={inputStyles}
        />

        <Group grow align="flex-start" wrap="wrap">
          <TextInput
            label="Telefone"
            value={form.phone}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, phone: event.currentTarget.value }))
            }
            styles={inputStyles}
          />
          <TextInput
            label="WhatsApp"
            value={form.whatsapp}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                whatsapp: event.currentTarget.value,
              }))
            }
            styles={inputStyles}
          />
        </Group>

        <Group grow align="flex-start" wrap="wrap">
          <TextInput
            label="E-mail"
            value={form.email}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, email: event.currentTarget.value }))
            }
            styles={inputStyles}
          />
          <TextInput
            label="CNPJ"
            value={form.cnpj}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, cnpj: event.currentTarget.value }))
            }
            styles={inputStyles}
          />
        </Group>

        <Group grow align="flex-start" wrap="wrap">
          <TextInput
            label="Instagram"
            value={form.instagram}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                instagram: event.currentTarget.value,
              }))
            }
            styles={inputStyles}
          />
          <TextInput
            label="Website"
            value={form.website}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                website: event.currentTarget.value,
              }))
            }
            styles={inputStyles}
          />
        </Group>

        <Group grow align="flex-start" wrap="wrap">
          <TextInput
            label="Cidade"
            value={form.city}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, city: event.currentTarget.value }))
            }
            styles={inputStyles}
          />
          <TextInput
            label="Estado"
            value={form.state}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, state: event.currentTarget.value }))
            }
            styles={inputStyles}
          />
        </Group>

        <TextInput
          label="Imagem de capa"
          placeholder="URL da imagem (opcional)"
          value={form.cover_image_url}
          onChange={(event) =>
            setForm((prev) => ({
              ...prev,
              cover_image_url: event.currentTarget.value,
            }))
          }
          styles={inputStyles}
        />

        <Group justify="flex-end">
          <Button
            variant="default"
            styles={softButtonStyles}
            onClick={handleClose}
          >
            Cancelar
          </Button>
          <Button
            loading={saving}
            styles={primaryButtonStyles}
            onClick={handleSave}
          >
            {mode === "edit" ? "Salvar alterações" : "Criar fornecedor"}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

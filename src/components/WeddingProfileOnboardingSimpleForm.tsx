import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { toUpperCamelWords } from "@/lib/text";
import api from "@/services/api";
import { primaryButtonStyles, softButtonStyles } from "@/styles";
import {
  ActionIcon,
  Box,
  Button,
  Group,
  NumberInput,
  ScrollArea,
  Stack,
  Stepper,
  TextInput,
} from "@mantine/core";
import { DatePickerInput, DatesProvider, TimePicker } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useMediaQuery } from "@mantine/hooks";
import { IconCalendarClock } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { IMaskInput } from "react-imask";

type WeddingProfileOnboardingSimpleFormProps = {
  onComplete: () => void;
};

export default function WeddingProfileOnboardingSimpleForm({
  onComplete,
}: WeddingProfileOnboardingSimpleFormProps) {
  const { user, refreshUser } = useAuth();
  const initial = user?.wedding_profile ?? {};
  const { toast } = useToast();
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const [dropdownOpened, setDropdownOpened] = useState(false);

  const parseTimeToDate = (value?: string | null) => {
    if (!value) return null;
    const parts = String(value).split(":");
    const hours = Number(parts[0]);
    const minutes = Number(parts[1] ?? 0);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  const form = useForm({
    initialValues: {
      nome_noivo: initial.nome_noivo ?? "",
      telefone_noivo: initial.telefone_noivo ?? "",
      nome_noiva: initial.nome_noiva ?? "",
      telefone_noiva: initial.telefone_noiva ?? "",
      local: initial.local ?? "",
      data_casamento: initial.data_casamento ?? "",
      hora_casamento: parseTimeToDate(initial.hora_casamento),
      budget_limit: initial.budget_limit ?? undefined,
    },
    validate: {
      nome_noivo: (value) => (!value ? "Obrigatorio" : null),
      telefone_noivo: (value) =>
        !value || value.replace(/\D/g, "").length < 10 ? "Obrigatorio" : null,
      nome_noiva: (value) => (!value ? "Obrigatorio" : null),
      telefone_noiva: (value) =>
        !value || value.replace(/\D/g, "").length < 10 ? "Obrigatorio" : null,
    },
  });

  useEffect(() => {
    if (active === 0) {
      form.clearFieldError("nome_noivo");
      form.clearFieldError("telefone_noivo");
    }
    if (active === 1) {
      form.clearFieldError("nome_noiva");
      form.clearFieldError("telefone_noiva");
    }
    if (active === 2) {
      form.clearFieldError("local");
      form.clearFieldError("data_casamento");
      form.clearFieldError("hora_casamento");
      form.clearFieldError("budget_limit");
    }
  }, [active]);

  const validateStep = (step: number) => {
    if (step === 0) {
      let hasError = false;
      if (!form.values.nome_noivo) {
        form.setFieldError("nome_noivo", "Obrigatorio");
        hasError = true;
      }
      if (
        !form.values.telefone_noivo ||
        form.values.telefone_noivo.replace(/\D/g, "").length < 10
      ) {
        form.setFieldError("telefone_noivo", "Obrigatorio");
        hasError = true;
      }
      return !hasError;
    }

    if (step === 1) {
      let hasError = false;
      if (!form.values.nome_noiva) {
        form.setFieldError("nome_noiva", "Obrigatorio");
        hasError = true;
      }
      if (
        !form.values.telefone_noiva ||
        form.values.telefone_noiva.replace(/\D/g, "").length < 10
      ) {
        form.setFieldError("telefone_noiva", "Obrigatorio");
        hasError = true;
      }
      return !hasError;
    }

    if (step === 2) {
      return true;
    }

    return true;
  };

  const isStepValid = (step: number) => {
    if (step === 0) {
      return !!form.values.nome_noivo && !!form.values.telefone_noivo;
    }
    if (step === 1) {
      return !!form.values.nome_noiva && !!form.values.telefone_noiva;
    }
    if (step === 2) {
      return true;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateStep(0)) {
      setActive(0);
      return;
    }
    if (!validateStep(1)) {
      setActive(1);
      return;
    }
    if (!validateStep(2)) {
      setActive(2);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        nome_noivo: toUpperCamelWords(String(form.values.nome_noivo ?? "")),
        telefone_noivo: String(form.values.telefone_noivo ?? "").trim(),
        nome_noiva: toUpperCamelWords(String(form.values.nome_noiva ?? "")),
        telefone_noiva: String(form.values.telefone_noiva ?? "").trim(),
        budget_limit: form.values.budget_limit
          ? Number(form.values.budget_limit)
          : null,
        local: toUpperCamelWords(String(form.values.local ?? "")),
        data_casamento: form.values.data_casamento
          ? form.values.data_casamento instanceof Date
            ? form.values.data_casamento.toISOString().slice(0, 10)
            : String(form.values.data_casamento).slice(0, 10)
          : null,
        hora_casamento: form.values.hora_casamento
          ? form.values.hora_casamento instanceof Date
            ? form.values.hora_casamento.toTimeString().slice(0, 5)
            : String(form.values.hora_casamento).slice(0, 5)
          : null,
      };

      await api.patch("/api/wedding-profile/me/", payload);
      await refreshUser();
      toast({
        title: "Perfil salvo!",
        description: "Seu onboarding foi concluído com sucesso.",
      });
      onComplete();
    } catch {
      toast({
        title: "Erro",
        description:
          "Nao foi possivel salvar as informacoes. Verifique os campos.",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    if (step === 0) {
      return (
        <Stack gap="sm" style={{ width: "100%" }}>
          <TextInput
            label="Nome do noivo"
            {...form.getInputProps("nome_noivo")}
            required
            placeholder="Digite o nome do noivo"
          />
          <TextInput
            label="Telefone do noivo"
            {...form.getInputProps("telefone_noivo")}
            required
            placeholder="(00) 00000-0000"
            inputMode="tel"
            mask="(00) 00000-0000"
            component={IMaskInput}
          />
        </Stack>
      );
    }

    if (step === 1) {
      return (
        <Stack gap="sm" style={{ width: "100%" }}>
          <TextInput
            label="Nome da noiva"
            {...form.getInputProps("nome_noiva")}
            required
            placeholder="Digite o nome da noiva"
          />
          <TextInput
            label="Telefone da noiva"
            {...form.getInputProps("telefone_noiva")}
            required
            placeholder="(00) 00000-0000"
            inputMode="tel"
            mask="(00) 00000-0000"
            component={IMaskInput}
          />
        </Stack>
      );
    }

    return (
      <Stack gap="sm" style={{ width: "100%" }}>
        <TextInput
          label="Local onde será realizado o casamento"
          {...form.getInputProps("local")}
          placeholder="Nome do local ou endereço"
        />
        <NumberInput
          label="Qual é o orçamento total estimado para o casamento?"
          description="Não se preocupe, vocês podem ajustar esse valor a qualquer momento. Usaremos isso para ajudar a controlar os gastos com fornecedores."
          placeholder="Ex: 50000"
          hideControls // Remove as setinhas de incrementar/decrementar, já que é um valor alto
          thousandSeparator="."
          decimalSeparator=","
          decimalScale={2}
          key={form.key("budget_limit")} // Força o remount do componente quando o campo é limpo, para resetar a formatação do input
          {...form.getInputProps("budget_limit")}
          leftSection={
            <span style={{ color: "var(--marriplan-rose)" }}>R$</span>
          }
          mt="md"
        />
        <DatesProvider settings={{ locale: "pt-br" }}>
          <DatePickerInput
            label="Data do casamento"
            value={
              form.values.data_casamento
                ? new Date(form.values.data_casamento)
                : null
            }
            valueFormat="DD/MM/YYYY"
            onChange={(date) => form.setFieldValue("data_casamento", date)}
          />
          <TimePicker
            label="Hora do casamento"
            withDropdown
            rightSection={
              <ActionIcon
                onClick={() => setDropdownOpened((prev) => !prev)}
                variant="default"
              >
                <IconCalendarClock size={18} />
              </ActionIcon>
            }
            value={
              form.values.hora_casamento
                ? String(
                    new Date(form.values.hora_casamento)
                      .toTimeString()
                      .slice(0, 5),
                  )
                : ""
            }
            onChange={(value) => {
              form.setFieldValue("hora_casamento", value);
              if (value === "") {
                setDropdownOpened(false);
              }
            }}
            popoverProps={{
              opened: dropdownOpened,
              onChange: (_opened) => !_opened && setDropdownOpened(false),
            }}
          />
        </DatesProvider>
      </Stack>
    );
  };

  const footer = (
    <Group grow gap="sm">
      <Button
        variant="default"
        styles={softButtonStyles}
        onClick={() => setActive((current) => Math.max(current - 1, 0))}
        disabled={active === 0}
        type="button"
        fullWidth
      >
        Voltar
      </Button>
      {active < 2 ? (
        <Button
          type="button"
          styles={primaryButtonStyles}
          onClick={() => {
            if (!validateStep(active)) return;
            setActive((current) => Math.min(current + 1, 2));
          }}
          disabled={!isStepValid(active)}
          fullWidth
        >
          Proximo
        </Button>
      ) : (
        <Button
          type="button"
          styles={primaryButtonStyles}
          loading={loading}
          disabled={!isStepValid(2)}
          onClick={handleSave}
          fullWidth
        >
          Salvar
        </Button>
      )}
    </Group>
  );

  if (isMobile) {
    return (
      <Box
        component="form"
        onSubmit={form.onSubmit(handleSave)}
        style={{
          display: "flex",
          flexDirection: "column",
          height: "70dvh",
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        <ScrollArea
          style={{ flex: 1, width: "100%", minHeight: 0 }}
          type="auto"
          offsetScrollbars
        >
          <Group justify="center" gap={6} mt="sm">
            {Array.from({ length: 3 }).map((_, index) => (
              <Box
                key={index}
                w={index === active ? 14 : 6}
                h={6}
                style={{
                  borderRadius: 999,
                  backgroundColor:
                    index === active
                      ? "var(--marriplan-rose)"
                      : "rgba(181, 139, 122, 0.22)",
                }}
              />
            ))}
          </Group>
          <Box w="100%" py="md" style={{ width: "100%" }}>
            {renderStepContent(active)}
          </Box>
        </ScrollArea>

        <Box
          px="sm"
          py="md"
          style={{
            flexShrink: 0,
            background: "var(--marriplan-surface)",
            borderTop: "1px solid var(--marriplan-border)",
          }}
        >
          {footer}
        </Box>
      </Box>
    );
  }

  return (
    <form onSubmit={form.onSubmit(handleSave)}>
      <Stepper active={active} onStepClick={setActive}>
        <Stepper.Step label="Dados do noivo">
          {renderStepContent(0)}
        </Stepper.Step>
        <Stepper.Step label="Dados da noiva">
          {renderStepContent(1)}
        </Stepper.Step>
        <Stepper.Step label="Evento (opcional)">
          {renderStepContent(2)}
        </Stepper.Step>
      </Stepper>
      <Group justify="space-between" mt="xl">
        <Button
          variant="default"
          styles={softButtonStyles}
          onClick={() => setActive((current) => Math.max(current - 1, 0))}
          disabled={active === 0}
          type="button"
        >
          Voltar
        </Button>
        {active < 2 ? (
          <Button
            type="button"
            styles={primaryButtonStyles}
            onClick={() => {
              if (!validateStep(active)) return;
              setActive((current) => Math.min(current + 1, 2));
            }}
            disabled={!isStepValid(active)}
          >
            Proximo
          </Button>
        ) : (
          <Button
            type="button"
            styles={primaryButtonStyles}
            loading={loading}
            disabled={!isStepValid(2)}
            onClick={handleSave}
          >
            Salvar
          </Button>
        )}
      </Group>
    </form>
  );
}

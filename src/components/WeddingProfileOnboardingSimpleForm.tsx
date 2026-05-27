import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { toUpperCamelWords } from "@/lib/text";
import api from "@/services/api";
import { primaryButtonStyles, softButtonStyles } from "@/styles";
import { Box, Button, Group, ScrollArea, Stack, Stepper, Text, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useMediaQuery } from "@mantine/hooks";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { ptBR } from "date-fns/locale/pt-BR";
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
        description: "Nao foi possivel salvar as informacoes. Verifique os campos.",
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
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
          <Stack gap="md" pt="sm" style={{ width: "100%" }}>
            <DatePicker
              label="Data do casamento"
              value={
                form.values.data_casamento
                  ? new Date(form.values.data_casamento)
                  : null
              }
              onChange={(date) => form.setFieldValue("data_casamento", date)}
              format="dd/MM/yyyy"
              slotProps={{
                textField: {
                  fullWidth: true,
                  placeholder: "Selecione a data",
                },
              }}
            />
            <TimePicker
              label="Hora do casamento"
              value={form.values.hora_casamento}
              onChange={(value) => form.setFieldValue("hora_casamento", value)}
              ampm={false}
              minutesStep={1}
              slotProps={{
                textField: {
                  fullWidth: true,
                  placeholder: "00:00",
                },
              }}
            />
          </Stack>
        </LocalizationProvider>
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

        <ScrollArea style={{ flex: 1, width: "100%", minHeight: 0 }} type="auto" offsetScrollbars>
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
        <Stepper.Step label="Dados do noivo">{renderStepContent(0)}</Stepper.Step>
        <Stepper.Step label="Dados da noiva">{renderStepContent(1)}</Stepper.Step>
        <Stepper.Step label="Evento (opcional)">{renderStepContent(2)}</Stepper.Step>
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
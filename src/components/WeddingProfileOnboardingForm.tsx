import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { toUpperCamelWords } from "@/lib/text";
import api from "@/services/api";
import { primaryButtonStyles, softButtonStyles } from "@/styles";
import {
  ActionIcon,
  Button,
  Group,
  Loader,
  NumberInput,
  Stepper,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useMediaQuery } from "@mantine/hooks";
import { useState } from "react";

import { Box, ScrollArea, Stack, Text } from "@mantine/core";
import { DatePickerInput, DatesProvider, TimePicker } from "@mantine/dates";
import { IconCalendarClock } from "@tabler/icons-react";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import relativeTime from "dayjs/plugin/relativeTime";
import { IMaskInput } from "react-imask";
dayjs.extend(relativeTime);
dayjs.locale("pt-br");

// Importar L apenas no client-side
// let L: any = null;
// if (typeof window !== "undefined") {
//   L = require("leaflet");
//   require("leaflet/dist/leaflet.css");
// }

// const LeafletMap = dynamic(() => import("./LeafletMap"), {
//   ssr: false,
// });

type WeddingProfileOnboardingFormProps = {
  onComplete: () => void;
};

export default function WeddingProfileOnboardingForm({
  onComplete,
}: WeddingProfileOnboardingFormProps) {
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

  const isValidOptionalEmail = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  };

  const buildNormalizedPayload = (
    values: Record<string, unknown>,
  ): Record<string, unknown> & {
    data_casamento?: unknown;
    hora_casamento?: unknown;
  } => ({
    ...values,
    nome_noivo: toUpperCamelWords(String(values.nome_noivo ?? "")),
    nome_noiva: toUpperCamelWords(String(values.nome_noiva ?? "")),
    local: toUpperCamelWords(String(values.local ?? "")),
    email_noivo: String(values.email_noivo ?? "")
      .trim()
      .toLowerCase(),
    email_noiva: String(values.email_noiva ?? "")
      .trim()
      .toLowerCase(),
    data_casamento: values.data_casamento,
    hora_casamento: values.hora_casamento,
    budget_limit: values.budget_limit ? Number(values.budget_limit) : undefined,
  });

  const form = useForm({
    initialValues: {
      nome_noivo: initial.nome_noivo ?? "",
      telefone_noivo: initial.telefone_noivo ?? "",
      email_noivo: initial.email_noivo ?? "",
      nome_noiva: initial.nome_noiva ?? "",
      telefone_noiva: initial.telefone_noiva ?? "",
      email_noiva: initial.email_noiva ?? "",
      data_casamento: initial.data_casamento ?? "",
      hora_casamento: parseTimeToDate(initial.hora_casamento),
      budget_limit: initial.budget_limit ?? "",
      local: initial.local ?? "",
    },
    validate: {
      nome_noivo: (v) => (!v ? "Obrigatorio" : null),
      telefone_noivo: (v) =>
        !v || v.replace(/\D/g, "").length < 10 ? "Obrigatorio" : null,
      nome_noiva: (v) => (!v ? "Obrigatorio" : null),
      telefone_noiva: (v) =>
        !v || v.replace(/\D/g, "").length < 10 ? "Obrigatorio" : null,
      data_casamento: (v) => (!v ? "Obrigatorio" : null),
      hora_casamento: (v) => (!v ? "Obrigatorio" : null),
    },
  });

  // useEffect(() => {
  //   if (form.values.latitude && form.values.longitude) {
  //     setMapPosition([form.values.latitude, form.values.longitude]);
  //   } else {
  //     setMapPosition(null);
  //   }
  // }, [form.values.latitude, form.values.longitude]);

  const [dropdownOpened, setDropdownOpened] = useState(false);

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
      const normalizedValues = buildNormalizedPayload(form.values);
      const dataCasamento = normalizedValues.data_casamento;
      const horaCasamento = normalizedValues.hora_casamento;
      // Formata data e hora para o backend
      const dataToSend = {
        ...normalizedValues,
        data_casamento: dataCasamento
          ? typeof dataCasamento === "string"
            ? dataCasamento.slice(0, 10)
            : dataCasamento instanceof Date
            ? dataCasamento.toISOString().slice(0, 10)
            : ""
          : "",
        hora_casamento: horaCasamento
          ? typeof horaCasamento === "string"
            ? horaCasamento.slice(0, 5)
            : horaCasamento instanceof Date
            ? horaCasamento.toTimeString().slice(0, 5)
            : ""
          : "",
      };
      await api.patch("/api/wedding-profile/me/", dataToSend);
      await refreshUser();
      toast({
        title: "Perfil salvo!",
        description: "Seu perfil de casamento foi atualizado.",
      });
      onComplete();
    } catch {
      toast({
        title: "Erro",
        description: "Nao foi possivel salvar o perfil. Verifique os campos.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Busca endereco pelo CEP
  // const handleCepBlur = async () => {
  //   setCepError(null);
  //   const rawCep = form.values.cep.replace(/\D/g, "");
  //   if (rawCep.length !== 8) {
  //     setCepError("CEP invalido");
  //     return;
  //   }
  //   setCepLoading(true);
  //   try {
  //     const { data } = await axios.get(
  //       `https://viacep.com.br/ws/${rawCep}/json/`,
  //     );
  //     if (!data.erro) {
  //       form.setFieldValue("endereco", data.logradouro ?? "");
  //       form.setFieldValue("bairro", data.bairro ?? "");
  //       form.setFieldValue("cidade", data.localidade ?? "");
  //       form.setFieldValue("estado", data.uf ?? "");
  //       form.setFieldValue("cep", data.cep ?? rawCep);
  //     } else {
  //       setCepError("CEP nao encontrado");
  //     }
  //   } catch {
  //     setCepError("Erro ao buscar CEP");
  //   }
  //   setCepLoading(false);
  // };

  // Funcao para buscar endereco pelas coordenadas (reverse geocode)
  // async function reverseGeocode(lat: number, lon: number) {
  //   const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
  //   try {
  //     const res = await fetch(url);
  //     const data = await res.json();
  //     return data.address || {};
  //   } catch {
  //     console.error("Erro ao fazer reverse geocoding:");
  //     return {};
  //   }
  // }

  // Funcao para checar se os campos obrigatorios do step atual estao preenchidos
  function isStepValid(step: number): boolean {
    if (step === 0) {
      return !!form.values.nome_noivo && !!form.values.telefone_noivo;
    }
    if (step === 1) {
      return !!form.values.nome_noiva && !!form.values.telefone_noiva;
    }
    if (step === 2) {
      return !!form.values.data_casamento && !!form.values.hora_casamento;
    }
    return true;
  }

  function validateStep(step: number): boolean {
    if (step === 0) {
      form.clearFieldError("nome_noivo");
      form.clearFieldError("telefone_noivo");
      form.clearFieldError("email_noivo");

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
      if (!isValidOptionalEmail(form.values.email_noivo)) {
        form.setFieldError("email_noivo", "Email invalido");
        hasError = true;
      }
      return !hasError;
    }

    if (step === 1) {
      form.clearFieldError("nome_noiva");
      form.clearFieldError("telefone_noiva");
      form.clearFieldError("email_noiva");

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
      if (!isValidOptionalEmail(form.values.email_noiva)) {
        form.setFieldError("email_noiva", "Email invalido");
        hasError = true;
      }
      return !hasError;
    }

    if (step === 2) {
      form.clearFieldError("data_casamento");
      form.clearFieldError("hora_casamento");
      form.clearFieldError("budget_limit");

      let hasError = false;
      if (!form.values.data_casamento) {
        form.setFieldError("data_casamento", "Obrigatorio");
        hasError = true;
      }
      if (!form.values.hora_casamento) {
        form.setFieldError("hora_casamento", "Obrigatorio");
        hasError = true;
      }

      return !hasError;
    }

    return true;
  }

  const mobileStepTitles = ["Dados do noivo", "Dados da noiva", "Evento"];

  const renderMobileStepContent = () => {
    if (active === 0) {
      return (
        <>
          <TextInput
            label="Nome do noivo"
            {...form.getInputProps("nome_noivo")}
            required
            mb="md"
          />
          <TextInput
            label="Telefone do noivo"
            {...form.getInputProps("telefone_noivo")}
            required
            mb="md"
            placeholder="(00) 00000-0000"
          />
          <TextInput
            label="Email do noivo"
            {...form.getInputProps("email_noivo")}
            mb="md"
            type="email"
          />
        </>
      );
    }

    if (active === 1) {
      return (
        <>
          <TextInput
            label="Nome da noiva"
            {...form.getInputProps("nome_noiva")}
            required
            mb="md"
          />
          <TextInput
            label="Telefone da noiva"
            {...form.getInputProps("telefone_noiva")}
            required
            mb="md"
            placeholder="(00) 00000-0000"
          />
          <TextInput
            label="Email da noiva"
            {...form.getInputProps("email_noiva")}
            mb="md"
            type="email"
          />
        </>
      );
    }

    return (
      <>
        <TextInput
          label="Local onde sera realizado"
          {...form.getInputProps("local")}
          mt="md"
        />
        <DatesProvider settings={{ locale: "pt-br" }}>
          <DatePickerInput
            valueFormat="DD/MM/YYYY"
            label="Data do casamento"
            value={
              form.values.data_casamento
                ? form.values.data_casamento
                : null
            }
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
        />
      </>
    );
  };

  const mobileFooter = (
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
          height: "90dvh",
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        <Box
          px="sm"
          py="sm"
          style={{
            borderBottom: "1px solid var(--marriplan-border)",
          }}
        >
          <Text fw={700} size="lg" c="var(--marriplan-text)">
            {mobileStepTitles[active]}
          </Text>
          <Group justify="center" gap={6} mt="sm">
            {mobileStepTitles.map((_, index) => (
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
        </Box>

        <ScrollArea
          style={{ flex: 1, width: "100%", minHeight: 0 }}
          type="auto"
          offsetScrollbars
        >
          <Box px="sm" py="md" style={{ width: "100%" }}>
            <Stack gap="sm" style={{ width: "100%" }}>
              {renderMobileStepContent()}
            </Stack>
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
          {mobileFooter}
        </Box>
      </Box>
    );
  }

  return (
    <form onSubmit={form.onSubmit(handleSave)}>
      <Stepper active={active} onStepClick={setActive}>
        <Stepper.Step label="Dados do noivo">
          <TextInput
            label="Nome do noivo"
            {...form.getInputProps("nome_noivo")}
            required
            mb="md"
          />
          <TextInput
            label="Telefone do noivo"
            {...form.getInputProps("telefone_noivo")}
            required
            mb="md"
            placeholder="(00) 00000-0000"
            mask="(00) 00000-0000"
            component={IMaskInput}
          />
          <TextInput
            label="Email do noivo"
            {...form.getInputProps("email_noivo")}
            mb="md"
            type="email"
          />
        </Stepper.Step>
        <Stepper.Step label="Dados da noiva">
          <TextInput
            label="Nome da noiva"
            {...form.getInputProps("nome_noiva")}
            required
            mb="md"
          />
          <TextInput
            label="Telefone da noiva"
            {...form.getInputProps("telefone_noiva")}
            required
            mb="md"
            placeholder="(00) 00000-0000"
            mask="(00) 00000-0000"
            component={IMaskInput}
          />
          <TextInput
            label="Email da noiva"
            {...form.getInputProps("email_noiva")}
            mb="md"
            type="email"
          />
        </Stepper.Step>
        <Stepper.Step label="Evento">
          <TextInput
            label="Local onde sera realizado"
            {...form.getInputProps("local")}
            mt="md"
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
          {/* {mapPosition && (
            <LeafletMap
              mapPosition={mapPosition}
              setMapPosition={setMapPosition}
              reverseGeocode={reverseGeocode}
              form={form}
              L={L}
            />
          )}
          <TextInput
            label="CEP"
            {...form.getInputProps("cep")}
            maxLength={9}
            error={cepError ?? form.errors.cep}
            placeholder="Digite o CEP e saia do campo para buscar endereco"
            rightSection={cepLoading ? <Loader size="xs" /> : null}
            mt="md"
            onBlur={handleCepBlur}
          />
          <TextInput
            label="Endereco"
            {...form.getInputProps("endereco")}
            mt="md"
          />
          <Group grow mt="md">
            <TextInput label="Numero" {...form.getInputProps("numero")} />
            <TextInput label="Bairro" {...form.getInputProps("bairro")} />
          </Group>
          <Group grow mt="md">
            <TextInput label="Cidade" {...form.getInputProps("cidade")} />
            <TextInput label="Estado" {...form.getInputProps("estado")} />
          </Group>
          <TextInput
            label="Cor principal do Casamento"
            {...form.getInputProps("cor_principal")}
            mt="md"
          />
          <TextInput
            label="Frase do Casal"
            {...form.getInputProps("frase_casal")}
            mt="md"
            placeholder="Alguma frase que representa a sua uniao."
          /> */}
          <Group justify="space-between" gap="md" grow my="md">
            <DatesProvider settings={{ locale: "pt-br" }}>
              <DatePickerInput
                valueFormat="DD/MM/YYYY"
                label="Data do casamento"
                value={
                  form.values.data_casamento
                    ? form.values.data_casamento
                    : null
                }
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
          </Group>
        </Stepper.Step>
      </Stepper>
      <Group justify="space-between" mt="xl">
        <Button
          variant="default"
          styles={softButtonStyles}
          onClick={() => setActive((a) => Math.max(a - 1, 0))}
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
              setActive((a) => Math.min(a + 1, 2));
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
      {loading && <Loader mt="md" />}
    </form>
  );
}

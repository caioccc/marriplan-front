import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { toSentenceCase, toUpperCamelWords } from "@/lib/text";
import api from "@/services/api";
import { primaryButtonStyles, softButtonStyles } from "@/styles";
import {
  Button,
  Group,
  Loader,
  Stepper,
  TextInput,
  Textarea,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import axios from "axios";
import { ptBR } from "date-fns/locale/pt-BR";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useMediaQuery } from "@mantine/hooks";

import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import relativeTime from "dayjs/plugin/relativeTime";
import { Box, ScrollArea, Text, Stack } from "@mantine/core";
dayjs.extend(relativeTime);
dayjs.locale("pt-br");

// Importar L apenas no client-side
// let L: any = null;
// if (typeof window !== "undefined") {
//   L = require("leaflet");
//   require("leaflet/dist/leaflet.css");
// }

const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
});

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
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);
  const [mapPosition, setMapPosition] = useState<[number, number] | null>(null);
  const L = null;
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

  const isValidOptionalUrl = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return true;
    try {
      const url = new URL(trimmed);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
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
    bairro: toUpperCamelWords(String(values.bairro ?? "")),
    cidade: toUpperCamelWords(String(values.cidade ?? "")),
    estado: toUpperCamelWords(String(values.estado ?? "")),
    descricao_noivo: toSentenceCase(String(values.descricao_noivo ?? "")),
    descricao_noiva: toSentenceCase(String(values.descricao_noiva ?? "")),
    frase_casal: toSentenceCase(String(values.frase_casal ?? "")),
    historia: toSentenceCase(String(values.historia ?? "")),
    email_noivo: String(values.email_noivo ?? "").trim().toLowerCase(),
    email_noiva: String(values.email_noiva ?? "").trim().toLowerCase(),
    facebook_noivo: String(values.facebook_noivo ?? "").trim(),
    instagram_noivo: String(values.instagram_noivo ?? "").trim(),
    facebook_noiva: String(values.facebook_noiva ?? "").trim(),
    instagram_noiva: String(values.instagram_noiva ?? "").trim(),
    data_casamento: values.data_casamento,
    hora_casamento: values.hora_casamento,
  });

  const form = useForm({
    initialValues: {
      nome_noivo: initial.nome_noivo ?? "",
      telefone_noivo: initial.telefone_noivo ?? "",
      email_noivo: initial.email_noivo ?? "",
      descricao_noivo: initial.descricao_noivo ?? "",
      facebook_noivo: initial.facebook_noivo ?? "",
      instagram_noivo: initial.instagram_noivo ?? "",
      nome_noiva: initial.nome_noiva ?? "",
      telefone_noiva: initial.telefone_noiva ?? "",
      email_noiva: initial.email_noiva ?? "",
      descricao_noiva: initial.descricao_noiva ?? "",
      facebook_noiva: initial.facebook_noiva ?? "",
      instagram_noiva: initial.instagram_noiva ?? "",
      data_casamento: initial.data_casamento ?? "",
      hora_casamento: parseTimeToDate(initial.hora_casamento),
      local: initial.local ?? "",
      endereco: initial.endereco ?? "",
      numero: initial.numero ?? "",
      bairro: initial.bairro ?? "",
      cidade: initial.cidade ?? "",
      estado: initial.estado ?? "",
      latitude: initial.latitude ?? null,
      longitude: initial.longitude ?? null,
      cep: initial.cep ?? "",
      cor_principal: initial.cor_principal ?? "",
      frase_casal: initial.frase_casal ?? "",
      historia: initial.historia ?? "",
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
      // Todos os outros campos sao opcionais
    },
  });

  useEffect(() => {
    if (form.values.latitude && form.values.longitude) {
      setMapPosition([form.values.latitude, form.values.longitude]);
    } else {
      setMapPosition(null);
    }
  }, [form.values.latitude, form.values.longitude]);

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
  const handleCepBlur = async () => {
    setCepError(null);
    const rawCep = form.values.cep.replace(/\D/g, "");
    if (rawCep.length !== 8) {
      setCepError("CEP invalido");
      return;
    }
    setCepLoading(true);
    try {
      const { data } = await axios.get(
        `https://viacep.com.br/ws/${rawCep}/json/`,
      );
      if (!data.erro) {
        form.setFieldValue("endereco", data.logradouro ?? "");
        form.setFieldValue("bairro", data.bairro ?? "");
        form.setFieldValue("cidade", data.localidade ?? "");
        form.setFieldValue("estado", data.uf ?? "");
        form.setFieldValue("cep", data.cep ?? rawCep);
      } else {
        setCepError("CEP nao encontrado");
      }
    } catch {
      setCepError("Erro ao buscar CEP");
    }
    setCepLoading(false);
  };

  // Funcao para buscar endereco pelas coordenadas (reverse geocode)
  async function reverseGeocode(lat: number, lon: number) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      return data.address || {};
    } catch {
      console.error("Erro ao fazer reverse geocoding:");
      return {};
    }
  }

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
      form.clearFieldError("facebook_noivo");
      form.clearFieldError("instagram_noivo");

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
      if (!isValidOptionalUrl(form.values.facebook_noivo)) {
        form.setFieldError("facebook_noivo", "URL invalida");
        hasError = true;
      }
      if (!isValidOptionalUrl(form.values.instagram_noivo)) {
        form.setFieldError("instagram_noivo", "URL invalida");
        hasError = true;
      }
      return !hasError;
    }

    if (step === 1) {
      form.clearFieldError("nome_noiva");
      form.clearFieldError("telefone_noiva");
      form.clearFieldError("email_noiva");
      form.clearFieldError("facebook_noiva");
      form.clearFieldError("instagram_noiva");

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
      if (!isValidOptionalUrl(form.values.facebook_noiva)) {
        form.setFieldError("facebook_noiva", "URL invalida");
        hasError = true;
      }
      if (!isValidOptionalUrl(form.values.instagram_noiva)) {
        form.setFieldError("instagram_noiva", "URL invalida");
        hasError = true;
      }
      return !hasError;
    }

    if (step === 2) {
      form.clearFieldError("data_casamento");
      form.clearFieldError("hora_casamento");

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

  const mobileStepTitles = [
    "Dados do noivo",
    "Dados da noiva",
    "Evento",
    "História",
  ];

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
          <Textarea
            label="Descricao do noivo"
            {...form.getInputProps("descricao_noivo")}
            minRows={4}
            autosize
            mb="md"
            placeholder="Idade, estilo musical, religiao, time do coracao, hobbies, profissao, formacao, temperamento etc."
          />
          <TextInput
            label="Facebook do noivo"
            {...form.getInputProps("facebook_noivo")}
            mb="md"
            placeholder="Link do Facebook"
          />
          <TextInput
            label="Instagram do noivo"
            {...form.getInputProps("instagram_noivo")}
            mb="md"
            placeholder="Link do Instagram"
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
          <Textarea
            label="Descricao da noiva"
            {...form.getInputProps("descricao_noiva")}
            minRows={4}
            autosize
            mb="md"
            placeholder="Idade, estilo musical, religiao, time do coracao, hobbies, profissao, formacao, temperamento etc."
          />
          <TextInput
            label="Facebook da noiva"
            {...form.getInputProps("facebook_noiva")}
            mb="md"
            placeholder="Link do Facebook"
          />
          <TextInput
            label="Instagram da noiva"
            {...form.getInputProps("instagram_noiva")}
            mb="md"
            placeholder="Link do Instagram"
          />
        </>
      );
    }

    if (active === 2) {
      return (
        <>
          <TextInput
            label="Local onde sera realizado"
            {...form.getInputProps("local")}
            mt="md"
          />
          {mapPosition && (
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
          <Stack gap="sm" mt="md">
            <TextInput label="Numero" {...form.getInputProps("numero")} />
            <TextInput label="Bairro" {...form.getInputProps("bairro")} />
            <TextInput label="Cidade" {...form.getInputProps("cidade")} />
            <TextInput label="Estado" {...form.getInputProps("estado")} />
          </Stack>
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
          />
          <LocalizationProvider
            dateAdapter={AdapterDateFns}
            adapterLocale={ptBR}
          >
            <Stack gap="36px" w="100%" mt="md">
              <DatePicker
                label="Data do casamento"
                value={
                  form.values.data_casamento
                    ? new Date(form.values.data_casamento)
                    : null
                }
                onChange={(date) => form.setFieldValue("data_casamento", date)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    placeholder: "Selecione a data",
                    sx: {
                      height: 36,
                      minHeight: 36,
                      ".MuiInputBase-input": {
                        height: 36,
                        minHeight: 36,
                        padding: "0 12px",
                      },
                    },
                  },
                }}
                format="dd/MM/yyyy"
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
                    required: true,
                    placeholder: "00:00",
                    sx: {
                      height: 36,
                      minHeight: 36,
                      ".MuiInputBase-input": {
                        height: 36,
                        minHeight: 36,
                        padding: "0 12px",
                      },
                    },
                  },
                }}
              />
            </Stack>
          </LocalizationProvider>
        </>
      );
    }

    return (
      <Textarea
        label="Conte um pouco sobre a historia do casal"
        minRows={2}
        autosize
        {...form.getInputProps("historia")}
      />
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
      {active < 3 ? (
        <Button
          type="button"
          styles={primaryButtonStyles}
          onClick={() => {
            if (!validateStep(active)) return;
            setActive((current) => Math.min(current + 1, 3));
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
            background: "var(--marriplan-surface)",
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
          />
          <TextInput
            label="Email do noivo"
            {...form.getInputProps("email_noivo")}
            mb="md"
            type="email"
          />
          <Textarea
            label="Descricao do noivo"
            {...form.getInputProps("descricao_noivo")}
            minRows={4}
            autosize
            mb="md"
            placeholder="Idade, estilo musical, religiao, time do coracao, hobbies, profissao, formacao, temperamento etc."
          />
          <TextInput
            label="Facebook do noivo"
            {...form.getInputProps("facebook_noivo")}
            mb="md"
            placeholder="Link do Facebook"
          />
          <TextInput
            label="Instagram do noivo"
            {...form.getInputProps("instagram_noivo")}
            mb="md"
            placeholder="Link do Instagram"
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
          />
          <TextInput
            label="Email da noiva"
            {...form.getInputProps("email_noiva")}
            mb="md"
            type="email"
          />
          <Textarea
            label="Descricao da noiva"
            {...form.getInputProps("descricao_noiva")}
            minRows={4}
            autosize
            mb="md"
            placeholder="Idade, estilo musical, religiao, time do coracao, hobbies, profissao, formacao, temperamento etc."
          />
          <TextInput
            label="Facebook da noiva"
            {...form.getInputProps("facebook_noiva")}
            mb="md"
            placeholder="Link do Facebook"
          />
          <TextInput
            label="Instagram da noiva"
            {...form.getInputProps("instagram_noiva")}
            mb="md"
            placeholder="Link do Instagram"
          />
        </Stepper.Step>
        <Stepper.Step label="Evento">
          <TextInput
            label="Local onde sera realizado"
            {...form.getInputProps("local")}
            mt="md"
          />
          {mapPosition && (
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
          />
          <Group grow>
            <LocalizationProvider
              dateAdapter={AdapterDateFns}
              adapterLocale={ptBR}
            >
              <Group
                gap="md"
                style={{
                  alignItems: "flex-end",
                  flexWrap: "nowrap",
                  width: "100%",
                  marginTop: 16,
                  marginBottom: 16,
                }}
              >
                <DatePicker
                  label="Data do casamento"
                  value={
                    form.values.data_casamento
                      ? new Date(form.values.data_casamento)
                      : null
                  }
                  onChange={(date) =>
                    form.setFieldValue("data_casamento", date)
                  }
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      placeholder: "Selecione a data",
                      sx: {
                        height: 36,
                        minHeight: 36,
                        ".MuiInputBase-input": {
                          height: 36,
                          minHeight: 36,
                          padding: "0 12px",
                        },
                      },
                      style: { flex: 1 },
                    },
                  }}
                  format="dd/MM/yyyy"
                />
                <TimePicker
                  label="Hora do casamento"
                  value={form.values.hora_casamento}
                  onChange={(value) =>
                    form.setFieldValue("hora_casamento", value)
                  }
                  ampm={false}
                  minutesStep={1}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      placeholder: "00:00",
                      sx: {
                        height: 36,
                        minHeight: 36,
                        ".MuiInputBase-input": {
                          height: 36,
                          minHeight: 36,
                          padding: "0 12px",
                        },
                      },
                      style: { flex: 1 },
                    },
                  }}
                />
              </Group>
            </LocalizationProvider>
          </Group>
        </Stepper.Step>
        <Stepper.Step label="Historia">
          <Textarea
            label="Conte um pouco sobre a historia do casal"
            minRows={2}
            autosize
            {...form.getInputProps("historia")}
          />
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
        {active < 3 ? (
          <Button
            type="button"
            styles={primaryButtonStyles}
            onClick={() => {
              if (!validateStep(active)) return;
              setActive((a) => Math.min(a + 1, 3));
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

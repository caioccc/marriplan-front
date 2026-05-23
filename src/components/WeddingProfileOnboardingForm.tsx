import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { toSentenceCase, toUpperCamelWords } from "@/lib/text";
import api from "@/services/api";
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
import ptBR from "date-fns/locale/pt-BR";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { IMaskInput } from "react-imask";

import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
dayjs.locale("pt-br");

// Importar L apenas no client-side
let L: any = null;
if (typeof window !== "undefined") {
  L = require("leaflet");
  require("leaflet/dist/leaflet.css");
}

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

  const buildNormalizedPayload = (values: Record<string, any>) => ({
    ...values,
    nome_noivo: toUpperCamelWords(values.nome_noivo ?? ""),
    nome_noiva: toUpperCamelWords(values.nome_noiva ?? ""),
    local: toUpperCamelWords(values.local ?? ""),
    bairro: toUpperCamelWords(values.bairro ?? ""),
    cidade: toUpperCamelWords(values.cidade ?? ""),
    estado: toUpperCamelWords(values.estado ?? ""),
    descricao_noivo: toSentenceCase(values.descricao_noivo ?? ""),
    descricao_noiva: toSentenceCase(values.descricao_noiva ?? ""),
    frase_casal: toSentenceCase(values.frase_casal ?? ""),
    historia: toSentenceCase(values.historia ?? ""),
    email_noivo: (values.email_noivo ?? "").trim().toLowerCase(),
    email_noiva: (values.email_noiva ?? "").trim().toLowerCase(),
    facebook_noivo: (values.facebook_noivo ?? "").trim(),
    instagram_noivo: (values.instagram_noivo ?? "").trim(),
    facebook_noiva: (values.facebook_noiva ?? "").trim(),
    instagram_noiva: (values.instagram_noiva ?? "").trim(),
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
      cep: initial.cep ?? "",
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
      // Formata data e hora para o backend
      const dataToSend = {
        ...normalizedValues,
        data_casamento: normalizedValues.data_casamento
          ? typeof normalizedValues.data_casamento === "string"
            ? normalizedValues.data_casamento.slice(0, 10)
            : normalizedValues.data_casamento.toISOString().slice(0, 10)
          : "",
        hora_casamento: normalizedValues.hora_casamento
          ? typeof normalizedValues.hora_casamento === "string"
            ? normalizedValues.hora_casamento.slice(0, 5)
            : normalizedValues.hora_casamento instanceof Date
            ? normalizedValues.hora_casamento.toTimeString().slice(0, 5)
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
    } catch (e) {
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

  // Funcao para buscar coordenadas pelo endereco (usando Nominatim)
  async function geocodeAddress(address: string) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      address,
    )}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data && data.length > 0) {
        form.setFieldValue("latitude", parseFloat(data[0].lat));
        form.setFieldValue("longitude", parseFloat(data[0].lon));
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      }
    } catch (e) {
      console.error("Erro ao geocodificar endereco:", e);
    }
    return null;
  }

  // Funcao para buscar endereco pelas coordenadas (reverse geocode)
  async function reverseGeocode(lat: number, lon: number) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      return data.address || {};
    } catch (e) {
      console.error("Erro ao fazer reverse geocoding:", e);
      return {};
    }
  }

  // Atualiza o mapa ao preencher o CEP ou endereco

  // Componente para manipular o clique no mapa
  function LocationMarker() {
    // So renderiza no client
    if (typeof window === "undefined" || !useMapEvents) return null;
    const mapEvents = useMapEvents({
      click(e) {
        setMapPosition([e.latlng.lat, e.latlng.lng]);
        reverseGeocode(e.latlng.lat, e.latlng.lng).then((addr) => {
          if (addr) {
            form.setFieldValue("endereco", addr.road || "");
            form.setFieldValue(
              "bairro",
              addr.suburb ||
                addr.neighbourhood ||
                addr.village ||
                addr.town ||
                "",
            );
            form.setFieldValue(
              "cidade",
              addr.city || addr.town || addr.village || "",
            );
            form.setFieldValue("estado", addr.state || "");
            form.setFieldValue("numero", addr.house_number || "");
            form.setFieldValue("cep", addr.postcode || form.values.cep || "");
            form.setFieldValue("latitude", e.latlng.lat);
            form.setFieldValue("longitude", e.latlng.lng);
          }
        });
      },
    });
    return mapPosition && L ? (
      <Marker
        position={mapPosition}
        icon={L.icon({
          iconUrl:
            "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
        })}
      />
    ) : null;
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

  return (
    <form onSubmit={form.onSubmit(handleSave)}>
      <Stepper active={active} onStepClick={setActive} breakpoint="sm">
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
            component={IMaskInput}
            mask="(00) 00000-0000"
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
            component={IMaskInput}
            mask="(00) 00000-0000"
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
            component={IMaskInput}
            mask="00000-000"
            {...form.getInputProps("cep")}
            maxLength={9}
            error={cepError ?? form.errors.cep}
            placeholder="Digite o CEP e saia do campo para buscar endereco"
            rightSection={cepLoading ? <Loader size="xs" /> : null}
            mt="md"
            onBlur={handleCepBlur}
            onAccept={(value) => {
              form.setFieldValue("cep", value ?? "");
              if (cepError) setCepError(null);
            }}
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
          onClick={() => setActive((a) => Math.max(a - 1, 0))}
          disabled={active === 0}
          type="button"
        >
          Voltar
        </Button>
        {active < 3 ? (
          <Button
            type="button"
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

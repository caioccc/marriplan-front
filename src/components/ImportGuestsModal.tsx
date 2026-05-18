import { useToast } from "@/hooks/use-toast";
import { guests_download_model, guests_import } from "@/services/guests";
import { primaryButtonStyles, softButtonStyles } from "@/styles";
import {
  Box,
  Button,
  Group,
  Modal,
  Notification,
  rem,
  Stack,
  Stepper,
  Table,
  Text,
  Tooltip
} from "@mantine/core";
import {
  IconCheck,
  IconDownload,
  IconFileSpreadsheet,
  IconUpload
} from "@tabler/icons-react";
import { DataTable } from "mantine-datatable";
import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";

interface ImportGuestsModalProps {
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const EXPECTED_COLUMNS = [
  { key: "name", label: "Nome" },
  { key: "phone", label: "Telefone" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "email", label: "Email" },
  { key: "alergias", label: "Alergias" },
  { key: "acompanhantes", label: "Acompanhantes" },
  { key: "observacoes", label: "Observações" },
];

export default function ImportGuestsModal({
  opened,
  onClose,
  onSuccess,
}: ImportGuestsModalProps) {
  const [active, setActive] = useState(0);
  const [importing, setImporting] = useState(false);
  const [columns, setColumns] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState<any[]>([]);
  const [importError, setImportError] = useState<string | null>(null);
  const [finalizeError, setFinalizeError] = useState<any[] | null>(null);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  // Sempre que o modal abrir, resetar para a primeira etapa e limpar estados
  useEffect(() => {
    if (opened) {
      setActive(0);
      setImporting(false);
      setColumns([]);
      setMapping({});
      setPreview([]);
      setImportError(null);
      setFinalizeError(null);
      setSuccess(false);
    }
  }, [opened]);

  // Step 1: Download modelo
  const handleDownload = async () => {
    try {
      const res = await guests_download_model();
      const url = window.URL.createObjectURL(
        new Blob([res.data], { type: "text/csv" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "modelo_convidados.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast({
        title: "Modelo baixado",
        description: "O modelo de planilha foi baixado com sucesso.",
      });
    } catch {
      toast({
        title: "Erro ao baixar",
        description: "Não foi possível baixar o modelo de planilha.",
        variant: "destructive",
      });
    }
  };

  // Step 2: Import planilha (leitura local)
  const handleDrop = async (files: File[]) => {
    setImportError(null);
    setImporting(true);
    try {
      const file = files[0];
      const data = await file.arrayBuffer();
      const isCsv =
        file.type.includes("csv") || file.name.toLowerCase().endsWith(".csv");
      const workbook = isCsv
        ? XLSX.read(new TextDecoder("utf-8").decode(data), { type: "string" })
        : XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      const [header, ...rows] = json;
      setColumns(header as string[]);
      setPreview(
        rows.map((row) => {
          const obj: Record<string, string> = {};
          (header as string[]).forEach((col, idx) => {
            obj[col] = row[idx] ?? "";
          });
          return obj;
        }),
      );
      // Mapeamento automático: busca por label exata (case-insensitive)
      const autoMap: Record<string, string> = {};
      EXPECTED_COLUMNS.forEach((col) => {
        const found = (header as string[]).find(
          (c) => c.trim().toLowerCase() === col.label.trim().toLowerCase(),
        );
        if (found) autoMap[col.key] = found;
      });
      setMapping(autoMap);
      setActive(2);
    } catch (e: any) {
      setImportError(e.message || "Erro ao ler planilha.");
    } finally {
      setImporting(false);
    }
  };

  // Step 3: Mapeamento
  const handleMappingChange = (target: string, value: string) => {
    setMapping((m) => ({ ...m, [target]: value }));
  };

  // Step 4: Finalizar importação (gera nova planilha e faz upload)
  const handleFinalize = async () => {
    setFinalizeError(null);
    setImporting(true);
    try {
      // Gera nova planilha apenas com as colunas mapeadas e não vazias
      const newHeader = Object.entries(mapping)
        .filter(([_, v]) => v)
        .map(([k, v]) => k);
      const newRows = preview.map((row) =>
        Object.entries(mapping)
          .filter(([_, v]) => v)
          .map(([_, v]) => row[v] ?? ""),
      );
      const ws = XLSX.utils.aoa_to_sheet([newHeader, ...newRows]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Convidados");
      const wbout = XLSX.write(wb, { type: "array", bookType: "xlsx" });
      const finalFile = new File([wbout], "convidados_importados.xlsx", {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const res = await guests_import(finalFile);

      if (res.status === 207 && res.data.errors) {
        setFinalizeError(res.data.errors);
        toast({
          title: "Importação parcial",
          description:
            "Alguns convidados não foram importados. Verifique os detalhes.",
          variant: "warning",
        });
      } else if (res.status === 200 || res.status === 201) {
        setSuccess(true);
        toast({
          title: "Convidados importados",
          description:
            "A importação foi concluída com sucesso. Confira a lista de convidados.",
        });
        onSuccess();
        onClose();
      } else {
        setFinalizeError([
          { error: res.data.detail || "Erro desconhecido na importação." },
        ]);
        toast({
          title: "Erro na importação",
          description:
            res.data.detail || "Ocorreu um erro ao finalizar a importação.",
          variant: "destructive",
        });
      }
    } catch (e: any) {
      setFinalizeError([
        { error: e.message || "Erro ao finalizar a importação." },
      ]);
      toast({
        title: "Erro na importação",
        description: e.message || "Ocorreu um erro ao finalizar a importação.",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  function DropzoneArea({
    onDrop,
    importing,
  }: {
    onDrop: (files: File[]) => void;
    importing: boolean;
  }) {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop,
      accept: {
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
          ".xlsx",
        ],
        "text/csv": [".csv"],
      },
      multiple: false,
      disabled: importing,
    });
    return (
      <Box
        {...getRootProps()}
        style={{
          border: "2px dashed var(--marriplan-rose)",
          borderRadius: rem(12),
          padding: 32,
          width: "100%",
          maxWidth: 400,
          background: "var(--marriplan-surface-muted)",
          cursor: "pointer",
          outline: "none",
        }}
      >
        <input {...getInputProps()} />
        <Group justify="center" align="center">
          <IconFileSpreadsheet size={48} color="var(--marriplan-rose)" />
        </Group>
        <Text ta="center" mt="sm" c="dimmed">
          {isDragActive
            ? "Solte o arquivo aqui..."
            : "Clique ou arraste o arquivo .xlsx ou .csv aqui"}
        </Text>
      </Box>
    );
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Importar Planilha de Convidados"
      size="xl"
      centered
    >
      <Stepper active={active} onStepClick={setActive} breakpoint="sm">
        <Stepper.Step icon={<IconDownload size={20} />} label="Modelo">
          <Stack align="center" gap="md">
            <Text size="lg" fw={500}>
              Baixe o modelo de planilha
            </Text>
            <Text ta="center">
              Faça o download do modelo para garantir que os dados estejam no
              formato correto. Utilize um editor de planilhas para preencher os
              convidados.
            </Text>
            <Button
              leftSection={<IconDownload size={18} />}
              onClick={handleDownload}
              styles={softButtonStyles}
            >
              Baixar modelo de planilha
            </Button>
            <Button
              mt="md"
              onClick={() => setActive(1)}
              styles={primaryButtonStyles}
            >
              Avançar
            </Button>
          </Stack>
        </Stepper.Step>
        <Stepper.Step icon={<IconUpload size={20} />} label="Importar">
          <Stack align="center" gap="md">
            <Text size="lg" fw={500}>
              Selecione ou arraste sua planilha preenchida
            </Text>
            <DropzoneArea onDrop={handleDrop} importing={importing} />
            {importError && (
              <Notification color="red" mt="md">
                {importError}
              </Notification>
            )}
            <Button
              mt="md"
              onClick={() => setActive(0)}
              styles={softButtonStyles}
            >
              Voltar
            </Button>
          </Stack>
        </Stepper.Step>
        <Stepper.Step
          icon={<IconFileSpreadsheet size={20} />}
          label="Mapeamento"
        >
          <Stack gap="md">
            <Text size="lg" fw={500}>
              Mapeie as colunas da sua planilha
            </Text>
            <Text c="dimmed">
              Verifique se cada coluna da sua planilha está corretamente
              associada ao campo esperado. Ajuste se necessário.
            </Text>
            <Table withColumnBorders withRowBorders striped highlightOnHover>
              <thead>
                <tr
                  style={{ borderBottom: "1px solid var(--marriplan-border)" }}
                >
                  <th
                    style={{
                      textAlign: "center",
                      verticalAlign: "middle",
                      borderRight: "1px solid var(--marriplan-border)",
                      fontSize: 16,
                      padding: "16px 0",
                    }}
                  >
                    Campo esperado
                  </th>
                  <th
                    style={{
                      textAlign: "center",
                      verticalAlign: "middle",
                      fontSize: 16,
                      padding: "16px 0",
                    }}
                  >
                    Coluna da planilha
                  </th>
                </tr>
              </thead>
              <tbody>
                {EXPECTED_COLUMNS.map((col, idx) => (
                  <tr
                    key={col.key}
                    style={{
                      borderBottom: "1px solid var(--marriplan-border)",
                      height: 56,
                    }}
                  >
                    <td
                      style={{
                        textAlign: "center",
                        verticalAlign: "middle",
                        borderRight: "1px solid var(--marriplan-border)",
                        fontSize: 15,
                        padding: "12px 0",
                        background:
                          idx % 2 === 0
                            ? "var(--marriplan-surface-muted)"
                            : "#fff",
                      }}
                    >
                      {col.label}
                    </td>
                    <td
                      style={{
                        textAlign: "center",
                        verticalAlign: "middle",
                        fontSize: 15,
                        padding: "12px 0",
                        background:
                          idx % 2 === 0
                            ? "var(--marriplan-surface-muted)"
                            : "#fff",
                      }}
                    >
                      <select
                        value={mapping[col.key] || ""}
                        onChange={(e) =>
                          handleMappingChange(col.key, e.target.value)
                        }
                        style={{
                          width: 200,
                          textAlign: "center",
                          height: 36,
                          fontSize: 15,
                          borderRadius: 8,
                          border: "1px solid var(--marriplan-border)",
                          background: "#fff",
                          margin: "0 4px",
                        }}
                      >
                        <option value="">Selecione...</option>
                        {columns.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <Group mt="md" gap="md" grow>
              <Button
                onClick={() => setActive(1)}
                styles={softButtonStyles}
                fullWidth
              >
                Voltar
              </Button>
              <Button
                onClick={() => setActive(3)}
                disabled={Object.values(mapping).some((v) => !v)}
                styles={primaryButtonStyles}
                fullWidth
              >
                Avançar
              </Button>
            </Group>
          </Stack>
        </Stepper.Step>
        <Stepper.Step icon={<IconCheck size={20} />} label="Preview">
          <Stack gap="md">
            <Text size="lg" fw={500}>
              Pré-visualização dos dados
            </Text>
            <Text c="dimmed">
              Confira as 5 primeiras linhas da planilha de acordo com o
              mapeamento.
            </Text>
            <DataTable
              withBorder
              withColumnBorders
              striped
              highlightOnHover
              minHeight={120}
              records={preview.slice(0, 5)}
              columns={EXPECTED_COLUMNS.map((col) => ({
                accessor: col.label,
                title: col.label,
                render: (row: any) => {
                  const value = row[mapping[col.key]] || "";
                  const display =
                    value && value.length > 30
                      ? value.slice(0, 30) + "..."
                      : value;
                  return value ? (
                    <Tooltip
                      label={value}
                      multiline
                      maw={400}
                      withArrow
                      position="top-start"
                    >
                      <span>{display}</span>
                    </Tooltip>
                  ) : (
                    <span>{display}</span>
                  );
                },
                textAlign: "center",
                maxWidth: 200,
              }))}
              styles={{
                table: { minWidth: 600 },
                th: { fontSize: 14, padding: "8px 4px", textAlign: "center" },
                td: {
                  fontSize: 14,
                  padding: "8px 4px",
                  textAlign: "center",
                  maxWidth: 180,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                },
              }}
              scrollAreaProps={{
                style: { maxWidth: "100%", overflowX: "auto" },
              }}
            />
            {finalizeError && finalizeError.length > 0 && (
              <Box
                bg="#fffbe6"
                p="md"
                style={{ border: "1px solid #ffe58f", borderRadius: 6 }}
              >
                <Text fw={500} mb={4} color="orange">
                  Erros encontrados na importação:
                </Text>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {finalizeError.map((err, i) => {
                    let msg = "";
                    if (typeof err === "string") {
                      msg = err;
                    } else if (err && typeof err === "object") {
                      if (err.error) {
                        msg =
                          typeof err.error === "string"
                            ? err.error
                            : JSON.stringify(err.error);
                      } else if (err.email) {
                        // Exemplo: { email: ["mensagem"] }
                        msg = Object.entries(err)
                          .map(
                            ([k, v]) =>
                              `${k}: ${Array.isArray(v) ? v.join(", ") : v}`,
                          )
                          .join("; ");
                      } else {
                        msg = JSON.stringify(err);
                      }
                    }
                    return (
                      <li key={i} style={{ color: "#ad6800" }}>
                        {msg}
                      </li>
                    );
                  })}
                </ul>
              </Box>
            )}
            {success && (
              <Notification color="green" mt="md">
                Importação realizada com sucesso!
              </Notification>
            )}
            <Group mt="md" gap="md" grow>
              <Button
                onClick={() => setActive(2)}
                styles={softButtonStyles}
                fullWidth
              >
                Voltar
              </Button>
              <Button
                onClick={handleFinalize}
                disabled={
                  preview.length === 0 || Object.values(mapping).some((v) => !v)
                }
                loading={importing}
                styles={primaryButtonStyles}
                fullWidth
              >
                Finalizar importação
              </Button>
            </Group>
          </Stack>
        </Stepper.Step>
      </Stepper>
    </Modal>
  );
}

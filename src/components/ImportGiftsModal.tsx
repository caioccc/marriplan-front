import { useToast } from "@/hooks/use-toast";
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
  Tooltip,
} from "@mantine/core";
import {
  IconCheck,
  IconDownload,
  IconFileSpreadsheet,
  IconUpload,
} from "@tabler/icons-react";
import { DataTable } from "mantine-datatable";
import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";

interface ImportGiftsModalProps {
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
  downloadTemplate: () => Promise<void>;
  finalizeImport: (
    file: File,
  ) => Promise<{
    success: boolean;
    errors?: Array<{ error?: string } | string>;
  }>;
}

interface ImportPreviewRow {
  [key: string]: string;
}

const EXPECTED_COLUMNS = [
  { key: "name", label: "Nome do Presente" },
  { key: "value", label: "Valor" },
  { key: "link", label: "Link" },
  { key: "description", label: "Descrição" },
  { key: "category", label: "Categoria" },
  { key: "image", label: "Imagem" },
  { key: "status", label: "Status" },
  { key: "product_code", label: "Código do Produto" },
];

export default function ImportGiftsModal({
  opened,
  onClose,
  onSuccess,
  downloadTemplate,
  finalizeImport,
}: ImportGiftsModalProps) {
  const [active, setActive] = useState(0);
  const [importing, setImporting] = useState(false);
  const [columns, setColumns] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState<ImportPreviewRow[]>([]);
  const [importError, setImportError] = useState<string | null>(null);
  const [finalizeError, setFinalizeError] = useState<Array<
    { error?: string } | string
  > | null>(null);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

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

  const handleDownload = async () => {
    await downloadTemplate();
  };

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
      const json = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1 });
      const [header, ...rows] = json;
      const normalizedHeader = Array.isArray(header)
        ? header.map((column) => String(column ?? ""))
        : [];
      setColumns(normalizedHeader);
      setPreview(
        rows.map((row: unknown[]) => {
          const obj: ImportPreviewRow = {};
          normalizedHeader.forEach((col, idx) => {
            const value = row?.[idx];
            obj[col] =
              value === undefined || value === null ? "" : String(value);
          });
          return obj;
        }),
      );

      const autoMap: Record<string, string> = {};
      EXPECTED_COLUMNS.forEach((col) => {
        const found = normalizedHeader.find(
          (candidate) =>
            candidate.trim().toLowerCase() === col.label.trim().toLowerCase(),
        );
        if (found) autoMap[col.key] = found;
      });

      setMapping(autoMap);
      setActive(2);
    } catch (error: unknown) {
      setImportError(
        error instanceof Error ? error.message : "Erro ao ler planilha.",
      );
    } finally {
      setImporting(false);
    }
  };

  const handleMappingChange = (target: string, value: string) => {
    setMapping((current) => ({ ...current, [target]: value }));
  };

  const handleFinalize = async () => {
    setFinalizeError(null);
    setImporting(true);
    try {
      const mappedKeys = Object.keys(mapping).filter((key) => mapping[key]);
      const newHeader = mappedKeys;
      const newRows = preview.map((row) =>
        mappedKeys.map((key) => row[mapping[key]] ?? ""),
      );
      const ws = XLSX.utils.aoa_to_sheet([newHeader, ...newRows]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Presentes");
      const wbout = XLSX.write(wb, { type: "array", bookType: "xlsx" });
      const finalFile = new File([wbout], "presentes_importados.xlsx", {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const res = await finalizeImport(finalFile);

      if (res.success && (!res.errors || res.errors.length === 0)) {
        setSuccess(true);
        toast({
          title: "Presentes importados",
          description:
            "A importação foi concluída com sucesso. Confira a lista de presentes.",
        });
        onSuccess();
        onClose();
        return;
      }

      setFinalizeError(res.errors || []);
    } catch (error: unknown) {
      setFinalizeError([
        {
          error:
            error instanceof Error
              ? error.message
              : "Erro ao finalizar a importação.",
        },
      ]);
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
          maxWidth: 420,
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
      title="Importar Planilha de Presentes"
      size="xl"
      centered
      overlayProps={{ blur: 2 }}
    >
      <Stepper active={active} onStepClick={setActive}>
        <Stepper.Step icon={<IconDownload size={20} />} label="Modelo">
          <Stack align="center" gap="md">
            <Text size="lg" fw={500}>
              Baixe o modelo de planilha
            </Text>
            <Text ta="center">
              Faça o download do modelo para garantir que os dados estejam no
              formato correto. Utilize um editor de planilhas para preencher os
              presentes.
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
                {EXPECTED_COLUMNS.map((col, index) => (
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
                          index % 2 === 0
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
                          index % 2 === 0
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
                          width: 220,
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
                        {columns.map((column) => (
                          <option key={column} value={column}>
                            {column}
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
                disabled={Object.values(mapping).some((value) => !value)}
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
              withColumnBorders
              striped
              highlightOnHover
              minHeight={120}
              records={preview.slice(0, 5)}
              columns={EXPECTED_COLUMNS.map((col) => ({
                accessor: col.label,
                title: col.label,
                render: (row: ImportPreviewRow) => {
                  const value = row[mapping[col.key]] || "";
                  const display =
                    value && value.length > 30
                      ? `${value.slice(0, 30)}...`
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
                textAlign: "center" as const,
                maxWidth: 200,
              }))}
              styles={{
                table: { minWidth: 600 },
              }}
              scrollAreaProps={{
                style: { maxWidth: "100%", overflowX: "auto" },
              }}
            />
            {finalizeError && finalizeError.length > 0 && (
              <Box
                bg="var(--marriplan-surface-muted)"
                p="md"
                style={{
                  border: "1px solid var(--marriplan-border)",
                  borderRadius: 6,
                }}
              >
                <Text fw={500} mb={4} c="orange">
                  Erros encontrados na importação:
                </Text>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {finalizeError.map((err, index) => {
                    const message =
                      typeof err === "string"
                        ? err
                        : err.error || JSON.stringify(err);
                    return (
                      <li key={index} style={{ color: "#ad6800" }}>
                        {message}
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
                  preview.length === 0 ||
                  Object.values(mapping).some((value) => !value)
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

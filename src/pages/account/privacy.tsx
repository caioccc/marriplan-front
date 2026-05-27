import BaseLayout from "@/components/Layout/_BaseLayout";
import { useAuth } from "@/contexts/AuthContext";
import { deleteAccount, exportAccountData } from "@/services/privacy";
import {
  authInputStyles,
  primaryButtonStyles,
  primaryButtonStylesWithDisabled,
  softButtonStyles,
} from "@/styles";
import {
  Alert,
  Box,
  Button,
  Group,
  Modal,
  Paper,
  PasswordInput,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import {
  IconAlertTriangle,
  IconDownload,
  IconLock,
  IconShieldLock,
  IconTrash,
} from "@tabler/icons-react";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

type CookiePreferences = {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
};

const COOKIE_PREFERENCES_KEY = "marriplan_cookie_preferences";
const DELETE_CONFIRMATION_TEXT = "EXCLUIR";

const defaultCookiePreferences: CookiePreferences = {
  essential: true,
  analytics: false,
  marketing: false,
  personalization: false,
};

const cardStyles = {
  root: {
    background: "var(--marriplan-surface)",
    border: "1px solid var(--marriplan-border)",
    borderRadius: 20,
    boxShadow: "var(--marriplan-shadow)",
  },
} as const;

const cardTitleStyle = {
  color: "var(--marriplan-text)",
  fontWeight: 700,
} as const;

export default function AccountPrivacyPage() {
  const router = useRouter();
  const { logout, user } = useAuth();

  const [cookiePreferences, setCookiePreferences] =
    useState<CookiePreferences>(defaultCookiePreferences);
  const [cookieModalOpen, setCookieModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");

  const [cookieSaveSuccess, setCookieSaveSuccess] = useState<string | null>(null);
  const [cookieSaveError, setCookieSaveError] = useState<string | null>(null);

  const [exportLoading, setExportLoading] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const requiresCurrentPassword =
    user?.login_method !== "LOGIN_GOOGLE" && user?.has_usable_password !== false;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(COOKIE_PREFERENCES_KEY);
      if (!raw) {
        setCookiePreferences(defaultCookiePreferences);
        return;
      }

      const parsed = JSON.parse(raw) as Partial<CookiePreferences>;
      setCookiePreferences({
        essential: true,
        analytics: !!parsed.analytics,
        marketing: !!parsed.marketing,
        personalization: !!parsed.personalization,
      });
    } catch {
      setCookiePreferences(defaultCookiePreferences);
    }
  }, []);

  const canDeleteAccount = useMemo(() => {
    const hasRequiredPassword = requiresCurrentPassword ? !!currentPassword.trim() : true;
    return confirmationText.trim() === DELETE_CONFIRMATION_TEXT && hasRequiredPassword;
  }, [confirmationText, currentPassword, requiresCurrentPassword]);

  const handleDownloadData = async () => {
    setExportLoading(true);
    setExportError(null);

    try {
      const data = await exportAccountData();
      const fileName = `marriplan-dados-${new Date().toISOString().slice(0, 10)}.json`;
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      setExportError("Não foi possível exportar seus dados agora. Tente novamente.");
    } finally {
      setExportLoading(false);
    }
  };

  const handleSaveCookiePreferences = () => {
    setCookieSaveSuccess(null);
    setCookieSaveError(null);

    try {
      localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(cookiePreferences));
      setCookieSaveSuccess("Preferências de cookies salvas com sucesso.");
      setCookieModalOpen(false);
    } catch {
      setCookieSaveError("Não foi possível salvar as preferências de cookies.");
    }
  };

  const handleDeleteAccount = async () => {
    if (!canDeleteAccount) {
      return;
    }

    setDeleteLoading(true);
    setDeleteError(null);

    try {
      await deleteAccount(currentPassword);
      logout();
      localStorage.removeItem(COOKIE_PREFERENCES_KEY);
      await router.push("/login?reason=account_deleted");
    } catch (error: any) {
      const detail =
        error?.response?.data?.detail ||
        "Não foi possível excluir a conta neste momento.";
      setDeleteError(detail);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <BaseLayout>
      <Box
        style={{
          width: "100%",
          background: "var(--marriplan-surface)",
          border: "1px solid var(--marriplan-border)",
          borderRadius: 20,
          boxShadow: "var(--marriplan-shadow)",
          padding: 24,
        }}
      >
        <Stack gap="md" mb="lg">
          <Group gap="sm">
            <Box
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--marriplan-champagne)",
                border: "1px solid var(--marriplan-border)",
                color: "var(--marriplan-rose)",
              }}
            >
              <IconShieldLock size={24} />
            </Box>
            <div>
              <Title order={2}>Menu de Privacidade</Title>
              <Text c="dimmed">Seus dados (LGPD)</Text>
            </div>
          </Group>

          <Text c="dimmed" maw={920}>
            Conforme a Lei Geral de Proteção de Dados (LGPD), você pode acessar, exportar e excluir os dados pessoais que armazenamos sobre você e seu casamento.
          </Text>
        </Stack>

        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
          <Paper p="xl" styles={cardStyles}>
            <Stack gap="sm">
              <Title order={4} style={cardTitleStyle}>
                Privacidade e dados
              </Title>
              <Text c="dimmed">
                Gerencie seus dados pessoais conforme a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).
              </Text>
            </Stack>
          </Paper>

          <Paper p="xl" styles={cardStyles}>
            <Stack gap="md">
              <Title order={4} style={cardTitleStyle}>
                Baixar meus dados
              </Title>
              <Text c="dimmed">
                Receba uma cópia completa dos seus dados em formato JSON, incluindo convidados, eventos, tarefas, orçamento e mensagens.
              </Text>
              <Group>
                <Button
                  leftSection={<IconDownload size={16} />}
                  loading={exportLoading}
                  onClick={handleDownloadData}
                  styles={primaryButtonStyles}
                >
                  Baixar meus dados
                </Button>
              </Group>
              {exportError ? (
                <Alert color="red" title="Exportação de dados">
                  {exportError}
                </Alert>
              ) : null}
            </Stack>
          </Paper>

          <Paper p="xl" styles={cardStyles}>
            <Stack gap="md">
              <Title order={4} style={cardTitleStyle}>
                Preferências de cookies
              </Title>
              <Text c="dimmed">
                Controle quais cookies e tecnologias de rastreamento você permite no Marriplan.
              </Text>
              <Group>
                <Button
                  leftSection={<IconLock size={16} />}
                  onClick={() => setCookieModalOpen(true)}
                  styles={softButtonStyles}
                >
                  Preferências de cookies
                </Button>
              </Group>
              {cookieSaveSuccess ? (
                <Alert color="green" title="Preferências de cookies">
                  {cookieSaveSuccess}
                </Alert>
              ) : null}
              {cookieSaveError ? (
                <Alert color="red" title="Preferências de cookies">
                  {cookieSaveError}
                </Alert>
              ) : null}
            </Stack>
          </Paper>

          <Paper p="xl" styles={cardStyles}>
            <Stack gap="md">
              <Title order={4} style={cardTitleStyle}>
                Excluir minha conta
              </Title>
              <Text c="dimmed">
                Remove permanentemente sua conta e todos os dados associados.
              </Text>
              <Group>
                <Button
                  color="red"
                  leftSection={<IconTrash size={16} />}
                  onClick={() => setDeleteModalOpen(true)}
                >
                  Excluir minha conta
                </Button>
              </Group>
            </Stack>
          </Paper>
        </SimpleGrid>
      </Box>

      <Modal
        opened={cookieModalOpen}
        onClose={() => setCookieModalOpen(false)}
        title="Preferências de cookies"
        centered
        size="lg"
      >
        <Stack gap="md">
          <Switch
            label="Cookies essenciais"
            description="Necessários para autenticação, segurança e funcionamento da plataforma."
            checked
            disabled
          />
          <Switch
            label="Cookies analíticos"
            checked={cookiePreferences.analytics}
            onChange={(event) =>
              setCookiePreferences((prev) => ({
                ...prev,
                analytics: event.target.checked,
              }))
            }
          />
          <Switch
            label="Cookies de marketing"
            checked={cookiePreferences.marketing}
            onChange={(event) =>
              setCookiePreferences((prev) => ({
                ...prev,
                marketing: event.target.checked,
              }))
            }
          />
          <Switch
            label="Cookies de personalização"
            checked={cookiePreferences.personalization}
            onChange={(event) =>
              setCookiePreferences((prev) => ({
                ...prev,
                personalization: event.target.checked,
              }))
            }
          />

          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={() => setCookieModalOpen(false)}>
              Cancelar
            </Button>
            <Button styles={primaryButtonStyles} onClick={handleSaveCookiePreferences}>
              Salvar preferências
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={deleteModalOpen}
        onClose={() => {
          if (!deleteLoading) {
            setDeleteModalOpen(false);
          }
        }}
        title="Excluir conta permanentemente"
        centered
        size="lg"
      >
        <Stack gap="md">
          <Alert color="red" icon={<IconAlertTriangle size={16} />}>
            Essa ação é irreversível. Todos os dados da sua conta e do seu casamento serão removidos permanentemente.
          </Alert>

          <TextInput
            label={`Digite ${DELETE_CONFIRMATION_TEXT} para confirmar`}
            value={confirmationText}
            onChange={(event) => setConfirmationText(event.currentTarget.value)}
            styles={authInputStyles}
          />

          {requiresCurrentPassword ? (
            <PasswordInput
              label="Senha atual"
              placeholder="Digite sua senha atual"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.currentTarget.value)}
              styles={authInputStyles}
            />
          ) : (
            <Alert color="blue" title="Conta vinculada ao Google">
              Esta conta foi criada com Google Login. Você não precisa informar senha para excluir a conta.
            </Alert>
          )}

          {deleteError ? <Alert color="red">{deleteError}</Alert> : null}

          <Group justify="flex-end">
            <Button
              variant="default"
              disabled={deleteLoading}
              onClick={() => setDeleteModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              color="red"
              loading={deleteLoading}
              disabled={!canDeleteAccount}
              leftSection={<IconTrash size={16} />}
              styles={primaryButtonStylesWithDisabled}
              onClick={handleDeleteAccount}
            >
              Confirmar exclusão
            </Button>
          </Group>
        </Stack>
      </Modal>
    </BaseLayout>
  );
}

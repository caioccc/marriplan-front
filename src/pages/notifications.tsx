import { AnimatedTargetDot } from "@/components/AnimatedTargetDot";
import BaseLayout from "@/components/Layout/_BaseLayout";
import { PAGE_SIZE, PAGES_SIZES, truncate } from "@/lib/utils";
import {
  fetchNotifications,
  markAllAsRead,
  markAllAsUnread,
  markAsRead,
  markAsUnread,
  removeAllNotifications,
  removeNotification,
} from "@/services/notifications";
import { primaryButtonStyles, softButtonStyles } from "@/styles";
import {
  ActionIcon,
  Box,
  Button,
  Group,
  Menu,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import {
  IconBell,
  IconDotsVertical,
  IconEye,
  IconEyeOff,
  IconTrash,
} from "@tabler/icons-react";
import { DataTable } from "mantine-datatable";
import { useCallback, useEffect, useState } from "react";

type NotificationItem = {
  id: number | string;
  type: string;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [total, setTotal] = useState(0);
  const isCompactLayout = useMediaQuery("(max-width: 1024px)");

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    const data = await fetchNotifications(page, pageSize);
    setNotifications(data.results ?? []);
    setTotal(data.count);
    setLoading(false);
  }, [page, pageSize]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkAsRead = async (id: number | string) => {
    await markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    );
  };

  const handleMarkAsUnread = async (id: number | string) => {
    await markAsUnread(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: false } : n)),
    );
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const handleMarkAllAsUnread = async () => {
    await markAllAsUnread();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: false })));
  };

  const handleRemoveNotification = async (id: number | string) => {
    await removeNotification(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleRemoveAll = async () => {
    await removeAllNotifications();
    setNotifications([]);
  };

  const getColor = (type) => {
    return type === "success"
      ? "green"
      : type === "error"
      ? "red"
      : type === "warning"
      ? "yellow"
      : "blue";
  };

  const tableColumns = isCompactLayout
    ? [
        {
          accessor: "type",
          title: "Tipo",
          render: (n) => <AnimatedTargetDot color={getColor(n.type)} />,
        },
        {
          accessor: "message",
          title: "Mensagem",
          render: (n) => (
            <Tooltip label={n.message} withArrow>
              <Text
                style={
                  n.is_read
                    ? { textDecoration: "line-through", color: "#adb5bd" }
                    : {}
                }
              >
                {truncate(n.message, 30)}
              </Text>
            </Tooltip>
          ),
        },
        {
          accessor: "actions",
          title: "Ações",
          render: (n) =>
            isCompactLayout ? (
              <Menu shadow="md" width={220} position="bottom-end">
                <Menu.Target>
                  <ActionIcon
                    variant="subtle"
                    aria-label="Ações da notificação"
                    style={{ color: "var(--marriplan-text)" }}
                  >
                    <IconDotsVertical size={18} />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  {n.is_read ? (
                    <Menu.Item
                      leftSection={<IconEyeOff size={16} />}
                      onClick={() => handleMarkAsUnread(n.id)}
                    >
                      Marcar como não lida
                    </Menu.Item>
                  ) : (
                    <Menu.Item
                      leftSection={<IconEye size={16} />}
                      onClick={() => handleMarkAsRead(n.id)}
                    >
                      Marcar como lida
                    </Menu.Item>
                  )}
                  <Menu.Item
                    leftSection={<IconTrash size={16} />}
                    onClick={() => handleRemoveNotification(n.id)}
                    color="red"
                  >
                    Excluir
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            ) : (
              <Group gap="xs">
                {n.is_read ? (
                  <Button
                    size="compact-xs"
                    variant="subtle"
                    onClick={() => handleMarkAsUnread(n.id)}
                    styles={softButtonStyles}
                  >
                    <IconEyeOff size={18} />
                  </Button>
                ) : (
                  <Button
                    size="compact-xs"
                    variant="subtle"
                    onClick={() => handleMarkAsRead(n.id)}
                    styles={primaryButtonStyles}
                  >
                    <IconEye size={18} />
                  </Button>
                )}
                <Button
                  size="compact-xs"
                  variant="subtle"
                  onClick={() => handleRemoveNotification(n.id)}
                  styles={destructiveButtonStyles}
                >
                  <IconTrash size={18} />
                </Button>
              </Group>
            ),
        },
      ]
    : [
        {
          accessor: "type",
          title: "Tipo",
          render: (n) => <AnimatedTargetDot color={getColor(n.type)} />,
        },
        {
          accessor: "title",
          title: "Título",
          render: (n) => (
            <Text
              style={
                n.is_read
                  ? { textDecoration: "line-through", color: "#adb5bd" }
                  : {}
              }
            >
              {truncate(n.title, 30)}
            </Text>
          ),
        },
        {
          accessor: "message",
          title: "Mensagem",
          render: (n) => (
            <Tooltip label={n.message} withArrow>
              <Text
                style={
                  n.is_read
                    ? { textDecoration: "line-through", color: "#adb5bd" }
                    : {}
                }
              >
                {truncate(n.message, 30)}
              </Text>
            </Tooltip>
          ),
        },
        {
          accessor: "created_at",
          title: "Data/Hora",
          render: (n) => new Date(n.created_at).toLocaleString(),
        },
        {
          accessor: "actions",
          title: "Ações",
          render: (n) => (
            <Group gap="xs">
              {n.is_read ? (
                <Button
                  size="compact-xs"
                  variant="subtle"
                  onClick={() => handleMarkAsUnread(n.id)}
                  styles={softButtonStyles}
                >
                  <IconEyeOff size={18} />
                </Button>
              ) : (
                <Button
                  size="compact-xs"
                  variant="subtle"
                  onClick={() => handleMarkAsRead(n.id)}
                  styles={primaryButtonStyles}
                >
                  <IconEye size={18} />
                </Button>
              )}
              <Button
                size="compact-xs"
                variant="subtle"
                onClick={() => handleRemoveNotification(n.id)}
                styles={destructiveButtonStyles}
              >
                <IconTrash size={18} />
              </Button>
            </Group>
          ),
        },
      ];

  const pageStyles = {
    root: {
      background: "var(--marriplan-surface)",
      border: "1px solid var(--marriplan-border)",
      borderRadius: 20,
      boxShadow: "var(--marriplan-shadow)",
      padding: 20,
    },
  } as const;

  const destructiveButtonStyles = {
    root: {
      backgroundColor: "#f8ebe6",
      color: "#9f5a49",
      borderRadius: 12,
      border: "1px solid #e6c7bc",
      transition: "all 160ms ease",
      "&:hover": {
        backgroundColor: "#efdcd3",
      },
      "&:focus-visible": {
        outline: "2px solid rgba(181, 139, 122, 0.45)",
        outlineOffset: 2,
      },
    },
  } as const;

  return (
    <BaseLayout>
      <Box style={pageStyles.root}>
        <Group mb="md" align="center" gap="sm">
          <Box
            style={{
              width: 42,
              height: 42,
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "var(--marriplan-champagne)",
              color: "var(--marriplan-rose)",
              border: "1px solid var(--marriplan-border)",
            }}
          >
            <IconBell size={22} />
          </Box>
          <Box>
            <Title order={2} style={{ marginBottom: 4 }}>
              Notificações
            </Title>
            <Text size="sm" c="dimmed">
              Gerencie leituras, pendências e limpeza da sua caixa.
            </Text>
          </Box>
        </Group>
        <Group mb="md" gap="sm" wrap="wrap">
          <Button
            leftSection={<IconEye size={16} />}
            onClick={handleMarkAllAsRead}
            styles={primaryButtonStyles}
          >
            Marcar todas como lida
          </Button>
          <Button
            leftSection={<IconEyeOff size={16} />}
            onClick={handleMarkAllAsUnread}
            styles={softButtonStyles}
          >
            Marcar todas como não lida
          </Button>
          <Button
            leftSection={<IconTrash size={16} />}
            onClick={handleRemoveAll}
            styles={destructiveButtonStyles}
          >
            Limpar notificações
          </Button>
        </Group>
        <Box
          style={{ display: "flex", flexDirection: "column", width: "100%" }}
        >
          <DataTable
            className="notifications-table"
            columns={tableColumns}
            records={notifications}
            highlightOnHover
            fetching={loading}
            totalRecords={total}
            recordsPerPage={pageSize}
            page={page}
            onPageChange={setPage}
            recordsPerPageOptions={PAGES_SIZES}
            onRecordsPerPageChange={(value) => {
              setPageSize(value);
              setPage(1);
            }}
            recordsPerPageLabel={"Itens por página"}
            noRecordsText={"Nenhuma notificação encontrada"}
            paginationText={({ from, to, totalRecords }) =>
              `${from} - ${to} de ${totalRecords} itens`
            }
          />
        </Box>
        <style>{`
                                        .notifications-table {
                                            --dt-border-color: var(--marriplan-border);
                                        }

                                        .notifications-table .mantine-DataTable-table {
                                            background: var(--marriplan-surface);
                                            border-radius: 16px;
                                            overflow: hidden;
                                        }

                                        .notifications-table .mantine-DataTable-table thead th {
                                            background: linear-gradient(180deg, #f7efe5 0%, #f3e7d8 100%);
                                            color: var(--marriplan-text);
                                            font-weight: 700;
                                        }

                                        .notifications-table .mantine-DataTable-table tbody tr {
                                            transition: background-color 160ms ease;
                                        }

                                        .notifications-table .mantine-DataTable-table tbody tr:hover {
                                            background-color: rgba(242, 230, 216, 0.55);
                                        }

                                        .notifications-table .mantine-DataTable-table th,
                                        .notifications-table .mantine-DataTable-table td {
                                            border-color: var(--marriplan-border);
                                        }

                                        .notifications-table .mantine-DataTable-pagination .mantine-Pagination-control,
                                        .notifications-table .mantine-Pagination-control {
                                            border-radius: 12px;
                                            border-color: var(--marriplan-border);
                                            color: var(--marriplan-text);
                                        }

                                        .notifications-table .mantine-DataTable-pagination .mantine-Pagination-control[data-active],
                                        .notifications-table .mantine-Pagination-control[data-active] {
                                            background-color: var(--marriplan-rose);
                                            border-color: var(--marriplan-rose);
                                            color: #fff;
                                        }

                                        .notifications-table .mantine-Input-input,
                                        .notifications-table .mantine-Select-input,
                                        .notifications-table .mantine-NumberInput-input {
                                            border-radius: 12px;
                                            border-color: var(--marriplan-border);
                                        }

                                        .notifications-table .mantine-Input-input:focus,
                                        .notifications-table .mantine-Select-input:focus,
                                        .notifications-table .mantine-NumberInput-input:focus {
                                            border-color: var(--marriplan-rose);
                                        }
                                `}</style>
      </Box>
    </BaseLayout>
  );
}

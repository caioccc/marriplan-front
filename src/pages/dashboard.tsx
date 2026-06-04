//eslint-disable react-hooks/exhaustive-deps
//eslint-disable @typescript-eslint/no-unused-vars
/* eslint-disable @typescript-eslint/no-explicit-any */
//eslint no-explicit-any: "off"

import { UpgradeCta } from "@/components/billing/UpgradeCta";
import BaseLayout from "@/components/Layout/_BaseLayout";
import { MarriplanStatusBadge } from "@/components/MarriplanStatusBadge";
import { SuppliersCarouselRow } from "@/components/SuppliersCarouselRow";
import {
  DRESS_CODE_OPTIONS,
  WEDDING_SIZES,
  WEDDING_STYLES,
} from "@/constants/weddingIdentityData";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { useWeddingIdentityState } from "@/hooks/useWeddingIdentityState";
import { fetchChecklistTasks, updateChecklistTask } from "@/services/checklist";
import { giftsService } from "@/services/giftsService";
import {
  guests_generate_confirmation_link,
  guests_list_all,
  guests_partial_update,
} from "@/services/guests";
import { primaryButtonStyles, softButtonStyles } from "@/styles";
import { ChecklistTask } from "@/types/checklist";
import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Center,
  Checkbox,
  Container,
  Divider,
  Flex,
  Group,
  Image,
  Loader,
  Menu,
  Modal,
  Paper,
  Progress,
  RingProgress,
  ScrollArea,
  SimpleGrid,
  Stack,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IconBrandWhatsapp,
  IconCalendar,
  IconCheck,
  IconChecklist,
  IconChevronRight,
  IconClock,
  IconCopy,
  IconDotsVertical,
  IconEye,
  IconGift,
  IconLink,
  IconMail,
  IconMapPin,
  IconPhoto,
  IconSparkles,
  IconUsers,
} from "@tabler/icons-react";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";

// Tipos de dados
interface Guest {
  id: string;
  name: string;
  status_presenca: "Pending" | "Confirmed" | "Refused";
  plusOne: boolean;
  avatar?: string;
  acompanhantes?: number;
  observacoes?: string;
  alergias?: string;
  email?: string;
  phone?: string;
  photo_url?: string;
  user?: number | null;
  created_at?: string;
  updated_at?: string;
  wedding_profile?: number;
  whatsapp?: string;
}

interface Gift {
  id: number;
  name: string;
  description: string;
  price?: number; // deprecated, use value
  value: number | string;
  status: "available" | "purchased" | "reserved";
  image?: string;
  icon?: string;
  category: string;
  product_code?: string;
  link?: string;
  purchased_by?: string;
  purchase_date?: string | null;
  created_at?: string;
  updated_at?: string;
  wedding_profile?: number;
}

interface WeddingOverview {
  date: string;
  venue: string;
  confirmedGuests: number;
  totalGuests: number;
}

interface CountdownState {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isComplete: boolean;
}

interface GuestsResponse {
  results: Guest[];
  count: number;
}

interface GiftsResponse {
  results: Gift[];
  count: number;
}

const MarriplanDashboard: React.FC = () => {
  const [guests, setGuests] = useState<GuestsResponse>({
    results: [],
    count: 0,
  });
  const [gifts, setGifts] = useState<GiftsResponse>({ results: [], count: 0 });
  const [allGifts, setAllGifts] = useState<GiftsResponse>({
    results: [],
    count: 0,
  });
  const [loadingGuests, setLoadingGuests] = useState(false);
  const [loadingGifts, setLoadingGifts] = useState(false);
  const [loadingChecklist, setLoadingChecklist] = useState(false);
  const [checklistTasks, setChecklistTasks] = useState<ChecklistTask[]>([]);
  const [giftPage, setGiftPage] = useState(0);
  const { user } = useAuth();
  const { isFree } = useSubscription();
  const {
    palette: identityPalette,
    selectedStyle,
    weddingSize,
    dressCode,
  } = useWeddingIdentityState();
  const [countdown, setCountdown] = useState<CountdownState>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isComplete: false,
  });

  const router = useRouter();

  const [presencaModalOpen, setPresencaModalOpen] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [confirmationData, setConfirmationData] = useState<{
    confirmation_url?: string;
    whatsapp_link?: string;
    token?: string;
  } | null>(null);

  // Dados reais do perfil de casamento
  // Visão Geral do Casamento com dados reais
  let weddingOverview: WeddingOverview = {
    date: "-",
    venue: "-",
    confirmedGuests: 0,
    totalGuests: 0,
  };

  const weddingDateTime = useMemo(() => {
    if (
      !user?.wedding_profile?.data_casamento ||
      !user?.wedding_profile?.hora_casamento
    )
      return null;
    const time = user.wedding_profile.hora_casamento;
    return new Date(`${user.wedding_profile.data_casamento}T${time}`);
  }, [
    user?.wedding_profile?.data_casamento,
    user?.wedding_profile?.hora_casamento,
  ]);

  const hasWeddingDate = !!user?.wedding_profile?.data_casamento;
  const hasWeddingVenue = !!user?.wedding_profile?.local;

  if (user?.wedding_profile) {
    const p = user.wedding_profile;
    // Data formatada e cálculo de dias restantes
    const weddingDateDisplay = p.data_casamento
      ? new Date(`${p.data_casamento}T00:00:00`)
      : null;
    // Convidados
    const totalGuests = guests.count;
    const confirmedGuests = guests.results.filter(
      (g) => g.status_presenca === "Confirmed",
    ).length;
    weddingOverview = {
      date: weddingDateDisplay
        ? weddingDateDisplay.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })
        : "-",
      venue: p.local || "-",
      confirmedGuests,
      totalGuests,
    };
  }

  useEffect(() => {
    if (!weddingDateTime) {
      setCountdown({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isComplete: false,
      });
      return;
    }

    const tick = () => {
      const now = Date.now();
      const diff = weddingDateTime.getTime() - now;

      if (diff <= 0) {
        setCountdown({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isComplete: true,
        });
        return;
      }

      const totalSeconds = Math.floor(diff / 1000);
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setCountdown({ days, hours, minutes, seconds, isComplete: false });
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [weddingDateTime]);

  // Carregar convidados reais da API
  async function fetchGuests() {
    setLoadingGuests(true);
    try {
      const data = await guests_list_all();
      const mappedGuests = (data.results || []).map((g: any) => ({
        id: g.id,
        name: g.name,
        status_presenca: g.status_presenca || "Pending",
        plusOne: g.acompanhantes && g.acompanhantes > 0,
        avatar: g.avatar,
        photo_url: g.photo_url,
        email: g.email,
        phone: g.phone,
        observacoes: g.observacoes,
        alergias: g.alergias,
        whatsapp: g.whatsapp,
      }));
      setGuests({
        results: mappedGuests,
        count: data.count,
      });
    } catch (e) {
      console.error(e);
      setGuests({ results: [], count: 0 });
    } finally {
      setLoadingGuests(false);
    }
  }

  // Carregar presentes reais da API
  async function fetchGifts() {
    setLoadingGifts(true);
    try {
      const res = await giftsService.listGifts({ page: 1 });
      const resAll = await giftsService.listAllGifts();
      setAllGifts(
        Array.isArray(resAll)
          ? { results: resAll, count: resAll.length }
          : resAll,
      );
      setGifts(res);
    } catch (e) {
      console.error(e);
      setGifts({ results: [], count: 0 });
    } finally {
      setLoadingGifts(false);
    }
  }

  async function fetchChecklist() {
    setLoadingChecklist(true);
    try {
      const data = await fetchChecklistTasks();
      setChecklistTasks(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setChecklistTasks([]);
    } finally {
      setLoadingChecklist(false);
    }
  }

  useEffect(() => {
    fetchGuests();
    fetchGifts();
    fetchChecklist();
  }, []);

  const loadMoreGuests = async () => {
    setLoadingGuests(true);
    try {
      const data = await guests_list_all();
      const mappedGuests = (data.results || []).map((g: any) => ({
        id: g.id,
        name: g.name,
        status_presenca: g.status_presenca || "Pending",
        plusOne: g.acompanhantes && g.acompanhantes > 0,
        avatar: g.avatar,
        photo_url: g.photo_url,
        email: g.email,
        phone: g.phone,
        observacoes: g.observacoes,
        alergias: g.alergias,
        whatsapp: g.whatsapp,
      }));
      setGuests({
        results: mappedGuests,
        count: data.count,
      });
    } catch (e) {
      console.error(e);
      // erro silencioso
    } finally {
      setLoadingGuests(false);
    }
  };

  const loadMoreGifts = async () => {
    setLoadingGifts(true);
    try {
      const nextPage = giftPage + 1;
      const res = await giftsService.listGifts({ page: nextPage + 1 });
      setGifts((prev) => ({
        results: [...prev.results, ...res.results],
        count: res.count,
      }));
      setGiftPage(nextPage);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingGifts(false);
    }
  };

  const palette = {
    champagne: "#F7F1E8",
    roseGold: "#E6B8A2",
    beige: "#EFE6DA",
    warmGray: "#6F6660",
    ink: "#2D2622",
    line: "#EEE3D8",
    softWhite: "#FFFCF8",
  };

  const sizeData = WEDDING_SIZES.find((size) => size.id === weddingSize);
  const styleData = WEDDING_STYLES.find((style) => style.id === selectedStyle);
  const dressData = DRESS_CODE_OPTIONS.find((dress) => dress.id === dressCode);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const hasPalette = identityPalette.length > 0;
  const hasWeddingSize = Boolean(weddingSize && sizeData);
  const hasSelectedStyle = Boolean(selectedStyle && styleData);
  const hasDressCode = Boolean(dressCode && dressData);
  const hasIdentityHighlights =
    hasPalette || hasWeddingSize || hasSelectedStyle || hasDressCode;

  const checklistStats = useMemo(() => {
    const total = checklistTasks.length;
    const done = checklistTasks.filter((task) => task.status === "done").length;
    const inProgress = checklistTasks.filter(
      (task) => task.status === "in_progress",
    ).length;
    const pending = checklistTasks.filter(
      (task) => task.status === "pending",
    ).length;
    const progress = total > 0 ? Math.round((done / total) * 100) : 0;
    return { total, done, inProgress, pending, progress };
  }, [checklistTasks]);

  const guestsProgress =
    weddingOverview.totalGuests > 0
      ? Math.round(
          (weddingOverview.confirmedGuests / weddingOverview.totalGuests) * 100,
        )
      : 0;

  const giftsPurchased = allGifts.results.filter(
    (gift) => gift.status === "purchased",
  ).length;
  const giftsReserved = allGifts.results.filter(
    (gift) => gift.status === "reserved",
  ).length;
  const giftsProgress =
    allGifts.count > 0
      ? Math.round((giftsPurchased / allGifts.count) * 100)
      : 0;

  const nextTasks = useMemo(() => {
    const priorityWeight: Record<string, number> = {
      high: 0,
      medium: 1,
      low: 2,
    };
    return checklistTasks
      .filter((task) => task.status !== "done")
      .sort((a, b) => {
        const dateA = a.due_date || a.start_date || a.created_at;
        const dateB = b.due_date || b.start_date || b.created_at;
        const timeA = dateA
          ? new Date(dateA).getTime()
          : Number.MAX_SAFE_INTEGER;
        const timeB = dateB
          ? new Date(dateB).getTime()
          : Number.MAX_SAFE_INTEGER;
        if (timeA !== timeB) return timeA - timeB;
        return (
          (priorityWeight[a.priority] ?? 3) - (priorityWeight[b.priority] ?? 3)
        );
      })
      .slice(0, 4);
  }, [checklistTasks]);

  const coupleName = user?.wedding_profile
    ? `${user.wedding_profile.nome_noivo || "Noivo"} & ${
        user.wedding_profile.nome_noiva || "Noiva"
      }`
    : "Seu casamento";

  const [loadingTaskId, setLoadingTaskId] = useState<number | null>(null);

  async function handleToggleDone(task: ChecklistTask) {
    setLoadingTaskId(task.id);
    await updateChecklistTask(task.id, {
      status: task.status === "done" ? "pending" : "done",
    });
    fetchChecklistTasks()
      .then((data) => setChecklistTasks(Array.isArray(data) ? data : []))
      .finally(() => setLoadingTaskId(null));
  }

  return (
    <BaseLayout>
      <Container size="xl" py="md">
        <Stack gap="md">
          <Card
            radius="xl"
            p="xl"
            style={{
              background: `linear-gradient(135deg, ${palette.softWhite} 0%, ${palette.champagne} 50%, ${palette.beige} 100%)`,
              border: `1px solid ${palette.line}`,
            }}
          >
            <Stack gap="lg">
              <Group
                justify="space-between"
                align="flex-start"
                gap="xl"
                wrap="wrap"
              >
                <Stack gap={8} style={{ maxWidth: 520 }}>
                  <Text
                    size="xs"
                    c={palette.warmGray}
                    fw={600}
                    tt="uppercase"
                    style={{ letterSpacing: 1.2 }}
                  >
                    Seu momento especial
                  </Text>
                  <Title order={2} c={palette.ink} style={{ fontWeight: 600 }}>
                    {coupleName}
                  </Title>
                  {(hasWeddingDate || hasWeddingVenue) && (
                    <Group gap="md" wrap="wrap">
                      {hasWeddingDate && (
                        <Group gap="xs">
                          <IconCalendar size={16} color={palette.roseGold} />
                          <Text size="sm" c={palette.ink}>
                            {weddingOverview.date}
                          </Text>
                        </Group>
                      )}
                      {hasWeddingVenue && (
                        <Group gap="xs">
                          <IconMapPin size={16} color={palette.warmGray} />
                          <Text size="sm" c={palette.ink}>
                            {weddingOverview.venue}
                          </Text>
                        </Group>
                      )}
                    </Group>
                  )}
                  <Text size="sm" c={palette.warmGray}>
                    Cada detalhe conta. Veja o progresso e os proximos passos
                    mais importantes da sua jornada.
                  </Text>
                </Stack>
              </Group>
              {weddingDateTime && (
                <Card
                  radius="xl"
                  p="lg"
                  style={{
                    background: palette.softWhite,
                    border: `1px solid ${palette.line}`,
                  }}
                >
                  <Stack gap={8} align="center">
                    <Group gap="xs">
                      <IconClock size={16} color={palette.roseGold} />
                      <Text
                        size="xs"
                        c={palette.warmGray}
                        fw={600}
                        tt="uppercase"
                        style={{ letterSpacing: 1 }}
                      >
                        Contador regressivo
                      </Text>
                    </Group>
                    {countdown.isComplete ? (
                      <Text size="lg" fw={700} c={palette.ink}>
                        Chegou o grande dia! Felicidades aos noivos.
                      </Text>
                    ) : (
                      <Group gap="md" wrap="wrap" justify="center">
                        <Stack gap={2} align="center">
                          <Text size="xl" fw={700} c={palette.ink}>
                            {countdown.days}
                          </Text>
                          <Text size="xs" c={palette.warmGray}>
                            Dias
                          </Text>
                        </Stack>
                        <Stack gap={2} align="center">
                          <Text size="xl" fw={700} c={palette.ink}>
                            {countdown.hours}
                          </Text>
                          <Text size="xs" c={palette.warmGray}>
                            Horas
                          </Text>
                        </Stack>
                        <Stack gap={2} align="center">
                          <Text size="xl" fw={700} c={palette.ink}>
                            {countdown.minutes}
                          </Text>
                          <Text size="xs" c={palette.warmGray}>
                            Minutos
                          </Text>
                        </Stack>
                        <Stack gap={2} align="center">
                          <Text size="xl" fw={700} c={palette.ink}>
                            {countdown.seconds}
                          </Text>
                          <Text size="xs" c={palette.warmGray}>
                            Segundos
                          </Text>
                        </Stack>
                      </Group>
                    )}
                  </Stack>
                </Card>
              )}
            </Stack>
          </Card>

          {(hasWeddingDate || hasWeddingVenue || hasIdentityHighlights) && (
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
              {hasPalette && (
                <Card
                  className="marriplan-card"
                  radius="xl"
                  p="lg"
                  style={{
                    background: palette.softWhite,
                    border: `1px solid ${palette.line}`,
                  }}
                >
                  <Text
                    size="xs"
                    c={palette.warmGray}
                    tt="uppercase"
                    fw={600}
                    style={{ letterSpacing: 1 }}
                  >
                    Paleta Definida
                  </Text>
                  <Text fw={600} size="lg" c={palette.ink} mt={8}>
                    {identityPalette.length}
                  </Text>
                  <Text size="xs" c={palette.warmGray}>
                    cores selecionadas
                  </Text>
                  <Group gap={4} wrap="nowrap" mt={10}>
                    {identityPalette.map((color) => (
                      <Card
                        key={color.id}
                        p={0}
                        radius="md"
                        withBorder
                        style={{ flex: 1, height: 18, background: color.hex }}
                      />
                    ))}
                  </Group>
                </Card>
              )}

              {hasWeddingSize && (
                <Card
                  className="marriplan-card"
                  radius="xl"
                  p="lg"
                  style={{
                    background: palette.softWhite,
                    border: `1px solid ${palette.line}`,
                  }}
                >
                  <Text
                    size="xs"
                    c={palette.warmGray}
                    tt="uppercase"
                    fw={600}
                    style={{ letterSpacing: 1 }}
                  >
                    Tamanho do Casamento
                  </Text>
                  <Text fw={600} size="lg" c={palette.ink} mt={8}>
                    {sizeData?.label}
                  </Text>
                  <Text size="xs" c={palette.warmGray}>
                    {sizeData?.guestRange}
                  </Text>
                </Card>
              )}

              {hasSelectedStyle && (
                <Card
                  className="marriplan-card"
                  radius="xl"
                  p="lg"
                  style={{
                    background: palette.softWhite,
                    border: `1px solid ${palette.line}`,
                  }}
                >
                  <Text
                    size="xs"
                    c={palette.warmGray}
                    tt="uppercase"
                    fw={600}
                    style={{ letterSpacing: 1 }}
                  >
                    Estilo Selecionado
                  </Text>
                  <Text fw={600} size="lg" c={palette.ink} mt={8}>
                    {styleData?.label}
                  </Text>
                  <Text size="xs" c={palette.warmGray}>
                    {styleData?.subtitle || ""}
                  </Text>
                </Card>
              )}

              {hasDressCode && (
                <Card
                  className="marriplan-card"
                  radius="xl"
                  p="lg"
                  style={{
                    background: palette.softWhite,
                    border: `1px solid ${palette.line}`,
                  }}
                >
                  <Text
                    size="xs"
                    c={palette.warmGray}
                    tt="uppercase"
                    fw={600}
                    style={{ letterSpacing: 1 }}
                  >
                    Dress Code
                  </Text>
                  <Text fw={600} size="lg" c={palette.ink} mt={8}>
                    {dressData?.label}
                  </Text>
                  <Tooltip
                    label={dressData?.desc || "Descricao nao disponivel"}
                    position="bottom"
                    color="dark"
                    withArrow
                    style={{ fontSize: 11 }}
                  >
                    <Text size="xs" c={palette.warmGray}>
                      {isMobile
                        ? dressData?.desc
                        : dressData?.desc?.slice(0, 30) + "..." || ""}
                    </Text>
                  </Tooltip>
                </Card>
              )}
            </SimpleGrid>
          )}

          <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg">
            <Card
              className="marriplan-card"
              radius="xl"
              p="lg"
              style={{
                background: palette.softWhite,
                border: `1px solid ${palette.line}`,
              }}
            >
              <Group justify="space-between" align="flex-start">
                <Stack gap={6}>
                  <Text
                    size="xs"
                    c={palette.warmGray}
                    fw={600}
                    tt="uppercase"
                    style={{ letterSpacing: 1 }}
                  >
                    Progresso do casamento
                  </Text>
                  <Text size="lg" fw={600} c={palette.ink}>
                    {checklistStats.progress}% concluido
                  </Text>
                  <Text size="xs" c={palette.warmGray}>
                    {checklistStats.done} de {checklistStats.total} tarefas
                  </Text>
                </Stack>
                <RingProgress
                  size={72}
                  thickness={6}
                  sections={[
                    { value: checklistStats.progress, color: palette.roseGold },
                  ]}
                  label={
                    <Text size="xs" fw={600} c={palette.ink} ta="center">
                      {checklistStats.progress}%
                    </Text>
                  }
                />
              </Group>
            </Card>

            <Card
              radius="xl"
              className="marriplan-card"
              p="lg"
              style={{
                background: palette.softWhite,
                border: `1px solid ${palette.line}`,
              }}
            >
              <Group justify="space-between" align="flex-start">
                <Stack gap={6}>
                  <Text
                    size="xs"
                    c={palette.warmGray}
                    fw={600}
                    tt="uppercase"
                    style={{ letterSpacing: 1 }}
                  >
                    Convidados confirmados
                  </Text>
                  <Text size="lg" fw={600} c={palette.ink}>
                    {weddingOverview.confirmedGuests} confirmados
                  </Text>
                  <Text size="xs" c={palette.warmGray}>
                    {weddingOverview.totalGuests} convidados totais
                  </Text>
                </Stack>
                <IconUsers size={24} color={palette.roseGold} />
              </Group>
              <Progress
                value={guestsProgress}
                color={palette.roseGold}
                mt="sm"
                radius="xl"
              />
            </Card>

            <Card
              radius="xl"
              className="marriplan-card"
              p="lg"
              style={{
                background: palette.softWhite,
                border: `1px solid ${palette.line}`,
              }}
            >
              <Group justify="space-between" align="flex-start">
                <Stack gap={6}>
                  <Text
                    size="xs"
                    c={palette.warmGray}
                    fw={600}
                    tt="uppercase"
                    style={{ letterSpacing: 1 }}
                  >
                    Lista de presentes
                  </Text>
                  <Text size="lg" fw={600} c={palette.ink}>
                    {giftsPurchased} comprados
                  </Text>
                  <Text size="xs" c={palette.warmGray}>
                    {giftsReserved} reservados
                  </Text>
                  <Text size="xs" c={palette.warmGray}>
                    {gifts.count} itens cadastrados
                  </Text>
                </Stack>
                <IconGift size={24} color={palette.roseGold} />
              </Group>
              <Progress
                value={giftsProgress}
                color={palette.roseGold}
                mt="sm"
                radius="xl"
              />
            </Card>

            <Card
              radius="xl"
              className="marriplan-card"
              p="lg"
              style={{
                background: palette.softWhite,
                border: `1px solid ${palette.line}`,
              }}
            >
              <Group justify="space-between" align="flex-start">
                <Stack gap={6}>
                  <Text
                    size="xs"
                    c={palette.warmGray}
                    fw={600}
                    tt="uppercase"
                    style={{ letterSpacing: 1 }}
                  >
                    Energia do planejamento
                  </Text>
                  <Text size="lg" fw={600} c={palette.ink}>
                    Tudo alinhado
                  </Text>
                  <Text size="xs" c={palette.warmGray}>
                    Um passo de cada vez
                  </Text>
                </Stack>
                <IconSparkles size={24} color={palette.roseGold} />
              </Group>
            </Card>
          </SimpleGrid>

          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
            <Card
              radius="xl"
              p="lg"
              style={{
                background: palette.softWhite,
                border: `1px solid ${palette.line}`,
              }}
            >
              <Group justify="space-between" align="center" mb="md">
                <Stack gap={2}>
                  <Group gap="xs">
                    <IconChecklist size={18} color={palette.roseGold} />
                    <Title order={4} c={palette.ink}>
                      Proximos passos
                    </Title>
                  </Group>
                  <Text size="xs" c={palette.warmGray}>
                    Foque no que destrava seu planejamento
                  </Text>
                </Stack>
                <Button
                  variant="subtle"
                  color="dark"
                  rightSection={<IconChevronRight size={16} />}
                  onClick={() => (window.location.href = "/checklist")}
                >
                  Ver checklist
                </Button>
              </Group>
              <Divider mb="md" color={palette.line} />
              <Stack gap="sm">
                {loadingChecklist && (
                  <Center py="md">
                    <Loader size="sm" />
                  </Center>
                )}
                {!loadingChecklist && nextTasks.length === 0 && (
                  <Text size="sm" c={palette.warmGray}>
                    Nenhuma tarefa pendente no momento.
                  </Text>
                )}
                {nextTasks.map((task) => {
                  const isDone = task.status === "done";
                  const isLoading = loadingTaskId === task.id;

                  return (
                    <Paper
                      key={task.id}
                      className="marriplan-card"
                      radius="lg"
                      p="sm"
                      style={{
                        border: `1px solid ${palette.line}`,
                        cursor: isLoading ? "not-allowed" : "pointer", // Feedback visual de clique
                        transition: "all 160ms ease",
                        opacity: isLoading ? 0.6 : 1,
                        "&:hover": {
                          backgroundColor: "rgba(247, 241, 232, 0.3)", // Leve realce no hover usando o champagne
                        },
                      }}
                    >
                      <Group
                        justify="space-between"
                        align="center"
                        wrap="nowrap"
                      >
                        {/* Agrupamento da Esquerda: Checkbox + Textos alinhados horizontalmente ao centro */}
                        <Group
                          align="center"
                          gap="md"
                          style={{ flex: 1, minWidth: 0 }}
                        >
                          <Checkbox
                            checked={isDone}
                            readOnly // O clique é gerenciado pelo Paper pai, evitando duplo clique acidental
                            disabled={isLoading}
                            color="var(--marriplan-rose)" // Mantendo sua identidade rose
                            radius="sm"
                            size="sm"
                            styles={{
                              input: { cursor: "pointer" },
                            }}
                          />

                          <Box
                            style={{ flex: 1, minWidth: 0 }}
                            onClick={() => !isLoading && handleToggleDone(task)} // Dispara a ação ao clicar em qualquer lugar do card
                          >
                            <Text
                              size="sm"
                              fw={600}
                              c={palette.ink}
                              style={{
                                textDecoration: isDone
                                  ? "line-through"
                                  : "none",
                                opacity: isDone ? 0.5 : 1,
                                transition: "all 160ms ease",
                              }}
                            >
                              {task.description}
                            </Text>
                            <Text size="xs" c={palette.warmGray}>
                              {task.due_date
                                ? `Entrega: ${new Date(
                                    task.due_date,
                                  ).toLocaleDateString("pt-BR")}`
                                : "Sem data definida"}
                            </Text>
                          </Box>
                        </Group>

                        {/* Canto Direito: Badge de Status permanece estático */}
                        <Box style={{ flexShrink: 0 }}>
                          <MarriplanStatusBadge
                            kind="checklist"
                            status={String(task.status).toLowerCase()}
                          />
                        </Box>
                      </Group>
                    </Paper>
                  );
                })}
              </Stack>
            </Card>

            <Card
              radius="xl"
              p="lg"
              style={{
                background: palette.softWhite,
                border: `1px solid ${palette.line}`,
              }}
            >
              <Group justify="space-between" align="center" mb="md">
                <Stack gap={2}>
                  <Title order={4} c={palette.ink}>
                    Resumo do checklist
                  </Title>
                  <Text size="xs" c={palette.warmGray}>
                    Distribuicao por status
                  </Text>
                </Stack>
                <Badge
                  variant="light"
                  color="gray"
                  style={{
                    border: "1px solid var(--marriplan-border)",
                    backgroundColor: "var(--marriplan-surface-muted)",
                    color: "var(--marriplan-text)",
                    fontWeight: 600,
                  }}
                >
                  {checklistStats.total} tarefas
                </Badge>
              </Group>
              <Stack gap="sm">
                <Progress
                  radius="xl"
                  size="lg"
                  value={checklistStats.progress}
                  color={palette.roseGold}
                />
                <Group justify="space-between">
                  <Text size="sm" c={palette.warmGray}>
                    Concluido
                  </Text>
                  <Text size="sm" fw={600} c={palette.ink}>
                    {checklistStats.done}
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm" c={palette.warmGray}>
                    Em andamento
                  </Text>
                  <Text size="sm" fw={600} c={palette.ink}>
                    {checklistStats.inProgress}
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm" c={palette.warmGray}>
                    Pendente
                  </Text>
                  <Text size="sm" fw={600} c={palette.ink}>
                    {checklistStats.pending}
                  </Text>
                </Group>
              </Stack>
            </Card>
          </SimpleGrid>

          <SuppliersCarouselRow />

          {isFree && <UpgradeCta />}

          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
            <Card
              radius="xl"
              p="lg"
              style={{
                background: palette.softWhite,
                border: `1px solid ${palette.line}`,
              }}
            >
              <Group justify="space-between" mb="md">
                <Title order={4} c={palette.ink}>
                  Convidados recentes
                </Title>
                <Badge
                  variant="light"
                  color="gray"
                  style={{
                    border: "1px solid var(--marriplan-border)",
                    backgroundColor: "var(--marriplan-surface-muted)",
                    color: "var(--marriplan-text)",
                    fontWeight: 600,
                  }}
                >
                  {guests.count} convidados
                </Badge>
              </Group>

              <ScrollArea h={320}>
                <Stack gap="sm">
                  {guests.results.map((guest) => (
                    <Paper
                      key={guest.id}
                      p="sm"
                      radius="lg"
                      style={{ border: `1px solid ${palette.line}` }}
                    >
                      {/* wrap="nowrap" e align="center" garantem todo mundo na mesma linha verticalmente centralizado */}
                      <Group
                        justify="space-between"
                        align="center"
                        wrap="nowrap"
                      >
                        {/* Container da Esquerda: Avatar + Textos. flex: 1 permite que ele ocupe o espaço disponível sem esmagar o resto */}
                        <Group
                          gap="sm"
                          style={{ flex: 1, minWidth: 0 }}
                          wrap="nowrap"
                          align="center"
                        >
                          {guest.photo_url ? (
                            <Avatar
                              size="sm"
                              color="gray"
                              variant="light"
                              src={guest.photo_url}
                            />
                          ) : (
                            <Avatar size="sm" color="gray" variant="light">
                              {guest.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </Avatar>
                          )}

                          {/* Box dos textos com minWidth: 0 essencial para o truncamento do filho funcionar */}
                          <Box style={{ flex: 1, minWidth: 0 }}>
                            <Tooltip
                              label={guest.name}
                              position="top-start"
                              withArrow
                              multiline
                              maw={320}
                            >
                              <Text
                                fw={500}
                                size="sm"
                                c={palette.ink}
                                style={{
                                  overflow: "hidden",
                                  whiteSpace: "nowrap",
                                  textOverflow: "ellipsis", // Aqui usei com as reticências básicas, mude para 'clip' se preferir corte seco
                                }}
                              >
                                {guest.name}
                              </Text>
                            </Tooltip>
                            <Text size="xs" c={palette.warmGray} lineClamp={1}>
                              {guest.plusOne
                                ? "Com acompanhante"
                                : "Sem acompanhante"}
                            </Text>
                          </Box>
                        </Group>

                        {/* Bloco da Direita: Status + Menu. wrap="nowrap" impede o menu de ir para baixo do Badge */}
                        <Group
                          gap="xs"
                          wrap="nowrap"
                          style={{ flexShrink: 0 }}
                          align="center"
                        >
                          <MarriplanStatusBadge
                            kind="guest"
                            status={String(guest.status_presenca).toLowerCase()}
                          />

                          <Menu withinPortal position="bottom-end" shadow="sm">
                            <Menu.Target>
                              <ActionIcon variant="subtle" color="gray">
                                <IconDotsVertical size={18} />
                              </ActionIcon>
                            </Menu.Target>
                            <Menu.Dropdown>
                              {guest.status_presenca === "Pending" && (
                                <Tooltip label="Confirmar Presença">
                                  <Menu.Item
                                    leftSection={<IconCheck size={16} />}
                                    onClick={() => {
                                      setSelectedGuest(guest);
                                      setPresencaModalOpen(true);
                                    }}
                                  >
                                    Confirmar Presença
                                  </Menu.Item>
                                </Tooltip>
                              )}
                              {guest.whatsapp &&
                                guest.status_presenca === "Pending" && (
                                  <Tooltip label="Enviar RSVP por WhatsApp">
                                    <Menu.Item
                                      leftSection={
                                        <IconBrandWhatsapp size={16} />
                                      }
                                      onClick={async () => {
                                        try {
                                          const res =
                                            await guests_generate_confirmation_link(
                                              Number(guest.id),
                                            );
                                          setConfirmationData({
                                            confirmation_url:
                                              res.confirmation_url,
                                            whatsapp_link: res.whatsapp_link,
                                            token: res.token,
                                          });
                                          setConfirmationModalOpen(true);
                                        } catch {
                                          notifications.show({
                                            color: "red",
                                            message:
                                              "Erro ao gerar link de confirmação.",
                                          });
                                        }
                                      }}
                                    >
                                      Enviar RSVP
                                    </Menu.Item>
                                  </Tooltip>
                                )}
                              {guest.status_presenca !== "Pending" && (
                                <Tooltip label="Gerar link de confirmação">
                                  <Menu.Item
                                    leftSection={<IconLink size={16} />}
                                    onClick={async () => {
                                      try {
                                        const res =
                                          await guests_generate_confirmation_link(
                                            Number(guest.id),
                                          );
                                        setConfirmationData({
                                          confirmation_url:
                                            res.confirmation_url,
                                          whatsapp_link: res.whatsapp_link,
                                          token: res.token,
                                        });
                                        setConfirmationModalOpen(true);
                                      } catch {
                                        notifications.show({
                                          color: "red",
                                          message:
                                            "Erro ao gerar link de confirmação.",
                                        });
                                      }
                                    }}
                                  >
                                    Gerar Link
                                  </Menu.Item>
                                </Tooltip>
                              )}
                              {guest.email && (
                                <Tooltip
                                  label="Enviar RSVP por Email"
                                  position="right"
                                >
                                  <Menu.Item
                                    leftSection={<IconMail size={14} />}
                                    component="a"
                                    href={`mailto:${
                                      guest.email
                                    }?subject=${encodeURIComponent(
                                      "Confirmação de Presença - Casamento",
                                    )}&body=${encodeURIComponent(
                                      "Olá! Por gentileza, confirme sua presença no nosso casamento respondendo este e-mail ou pelo site. O convite formal será enviado via papelaria. Obrigado!",
                                    )}`}
                                  >
                                    Email
                                  </Menu.Item>
                                </Tooltip>
                              )}
                              <Tooltip label="Ver convidado" position="right">
                                <Menu.Item
                                  leftSection={
                                    <IconEye
                                      size={14}
                                      color="var(--marriplan-rose)"
                                    />
                                  }
                                  onClick={() => router.push(`/guests`)}
                                >
                                  Ver convidado
                                </Menu.Item>
                              </Tooltip>
                            </Menu.Dropdown>
                          </Menu>
                        </Group>
                      </Group>
                    </Paper>
                  ))}

                  {loadingGuests && (
                    <Center py="md">
                      <Loader size="sm" />
                    </Center>
                  )}

                  {guests.results.length < guests.count && (
                    <Center>
                      <Button
                        variant="subtle"
                        color="dark"
                        onClick={loadMoreGuests}
                        disabled={loadingGuests}
                      >
                        Carregar mais convidados
                      </Button>
                    </Center>
                  )}
                </Stack>
              </ScrollArea>
            </Card>

            <Card
              radius="xl"
              p="lg"
              style={{
                background: palette.softWhite,
                border: `1px solid ${palette.line}`,
              }}
            >
              <Group justify="space-between" mb="md">
                <Title order={4} c={palette.ink}>
                  Presentes recentes
                </Title>
                <Badge
                  variant="light"
                  color="gray"
                  style={{
                    border: "1px solid var(--marriplan-border)",
                    backgroundColor: "var(--marriplan-surface-muted)",
                    color: "var(--marriplan-text)",
                    fontWeight: 600,
                  }}
                >
                  {gifts.count} itens
                </Badge>
              </Group>

              <ScrollArea h={320}>
                <Stack gap="sm">
                  {gifts.results.map((gift) => (
                    <Paper
                      key={gift.id}
                      className="marriplan-card"
                      p="sm"
                      radius="lg"
                      style={{ border: `1px solid ${palette.line}` }}
                    >
                      {/* Justify space-between mantém o status na extrema direita */}
                      <Group
                        justify="space-between"
                        align="center"
                        wrap="nowrap"
                        onClick={() =>
                          gift.link && window.open(gift.link, "_blank")
                        }
                        style={{ cursor: gift.link ? "pointer" : "default" }}
                      >
                        {/* wrap="nowrap" impede que o Box de texto quebre para baixo da imagem */}
                        <Group
                          gap="sm"
                          style={{ flex: 1, minWidth: 0 }}
                          wrap="nowrap"
                          align="center"
                        >
                          {gift.image ? (
                            <Image
                              src={gift.image}
                              alt={gift.name}
                              w={64}
                              h={64}
                              radius="md"
                              fit="cover"
                              style={{ display: "block" }}
                            />
                          ) : (
                            <Flex
                              justify="center"
                              align="center"
                              w={64}
                              h={64}
                              bg="gray.1"
                              style={{
                                borderRadius: "var(--mantine-radius-md)",
                              }}
                            >
                              <IconPhoto
                                size={24}
                                color="var(--marriplan-border)"
                              />
                            </Flex>
                          )}

                          {/* flex: 1 faz o Box ocupar o espaço restante; minWidth: 0 permite o truncamento dos filhos */}
                          <Box style={{ flex: 1, minWidth: 0 }}>
                            <Tooltip
                              label={gift.name}
                              position="top-start"
                              withArrow
                              multiline
                              maw={320}
                            >
                              <Text
                                fw={500}
                                size="sm"
                                c={palette.ink}
                                style={{
                                  overflow: "hidden",
                                  whiteSpace: "nowrap",
                                  textOverflow: "clip", // Remove as reticências e corta o texto seco
                                }}
                              >
                                {gift.name}
                              </Text>
                            </Tooltip>

                            {gift.description && (
                              <Text
                                size="xs"
                                c={palette.warmGray}
                                mt={2}
                                lineClamp={1} // Mantém o clamp de 2 linhas para a descrição se preferir, ou aplique a mesma lógica acima
                              >
                                {gift.description}
                              </Text>
                            )}

                            <Group gap="xs" mt={2}>
                              <Text size="xs" fw={600} c={palette.ink}>
                                {`R$ ${Number(gift.value).toFixed(2)}`}
                              </Text>
                            </Group>

                            {gift.link && (
                              <Text
                                size="xs"
                                c={palette.warmGray}
                                style={{
                                  cursor: "pointer",
                                  display: "inline-block",
                                }}
                                onClick={() => window.open(gift.link, "_blank")}
                              >
                                Ver presente
                              </Text>
                            )}
                          </Box>
                        </Group>

                        {/* Status fixo na direita */}
                        <MarriplanStatusBadge
                          kind="gift"
                          status={gift.status}
                        />
                      </Group>
                    </Paper>
                  ))}

                  {loadingGifts && (
                    <Center py="md">
                      <Loader size="sm" />
                    </Center>
                  )}

                  <Center>
                    <Button
                      variant="subtle"
                      color="dark"
                      onClick={loadMoreGifts}
                      disabled={loadingGifts}
                    >
                      Carregar mais presentes
                    </Button>
                  </Center>
                </Stack>
              </ScrollArea>
            </Card>
          </SimpleGrid>
        </Stack>
      </Container>

      <Modal
        opened={presencaModalOpen}
        onClose={() => setPresencaModalOpen(false)}
        title="Confirmar Presença do Convidado"
        centered
        size="sm"
        overlayProps={{ blur: 2 }}
      >
        <Stack>
          {selectedGuest && (
            <>
              <Text fw={500} size="lg">
                {selectedGuest.name}
              </Text>
              <Text size="sm" c="dimmed">
                Selecione o status de presença:
              </Text>
              <Group grow>
                <Button
                  color="green"
                  onClick={async () => {
                    try {
                      await guests_partial_update(selectedGuest.id, {
                        status_presenca: "Confirmed",
                      });
                      notifications.show({
                        title: "Sucesso",
                        message: "Presença confirmada",
                        color: "green",
                      });
                      setPresencaModalOpen(false);
                      await fetchGuests();
                    } catch {
                      notifications.show({
                        title: "Erro",
                        message: "Falha ao confirmar presença",
                        color: "red",
                      });
                    }
                  }}
                >
                  Confirmar
                </Button>
                <Button
                  color="red"
                  onClick={async () => {
                    try {
                      await guests_partial_update(selectedGuest.id, {
                        status_presenca: "Refused",
                      });
                      notifications.show({
                        title: "Sucesso",
                        message: "Presença recusada",
                        color: "red",
                      });
                      setPresencaModalOpen(false);
                      await fetchGuests();
                    } catch {
                      notifications.show({
                        title: "Erro",
                        message: "Falha ao recusar presença",
                        color: "red",
                      });
                    }
                  }}
                >
                  Recusar
                </Button>
                <Button
                  variant="default"
                  onClick={() => setPresencaModalOpen(false)}
                  styles={softButtonStyles}
                >
                  Cancelar
                </Button>
              </Group>
            </>
          )}
        </Stack>
      </Modal>

      <Modal
        opened={confirmationModalOpen}
        onClose={() => setConfirmationModalOpen(false)}
        title="Link de Confirmação"
        centered
      >
        <Stack gap="sm">
          <Text size="sm">
            Link criado. Você pode copiar e colar na sua mensagem do WhatsApp ou
            abrir direto no WhatsApp abaixo.
          </Text>
          <Text size="sm" style={{ wordBreak: "break-all" }}>
            {confirmationData?.confirmation_url}
          </Text>
          <Group>
            <Button
              styles={softButtonStyles}
              leftSection={<IconCopy size={16} />}
              onClick={async () => {
                if (!confirmationData?.confirmation_url) return;
                try {
                  await navigator.clipboard.writeText(
                    confirmationData.confirmation_url,
                  );
                  notifications.show({
                    color: "green",
                    message: "Link copiado para a área de transferência.",
                  });
                } catch {
                  notifications.show({
                    color: "red",
                    message: "Falha ao copiar. Copie manualmente.",
                  });
                }
              }}
            >
              Copiar link
            </Button>
            {confirmationData?.whatsapp_link && (
              <Button
                leftSection={<IconBrandWhatsapp size={16} />}
                component="a"
                target="_blank"
                rel="noopener noreferrer"
                href={confirmationData.whatsapp_link}
                styles={primaryButtonStyles}
              >
                Abrir WhatsApp
              </Button>
            )}
          </Group>
        </Stack>
      </Modal>
    </BaseLayout>
  );
};

export default MarriplanDashboard;

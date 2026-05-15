//eslint-disable react-hooks/exhaustive-deps
//eslint-disable @typescript-eslint/no-unused-vars
/* eslint-disable @typescript-eslint/no-explicit-any */
//eslint no-explicit-any: "off"

import BaseLayout from '@/components/Layout/_BaseLayout';
import { useAuth } from '@/contexts/AuthContext';
import { fetchChecklistTasks } from '@/services/checklist';
import { giftsService } from '@/services/giftsService';
import { guests_list } from '@/services/guests';
import { ChecklistTask } from '@/types/checklist';
import { Avatar, Badge, Box, Button, Card, Center, Container, Divider, Group, Loader, Paper, Progress, RingProgress, ScrollArea, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import {
  IconCalendar,
  IconChecklist,
  IconChevronRight,
  IconClock,
  IconGift,
  IconMapPin,
  IconSparkles,
  IconUsers
} from '@tabler/icons-react';
import React, { useEffect, useMemo, useState } from 'react';

// Tipos de dados
interface Guest {
  id: string;
  name: string;
  status: 'confirmed' | 'pending' | 'declined';
  plusOne: boolean;
  avatar?: string;
}

interface Gift {
  id: number;
  name: string;
  description: string;
  price?: number; // deprecated, use value
  value: number | string;
  status: 'available' | 'purchased';
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
  daysRemaining: number;
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
  const [guests, setGuests] = useState<GuestsResponse>({ results: [], count: 0 });
  const [gifts, setGifts] = useState<GiftsResponse>({ results: [], count: 0 });
  const [loadingGuests, setLoadingGuests] = useState(false);
  const [loadingGifts, setLoadingGifts] = useState(false);
  const [loadingChecklist, setLoadingChecklist] = useState(false);
  const [checklistTasks, setChecklistTasks] = useState<ChecklistTask[]>([]);
  const [guestPage, setGuestPage] = useState(0);
  const [giftPage, setGiftPage] = useState(0);
  const { user } = useAuth();
  const [countdown, setCountdown] = useState<CountdownState>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isComplete: false,
  });


  // Dados reais do perfil de casamento
  // Visão Geral do Casamento com dados reais
  let weddingOverview: WeddingOverview = {
    date: '-',
    daysRemaining: 0,
    venue: '-',
    confirmedGuests: 0,
    totalGuests: 0
  };

  const weddingDateTime = useMemo(() => {
    if (!user?.wedding_profile?.data_casamento) return null;
    const time = user.wedding_profile.hora_casamento || '00:00:00';
    return new Date(`${user.wedding_profile.data_casamento}T${time}`);
  }, [user?.wedding_profile?.data_casamento, user?.wedding_profile?.hora_casamento]);

  if (user?.wedding_profile) {
    const p = user.wedding_profile;
    // Data formatada e cálculo de dias restantes
    const weddingDate = weddingDateTime;
    let daysRemaining = 0;
    if (weddingDate) {
      // Zera hora/min/seg do casamento e hoje para evitar erro de fuso
      const weddingDateOnly = new Date(weddingDate.getFullYear(), weddingDate.getMonth(), weddingDate.getDate());
      const today = new Date();
      const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const diff = weddingDateOnly.getTime() - todayOnly.getTime();
      daysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }
    // Convidados
    const totalGuests = guests.count;
    const confirmedGuests = guests.results.filter(g => g.status === 'confirmed').length;
    weddingOverview = {
      date: weddingDate ? weddingDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) : '-',
      daysRemaining,
      venue: p.local || '-',
      confirmedGuests,
      totalGuests
    };
  }

  useEffect(() => {
    if (!weddingDateTime) {
      setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0, isComplete: false });
      return;
    }

    const tick = () => {
      const now = Date.now();
      const diff = weddingDateTime.getTime() - now;

      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0, isComplete: true });
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
  useEffect(() => {
    async function fetchGuests() {
      setLoadingGuests(true);
      try {
        const data = await guests_list({ page: 1, page_size: 10 });
        const mappedGuests = (data.results || []).map((g: any) => ({
          id: g.id,
          name: g.name,
          status: g.status || 'pending',
          plusOne: g.acompanhantes && g.acompanhantes > 0,
          avatar: g.avatar,
        }));
        setGuests({
          results: mappedGuests,
          count: data.count
        });
      } catch (e) {
        console.error(e);
        setGuests({ results: [], count: 0 });
      } finally {
        setLoadingGuests(false);
      }
    }
    fetchGuests();

    // Carregar presentes reais da API
    async function fetchGifts() {
      setLoadingGifts(true);
      try {
        const res = await giftsService.listGifts({ page: 1 });
        setGifts(res);
      } catch (e) {
        console.error(e);
        setGifts({ results: [], count: 0 });
      } finally {
        setLoadingGifts(false);
      }
    }
    fetchGifts();
  }, []);

  useEffect(() => {
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
    fetchChecklist();
  }, []);

  const loadMoreGuests = async () => {
    setLoadingGuests(true);
    try {
      const nextPage = guestPage + 1;
      const data = await guests_list({ page: nextPage + 1, page_size: 10 });
      const mappedGuests = (data.results || []).map((g: any) => ({
        id: g.id,
        name: g.name,
        status: g.status || 'pending',
        plusOne: g.acompanhantes && g.acompanhantes > 0,
        avatar: g.avatar,
      }));
      setGuests(prev => ({
        results: [...prev.results, ...mappedGuests],
        count: data.count
      }));
      setGuestPage(nextPage);
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
      setGifts(prev => ({
        results: [...prev.results, ...res.results],
        count: res.count
      }));
      setGiftPage(nextPage);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingGifts(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'green';
      case 'pending': return 'orange';
      case 'declined': return 'red';
      case 'available': return 'blue';
      case 'purchased': return 'gray';
      default: return 'gray';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmado';
      case 'pending': return 'Pendente';
      case 'declined': return 'Recusado';
      case 'available': return 'Disponível';
      case 'purchased': return 'Comprado';
      default: return status;
    }
  };

  const palette = {
    champagne: '#F7F1E8',
    roseGold: '#E6B8A2',
    beige: '#EFE6DA',
    warmGray: '#6F6660',
    ink: '#2D2622',
    line: '#EEE3D8',
    softWhite: '#FFFCF8'
  };

  const checklistStats = useMemo(() => {
    const total = checklistTasks.length;
    const done = checklistTasks.filter(task => task.status === 'done').length;
    const inProgress = checklistTasks.filter(task => task.status === 'in_progress').length;
    const pending = checklistTasks.filter(task => task.status === 'pending').length;
    const progress = total > 0 ? Math.round((done / total) * 100) : 0;
    return { total, done, inProgress, pending, progress };
  }, [checklistTasks]);

  const guestsProgress = weddingOverview.totalGuests > 0
    ? Math.round((weddingOverview.confirmedGuests / weddingOverview.totalGuests) * 100)
    : 0;

  const giftsPurchased = gifts.results.filter(gift => gift.status === 'purchased').length;
  const giftsProgress = gifts.count > 0 ? Math.round((giftsPurchased / gifts.count) * 100) : 0;

  const checklistSections = useMemo(() => {
    const total = Math.max(checklistStats.total, 1);
    return [
      { value: Math.round((checklistStats.done / total) * 100), color: '#D1A48C' },
      { value: Math.round((checklistStats.inProgress / total) * 100), color: '#E6C9B8' },
      { value: Math.round((checklistStats.pending / total) * 100), color: '#EFE6DA' }
    ];
  }, [checklistStats]);

  const nextTasks = useMemo(() => {
    const priorityWeight: Record<string, number> = { high: 0, medium: 1, low: 2 };
    return checklistTasks
      .filter(task => task.status !== 'done')
      .sort((a, b) => {
        const dateA = a.due_date || a.start_date || a.created_at;
        const dateB = b.due_date || b.start_date || b.created_at;
        const timeA = dateA ? new Date(dateA).getTime() : Number.MAX_SAFE_INTEGER;
        const timeB = dateB ? new Date(dateB).getTime() : Number.MAX_SAFE_INTEGER;
        if (timeA !== timeB) return timeA - timeB;
        return (priorityWeight[a.priority] ?? 3) - (priorityWeight[b.priority] ?? 3);
      })
      .slice(0, 4);
  }, [checklistTasks]);

  const coupleName = user?.wedding_profile
    ? `${user.wedding_profile.nome_noivo || 'Noivo'} & ${user.wedding_profile.nome_noiva || 'Noiva'}`
    : 'Seu casamento';

  return (
    <BaseLayout title="Dashboard">
      <Container size="xl" py="md">
        <Stack gap="xl">
          <Card
            radius="xl"
            p="xl"
            style={{
              background: `linear-gradient(135deg, ${palette.softWhite} 0%, ${palette.champagne} 50%, ${palette.beige} 100%)`,
              border: `1px solid ${palette.line}`
            }}
          >
            <Stack gap="lg">
              <Group justify="space-between" align="flex-start" gap="xl" wrap="wrap">
                <Stack gap={8} style={{ maxWidth: 520 }}>
                <Text size="xs" c={palette.warmGray} fw={600} tt="uppercase" style={{ letterSpacing: 1.2 }}>
                  Seu momento especial
                </Text>
                <Title order={2} c={palette.ink} style={{ fontWeight: 600 }}>
                  {coupleName}
                </Title>
                <Group gap="md" wrap="wrap">
                  <Group gap="xs">
                    <IconCalendar size={16} color={palette.roseGold} />
                    <Text size="sm" c={palette.ink}>{weddingOverview.date}</Text>
                  </Group>
                  <Group gap="xs">
                    <IconMapPin size={16} color={palette.warmGray} />
                    <Text size="sm" c={palette.ink}>{weddingOverview.venue}</Text>
                  </Group>
                </Group>
                  <Text size="sm" c={palette.warmGray}>
                    Cada detalhe conta. Veja o progresso e os proximos passos mais importantes da sua jornada.
                  </Text>
                </Stack>
              </Group>
              <Card
                radius="xl"
                p="lg"
                style={{
                  background: palette.softWhite,
                  border: `1px solid ${palette.line}`
                }}
              >
                <Stack gap={8} align="center">
                  <Group gap="xs">
                    <IconClock size={16} color={palette.roseGold} />
                    <Text size="xs" c={palette.warmGray} fw={600} tt="uppercase" style={{ letterSpacing: 1 }}>
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
                        <Text size="xl" fw={700} c={palette.ink}>{countdown.days}</Text>
                        <Text size="xs" c={palette.warmGray}>Dias</Text>
                      </Stack>
                      <Stack gap={2} align="center">
                        <Text size="xl" fw={700} c={palette.ink}>{countdown.hours}</Text>
                        <Text size="xs" c={palette.warmGray}>Horas</Text>
                      </Stack>
                      <Stack gap={2} align="center">
                        <Text size="xl" fw={700} c={palette.ink}>{countdown.minutes}</Text>
                        <Text size="xs" c={palette.warmGray}>Minutos</Text>
                      </Stack>
                      <Stack gap={2} align="center">
                        <Text size="xl" fw={700} c={palette.ink}>{countdown.seconds}</Text>
                        <Text size="xs" c={palette.warmGray}>Segundos</Text>
                      </Stack>
                    </Group>
                  )}
                </Stack>
              </Card>
            </Stack>
          </Card>

          <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg">
            <Card radius="xl" p="lg" style={{ background: palette.softWhite, border: `1px solid ${palette.line}` }}>
              <Group justify="space-between" align="flex-start">
                <Stack gap={6}>
                  <Text size="xs" c={palette.warmGray} fw={600} tt="uppercase" style={{ letterSpacing: 1 }}>
                    Progresso do casamento
                  </Text>
                  <Text size="lg" fw={600} c={palette.ink}>{checklistStats.progress}% concluido</Text>
                  <Text size="xs" c={palette.warmGray}>{checklistStats.done} de {checklistStats.total} tarefas</Text>
                </Stack>
                <RingProgress
                  size={72}
                  thickness={6}
                  sections={[{ value: checklistStats.progress, color: palette.roseGold }]}
                  label={
                    <Text size="xs" fw={600} c={palette.ink} ta="center">
                      {checklistStats.progress}%
                    </Text>
                  }
                />
              </Group>
            </Card>

            <Card radius="xl" p="lg" style={{ background: palette.softWhite, border: `1px solid ${palette.line}` }}>
              <Group justify="space-between" align="flex-start">
                <Stack gap={6}>
                  <Text size="xs" c={palette.warmGray} fw={600} tt="uppercase" style={{ letterSpacing: 1 }}>
                    Convidados
                  </Text>
                  <Text size="lg" fw={600} c={palette.ink}>{weddingOverview.confirmedGuests} confirmados</Text>
                  <Text size="xs" c={palette.warmGray}>{weddingOverview.totalGuests} convidados totais</Text>
                </Stack>
                <IconUsers size={24} color={palette.roseGold} />
              </Group>
              <Progress value={guestsProgress} color={palette.roseGold} mt="sm" radius="xl" />
            </Card>

            <Card radius="xl" p="lg" style={{ background: palette.softWhite, border: `1px solid ${palette.line}` }}>
              <Group justify="space-between" align="flex-start">
                <Stack gap={6}>
                  <Text size="xs" c={palette.warmGray} fw={600} tt="uppercase" style={{ letterSpacing: 1 }}>
                    Lista de presentes
                  </Text>
                  <Text size="lg" fw={600} c={palette.ink}>{giftsPurchased} comprados</Text>
                  <Text size="xs" c={palette.warmGray}>{gifts.count} itens cadastrados</Text>
                </Stack>
                <IconGift size={24} color={palette.roseGold} />
              </Group>
              <Progress value={giftsProgress} color={palette.roseGold} mt="sm" radius="xl" />
            </Card>

            <Card radius="xl" p="lg" style={{ background: palette.softWhite, border: `1px solid ${palette.line}` }}>
              <Group justify="space-between" align="flex-start">
                <Stack gap={6}>
                  <Text size="xs" c={palette.warmGray} fw={600} tt="uppercase" style={{ letterSpacing: 1 }}>
                    Energia do planejamento
                  </Text>
                  <Text size="lg" fw={600} c={palette.ink}>Tudo alinhado</Text>
                  <Text size="xs" c={palette.warmGray}>Um passo de cada vez</Text>
                </Stack>
                <IconSparkles size={24} color={palette.roseGold} />
              </Group>
            </Card>
          </SimpleGrid>

          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
            <Card radius="xl" p="lg" style={{ background: palette.softWhite, border: `1px solid ${palette.line}` }}>
              <Group justify="space-between" align="center" mb="md">
                <Stack gap={2}>
                  <Group gap="xs">
                    <IconChecklist size={18} color={palette.roseGold} />
                    <Title order={4} c={palette.ink}>Proximos passos</Title>
                  </Group>
                  <Text size="xs" c={palette.warmGray}>Foque no que destrava seu planejamento</Text>
                </Stack>
                <Button
                  variant="subtle"
                  color="dark"
                  rightSection={<IconChevronRight size={16} />}
                  onClick={() => window.location.href = '/checklist'}
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
                  <Text size="sm" c={palette.warmGray}>Nenhuma tarefa pendente no momento.</Text>
                )}
                {nextTasks.map(task => (
                  <Paper key={task.id} radius="lg" p="sm" style={{ border: `1px solid ${palette.line}` }}>
                    <Group justify="space-between" align="center" wrap="nowrap">
                      <Box>
                        <Text size="sm" fw={600} c={palette.ink}>{task.description}</Text>
                        <Text size="xs" c={palette.warmGray}>
                          {task.due_date ? `Entrega: ${new Date(task.due_date).toLocaleDateString('pt-BR')}` : 'Sem data definida'}
                        </Text>
                      </Box>
                      <Badge
                        variant="light"
                        color={task.status === 'in_progress' ? 'orange' : 'gray'}
                      >
                        {task.status === 'in_progress' ? 'Em andamento' : 'Pendente'}
                      </Badge>
                    </Group>
                  </Paper>
                ))}
              </Stack>
            </Card>

            <Card radius="xl" p="lg" style={{ background: palette.softWhite, border: `1px solid ${palette.line}` }}>
              <Group justify="space-between" align="center" mb="md">
                <Stack gap={2}>
                  <Title order={4} c={palette.ink}>Resumo do checklist</Title>
                  <Text size="xs" c={palette.warmGray}>Distribuicao por status</Text>
                </Stack>
                <Badge variant="light" color="gray">{checklistStats.total} tarefas</Badge>
              </Group>
              <Stack gap="sm">
                <Progress
                  radius="xl"
                  size="lg"
                  sections={checklistSections}
                />
                <Group justify="space-between">
                  <Text size="sm" c={palette.warmGray}>Concluido</Text>
                  <Text size="sm" fw={600} c={palette.ink}>{checklistStats.done}</Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm" c={palette.warmGray}>Em andamento</Text>
                  <Text size="sm" fw={600} c={palette.ink}>{checklistStats.inProgress}</Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm" c={palette.warmGray}>Pendente</Text>
                  <Text size="sm" fw={600} c={palette.ink}>{checklistStats.pending}</Text>
                </Group>
              </Stack>
            </Card>
          </SimpleGrid>

          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
            <Card radius="xl" p="lg" style={{ background: palette.softWhite, border: `1px solid ${palette.line}` }}>
              <Group justify="space-between" mb="md">
                <Title order={4} c={palette.ink}>Convidados recentes</Title>
                <Badge variant="light" color="gray">{guests.count} convidados</Badge>
              </Group>

              <ScrollArea h={320}>
                <Stack gap="sm">
                  {guests.results.map((guest) => (
                    <Paper key={guest.id} p="sm" radius="lg" style={{ border: `1px solid ${palette.line}` }}>
                      <Group justify="space-between">
                        <Group gap="sm">
                          <Avatar size="sm" color="gray" variant="light">
                            {guest.name.split(' ').map(n => n[0]).join('')}
                          </Avatar>
                          <Box>
                            <Text fw={500} size="sm" c={palette.ink}>{guest.name}</Text>
                            <Text size="xs" c={palette.warmGray}>
                              {guest.plusOne ? 'Com acompanhante' : 'Sem acompanhante'}
                            </Text>
                          </Box>
                        </Group>
                        <Badge variant="light" color={getStatusColor(guest.status)} size="sm">
                          {getStatusLabel(guest.status)}
                        </Badge>
                      </Group>
                    </Paper>
                  ))}

                  {loadingGuests && (
                    <Center py="md">
                      <Loader size="sm" />
                    </Center>
                  )}

                  <Center>
                    <Button variant="subtle" color="dark" onClick={loadMoreGuests} disabled={loadingGuests}>
                      Carregar mais convidados
                    </Button>
                  </Center>
                </Stack>
              </ScrollArea>
            </Card>

            <Card radius="xl" p="lg" style={{ background: palette.softWhite, border: `1px solid ${palette.line}` }}>
              <Group justify="space-between" mb="md">
                <Title order={4} c={palette.ink}>Presentes recentes</Title>
                <Badge variant="light" color="gray">{gifts.count} itens</Badge>
              </Group>

              <ScrollArea h={320}>
                <Stack gap="sm">
                  {gifts.results.map((gift) => (
                    <Paper key={gift.id} p="sm" radius="lg" style={{ border: `1px solid ${palette.line}` }}>
                      <Group justify="space-between" align="flex-start">
                        <Box style={{ flex: 1 }}>
                          <Text fw={500} size="sm" c={palette.ink}>{gift.name}</Text>
                          {gift.description && (
                            <Text size="xs" c={palette.warmGray} mt={2} lineClamp={2}>{gift.description}</Text>
                          )}
                          <Group gap="xs" mt={2}>
                            <Text size="xs" c={palette.warmGray}>{gift.category}</Text>
                            <Text size="xs" fw={600} c={palette.ink}>
                              {typeof gift.value === 'number'
                                ? `R$ ${Number(gift.value).toFixed(2)}`
                                : (typeof gift.price === 'number' ? `R$ ${Number(gift.price).toFixed(2)}` : '-')}
                            </Text>
                          </Group>
                          {gift.link && (
                            <Text size="xs" c={palette.warmGray} style={{ cursor: 'pointer' }} onClick={() => window.open(gift.link, '_blank')}>
                              Ver presente
                            </Text>
                          )}
                        </Box>
                        <Badge variant="light" color={getStatusColor(gift.status)} size="sm">
                          {getStatusLabel(gift.status)}
                        </Badge>
                      </Group>
                    </Paper>
                  ))}

                  {loadingGifts && (
                    <Center py="md">
                      <Loader size="sm" />
                    </Center>
                  )}

                  <Center>
                    <Button variant="subtle" color="dark" onClick={loadMoreGifts} disabled={loadingGifts}>
                      Carregar mais presentes
                    </Button>
                  </Center>
                </Stack>
              </ScrollArea>
            </Card>
          </SimpleGrid>
        </Stack>
      </Container>
    </BaseLayout>
  );
};

export default MarriplanDashboard;
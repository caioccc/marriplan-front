//eslint-disable react-hooks/exhaustive-deps
//eslint-disable @typescript-eslint/no-unused-vars
/* eslint-disable @typescript-eslint/no-explicit-any */
//eslint no-explicit-any: "off"

import BaseLayout from '@/components/Layout/_BaseLayout';
import WeddingProfileOnboardingModal from '@/components/WeddingProfileOnboardingModal';
import { useAuth } from '@/contexts/AuthContext';
import { giftsService } from '@/services/giftsService';
import { guests_list } from '@/services/guests';
import { Avatar, Badge, Box, Button, Card, Center, Container, Group, Loader, Paper, Progress, ScrollArea, SimpleGrid, Stack, Text, Title, useMantineTheme } from '@mantine/core';
import {
  IconCalendar,
  IconMapPin
} from '@tabler/icons-react';
import React, { useEffect, useState } from 'react';

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

interface GuestsResponse {
  results: Guest[];
  count: number;
}

interface GiftsResponse {
  results: Gift[];
  count: number;
}

const MarriplanDashboard: React.FC = () => {
  const theme = useMantineTheme();
  const [guests, setGuests] = useState<GuestsResponse>({ results: [], count: 0 });
  const [gifts, setGifts] = useState<GiftsResponse>({ results: [], count: 0 });
  const [loadingGuests, setLoadingGuests] = useState(false);
  const [loadingGifts, setLoadingGifts] = useState(false);
  const [guestPage, setGuestPage] = useState(0);
  const [giftPage, setGiftPage] = useState(0);
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Detecta perfil incompleto (campos obrigatórios)
    if (!user?.wedding_profile) {
      setShowOnboarding(true);
    } else {
      const p = user.wedding_profile;
      if (!p.nome_noivo || !p.nome_noiva || !p.data_casamento || !p.hora_casamento || !p.local) {
        setShowOnboarding(true);
      }
    }
  }, [user]);


  // Dados reais do perfil de casamento
  // Visão Geral do Casamento com dados reais
  let weddingOverview: WeddingOverview = {
    date: '-',
    daysRemaining: 0,
    venue: '-',
    confirmedGuests: 0,
    totalGuests: 0
  };

  if (user?.wedding_profile) {
    const p = user.wedding_profile;
    console.log('Wedding Profile:', p);
    // Data formatada e cálculo de dias restantes
    const weddingDate = p.data_casamento
      ? new Date(p.data_casamento + 'T' + (p.hora_casamento || '00:00:00'))
      : null;
    console.log('Wedding Date:', weddingDate);
    let daysRemaining = 0;
    if (weddingDate) {
      // Zera hora/min/seg do casamento e hoje para evitar erro de fuso
      const weddingDateOnly = new Date(weddingDate.getFullYear(), weddingDate.getMonth(), weddingDate.getDate());
      const today = new Date();
      const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const diff = weddingDateOnly.getTime() - todayOnly.getTime();
      daysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));

      console.log('Days Remaining:', daysRemaining, todayOnly, weddingDateOnly);
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

  return (
    <BaseLayout title="Dashboard">
      <Container size="xl" py="md">
        <WeddingProfileOnboardingModal
          opened={showOnboarding}
          onClose={() => setShowOnboarding(false)}
          onComplete={() => setShowOnboarding(false)}
        />
        <Stack gap="xl">
          {/* Overview do Casamento */}
          <Card shadow="md" radius="lg" p="lg">
            <Group justify="space-between" mb="md">
              <Title order={2}>Visão Geral do Casamento</Title>
            </Group>

            <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg">
              <Box>
                <Text size="sm" c="dimmed" mb={4}>Data do Casamento</Text>
                <Group gap="xs">
                  <IconCalendar size={16} color={theme.colors.pink[6]} />
                  <Text fw={500}>{weddingOverview.date}</Text>
                </Group>
              </Box>

              <Box>
                <Text size="sm" c="dimmed" mb={4}>Dias Restantes</Text>
                <Text fw={700} size="xl" c="pink.6">
                  {weddingOverview.daysRemaining} dias
                </Text>
              </Box>

              <Box>
                <Text size="sm" c="dimmed" mb={4}>Local</Text>
                <Group gap="xs">
                  <IconMapPin size={16} color={theme.colors.green[6]} />
                  <Text fw={500}>{weddingOverview.venue}</Text>
                </Group>
              </Box>

              <Box>
                <Text size="sm" c="dimmed" mb={4}>Convidados</Text>
                <Text fw={500}>
                  {weddingOverview.confirmedGuests} / {weddingOverview.totalGuests}
                </Text>
                <Progress
                  value={(weddingOverview.confirmedGuests / weddingOverview.totalGuests) * 100}
                  size="sm"
                  color="blue"
                  mt={4}
                />
              </Box>
            </SimpleGrid>
          </Card>

          {/* Lista de Convidados e Presentes */}
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
            {/* Lista de Convidados */}
            <Card shadow="md" radius="lg" p="lg">
              <Group justify="space-between" mb="md">
                <Title order={2}>Lista de Convidados</Title>
                <Badge variant="light" color="blue">
                  {guests.count} convidados
                </Badge>
              </Group>

              <ScrollArea h={400}>
                <Stack gap="sm">
                  {guests.results.map((guest) => (
                    <Paper key={guest.id} p="sm" radius="md" withBorder>
                      <Group justify="space-between">
                        <Group gap="sm">
                          <Avatar size="sm" color="pink" variant="light">
                            {guest.name.split(' ').map(n => n[0]).join('')}
                          </Avatar>
                          <Box>
                            <Text fw={500} size="sm">{guest.name}</Text>
                            <Text size="xs" c="dimmed">
                              {guest.plusOne ? 'Com acompanhante' : 'Sem acompanhante'}
                            </Text>
                          </Box>
                        </Group>
                        <Badge
                          variant="light"
                          color={getStatusColor(guest.status)}
                          size="sm"
                        >
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
                    <Button
                      variant="light"
                      onClick={loadMoreGuests}
                      disabled={loadingGuests}
                    >
                      Carregar mais convidados
                    </Button>
                  </Center>
                </Stack>
              </ScrollArea>
            </Card>

            {/* Lista de Presentes */}
            <Card shadow="md" radius="lg" p="lg">
              <Group justify="space-between" mb="md">
                <Title order={2}>Lista de Presentes</Title>
                <Badge variant="light" color="green">
                  {gifts.count} itens cadastrados
                </Badge>
              </Group>

              <ScrollArea h={400}>
                <Stack gap="sm">
                  {gifts.results.map((gift) => (
                    <Paper key={gift.id} p="sm" radius="md" withBorder>
                      <Group justify="space-between" align="flex-start">
                        <Box style={{ flex: 1 }}>
                          <Text fw={500} size="sm">{gift.name}</Text>
                          {gift.description && (
                            <Text size="xs" c="dimmed" mt={2} lineClamp={2}>{gift.description}</Text>
                          )}
                          <Group gap="xs" mt={2}>
                            <Text size="xs" c="dimmed">{gift.category}</Text>
                            <Text size="xs" fw={500} c="green">
                              {typeof gift.value === 'number' ? `R$ ${Number(gift.value).toFixed(2)}` : (typeof gift.price === 'number' ? `R$ ${Number(gift.price).toFixed(2)}` : '-')}
                            </Text>
                          </Group>
                          {gift.link && (
                            <Text size="xs" c="blue" style={{ cursor: 'pointer' }} onClick={() => window.open(gift.link, '_blank')}>
                              Ver presente
                            </Text>
                          )}
                          {gift.purchased_by && (
                            <Text size="xs" c="dimmed" mt={2}>
                              Comprado por: {gift.purchased_by}
                            </Text>
                          )}
                        </Box>
                        <Badge
                          variant="light"
                          color={getStatusColor(gift.status)}
                          size="sm"
                        >
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
                    <Button
                      variant="light"
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
    </BaseLayout>
  );
};

export default MarriplanDashboard;
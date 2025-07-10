import BaseLayout from '@/components/Layout/_BaseLayout';
import WeddingProfileOnboardingModal from '@/components/WeddingProfileOnboardingModal';
import { useAuth } from '@/contexts/AuthContext';
import { Carousel } from '@mantine/carousel';
import { Avatar, Badge, Box, Button, Card, Center, Checkbox, Container, Group, Loader, Paper, Progress, ScrollArea, SimpleGrid, Stack, Text, Title, useMantineTheme } from '@mantine/core';
import {
  IconBuildingStore,
  IconCalendar,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconClock,
  IconCurrency,
  IconHeart,
  IconMapPin,
  IconMinus,
  IconTrendingDown,
  IconTrendingUp
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
  id: string;
  name: string;
  price: number;
  status: 'available' | 'purchased';
  image?: string;
  category: string;
}

interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
  month: string;
  category: string;
}

interface WeddingOverview {
  date: string;
  daysRemaining: number;
  venue: string;
  confirmedGuests: number;
  totalGuests: number;
}

const MarriplanDashboard: React.FC = () => {
  const theme = useMantineTheme();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
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

  // Dados de exemplo
  const weddingOverview: WeddingOverview = {
    date: '15 de Junho, 2025',
    daysRemaining: 142,
    venue: 'Jardim do Pôr do Sol',
    confirmedGuests: 85,
    totalGuests: 120
  };

  const quickChecklist = [
    { id: '1', title: 'Local Reservado', completed: true },
    { id: '2', title: 'Convites Enviados', completed: true },
    { id: '3', title: 'Buffet Confirmado', completed: false },
    { id: '4', title: 'Fotógrafo Reservado', completed: false }
  ];

  const keyInformation = [
    {
      icon: IconCurrency,
      title: 'Orçamento',
      value: 'R$ 28.500',
      total: 'R$ 35.000',
      color: 'green',
      trend: 'up'
    },
    {
      icon: IconClock,
      title: 'Cronograma',
      value: 'No prazo',
      color: 'blue',
      trend: 'stable'
    },
    {
      icon: IconBuildingStore,
      title: 'Fornecedores',
      value: '6 confirmados',
      color: 'violet',
      trend: 'up'
    }
  ];

  const monthlyTasks = [
    {
      month: 'Janeiro',
      tasks: [
        { id: '1', title: 'Definir orçamento geral', completed: true, category: 'Planejamento' },
        { id: '2', title: 'Escolher data do casamento', completed: true, category: 'Planejamento' },
        { id: '3', title: 'Fazer lista de convidados', completed: true, category: 'Convidados' }
      ]
    },
    {
      month: 'Fevereiro',
      tasks: [
        { id: '4', title: 'Reservar local da cerimônia', completed: true, category: 'Local' },
        { id: '5', title: 'Reservar local da recepção', completed: true, category: 'Local' },
        { id: '6', title: 'Contratar fotógrafo', completed: false, category: 'Fornecedores' }
      ]
    },
    {
      month: 'Março',
      tasks: [
        { id: '7', title: 'Escolher buffet', completed: false, category: 'Alimentação' },
        { id: '8', title: 'Provar cardápio', completed: false, category: 'Alimentação' },
        { id: '9', title: 'Definir decoração', completed: false, category: 'Decoração' }
      ]
    },
    {
      month: 'Abril',
      tasks: [
        { id: '10', title: 'Enviar convites', completed: false, category: 'Convidados' },
        { id: '11', title: 'Contratar música', completed: false, category: 'Entretenimento' },
        { id: '12', title: 'Escolher flores', completed: false, category: 'Decoração' }
      ]
    }
  ];

  // Simular carregamento de dados
  useEffect(() => {
    const initialGuests: Guest[] = [
      { id: '1', name: 'Sarah Johnson', status: 'confirmed', plusOne: true },
      { id: '2', name: 'Michael Chen', status: 'pending', plusOne: false },
      { id: '3', name: 'Emma Wilson', status: 'confirmed', plusOne: true },
      { id: '4', name: 'David Brown', status: 'declined', plusOne: false },
      { id: '5', name: 'Ana Silva', status: 'confirmed', plusOne: true },
      { id: '6', name: 'Carlos Santos', status: 'pending', plusOne: false }
    ];

    const initialGifts: Gift[] = [
      { id: '1', name: 'Batedeira KitchenAid', price: 299.99, status: 'purchased', category: 'Cozinha' },
      { id: '2', name: 'Conjunto de Jantar', price: 149.99, status: 'available', category: 'Mesa' },
      { id: '3', name: 'Jogo de Cama', price: 89.99, status: 'available', category: 'Quarto' },
      { id: '4', name: 'Panela de Pressão', price: 79.99, status: 'available', category: 'Cozinha' },
      { id: '5', name: 'Conjunto de Taças', price: 119.99, status: 'purchased', category: 'Mesa' }
    ];

    setGuests(initialGuests);
    setGifts(initialGifts);
  }, []);

  const loadMoreGuests = () => {
    setLoadingGuests(true);
    setTimeout(() => {
      const newGuests: Guest[] = [
        { id: `${Date.now()}-1`, name: 'João Costa', status: 'confirmed', plusOne: true },
        { id: `${Date.now()}-2`, name: 'Maria Oliveira', status: 'pending', plusOne: false },
      ];
      setGuests(prev => [...prev, ...newGuests]);
      setGuestPage(prev => prev + 1);
      setLoadingGuests(false);
    }, 1000);
  };

  const loadMoreGifts = () => {
    setLoadingGifts(true);
    setTimeout(() => {
      const newGifts: Gift[] = [
        { id: `${Date.now()}-1`, name: 'Liquidificador', price: 159.99, status: 'available', category: 'Cozinha' },
        { id: `${Date.now()}-2`, name: 'Conjunto de Potes', price: 89.99, status: 'available', category: 'Cozinha' },
      ];
      setGifts(prev => [...prev, ...newGifts]);
      setGiftPage(prev => prev + 1);
      setLoadingGifts(false);
    }, 1000);
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

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <IconTrendingUp size={16} />;
      case 'down': return <IconTrendingDown size={16} />;
      default: return <IconMinus size={16} />;
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

          {/* Checklist Rápido */}
          <Card shadow="md" radius="lg" p="lg">
            <Group justify="space-between" mb="md">
              <Title order={2}>Lista de Verificação Rápida</Title>
              <Badge variant="light" color="blue">
                {quickChecklist.filter(item => item.completed).length} / {quickChecklist.length}
              </Badge>
            </Group>

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              {quickChecklist.map((item) => (
                <Group key={item.id} gap="md">
                  <Checkbox
                    checked={item.completed}
                    color="green"
                    size="md"
                    readOnly
                  />
                  <Box style={{ flex: 1 }}>
                    <Text fw={500} td={item.completed ? 'line-through' : 'none'}>
                      {item.title}
                    </Text>
                  </Box>
                  {item.completed && <IconCheck size={16} color={theme.colors.green[6]} />}
                </Group>
              ))}
            </SimpleGrid>
          </Card>

          {/* Informações Principais */}
          <Card shadow="md" radius="lg" p="lg">
            <Title order={2} mb="md">Status do Planejamento</Title>

            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
              {keyInformation.map((info, index) => (
                <Paper key={index} p="md" radius="md" withBorder>
                  <Group justify="space-between" mb="xs">
                    <Group gap="xs">
                      <info.icon size={20} color={theme.colors[info.color][6]} />
                      <Text fw={500}>{info.title}</Text>
                    </Group>
                    {getTrendIcon(info.trend)}
                  </Group>
                  <Text fw={700} size="lg" c={info.color}>
                    {info.value}
                  </Text>
                  {info.total && (
                    <Text size="sm" c="dimmed">
                      de {info.total}
                    </Text>
                  )}
                </Paper>
              ))}
            </SimpleGrid>
          </Card>

          {/* Cronograma Mensal */}
          <Card shadow="md" radius="lg" p="lg">
            <Title order={2} mb="md">Cronograma Mensal</Title>

            <Carousel
              withIndicators
              slideSize="100%"
              slideGap="md"
              align="start"
              nextControlIcon={<IconChevronRight size={16} />}
              previousControlIcon={<IconChevronLeft size={16} />}
              controlSize={40}
            >
              {monthlyTasks.map((month) => (
                <Carousel.Slide key={month.month}>
                  <Paper p="md" radius="md" withBorder h={300}>
                    <Group justify="space-between" mb="md">
                      <Title order={3} c="pink.6">{month.month}</Title>
                      <Badge variant="light" color="blue">
                        {month.tasks.filter(task => task.completed).length} / {month.tasks.length}
                      </Badge>
                    </Group>

                    <Stack gap="sm">
                      {month.tasks.map((task) => (
                        <Group key={task.id} gap="md">
                          <Checkbox
                            checked={task.completed}
                            color="green"
                            size="sm"
                            readOnly
                          />
                          <Box style={{ flex: 1 }}>
                            <Text size="sm" fw={500} td={task.completed ? 'line-through' : 'none'}>
                              {task.title}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {task.category}
                            </Text>
                          </Box>
                        </Group>
                      ))}
                    </Stack>
                  </Paper>
                </Carousel.Slide>
              ))}
            </Carousel>
          </Card>

          {/* Lista de Convidados e Presentes */}
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
            {/* Lista de Convidados */}
            <Card shadow="md" radius="lg" p="lg">
              <Group justify="space-between" mb="md">
                <Title order={2}>Lista de Convidados</Title>
                <Badge variant="light" color="blue">
                  {guests.length} convidados
                </Badge>
              </Group>

              <ScrollArea h={400}>
                <Stack gap="sm">
                  {guests.map((guest) => (
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
                  {gifts.filter(gift => gift.status === 'purchased').length} / {gifts.length}
                </Badge>
              </Group>

              <ScrollArea h={400}>
                <Stack gap="sm">
                  {gifts.map((gift) => (
                    <Paper key={gift.id} p="sm" radius="md" withBorder>
                      <Group justify="space-between">
                        <Box style={{ flex: 1 }}>
                          <Text fw={500} size="sm">{gift.name}</Text>
                          <Group gap="xs" mt={2}>
                            <Text size="xs" c="dimmed">{gift.category}</Text>
                            <Text size="xs" fw={500} c="green">
                              R$ {gift.price.toFixed(2)}
                            </Text>
                          </Group>
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
import PublicGiftListLayout from '@/components/Layout/PublicGiftListLayout';
import api from '@/services/api';
import {
  Box, Group, Title, Text, Badge, Image, Card, Button, Checkbox, Stack, Loader, Radio, Pagination, NumberInput, Switch, Divider, ScrollArea, SegmentedControl, Tooltip, RangeSlider
} from '@mantine/core';
import { useRef } from 'react';
import { IconExternalLink, IconFilter } from '@tabler/icons-react';
import { giftsService } from '@/services/giftsService';
import { Gift } from '@/types/gift';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useMediaQuery } from '@mantine/hooks';
import { IconClock, IconSortAscending, IconSortDescending, IconCalendar } from '@tabler/icons-react';

const STATUS_LABELS: Record<string, string> = {
  available: 'Disponível',
  purchased: 'Comprado',
  reserved: 'Reservado',
};
const STATUS_COLORS: Record<string, string> = {
  available: 'green',
  purchased: 'gray',
  reserved: 'yellow',
};
const CATEGORY_LABELS: Record<string, string> = {
  kitchen: 'Cozinha',
  home: 'Casa',
  electronics: 'Eletrônicos',
  decor: 'Decoração',
  bath: 'Banho',
  // ...adicione outras categorias conforme necessário
};

function formatCurrency(value: number | string) {
  if (typeof value === 'string') value = parseFloat(value);
  return value ? value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00';
}

import { useCallback } from 'react';

export default function GiftsSharePage() {
  const router = useRouter();
  const { token } = router.query;
  // Filtros e estado
  // Dados do casamento
  const [weddingProfile, setWeddingProfile] = useState<any>(null);

  // Função para buscar dados do casamento pelo wedding_profile do primeiro presente
  const fetchWeddingProfile = useCallback(async (profileId: number) => {
    try {
      const res = await api.get(`/api/wedding-profile/${profileId}/`);
      setWeddingProfile(res.data);
    } catch (e) {
      console.log('Erro ao buscar dados do casamento:', e);
      setWeddingProfile(null);
    }
  }, []);

  const [gifts, setGifts] = useState<Gift[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [statusOptions, setStatusOptions] = useState<string[]>([]);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [hasLink, setHasLink] = useState<boolean | undefined>(undefined);
  const [search, setSearch] = useState('');
  const [ordering, setOrdering] = useState<'recent' | 'oldest' | 'price_asc' | 'price_desc'>('recent');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Buscar presentes e opções de filtro
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    giftsService.listPublicGifts(token as string, {
      categories: selectedCategories,
      min_price: minPrice,
      max_price: maxPrice,
      status: selectedStatus,
      has_link: hasLink,
      search,
      ordering,
      page,
      page_size: pageSize,
    }).then(res => {
      setGifts(res.results || []);
      setTotal(res.total || 0);
      setCategories(res.categories || []);
      setStatusOptions(res.status || []);
      // Buscar dados do casamento pelo wedding_profile do primeiro presente
      if (res.results && res.results.length > 0 && res.results[0].wedding_profile) {
        fetchWeddingProfile(res.results[0].wedding_profile);
      }
    }).finally(() => setLoading(false));

  }, [token, selectedCategories, minPrice, maxPrice, selectedStatus, hasLink, search, ordering, page, pageSize, fetchWeddingProfile]);

  // Handlers
  const handleCategoryChange = (cat: string) => {
    setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
    setPage(1);
  };
  const handleStatusChange = (stat: string) => {
    setSelectedStatus(prev => prev.includes(stat) ? prev.filter(s => s !== stat) : [...prev, stat]);
    setPage(1);
  };
  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };
  const handleOrdering = (value: typeof ordering) => {
    setOrdering(value);
    setPage(1);
  };
  const handleHasLink = (checked: boolean) => {
    setHasLink(checked ? true : undefined);
    setPage(1);
  };
  const handleMinPrice = (value: number | '') => {
    setMinPrice(value === '' ? undefined : value);
    setPage(1);
  };
  const handleMaxPrice = (value: number | '') => {
    setMaxPrice(value === '' ? undefined : value);
    setPage(1);
  };

  // Sidebar de filtros
  const filters = (
    <Stack gap="xs">
      <Text size="sm" fw={500}>Categorias</Text>
      <ScrollArea mh={120} type="auto">
        <Stack gap="xs">
          {categories.map(cat => (
            <Checkbox
              key={cat}
              label={CATEGORY_LABELS[cat] || cat}
              checked={selectedCategories.includes(cat)}
              onChange={() => handleCategoryChange(cat)}
            />
          ))}
        </Stack>
      </ScrollArea>
      <Divider my="xs" />
      <Text size="sm" fw={500} mt="sm">Faixa de Preço (R$)</Text>
      <Group gap="xs">
        <NumberInput
          placeholder="Mínimo"
          value={minPrice}
          onChange={handleMinPrice}
          min={0}
          w={100}
        />
        <NumberInput
          placeholder="Máximo"
          value={maxPrice}
          onChange={handleMaxPrice}
          min={0}
          w={100}
        />
      </Group>
      <Divider my="xs" />
      <Text size="sm" fw={500} mt="sm">Status</Text>
      <Stack gap="xs">
        {statusOptions.map(stat => (
          <Checkbox
            key={stat}
            label={STATUS_LABELS[stat] || stat}
            checked={selectedStatus.includes(stat)}
            onChange={() => handleStatusChange(stat)}
          />
        ))}
      </Stack>
      <Divider my="xs" />
      <Group mt="sm">
        <Switch
          label="Apenas com link"
          checked={hasLink === true}
          onChange={e => handleHasLink(e.currentTarget.checked)}
        />
      </Group>
    </Stack>
  );

  // Content principal
  // Título dinâmico com nomes do casal
  let coupleTitle = 'Lista de Presentes';
  if (weddingProfile && (weddingProfile.nome_noivo || weddingProfile.nome_noiva)) {
    coupleTitle = `Lista de Presentes - ${weddingProfile.nome_noivo || ''}${weddingProfile.nome_noivo && weddingProfile.nome_noiva ? ' & ' : ''}${weddingProfile.nome_noiva || ''}`;
  }

  return (
    <PublicGiftListLayout search={search} onSearch={handleSearch} filters={filters}>
      <Box>
        <Title order={2} mb="md" style={{ textAlign: 'left' }}>{coupleTitle}</Title>

        <Group justify="space-between" align="center" mb="md" style={isMobile ? { flexDirection: 'column', gap: 12 } : {}}>
          <div style={isMobile ? { width: '100%', display: 'flex', justifyContent: 'center' } : {}}>
            <SegmentedControl
              value={ordering}
              onChange={handleOrdering}
              data={[
                {
                  value: 'recent',
                  label: (
                    <Tooltip label="Mais recente" withArrow position="top">
                      {isMobile ? (
                        <IconClock size={18} />
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                          <IconClock size={16} style={{ marginRight: 4 }} />Mais recente
                        </span>
                      )}
                    </Tooltip>
                  ),
                },
                {
                  value: 'oldest',
                  label: (
                    <Tooltip label="Mais antigo" withArrow position="top">
                      {isMobile ? (
                        <IconCalendar size={18} />
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                          <IconCalendar size={16} style={{ marginRight: 4 }} />Mais antigo
                        </span>
                      )}
                    </Tooltip>
                  ),
                },
                {
                  value: 'price_asc',
                  label: (
                    <Tooltip label="Preço crescente" withArrow position="top">
                      {isMobile ? (
                        <IconSortAscending size={18} />
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                          <IconSortAscending size={16} style={{ marginRight: 4 }} />Preço crescente
                        </span>
                      )}
                    </Tooltip>
                  ),
                },
                {
                  value: 'price_desc',
                  label: (
                    <Tooltip label="Preço decrescente" withArrow position="top">
                      {isMobile ? (
                        <IconSortDescending size={18} />
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                          <IconSortDescending size={16} style={{ marginRight: 4 }} />Preço decrescente
                        </span>
                      )}
                    </Tooltip>
                  ),
                },
              ]}
              color="blue"
              size="md"
              radius="md"
            />
          </div>
          <Tooltip label="Quantidade total de presentes encontrados" withArrow position="bottom">
            <Text size="sm" color="dimmed">{total} presentes encontrados</Text>
          </Tooltip>
        </Group>
        {loading ? (
          <Group justify="center" align="center" h={300}><Loader size="lg" /></Group>
        ) : (
          <Group wrap="wrap" gap="md">
            {gifts.length === 0 && (
              <Text color="dimmed">Nenhum presente encontrado.</Text>
            )}
            {gifts.map((gift, index) => {
              const isPurchased = gift.status === 'purchased';
              return (
                <Card key={index} shadow="sm" padding="lg" radius="md" withBorder style={{ width: 320, opacity: isPurchased ? 0.7 : 1 }}>
                  <Box style={{ width: '100%', height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa', borderRadius: 8, overflow: 'hidden' }}>
                    <Image
                      src={gift.image || '/img/gift-placeholder.png'}
                      alt={gift.name}
                      width={180}
                      height={180}
                      fit="cover"
                      style={{ objectFit: 'cover', width: 180, height: 180, minWidth: 180, minHeight: 180, borderRadius: 8, background: '#fafafa' }}
                      onError={e => {
                        const target = e.currentTarget as HTMLImageElement;
                        if (!target.src.includes('/img/gift-placeholder.png')) {
                          target.src = '/img/gift-placeholder.png';
                        }
                      }}
                    />
                  </Box>
                  <Title order={4} mt="sm" style={isPurchased ? { textDecoration: 'line-through', color: '#888' } : {}}>{gift.name}</Title>
                  <Text size="sm" color="dimmed" style={isPurchased ? { textDecoration: 'line-through' } : {}}>{gift.description}</Text>
                  <Text mt="xs" style={isPurchased ? { textDecoration: 'line-through' } : {}}>
                    <b>Valor:</b> {gift.value ? formatCurrency(gift.value) : 'não informado'}
                  </Text>
                  {gift.category ? (
                    <Text style={isPurchased ? { textDecoration: 'line-through' } : {}}>
                      <b>Categoria:</b> {CATEGORY_LABELS[gift.category] || gift.category}
                    </Text>
                  ) : (
                    <Text style={isPurchased ? { textDecoration: 'line-through' } : {}}>
                      <b>Categoria:</b> não informado
                    </Text>
                  )}
                  <Group mt="xs" justify="space-between" align="center">
                    <Badge color={isPurchased ? 'gray' : STATUS_COLORS[gift.status] || 'gray'}>
                      {STATUS_LABELS[gift.status] || gift.status}
                    </Badge>
                    {gift.link && !isPurchased && (
                      <Tooltip label="Abrir link do produto" withArrow position="top">
                        <Button
                          component="a"
                          href={gift.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          leftSection={<IconExternalLink size={16} />}
                          size="xs"
                          variant="light"
                          color="blue"
                        >
                          Ver Produto
                        </Button>
                      </Tooltip>
                    )}
                  </Group>
                </Card>
              );
            })}
          </Group>
        )}
        <Group justify="center" mt="lg">
          <Tooltip label="Paginação dos presentes" withArrow position="top">
            <Pagination
              total={Math.ceil(total / pageSize)}
              value={page}
              onChange={setPage}
              size="md"
              radius="md"
              withEdges
            />
          </Tooltip>
        </Group>
      </Box>
    </PublicGiftListLayout>
  );
}

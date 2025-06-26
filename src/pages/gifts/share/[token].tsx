import PublicGiftListLayout from '@/components/Layout/PublicGiftListLayout';
import {
  Box, Group, Title, Text, Badge, Image, Card, Button, Checkbox, Stack, Loader, Radio, Pagination, NumberInput, Switch, Divider, ScrollArea, SegmentedControl, Tooltip
} from '@mantine/core';
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

export default function GiftsSharePage() {
  const router = useRouter();
  const { token } = router.query;
  // Filtros e estado
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [statusOptions, setStatusOptions] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
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
    }).finally(() => setLoading(false));
  }, [token, selectedCategories, minPrice, maxPrice, selectedStatus, hasLink, search, ordering, page, pageSize]);

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
  return (
    <PublicGiftListLayout search={search} onSearch={handleSearch} filters={filters}>
      <Box>
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
            {gifts.map(gift => {
              const isPurchased = gift.status === 'purchased';
              return (
                <Card shadow="sm" padding="lg" radius="md" withBorder style={{ width: 320, opacity: isPurchased ? 0.7 : 1 }}>
                  {gift.image && <Image src={gift.image} alt={gift.name} height={140} fit="contain" />}
                  <Title order={4} mt="sm" style={isPurchased ? { textDecoration: 'line-through', color: '#888' } : {}}>{gift.name}</Title>
                  <Text size="sm" color="dimmed" style={isPurchased ? { textDecoration: 'line-through' } : {}}>{gift.description}</Text>
                  <Text mt="xs" style={isPurchased ? { textDecoration: 'line-through' } : {}}>
                    <b>Valor:</b> {formatCurrency(gift.value)}
                  </Text>
                  <Text style={isPurchased ? { textDecoration: 'line-through' } : {}}>
                    <b>Categoria:</b> {CATEGORY_LABELS[gift.category] || gift.category}
                  </Text>
                  <Badge color={isPurchased ? 'gray' : STATUS_COLORS[gift.status] || 'gray'} mt="xs">
                    {STATUS_LABELS[gift.status] || gift.status}
                  </Badge>
                  {gift.link && (
                    <Tooltip label="Abrir link do produto" withArrow position="top">
                      <Button
                        component="a"
                        href={gift.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        leftSection={<IconExternalLink size={16} />}
                        mt="xs"
                        size="xs"
                        variant="light"
                        color="blue"
                        disabled={isPurchased}
                      >
                        Ver Produto
                      </Button>
                    </Tooltip>
                  )}
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

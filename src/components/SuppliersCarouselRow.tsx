import { SupplierCard } from '@/components/SupplierCard';
import { listWeddingSuppliers, WeddingSupplier } from '@/services/suppliers';
import { Carousel } from '@mantine/carousel';
import { Box, Stack, Text, Title } from '@mantine/core';
import Autoplay from 'embla-carousel-autoplay';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';

export function SuppliersCarouselRow() {
  const router = useRouter();
  const [items, setItems] = useState<WeddingSupplier[]>([]);
  const [loading, setLoading] = useState(false);
  const autoplay = useMemo(() => Autoplay({ delay: 5000, stopOnInteraction: false }), []);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const data = await listWeddingSuppliers({ page_size: 12, ordering: '-updated_at' });
        if (mounted) {
          setItems(data.results || []);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (!loading && items.length === 0) {
    return null;
  }

  return (
    <Box w="100%" mt="xl">
      <Stack gap="md">
        <Box>
          <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: 1.2 }}>
            Gestão visual
          </Text>
          <Title order={3}>Meus fornecedores</Title>
        </Box>
        <Carousel
          slideSize={{ base: '86%', sm: '58%', md: '38%', lg: '30%' }}
          slideGap={{ base: 'md', sm: 'lg' }}
          align="start"
          loop
          withIndicators
          withControls={items.length > 1}
          plugins={[autoplay]}
        >
          {items.map((item) => (
            <Carousel.Slide key={item.id}>
              <SupplierCard
                supplier={item.supplier_detail!}
                weddingSupplier={item}
                compact
                onView={(supplier) => router.push(`/fornecedores/${supplier.id}`)}
                onAdd={(supplier) => router.push(`/fornecedores/${supplier.id}`)}
              />
            </Carousel.Slide>
          ))}
        </Carousel>
      </Stack>
    </Box>
  );
}

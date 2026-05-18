import { SupplierCard } from "@/components/SupplierCard";
import { listWeddingSuppliers, WeddingSupplier } from "@/services/suppliers";
import { Carousel } from "@mantine/carousel";
import { Box, Stack, Title } from "@mantine/core";
import Autoplay from "embla-carousel-autoplay";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

export function SuppliersCarouselRow() {
  const router = useRouter();
  const [items, setItems] = useState<WeddingSupplier[]>([]);
  const [loading, setLoading] = useState(false);
  const autoplay = useMemo(
    () => Autoplay({ delay: 5000, stopOnInteraction: false }),
    [],
  );

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const data = await listWeddingSuppliers({
          page_size: 12,
          ordering: "-updated_at",
        });
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
          <Title order={3}>Meus fornecedores</Title>
        </Box>
        <Carousel
          slideSize={{ base: "86%", sm: "58%", md: "38%", lg: "30%" }}
          slideGap={{ base: "md", sm: "lg" }}
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
                variant="dashboard"
                onView={(supplier) =>
                  router.push(`/fornecedores/${supplier.id}`)
                }
                onAdd={(supplier) =>
                  router.push(`/fornecedores/${supplier.id}`)
                }
              />
            </Carousel.Slide>
          ))}
        </Carousel>
      </Stack>
    </Box>
  );
}

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Loader, Container } from '@mantine/core';
import { toast } from '@/hooks/use-toast';
import { fetchWeddingSitePublic } from '@/services/weddingSite';
import WeddingLanding from '@/components/WeddingLanding';

export default function PublicWeddingSitePage() {
  const router = useRouter();
  const { slug } = router.query;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetchWeddingSitePublic(slug as string)
      .then(setData)
      .catch(err => {
        toast({ title: 'Site não encontrado', description: 'O site do casal não foi encontrado ou está indisponível.' });
        console.error('Erro ao carregar site público:', err);
        router.replace('/meu-site');
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <Container py={80}><Loader size="lg" /></Container>;
  if (!data) return null;

  return <WeddingLanding data={data} />;
}

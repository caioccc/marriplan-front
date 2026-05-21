import BaseLayout from '@/components/Layout/_BaseLayout';
import { WeddingStylePage } from '@/components/wedding/identity/pages';
import { useWeddingIdentityState } from '@/hooks/useWeddingIdentityState';
import { useEffect } from 'react';

export default function EstiloDoCasamentoPage() {
  const { activePage, setActivePage, selectedStyle, setSelectedStyle } = useWeddingIdentityState();

  useEffect(() => {
    if (activePage !== 'style') {
      setActivePage('style');
    }
  }, [activePage, setActivePage]);

  return (
    <BaseLayout>
      <WeddingStylePage selectedStyle={selectedStyle} setSelectedStyle={setSelectedStyle} />
    </BaseLayout>
  );
}

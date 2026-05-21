import BaseLayout from '@/components/Layout/_BaseLayout';
import { SweetsPage } from '@/components/wedding/identity/pages';
import { useWeddingIdentityState } from '@/hooks/useWeddingIdentityState';
import { useEffect } from 'react';

export default function DocesEBemCasadosPage() {
  const { activePage, setActivePage } = useWeddingIdentityState();

  useEffect(() => {
    if (activePage !== 'sweets') {
      setActivePage('sweets');
    }
  }, [activePage, setActivePage]);

  return (
    <BaseLayout>
      <SweetsPage />
    </BaseLayout>
  );
}

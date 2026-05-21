import BaseLayout from '@/components/Layout/_BaseLayout';
import { InspirationPage } from '@/components/wedding/identity/pages';
import { useWeddingIdentityState } from '@/hooks/useWeddingIdentityState';
import { useEffect } from 'react';

export default function ReferenciasVisuaisPage() {
  const { activePage, setActivePage } = useWeddingIdentityState();

  useEffect(() => {
    if (activePage !== 'inspirations') {
      setActivePage('inspirations');
    }
  }, [activePage, setActivePage]);

  return (
    <BaseLayout>
      <InspirationPage />
    </BaseLayout>
  );
}

import BaseLayout from '@/components/Layout/_BaseLayout';
import { DecorationPage } from '@/components/wedding/identity/pages';
import { useWeddingIdentityState } from '@/hooks/useWeddingIdentityState';
import { useEffect } from 'react';

export default function DecoracaoPageRoute() {
  const { activePage, setActivePage } = useWeddingIdentityState();

  useEffect(() => {
    if (activePage !== 'decoration') {
      setActivePage('decoration');
    }
  }, [activePage, setActivePage]);

  return (
    <BaseLayout>
      <DecorationPage />
    </BaseLayout>
  );
}

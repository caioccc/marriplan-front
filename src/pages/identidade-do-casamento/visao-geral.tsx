import BaseLayout from '@/components/Layout/_BaseLayout';
import { OverviewPage } from '@/components/wedding/identity/pages';
import { useWeddingIdentityState } from '@/hooks/useWeddingIdentityState';
import { useEffect } from 'react';

export default function VisaoGeralPage() {
  const { activePage, setActivePage, palette, selectedStyle, dressCode } = useWeddingIdentityState();

  useEffect(() => {
    if (activePage !== 'overview') {
      setActivePage('overview');
    }
  }, [activePage, setActivePage]);

  return (
    <BaseLayout>
      <OverviewPage selectedStyle={selectedStyle} palette={palette} dressCode={dressCode} />
    </BaseLayout>
  );
}

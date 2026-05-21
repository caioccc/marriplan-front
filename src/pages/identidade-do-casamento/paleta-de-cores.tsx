import BaseLayout from '@/components/Layout/_BaseLayout';
import { PalettePage } from '@/components/wedding/identity/pages';
import { useWeddingIdentityState } from '@/hooks/useWeddingIdentityState';
import { useEffect } from 'react';

export default function PaletaDeCoresPage() {
  const { activePage, setActivePage, palette, setPalette } = useWeddingIdentityState();

  useEffect(() => {
    if (activePage !== 'palette') {
      setActivePage('palette');
    }
  }, [activePage, setActivePage]);

  return (
    <BaseLayout>
      <PalettePage palette={palette} setPalette={setPalette} />
    </BaseLayout>
  );
}

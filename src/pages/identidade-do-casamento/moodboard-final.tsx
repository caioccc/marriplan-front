import BaseLayout from '@/components/Layout/_BaseLayout';
import { MoodboardPage } from '@/components/wedding/identity/pages';
import { useWeddingIdentityState } from '@/hooks/useWeddingIdentityState';
import { useEffect } from 'react';

export default function MoodboardFinalPage() {
  const { activePage, setActivePage, palette, selectedStyle, dressCode } = useWeddingIdentityState();

  useEffect(() => {
    if (activePage !== 'moodboard') {
      setActivePage('moodboard');
    }
  }, [activePage, setActivePage]);

  return (
    <BaseLayout>
      <MoodboardPage selectedStyle={selectedStyle} palette={palette} dressCode={dressCode} />
    </BaseLayout>
  );
}

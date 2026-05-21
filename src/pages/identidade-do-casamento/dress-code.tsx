import BaseLayout from '@/components/Layout/_BaseLayout';
import { DressCodePage } from '@/components/wedding/identity/pages';
import { useWeddingIdentityState } from '@/hooks/useWeddingIdentityState';
import { useEffect } from 'react';

export default function DressCodeRoutePage() {
  const { activePage, setActivePage, dressCode, setDressCode } = useWeddingIdentityState();

  useEffect(() => {
    if (activePage !== 'dresscode') {
      setActivePage('dresscode');
    }
  }, [activePage, setActivePage]);

  return (
    <BaseLayout>
      <DressCodePage dressCode={dressCode} setDressCode={setDressCode} />
    </BaseLayout>
  );
}

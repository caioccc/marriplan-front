import BaseLayout from '@/components/Layout/_BaseLayout';
import GuestTable from '@/components/GuestTable';

export default function GuestsPage() {
  return (
    <BaseLayout title="Convidados">
      <GuestTable />
    </BaseLayout>
  );
}

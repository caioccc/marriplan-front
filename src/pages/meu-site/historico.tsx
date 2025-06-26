import BaseLayout from '@/components/Layout/_BaseLayout';
import WeddingSiteHistoryList from '@/components/WeddingSiteHistoryList';
import { Card, Title, Text, Box, Timeline, Group } from '@mantine/core';
import { IconEdit, IconCheck, IconWorld } from '@tabler/icons-react';

export default function HistoricoSite() {
  return (
    <BaseLayout>
      <WeddingSiteHistoryList />
    </BaseLayout>
  );
}

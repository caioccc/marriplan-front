import { TimelineMoment } from '@/types/timeline';
import { Card, Skeleton, Stack } from '@mantine/core';
import { TimelineItem } from './TimelineItem';

type TimelineListProps = {
  moments: TimelineMoment[];
  loading?: boolean;
  onEdit: (moment: TimelineMoment) => void;
  onDelete: (moment: TimelineMoment) => void;
};

export function TimelineList({ moments, loading, onEdit, onDelete }: TimelineListProps) {
  if (loading) {
    return (
      <Stack gap="md">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} radius="xl" withBorder p="lg">
            <Stack gap="sm">
              <Skeleton height={18} width="22%" radius="xl" />
              <Skeleton height={12} width="55%" radius="xl" />
              <Skeleton height={12} width="78%" radius="xl" />
            </Stack>
          </Card>
        ))}
      </Stack>
    );
  }

  return (
    <Stack gap="md">
      {moments.map((moment) => (
        <TimelineItem key={moment.id} moment={moment} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </Stack>
  );
}

import { primaryButtonStyles, softButtonStyles } from '@/styles';
import { ActionIcon, Button, Group, Menu } from '@mantine/core';
import {
  IconDotsVertical,
  IconFileTypePdf,
  IconSparkles,
  IconPlus,
} from '@tabler/icons-react';

type TimelineActionsProps = {
  onCreate: () => void;
  onExportPdf: () => void;
  onGenerateDefault: () => void;
  exportingPdf?: boolean;
  generatingDefault?: boolean;
};

export function TimelineActions({
  onCreate,
  onExportPdf,
  onGenerateDefault,
  exportingPdf,
  generatingDefault,
}: TimelineActionsProps) {
  return (
    <Group gap="sm" wrap="wrap" justify="flex-end">
      <Button
        variant="default"
        leftSection={<IconFileTypePdf size={18} />}
        onClick={onExportPdf}
        loading={exportingPdf}
        styles={softButtonStyles}
      >
        Exportar PDF
      </Button>

      <Menu shadow="md" width={220} position="bottom-end">
        <Menu.Target>
          <ActionIcon
            variant="subtle"
            size="lg"
            aria-label="Mais ações da timeline"
            styles={softButtonStyles}
          >
            <IconDotsVertical size={18} />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item
            leftSection={<IconSparkles size={16} />}
            onClick={onGenerateDefault}
            disabled={generatingDefault}
          >
            Gerar Timeline Padrão
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>

      <Button
        leftSection={<IconPlus size={18} />}
        onClick={onCreate}
        styles={primaryButtonStyles}
      >
        Momento
      </Button>
    </Group>
  );
}

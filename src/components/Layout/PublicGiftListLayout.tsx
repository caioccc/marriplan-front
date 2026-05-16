import { AppShell, Box, Title, Group, TextInput, Divider, Stack, Checkbox, NumberInput, Switch, Text, Radio, Loader, Pagination, ScrollArea, Burger } from '@mantine/core';
import { IconSearch, IconFilter } from '@tabler/icons-react';
import { ReactNode, useState } from 'react';
import { useMediaQuery } from '@mantine/hooks';

interface PublicGiftListLayoutProps {
  children: ReactNode;
  search: string;
  onSearch: (value: string) => void;
  filters: ReactNode;
}

export default function PublicGiftListLayout({ children, search, onSearch, filters }: PublicGiftListLayoutProps) {
  const [navbarOpened, setNavbarOpened] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <AppShell
      padding="md"
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !navbarOpened },
      }}
      styles={{
        main: {
          background: 'var(--marriplan-bg)',
          minHeight: '100dvh',
        },
      }}
    >
      <AppShell.Header
        p="md"
        style={{
          background: 'rgba(255, 251, 247, 0.9)',
          borderBottom: '1px solid var(--marriplan-border)',
          backdropFilter: 'blur(10px)',
        }}
      >
        {isMobile ? (
          <Group w="100%" gap="xs" align="center">
            <Burger
              opened={navbarOpened}
              onClick={() => setNavbarOpened(o => !o)}
              aria-label="Abrir filtros"
              size="md"
            />
            <TextInput
              placeholder="Buscar por nome ou categoria..."
              leftSection={<IconSearch size={18} />}
              value={search}
              onChange={e => onSearch(e.currentTarget.value)}
              w="100%"
              style={{ flex: 1 }}
            />
          </Group>
        ) : (
          <Group justify="center" align="center" w="100%">
             <TextInput
              placeholder="Buscar por nome ou categoria..."
              leftSection={<IconSearch size={18} />}
              value={search}
              onChange={e => onSearch(e.currentTarget.value)}
              w={320}
            />
          </Group>
        )}
      </AppShell.Header>

      <AppShell.Navbar
        width={300}
        p="md"
        style={{
          background: 'var(--marriplan-surface)',
          borderRight: '1px solid var(--marriplan-border)',
        }}
      >
        <Title order={4} mb="md">Filtros</Title>
        <Divider mb="sm" labelPosition="center" label={<Group gap={4}><IconFilter size={16} />Filtros</Group>} />
        {filters}
      </AppShell.Navbar>

      <AppShell.Main>
        <Box style={{ margin: '8px 8px 8px 8px' }}>
          {children}
        </Box>
      </AppShell.Main>
    </AppShell>
  );
}

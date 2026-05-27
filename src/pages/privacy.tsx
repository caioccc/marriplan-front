import LandingFooter from "@/components/Footer/LandingFooter";
import LegalSection from "@/components/LegalSection";
import {
    privacyIntro,
    privacyLastUpdated,
    privacySections,
} from "@/utils/privacy-content";
import {
    Anchor,
    Badge,
    Box,
    Container,
    Divider,
    Grid,
    Group,
    Paper,
    Stack,
    Text,
    Title,
} from "@mantine/core";
import {
    IconChevronRight,
    IconHome2,
    IconShieldLock,
} from "@tabler/icons-react";
import Head from "next/head";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <>
      <Head>
        <title>Política de Privacidade | Marriplan</title>
        <meta
          name="description"
          content="Consulte a Política de Privacidade do Marriplan em uma página pública, clara e responsiva, com conteúdo organizado por seções."
        />
        <link rel="canonical" href="https://marriplan.com/privacy" />
        <meta
          property="og:title"
          content="Política de Privacidade | Marriplan"
        />
        <meta
          property="og:description"
          content="Consulte a Política de Privacidade do Marriplan em uma página pública, clara e responsiva, com conteúdo organizado por seções."
        />
        <meta property="og:url" content="https://marriplan.com/privacy" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta
          name="twitter:title"
          content="Política de Privacidade | Marriplan"
        />
        <meta
          name="twitter:description"
          content="Consulte a Política de Privacidade do Marriplan em uma página pública, clara e responsiva, com conteúdo organizado por seções."
        />
      </Head>

      <Box
        component="main"
        style={{
          scrollBehavior: "smooth",
          background:
            "linear-gradient(180deg, #faf7f2 0%, #f6f1ea 44%, #ffffff 100%)",
          color: "var(--marriplan-text)",
        }}
      >
        <Box pos="relative" py={{ base: 36, sm: 48 }}>
          <Box
            pos="absolute"
            left={0}
            top={0}
            h={320}
            w={320}
            style={{
              borderRadius: "9999px",
              background: "rgba(242, 230, 216, 0.72)",
              filter: "blur(72px)",
              pointerEvents: "none",
            }}
          />
          <Box
            pos="absolute"
            right={0}
            top={120}
            h={360}
            w={360}
            style={{
              borderRadius: "9999px",
              background: "rgba(232, 215, 203, 0.42)",
              filter: "blur(84px)",
              pointerEvents: "none",
            }}
          />

          <Container size="lg" pos="relative">
            <Stack gap={28}>
              <Paper
                radius="xl"
                p={{ base: "xl", sm: 32 }}
                className="marriplan-card"
              >
                <Stack gap="lg">
                  <Group gap="sm" wrap="wrap">
                    <Badge
                      radius="xl"
                      size="lg"
                      leftSection={<IconShieldLock size={14} />}
                      color="yellow"
                      variant="light"
                      styles={{
                        root: {
                          backgroundColor: "var(--marriplan-surface-muted)",
                          color: "var(--marriplan-muted)",
                          textTransform: "uppercase",
                          letterSpacing: "0.14em",
                        },
                      }}
                    >
                      Documento legal
                    </Badge>
                    <Text size="sm" c="var(--marriplan-muted)">
                      Última atualização: {privacyLastUpdated}
                    </Text>
                  </Group>

                  <Stack gap="sm" maw={760}>
                    <Title
                      order={1}
                      className="marriplan-heading"
                      style={{ fontSize: "clamp(2.25rem, 4vw, 4rem)" }}
                    >
                      Política de Privacidade
                    </Title>
                    <Text
                      size="lg"
                      c="var(--marriplan-muted)"
                      style={{ lineHeight: 1.8 }}
                    >
                      {privacyIntro[0]}
                    </Text>
                    <Text
                      size="md"
                      c="var(--marriplan-muted)"
                      style={{ lineHeight: 1.85 }}
                    >
                      {privacyIntro[1]}
                    </Text>
                    <Text
                      size="md"
                      c="var(--marriplan-muted)"
                      style={{ lineHeight: 1.85 }}
                    >
                      {privacyIntro[2]}
                    </Text>
                  </Stack>

                  <Group gap="md" wrap="wrap">
                    <Anchor
                      component={Link}
                      href="/"
                      underline="never"
                      c="var(--marriplan-text)"
                      fw={600}
                      className="inline-flex items-center gap-2"
                    >
                      <IconHome2 size={16} />
                      Início
                    </Anchor>
                    <Anchor
                      component={Link}
                      href="/terms"
                      underline="never"
                      c="var(--marriplan-text)"
                      fw={600}
                      className="inline-flex items-center gap-2"
                    >
                      <IconChevronRight size={16} />
                      Termos de Uso
                    </Anchor>
                  </Group>
                </Stack>
              </Paper>

              <Grid align="flex-start" gutter={{ base: 20, lg: 28 }}>
                <Grid.Col span={{ base: 12, lg: 8 }}>
                  <Stack gap="lg">
                    {privacySections.map((section, index) => (
                      <LegalSection
                        key={section.id}
                        section={section}
                        index={index}
                      />
                    ))}

                    <Paper
                      radius="xl"
                      p={{ base: "lg", sm: "xl" }}
                      className="marriplan-card"
                    >
                      <Stack gap="md">
                        <Text fw={700} className="marriplan-heading">
                          Links úteis
                        </Text>
                        <Group gap="lg" wrap="wrap">
                          <Anchor
                            component={Link}
                            href="/"
                            underline="never"
                            c="var(--marriplan-text)"
                            fw={600}
                          >
                            Início
                          </Anchor>
                          <Anchor
                            component={Link}
                            href="/terms"
                            underline="never"
                            c="var(--marriplan-text)"
                            fw={600}
                          >
                            Termos de Uso
                          </Anchor>
                        </Group>
                      </Stack>
                    </Paper>
                  </Stack>
                </Grid.Col>

                <Grid.Col span={{ base: 12, lg: 4 }}>
                  <Box visibleFrom="lg" style={{ position: "sticky", top: 96 }}>
                    <Paper
                      radius="xl"
                      p="xl"
                      className="marriplan-card"
                      style={{ background: "var(--marriplan-surface)" }}
                    >
                      <Stack gap="md">
                        <Text
                          size="sm"
                          fw={700}
                          c="var(--marriplan-muted)"
                          tt="uppercase"
                          style={{ letterSpacing: "0.18em" }}
                        >
                          Neste documento
                        </Text>
                        <Divider color="var(--marriplan-border)" />
                        <Stack gap={8}>
                          {privacySections.map((section) => (
                            <Anchor
                              key={section.id}
                              href={`#${section.id}`}
                              underline="never"
                              c="var(--marriplan-text)"
                              fw={500}
                              style={{ lineHeight: 1.5 }}
                            >
                              {section.title}
                            </Anchor>
                          ))}
                        </Stack>
                      </Stack>
                    </Paper>
                  </Box>
                </Grid.Col>
              </Grid>
            </Stack>
          </Container>
        </Box>

        <LandingFooter />
      </Box>
    </>
  );
}

import { Badge, List, Paper, Stack, Text, Title } from "@mantine/core";

import type { LegalSectionData } from "@/utils/terms-content";

type LegalSectionProps = {
  section: LegalSectionData;
  index: number;
};

export default function LegalSection({
  section,
  index,
}: Readonly<LegalSectionProps>) {
  return (
    <Paper
      id={section.id}
      component="section"
      radius="xl"
      p="xl"
      className="marriplan-card"
      style={{ scrollMarginTop: 112 }}
    >
      <Stack gap="lg">
        <Stack gap={10}>
          <Badge
            size="lg"
            radius="xl"
            variant="light"
            color="yellow"
            styles={{
              root: {
                backgroundColor: "var(--marriplan-surface-muted)",
                color: "var(--marriplan-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
              },
            }}
          >
            Seção {index + 1}
          </Badge>
          <Title
            order={2}
            className="marriplan-heading"
            style={{ fontSize: "1.5rem" }}
          >
            {section.title}
          </Title>
        </Stack>

        <Stack gap="md">
          {section.blocks.map((block, blockIndex) => {
            if (block.type === "paragraph") {
              return (
                <Text
                  key={`${section.id}-p-${blockIndex}`}
                  component="p"
                  c="var(--marriplan-text)"
                  style={{ lineHeight: 1.85 }}
                >
                  {block.text}
                </Text>
              );
            }

            return (
              <List
                key={`${section.id}-l-${blockIndex}`}
                spacing="sm"
                size="sm"
                withPadding
                styles={{
                  item: {
                    color: "var(--marriplan-text)",
                    lineHeight: 1.75,
                  },
                }}
              >
                {block.items.map((item) => (
                  <List.Item key={item}>{item}</List.Item>
                ))}
              </List>
            );
          })}
        </Stack>
      </Stack>
    </Paper>
  );
}

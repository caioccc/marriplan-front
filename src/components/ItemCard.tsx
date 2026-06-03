import { ActionIcon, Box, Card, Flex, Image, Menu } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconDotsVertical, IconPhoto } from "@tabler/icons-react";
import React, { useState } from "react";

interface ItemCardProps<T> {
  item: T;
  imageUrl?: string;
  renderContent: (item: T) => React.ReactNode;
  renderActions: (item: T) => React.ReactNode;
  renderStatus?: (item: T) => React.ReactNode;
  renderSoloActions?: (item: T) => React.ReactNode;
  fallbackIcon?: React.ReactNode;
  layout?: "horizontal" | "vertical";
}

export function ItemCard<T>({
  item,
  imageUrl,
  renderContent,
  renderActions,
  renderStatus,
  renderSoloActions,
  fallbackIcon,
  layout = "horizontal",
}: ItemCardProps<T>) {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const imagePlaceholderVertical = (
    <Flex
      justify="center"
      align="center"
      w={"100%"}
      h={180}
      bg="gray.1"
      style={{ borderRadius: "var(--mantine-radius-md)" }}
    >
      {fallbackIcon || (
        <IconPhoto size={64} color="var(--mantine-color-gray-5)" />
      )}
    </Flex>
  );

  const imagePlaceholderHorizontal = (
    <Flex
      justify="center"
      align="center"
      w={layout === "horizontal" ? "100%" : "100%"}
      h={layout === "horizontal" ? "100%" : 160}
      bg="gray.1"
      style={{ borderRadius: "var(--mantine-radius-md)" }}
    >
      {fallbackIcon || (
        <IconPhoto size={64} color="var(--mantine-color-gray-5)" />
      )}
    </Flex>
  );

  const imageContent =
    imageUrl && !imageError ? (
      <Image
        src={imageUrl}
        alt="Item image"
        w="100%"
        h="100%"
        radius="md"
        fit="cover"
        style={{ display: "block" }}
        onError={handleImageError}
      />
    ) : layout === "vertical" ? (
      imagePlaceholderVertical
    ) : (
      imagePlaceholderHorizontal
    );

  const menu = (
    <Menu withinPortal position="bottom-end" shadow="sm">
      <Menu.Target>
        <ActionIcon variant="subtle" color="gray">
          <IconDotsVertical size={18} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>{renderActions(item)}</Menu.Dropdown>
    </Menu>
  );

  const cardStyle = {
    background: "var(--marriplan-surface)",
    border: "1px solid var(--marriplan-border)",
    boxShadow: "0 16px 32px rgba(70, 56, 43, 0.08)",
    transition: "transform 180ms ease, box-shadow 180ms ease",
  } as const;

  if (layout === "vertical") {
    return (
      <Card
        padding="lg"
        radius="lg"
        withBorder
        style={{ ...cardStyle, position: "relative" }}
      >
        <Box
          style={{ position: "absolute", top: "8px", right: "8px", zIndex: 1 }}
        >
          {menu}
        </Box>
        <Flex direction="column" gap="xs">
          <Card.Section>
            <Box
              w="100%"
              h={180}
              style={{
                margin: "0 auto",
                overflow: "hidden",
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12,
              }}
            >
              {imageContent}
            </Box>
          </Card.Section>
          <Box>{renderContent(item)}</Box>
        </Flex>
      </Card>
    );
  }

  return (
    <Card
      padding="sm"
      radius="md"
      withBorder
      style={{ width: "100%", ...cardStyle }}
    >
      <Flex
        gap="md"
        align="center"
        justify="space-between"
        style={{ width: "100%" }}
      >
        {/* Bloco Esquerdo: Avatar + Informações textuais */}
        <Flex gap="sm" align="center" style={{ flex: 1, minWidth: 0 }}>
          <Box
            w={100}
            h={100}
            style={{
              flexShrink: 0,
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {imageContent}
          </Box>

          {/* Conteúdo de texto com tratamento de quebra de linha */}
          <Box style={{ flex: 1, minWidth: 0 }}>{renderContent(item)}</Box>
        </Flex>

        {/* Bloco Direito: Botões de Ação e Menu Alinhados Lado a Lado */}
        <Flex gap="xs" align="center" style={{ flexShrink: 0 }}>
          {renderSoloActions && renderSoloActions(item)}
          {menu}
        </Flex>
      </Flex>
    </Card>
  );
}

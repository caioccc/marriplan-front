import { SimpleGrid } from "@mantine/core";
import React from "react";
import { ItemCard } from "./ItemCard";

interface GalleryViewProps<T> {
  items: T[];
  renderContent: (item: T) => React.ReactNode;
  renderActions: (item: T) => React.ReactNode;
  getImageUrl: (item: T) => string | undefined;
  getItemId: (item: T) => string | number;
  fallbackIcon: (item: T) => React.ReactNode;
  cols?: React.ComponentProps<typeof SimpleGrid>["cols"];
}

export function GalleryView<T>({
  items,
  renderContent,
  renderActions,
  getImageUrl,
  getItemId,
  fallbackIcon,
  cols,
}: GalleryViewProps<T>) {
  return (
    <SimpleGrid cols={cols ?? { base: 1, sm: 2, md: 3, lg: 4 }} spacing="lg">
      {items.map((item) => (
        <ItemCard
          key={getItemId(item)}
          item={item}
          imageUrl={getImageUrl(item)}
          renderContent={renderContent}
          renderActions={renderActions}
          fallbackIcon={fallbackIcon}
          layout="vertical"
        />
      ))}
    </SimpleGrid>
  );
}

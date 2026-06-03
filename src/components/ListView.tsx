import { SimpleGrid } from "@mantine/core";
import React from "react";
import { ItemCard } from "./ItemCard";

interface ListViewProps<T> {
  items: T[];
  renderContent: (item: T) => React.ReactNode;
  renderActions: (item: T) => React.ReactNode;
  renderStatus?: (item: T) => React.ReactNode;
  getImageUrl: (item: T) => string | undefined;
  getItemId: (item: T) => string | number;
  fallbackIcon?: React.ReactNode;
  renderSoloActions?: (item: T) => React.ReactNode;
}

export function ListView<T>({
  items,
  renderContent,
  renderActions,
  renderStatus,
  getImageUrl,
  getItemId,
  renderSoloActions,
  fallbackIcon,
}: ListViewProps<T>) {
  return (
    <SimpleGrid cols={1} spacing="xs">
      {items.map((item) => (
        <ItemCard
          key={getItemId(item)}
          item={item}
          imageUrl={getImageUrl(item)}
          renderContent={renderContent}
          renderActions={renderActions}
          renderStatus={renderStatus}
          fallbackIcon={fallbackIcon}
          renderSoloActions={renderSoloActions}
          layout="horizontal"
        />
      ))}
    </SimpleGrid>
  );
}

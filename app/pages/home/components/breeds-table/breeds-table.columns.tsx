import { Flex, IconButton, Skeleton } from "@radix-ui/themes";
import { createColumnHelper } from "@tanstack/react-table";
import { Database } from "types/supabase.generated";
import { useHomeContext } from "../../home.context";
import { Star } from "@phosphor-icons/react/dist/icons/Star";

const columnHelper =
  createColumnHelper<Database["public"]["Tables"]["dog_breeds"]["Row"]>();

export const useColumns = ({ loading }: { loading?: boolean }) => {
  const { favorites, toggleFavorite } = useHomeContext();

  const columns = [
    columnHelper.accessor("name", {
      id: "name",
      header: () => {
        return (
          <Flex align="center" justify="center">
            Dog breed
          </Flex>
        );
      },
      cell: (info) => (
        <Flex align="center" pl="3">
          {info.getValue()}
        </Flex>
      ),
    }),
    columnHelper.display({
      id: "favorite",
      header: "Favorited",
      cell: (info) => {
        const favorited = favorites.includes(info.row.original.id);
        return (
          <Flex align="center" justify="center">
            <IconButton
              variant="ghost"
              color="yellow"
              style={{
                cursor: "pointer",
              }}
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(info.row.original.id);
              }}
            >
              <Star size={24} weight={favorited ? "fill" : "bold"} />
            </IconButton>
          </Flex>
        );
      },
      size: 24,
    }),
  ];

  if (loading) {
    return columns.map((column) => {
      return {
        ...column,
        cell: (
          <Flex align="center" justify="center" height="100%">
            <Skeleton
              width="100%"
              style={{ borderRadius: "var(--radius-3)" }}
            />
          </Flex>
        ) as any,
      };
    });
  }

  return columns;
};

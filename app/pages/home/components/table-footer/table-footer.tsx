import { Button, Flex, Text } from "@radix-ui/themes";
import { useRevalidator, useSearchParams } from "@remix-run/react";
import { FC } from "react";
import { useHomeContext } from "../../home.context";

export type TableFooterProps = {
  scrollToTop?: () => void;
};

export const TableFooter: FC<TableFooterProps> = ({ scrollToTop }) => {
  const { totalRows } = useHomeContext();
  const { revalidate } = useRevalidator();
  const [searchParams, setSearchParams] = useSearchParams();
  const pageString = searchParams.get("page") ?? "1";
  const page = parseInt(pageString, 10);

  const totalPages = Math.ceil(totalRows / 20);
  const pagesLabel = `Page ${page} of ${totalPages}`;

  const changePage = (page: number) => {
    searchParams.set("page", page.toString());
    setSearchParams(searchParams, { replace: true });
    revalidate();
  };

  return (
    <Flex
      align="center"
      justify="between"
      height="56px"
      style={{
        backgroundColor: "var(--accent-4)",
      }}
    >
      <Flex align="center" pl="2">
        <Button
          variant="classic"
          disabled={page === 1}
          onClick={() => {
            changePage(page - 1);
            scrollToTop?.();
          }}
        >
          Back
        </Button>
      </Flex>
      <Flex align="center" justify="center">
        <Text size="2" weight="bold" color="amber">
          {pagesLabel}
        </Text>
      </Flex>
      <Flex align="end" pr="2">
        <Button
          variant="classic"
          disabled={20 * page >= totalRows}
          onClick={() => {
            changePage(page + 1);
            scrollToTop?.();
          }}
        >
          Next
        </Button>
      </Flex>
    </Flex>
  );
};

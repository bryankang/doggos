import { FC, ReactNode, useRef, useState } from "react";
import { Button, Dialog, Flex, Table, Text } from "@radix-ui/themes";
import styles from "./breeds-table.module.css";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useColumns } from "./breeds-table.columns";
import { Database } from "types/supabase.generated";
import { TableFooter } from "../table-footer";
import { useHomeContext } from "../../home.context";

export type BreedsTableProps = {
  onRowClick?: (row: Database["public"]["Tables"]["dog_breeds"]["Row"]) => void;
};

export const BreedsTable: FC<BreedsTableProps> = ({ onRowClick }) => {
  const tableRef = useRef<HTMLTableElement>(null);
  const { breeds } = useHomeContext();
  const loading = false;
  const [loadingData] = useState(Array(30).fill({}));
  const columns = useColumns({ loading });
  const table = useReactTable({
    data: loading ? loadingData : breeds,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const scrollToTop = () => {
    const scroll = tableRef.current?.getElementsByClassName(
      "rt-ScrollAreaViewport"
    )?.[0];
    scroll?.scrollTo(0, 0);
  };

  if (!breeds.length) {
    return (
      <Flex flexGrow="1" align="center" justify="center">
        No breeds found
      </Flex>
    );
  }

  return (
    <Flex flexGrow="1" direction="column">
      <Flex position="relative" flexGrow="1" direction="column">
        <Flex position="absolute" top="0" bottom="0" width="100%" height="100%">
          <Table.Root
            ref={tableRef}
            layout="fixed"
            size="3"
            className={styles.root}
            style={{
              position: "absolute",
              inset: 0,
              whiteSpace: "nowrap",
            }}
          >
            {/* <Table.Header style={{ visibility: "hidden", height: 0 }}>
              {table.getHeaderGroups().map((headerGroup) => (
                <Table.Row key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <Table.ColumnHeaderCell
                        key={header.id}
                        colSpan={header.colSpan}
                        style={{}}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </Table.ColumnHeaderCell>
                    );
                  })}
                </Table.Row>
              ))}
            </Table.Header> */}
            <Table.Body>
              {table.getRowModel().rows.map((row) => (
                <Table.Row
                  key={row.id}
                  align="center"
                  className={styles.row}
                  onClick={() => {
                    onRowClick?.(row.original);
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <Table.Cell
                      key={cell.id}
                      py="0"
                      px="0"
                      className={styles.cell}
                      style={{
                        width: cell.column.getSize(),
                      }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </Table.Cell>
                  ))}
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Flex>
      </Flex>
      <TableFooter scrollToTop={scrollToTop} />
    </Flex>
  );
};

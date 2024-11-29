import { FC, ReactNode } from "react";
import { Flex } from "@radix-ui/themes";
import styles from "./root.module.css";

export type RootProps = {
  children?: ReactNode;
};

export const Root: FC<RootProps> = ({ children }) => {
  return (
    <Flex
      position="absolute"
      justify="center"
      width="100vw"
      height="100dvh"
      className={styles.root}
      style={
        {
          // backgroundColor: "lightblue",
        }
      }
    >
      <Flex
        direction="column"
        py="5"
        px="2"
        width="100%"
        maxWidth="560px"
        maxHeight="800px"
        // style={{ backgroundColor: "lightcoral" }}
      >
        <Flex
          flexGrow="1"
          direction="column"
          // style={{ backgroundColor: "lightpink" }}
          style={{
            backgroundColor: "var(--color-background)",
            border: "5px solid var(--accent-4)",
            borderRadius: "var(--radius-3)",
            boxShadow: "0 5px 1px 0 rgba(0, 0, 0, 0.18)",

            // border: "2px solid var(--gray-4)",
            // borderBottomWidth: 4,
            // borderRadius: "var(--radius-3)",
          }}
        >
          {children}
        </Flex>
      </Flex>
    </Flex>
  );
};

import { Checkbox, Flex, Text } from "@radix-ui/themes";
import { Command } from "cmdk";
import { FC } from "react";
import styles from "./item.module.css";
import { Check } from "@phosphor-icons/react/dist/icons/Check";

export type ItemProps = {
  label: string;
  aside?: string;
  asideWidth?: number;
  maxWidth: number;
  value: string;
  onCheckedChange?: (checked: boolean) => void;
  onSelect?: (value: string) => void;
  multi?: boolean | null;
  selected?: boolean;
};

export const Item: FC<ItemProps> = ({
  label,
  aside,
  asideWidth,
  maxWidth,
  value,
  onCheckedChange,
  onSelect,
  multi,
  selected,
}) => {
  return (
    <Command.Item
      keywords={[label]}
      value={value}
      onSelect={(value) => {
        onSelect?.(value);
        onCheckedChange?.(!selected);
      }}
      className={styles.item}
    >
      <Flex
        px="5px"
        // width={`${width}px`}
        maxWidth={`${maxWidth}px`}
        height="34px"
        overflow="hidden"
      >
        <Flex
          flexGrow="1"
          align="center"
          width="100%"
          // gap="1"
          pl="3px"
          pr={aside ? "2px" : "8px"}
          className={styles.innerItem}
        >
          <Flex
            align="center"
            justify="center"
            flexShrink="0"
            width="20px"
            height="100%"
            className={styles.icon}
            style={{
              color: selected ? "var(--accent-9)" : "var(--gray-7)",
              opacity: selected ? 1 : undefined,
            }}
          >
            {multi ? (
              <Flex position="relative">
                <label
                  htmlFor={value}
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "32px",
                    height: "32px",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                />
                <Checkbox
                  id={value}
                  checked={selected}
                  onCheckedChange={onCheckedChange}
                  tabIndex={-1}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                />
              </Flex>
            ) : (
              <Check weight="bold" />
            )}
          </Flex>
          <Flex
            flexGrow="1"
            align="center"
            justify="between"
            maxWidth="calc(100% - 20px)"
            gap="4"
            px="5px"
          >
            <Flex
              align="center"
              minWidth="0"
              overflow="hidden"
              style={{
                whiteSpace: "nowrap",
              }}
            >
              <Text
                size="2"
                style={{
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                }}
              >
                {label}
              </Text>
            </Flex>
            {asideWidth && (
              <Flex
                align="center"
                justify="end"
                flexShrink="0"
                minWidth={`${asideWidth}px`}
                height="100%"
              >
                {aside && (
                  <Text size="1" color="gray">
                    {aside}
                  </Text>
                )}
              </Flex>
            )}
          </Flex>
        </Flex>
      </Flex>
    </Command.Item>
  );
};

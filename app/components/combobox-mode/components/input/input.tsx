import { Flex, IconButton, TextField } from "@radix-ui/themes";
import { Command } from "cmdk";
import { forwardRef, useRef } from "react";
import styles from "./input.module.css";
import { composeRefs } from "@radix-ui/react-compose-refs";
import { MagnifyingGlass } from "@phosphor-icons/react/dist/icons/MagnifyingGlass";
import { X } from "@phosphor-icons/react/dist/icons/X";

export type InputProps = TextField.RootProps & {
  placeholder?: string;
  value?: string | null;
  onValueChange?: (value: string) => void;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ placeholder, value, onValueChange, ...props }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);

    return (
      <Flex
        direction="column"
        justify="center"
        height="40px"
        px="2px"
        className={styles.root}
      >
        <Command.Input
          value={value ?? ""}
          onValueChange={(value) => {
            onValueChange?.(value);
          }}
          placeholder={placeholder}
          autoFocus
          asChild
        >
          <TextField.Root
            ref={composeRefs(ref, inputRef)}
            size="2"
            className={styles.input}
            // {...props}
          >
            <TextField.Slot style={{ width: 0, padding: 4 }}>
              <MagnifyingGlass weight="bold" />
            </TextField.Slot>
            <TextField.Slot>
              {value && (
                <IconButton
                  size="2"
                  variant="ghost"
                  color="gray"
                  onClick={() => {
                    onValueChange?.("");
                    inputRef.current?.focus();
                  }}
                  onKeyDown={(e) => {
                    if (e.code !== "Enter" && e.code !== "Space") return;
                    onValueChange?.("");
                    inputRef.current?.focus();
                  }}
                  style={{ marginRight: -4 }}
                >
                  <X weight="bold" />
                </IconButton>
              )}
            </TextField.Slot>
          </TextField.Root>
        </Command.Input>
        <Command.Empty />
      </Flex>
    );
  }
);

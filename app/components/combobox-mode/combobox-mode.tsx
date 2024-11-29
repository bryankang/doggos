import * as PrimitivePopover from "@radix-ui/react-popover";
import { FC, ReactNode, useEffect, useState } from "react";
import { Flex, Inset, Popover, Reset, ScrollArea } from "@radix-ui/themes";
import { Command } from "cmdk";
import { Input } from "./components/input";
import { Item } from "./components/item";
import { Group } from "./components/group";

type Option = {
  label: string;
  value: string;
  aside?: string;
};

export type ComboboxModeBaseProps = {
  children?: ReactNode;
  className?: string;
  maxWidth?: number;
  maxHeight?: number;
  align?: PrimitivePopover.PopoverContentProps["align"];
  side?: PrimitivePopover.PopoverContentProps["side"];
  alignOffset?: PrimitivePopover.PopoverContentProps["alignOffset"];
  sideOffset?: PrimitivePopover.PopoverContentProps["sideOffset"];
  label: string;
  hideInput?: boolean;
  placeholder?: string;
  options: Option[];
  disableGrouping?: boolean;
  asideWidth?: number;
  shouldFilter?: boolean;
  onSearchChange?: (search: string) => void;
};

export type ComboboxModeProps = ComboboxModeBaseProps &
  (
    | {
        multi: true;
        values: string[];
        onValuesChange: (args: {
          selectedValues: string[];
          selectedOptions: Option[];
        }) => void;
        triggerRenderer: (args: {
          selectedOptions: Option[];
          close: () => void;
        }) => ReactNode;
      }
    | {
        multi?: false | null;
        value: string | null;
        onValueChange: (args: {
          selectedValue: string | null;
          selectedOption: Option | null;
        }) => void;
        triggerRenderer: (args: {
          selectedOption?: Option;
          close: () => void;
        }) => ReactNode;
      }
  );

// need to retain the values even if they're not checked
// and return them onValuesChange bc they may not be in the options
export const ComboboxMode: FC<ComboboxModeProps> = ({
  label,
  hideInput,
  placeholder,
  options,
  disableGrouping,
  asideWidth,
  onSearchChange,
  maxWidth = 280,
  maxHeight = 240,
  align = "start",
  side,
  alignOffset,
  sideOffset = 4,
  shouldFilter,
  ...props
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const values = props.multi ? props.values : [props.value].filter(Boolean);
  const [_values, _setValues] = useState(values);
  const [enhancedOptions, setEnhancedOptions] = useState<
    (Option & {
      selected: boolean;
    })[]
  >([]);
  const selectedOptions = enhancedOptions.filter((option) => option.selected);
  // Internal state for selected options, so we don't shift items around
  const _selectedOptions = disableGrouping
    ? enhancedOptions
    : enhancedOptions.filter((option) => _values.includes(option.value));
  const _unselectedOptions = disableGrouping
    ? []
    : enhancedOptions.filter((option) => !_values.includes(option.value));

  const resetEnhancedOptions = (
    options: Option[],
    values: (string | null)[]
  ) => {
    const newEnhancedOptions = options.map((option) => {
      const selected = values.includes(option.value);
      return {
        ...option,
        selected,
      };
    });
    setEnhancedOptions(newEnhancedOptions);
  };

  useEffect(() => {
    resetEnhancedOptions(options, values);
  }, [options, props.multi ? props.values : props.value]);

  return (
    <Popover.Root
      open={open}
      onOpenChange={(open) => {
        if (open) {
          _setValues(
            props.multi ? props.values : [props.value].filter(Boolean)
          );
          // if (props.multi) {
          //   resetEnhancedOptions(options, values);
          // }
        } else {
          setSearch("");
          onSearchChange?.("");
        }
        setOpen(open);
      }}
    >
      <PrimitivePopover.Trigger asChild>
        {props.multi
          ? props.triggerRenderer({
              selectedOptions: selectedOptions,
              close: () => setOpen(false),
            })
          : props.triggerRenderer({
              selectedOption: selectedOptions[0],
              close: () => setOpen(false),
            })}
      </PrimitivePopover.Trigger>

      <Popover.Content
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        align={align}
        onOpenAutoFocus={(e) => e.preventDefault()}
        style={{ maxWidth }}
      >
        <Inset>
          <Command
            label={label}
            shouldFilter={shouldFilter}
            style={{
              position: "relative",
              outline: "none",
            }}
          >
            <Flex flexShrink="0" flexGrow="1" direction="column">
              {!hideInput ? (
                <Input
                  value={search}
                  onValueChange={(value) => {
                    setSearch(value);
                    onSearchChange?.(value);
                  }}
                  placeholder={placeholder}
                />
              ) : (
                <Reset>
                  <button
                    autoFocus
                    aria-hidden="true"
                    style={{ position: "absolute", height: 0 }}
                  />
                </Reset>
              )}
              <Flex
                position="relative"
                direction="column"
                flexGrow="1"
                maxHeight={`${maxHeight}px`}
                maxWidth={`${maxWidth}px`}
              >
                <ScrollArea scrollbars="vertical">
                  <Flex direction="column">
                    <Command.List>
                      {_selectedOptions.length > 0 && (
                        <Group>
                          {_selectedOptions.map(
                            ({ label, value, aside, selected }) => (
                              <Item
                                key={value}
                                multi={props.multi}
                                label={label}
                                aside={aside}
                                asideWidth={asideWidth}
                                maxWidth={maxWidth}
                                value={value}
                                selected={selected}
                                onSelect={(value) => {
                                  if (props.multi) {
                                    const selectedOptions = enhancedOptions
                                      .map((option) => {
                                        if (option.value === value) {
                                          return {
                                            ...option,
                                            selected: !option.selected,
                                          };
                                        }
                                        return option;
                                      })
                                      .filter((option) => option.selected)
                                      .map((option) => ({
                                        label: option.label,
                                        value: option.value,
                                      }));

                                    const selectedValues = selectedOptions.map(
                                      (option) => option.value
                                    );
                                    props.onValuesChange({
                                      selectedValues,
                                      selectedOptions,
                                    });
                                  } else {
                                    const selectedOption = enhancedOptions.find(
                                      (option) => option.value === value
                                    );
                                    props.onValueChange?.({
                                      selectedValue:
                                        selectedOption?.value ?? null,
                                      selectedOption: selectedOption
                                        ? {
                                            label: selectedOption.label,
                                            value: selectedOption.value,
                                          }
                                        : null,
                                    });
                                  }
                                  setOpen(false);
                                }}
                                onCheckedChange={(checked) => {
                                  if (props.multi) {
                                    const newEnhancedOptions =
                                      enhancedOptions.map((option) => {
                                        if (option.value === value) {
                                          return {
                                            ...option,
                                            selected: checked,
                                          };
                                        }
                                        return option;
                                      });
                                    setEnhancedOptions(newEnhancedOptions);
                                    const selectedOptions =
                                      newEnhancedOptions.filter(
                                        (option) => option.selected
                                      );
                                    const selectedValues = selectedOptions.map(
                                      (option) => option.value
                                    );
                                    props.onValuesChange({
                                      selectedValues,
                                      selectedOptions,
                                    });
                                  }
                                }}
                              />
                            )
                          )}
                        </Group>
                      )}

                      {_unselectedOptions.length > 0 && (
                        <Group>
                          {_unselectedOptions.map(
                            ({ label, value, aside, selected }) => (
                              <Item
                                key={value}
                                multi={props.multi}
                                label={label}
                                aside={aside}
                                asideWidth={asideWidth}
                                maxWidth={maxWidth}
                                value={value}
                                selected={selected}
                                onSelect={(value) => {
                                  if (props.multi) {
                                    const selectedOptions = enhancedOptions
                                      .map((option) => {
                                        if (option.value === value) {
                                          return {
                                            ...option,
                                            selected: !option.selected,
                                          };
                                        }
                                        return option;
                                      })
                                      .filter((option) => option.selected)
                                      .map((option) => ({
                                        label: option.label,
                                        value: option.value,
                                      }));

                                    const selectedValues = selectedOptions.map(
                                      (option) => option.value
                                    );
                                    props.onValuesChange({
                                      selectedValues,
                                      selectedOptions,
                                    });
                                  } else {
                                    const selectedOption = enhancedOptions.find(
                                      (option) => option.value === value
                                    );
                                    props.onValueChange?.({
                                      selectedValue:
                                        selectedOption?.value ?? null,
                                      selectedOption: selectedOption
                                        ? {
                                            label: selectedOption.label,
                                            value: selectedOption.value,
                                          }
                                        : null,
                                    });
                                  }
                                  setOpen(false);
                                }}
                                onCheckedChange={(checked) => {
                                  if (props.multi) {
                                    const newEnhancedOptions =
                                      enhancedOptions.map((option) => {
                                        if (option.value === value) {
                                          return {
                                            ...option,
                                            selected: checked,
                                          };
                                        }
                                        return option;
                                      });
                                    setEnhancedOptions(newEnhancedOptions);
                                    const selectedOptions =
                                      newEnhancedOptions.filter(
                                        (option) => option.selected
                                      );
                                    const selectedValues = selectedOptions.map(
                                      (option) => option.value
                                    );
                                    props.onValuesChange({
                                      selectedValues,
                                      selectedOptions,
                                    });
                                  }
                                }}
                              />
                            )
                          )}
                        </Group>
                      )}
                    </Command.List>
                  </Flex>
                </ScrollArea>
              </Flex>
            </Flex>
          </Command>
        </Inset>
      </Popover.Content>
    </Popover.Root>
  );
};

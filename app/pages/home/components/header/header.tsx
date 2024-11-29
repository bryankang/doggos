import { DiceThree } from "@phosphor-icons/react/dist/icons/DiceThree";
import { MagnifyingGlass } from "@phosphor-icons/react/dist/icons/MagnifyingGlass";
import { Star } from "@phosphor-icons/react/dist/icons/Star";
import { X } from "@phosphor-icons/react/dist/icons/X";
import { Button, Flex, IconButton, Text } from "@radix-ui/themes";
import { useRevalidator, useSearchParams } from "@remix-run/react";
import { useDebounce } from "@uidotdev/usehooks";
import { uniqBy } from "lodash-es";
import { FC, useEffect, useMemo, useState } from "react";
import { ComboboxMode } from "~/components";
import { supabaseClient } from "~/lib/supabase";
import { useHomeContext } from "../../home.context";

export type HeaderProps = {
  onRandom?: () => void;
};

export const Header: FC<HeaderProps> = ({ onRandom }) => {
  const { showFavorites, setShowFavorites } = useHomeContext();
  const { revalidate } = useRevalidator();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 80);
  const [_options, setOptions] = useState<{ label: string; value: string }[]>(
    []
  );
  const [selectedOptions, setSelectedOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const selectedBreeds = useMemo(() => {
    return selectedOptions.map((o) => o.value);
  }, [selectedOptions]);
  const options = useMemo(() => {
    return uniqBy([...selectedOptions, ..._options], "value");
  }, [_options, selectedOptions]);

  useEffect(() => {
    const fetchInitialData = async () => {
      const { data } = await supabaseClient()
        .from("dog_breeds")
        .select()
        .limit(12);
      if (!data) return;
      const newOptions = data
        .filter((b) => b.name)
        .map((b) => ({ label: b.name ?? "", value: b.id }));
      setOptions(newOptions);
    };

    const fetchSearchData = async () => {
      const { data } = await supabaseClient()
        .rpc("search_dog_breeds_by_name_prefix", { prefix: debouncedSearch })
        .select()
        .limit(12);
      if (!data) return;
      const newOptions = data
        .filter((b) => b.name)
        .map((b) => ({ label: b.name ?? "", value: b.id }));
      setOptions(newOptions);
    };

    if (!debouncedSearch) {
      fetchInitialData();
    } else {
      fetchSearchData();
    }
  }, [debouncedSearch]);

  const handleSelectedOptionsChange = ({
    selectedOptions,
    selectedValues,
  }: {
    selectedOptions: {
      label: string;
      value: string;
    }[];
    selectedValues: string[];
  }) => {
    searchParams.delete("page");
    setSelectedOptions(selectedOptions);
    if (!selectedValues.length) {
      searchParams.delete("breeds");
    } else {
      for (let i = 0; i < selectedValues.length; i++) {
        if (i === 0) {
          searchParams.set("breeds", selectedValues[i]!);
        } else {
          searchParams.append("breeds", selectedValues[i]!);
        }
      }
    }
    setSearchParams(searchParams, { replace: true });
    revalidate();
  };

  return (
    <Flex
      align="center"
      justify="between"
      height="64px"
      px="2"
      style={{
        backgroundColor: "var(--accent-4)",
      }}
    >
      <Text size="5" weight="bold">
        Doggos
      </Text>
      <Flex align="center" gap="2">
        <Button
          variant="ghost"
          style={{ margin: 0 }}
          onClick={() => {
            setShowFavorites(!showFavorites);
          }}
        >
          <Flex align="center" gap="2">
            <Star weight={showFavorites ? "fill" : "bold"} />
            <Text size="2" weight="bold" color="amber">
              Favorites
            </Text>
          </Flex>
        </Button>

        <IconButton variant="classic" style={{ margin: 0 }} onClick={onRandom}>
          <DiceThree weight="bold" />
        </IconButton>

        <ComboboxMode
          label="Filter breed"
          align="end"
          sideOffset={8}
          placeholder="Search for breed"
          multi
          onSearchChange={setSearch}
          shouldFilter={false}
          onValuesChange={handleSelectedOptionsChange}
          options={options}
          values={selectedBreeds}
          triggerRenderer={({ selectedOptions, close }) => {
            return (
              <Button variant="classic">
                {selectedOptions.length === 0 ? (
                  <Flex align="center" gap="2">
                    <MagnifyingGlass weight="bold" />
                    <Text size="2" weight="bold" color="gray">
                      Search
                    </Text>
                  </Flex>
                ) : (
                  <Flex align="center" gap="2">
                    <Text size="2" weight="bold" color="gray">
                      {selectedOptions.length} selected
                    </Text>
                    <X
                      weight="bold"
                      onClick={(e) => {
                        e.stopPropagation();
                        close();
                        handleSelectedOptionsChange({
                          selectedOptions: [],
                          selectedValues: [],
                        });
                      }}
                    />
                  </Flex>
                )}
              </Button>
            );
          }}
        />
      </Flex>
    </Flex>
  );
};

import { FC, useState } from "react";
import { BreedsTable } from "./components/breeds-table/breeds-table";
import { Header } from "./components/header/header";
import { Root } from "./components/root";
import { Database } from "types/supabase.generated";
import { BreedDialog } from "./components/breed-dialog";
import { supabaseClient } from "~/lib/supabase";

export type HomeProps = {};

export const Home: FC<HomeProps> = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentBreed, setCurrentBreed] = useState<
    Database["public"]["Tables"]["dog_breeds"]["Row"] | undefined
  >(undefined);

  const handleRandom = async () => {
    // https://www.redpill-linpro.com/techblog/2021/05/07/getting-random-rows-faster.html
    const { data: dogBreeds } = await supabaseClient()
      .rpc("get_random_dog_breed")
      .select();
    const randomBreed = dogBreeds?.[0];
    setCurrentBreed(randomBreed);
    setDialogOpen(true);
  };

  return (
    <>
      <BreedDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        breed={currentBreed}
      />
      <Root>
        <Header onRandom={handleRandom} />
        <BreedsTable
          onRowClick={(breed) => {
            setCurrentBreed(breed);
            setDialogOpen(true);
          }}
        />
      </Root>
    </>
  );
};

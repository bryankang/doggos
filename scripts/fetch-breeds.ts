import createFetchClient from "openapi-fetch";
import { paths } from "types/dog-api.generated";
import { keyBy } from "lodash-es";
import { createSupabaseClient } from "~/lib/supabase";
import { Database } from "types/supabase.generated";
import { DogBreed } from "types/dog-api";

const dogClient = createFetchClient<paths>();
const supabaseClient = createSupabaseClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

const isEqual = (
  existing: Database["public"]["Tables"]["dog_breeds"]["Row"],
  breed: DogBreed
) => {
  return (
    existing.id === breed.id &&
    existing.name === breed.attributes.name &&
    existing.description === breed.attributes.description &&
    existing.hypoallergenic === breed.attributes.hypoallergenic
  );
};

const upsertDogBreed = async (
  existingBreedsMap: Record<
    string,
    Database["public"]["Tables"]["dog_breeds"]["Row"]
  >,
  breed: DogBreed
) => {
  const existingBreed = existingBreedsMap[breed.id];
  if (!existingBreed || !isEqual(existingBreed, breed)) {
    await supabaseClient.from("dog_breeds").upsert({
      id: breed.id,
      name: breed.attributes.name,
      description: breed.attributes.description,
      hypoallergenic: breed.attributes.hypoallergenic,
    });
  }

  await supabaseClient.from("dog_breeds_metadata").upsert({
    id: breed.id,
    list_last_reconciled_at: new Date().toISOString(),
  });
};

const fetchDogBreeds = async () => {
  const { data: existingBreeds } = await supabaseClient
    .from("dog_breeds")
    .select();
  const breedsMap = keyBy(existingBreeds, "id");

  // https://dogapi.dog/api/v2/breeds?page[number]=1
  let currentUrl = `${process.env.VITE_DOG_API_BASE_URL}/breeds?page[number]=1`;
  while (true) {
    console.log("fetching page", currentUrl);
    const { data, error } = (await dogClient.GET(currentUrl as "/breeds")) as {
      data?: {
        data: DogBreed[];
        links: { current: string; next: string; last: string };
      };
      error?: unknown;
    };
    if (!data) {
      console.error("error", error);
      break;
    }

    const { data: breeds, links } = data;

    for (const breed of breeds) {
      await upsertDogBreed(breedsMap, breed);
    }

    if (!links.next || links.current === links.last) {
      break;
    }

    currentUrl = links.next;

    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  process.exit();
};

fetchDogBreeds();

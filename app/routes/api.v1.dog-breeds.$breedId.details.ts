import createFetchClient from "openapi-fetch";
import { json, type ActionFunctionArgs } from "@remix-run/node"; // or cloudflare/deno
import dayjs from "dayjs";
import invariant from "tiny-invariant";
import { supabaseServerClient } from "~/lib/supabase/supabase-server-client.server";
import { paths } from "types/dog-api.generated";
import { openai } from "~/lib/openai/openai-client.server";

export const config = {
  maxDuration: 60,
};

const dogClient = createFetchClient<paths>();

export const action = async ({ request, params }: ActionFunctionArgs) => {
  switch (request.method) {
    case "POST": {
      const breedId = params.breedId;
      invariant(breedId, "Breed ID is required");

      const { data: dogBreed } = await supabaseServerClient()
        .from("dog_breeds")
        .select()
        .eq("id", breedId)
        .single();
      invariant(dogBreed, "Breed not found");
      invariant(dogBreed.name, "Breed name is required");

      const { data: dogBreedMetadata } = await supabaseServerClient()
        .from("dog_breeds_metadata")
        .select()
        .eq("id", breedId)
        .single();
      invariant(dogBreedMetadata, "Breed metadata not found");

      const lastReconciledAt = dogBreedMetadata.details_last_reconciled_at;

      if (
        lastReconciledAt &&
        dayjs().isBefore(dayjs(lastReconciledAt).add(1, "week"))
      ) {
        return json({ success: true, data: dogBreed });
      }

      const update: Record<string, any> = {};

      const { data: dogApiData } = await dogClient.GET(
        `${process.env.VITE_DOG_API_BASE_URL}/breeds/{id}` as "/breeds/{id}",
        {
          params: { path: { id: breedId } },
        }
      );

      const description = (dogApiData as any)?.data?.attributes?.description;

      if (description && description !== dogBreed.description) {
        update.description = description;
      }

      const funFact = await generateFunFact(dogBreed.name);

      const { data: updatedDogBreed } = await supabaseServerClient()
        .from("dog_breeds")
        .update({
          ...update,
          fun_fact: funFact,
        })
        .eq("id", breedId)
        .select()
        .single();
      await supabaseServerClient()
        .from("dog_breeds_metadata")
        .update({
          details_last_reconciled_at: new Date().toISOString(),
        })
        .eq("id", breedId);

      return json({ success: true, data: updatedDogBreed });
    }
  }

  return json({ success: false }, { status: 405 });
};

const generateFunFact = async (breedName: string) => {
  const completion = await openai().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are an extremely friendly dog expert. You are also funny. You know random facts about dogs.",
      },
      {
        role: "user",
        content: `Give me a fun fact about ${breedName}. Just the fact. Nothing else`,
      },
    ],
  });

  return completion.choices[0].message.content;
};

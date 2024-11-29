import { json, type ActionFunctionArgs } from "@remix-run/node"; // or cloudflare/deno
import invariant from "tiny-invariant";
import { openai } from "~/lib/openai/openai-client.server";
import { supabaseServerClient } from "~/lib/supabase/supabase-server-client.server";

export const config = {
  maxDuration: 60,
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  switch (request.method) {
    case "POST": {
      const breedId = params.breedId;
      invariant(breedId, "Breed ID is required");

      const { data: existingImageData } = await supabaseServerClient()
        .storage.from("dog_breeds")
        .exists(`images/${breedId}.png`);
      if (existingImageData) {
        const imageData = supabaseServerClient()
          .storage.from("dog_breeds")
          .getPublicUrl(`images/${breedId}.png`);
        return json({
          success: true,
          imageUrl: imageData.data?.publicUrl,
        });
      }

      const { data: dogBreed } = await supabaseServerClient()
        .from("dog_breeds")
        .select()
        .eq("id", breedId)
        .single();
      invariant(dogBreed, "Breed not found");

      if (!dogBreed.name) {
        return json({ success: false }, { status: 405 });
      }

      const imageUrl = await generateImage(dogBreed.name);
      invariant(imageUrl, "Failed to generate image");

      const res = await fetch(imageUrl);
      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      await supabaseServerClient()
        .storage.from("dog_breeds")
        .upload(`images/${dogBreed.id}.png`, buffer, {
          cacheControl: "3600",
          upsert: true, // Replace the file if it already exists
        });
      const { data: publicImageData } = supabaseServerClient()
        .storage.from("dog_breeds")
        .getPublicUrl(`images/${dogBreed.id}.png`);

      return json({
        success: true,
        imageUrl: publicImageData?.publicUrl,
      });
    }
  }

  return json({ success: false }, { status: 405 });
};

const generateImage = async (breedName: string) => {
  const response = await openai().images.generate({
    model: "dall-e-3",
    prompt: `A cute cartoon image of ${breedName} using pastel like colors. Make it look 2D. Try not to make it too realistic or detailed.`,
    n: 1,
    size: "1024x1024",
  });
  return response.data[0].url;
};

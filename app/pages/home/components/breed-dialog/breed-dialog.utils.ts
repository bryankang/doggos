import { config } from "~/lib/config";

export const fetchDetails = async (breedId: string) => {
  const controller = new AbortController();
  const signal = controller.signal;

  const detailsRes = await fetch(
    `${config().VITE_API_BASE_URL}/api/v1/dog-breeds/${breedId}/details`,
    {
      method: "POST",
      signal,
    }
  );
  const details = await detailsRes.json();

  return details.data;
};

export const fetchImage = async (breedId: string) => {
  const controller = new AbortController();
  const signal = controller.signal;

  const imageRes = await fetch(
    `${config().VITE_API_BASE_URL}/api/v1/dog-breeds/${breedId}/image`,
    {
      method: "POST",
      signal,
    }
  );
  const image = await imageRes.json();
  return image;
};

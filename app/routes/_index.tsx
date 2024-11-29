import { json, useLoaderData } from "@remix-run/react";
import cookie from "cookie";
import type { LoaderFunction, MetaFunction } from "@vercel/remix";
import { uniq } from "lodash-es";
import type { Database } from "types/supabase.generated";
import { supabaseClient } from "~/lib/supabase";
import { HomeProvider, Home } from "~/pages/home";

export const meta: MetaFunction = () => {
  return [
    { title: "Doggo Breeds" },
    { name: "description", content: "Very intensive dog breed database" },
  ];
};

const LIMIT = 20;

type LoaderData = {
  breeds: Database["public"]["Tables"]["dog_breeds"]["Row"][];
  totalRows: number;
  favorites: string[];
};

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const breedIds = url.searchParams.getAll("breeds");
  const pageString = url.searchParams.get("page") ?? "1";
  const page = parseInt(pageString, 10);
  const showFavorites = url.searchParams.get("favorites") === "true";
  const cookies = cookie.parse(request.headers.get("cookie") ?? "");
  const favoriteBreedIds = JSON.parse(cookies["favorites"] ?? "[]");

  const ids = showFavorites ? favoriteBreedIds : breedIds;

  if (showFavorites || ids.length) {
    const { data } = await supabaseClient()
      .from("dog_breeds")
      .select()
      .order("name")
      .in("id", ids)
      .range((page - 1) * LIMIT, page * 20)
      .limit(LIMIT);
    const { count } = await supabaseClient()
      .from("dog_breeds")
      .select("*", { count: "estimated", head: true })
      .in("id", ids);
    const breeds = data ?? [];
    return json({
      breeds,
      totalRows: count,
      favorites: favoriteBreedIds,
    });
  }

  const { data } = await supabaseClient()
    .from("dog_breeds")
    .select()
    .order("name")
    .range((page - 1) * LIMIT, page * 20)
    .limit(LIMIT);
  const { count } = await supabaseClient()
    .from("dog_breeds")
    .select("*", { count: "estimated", head: true })
    .range((page - 1) * LIMIT, page * 20)
    .limit(LIMIT);
  const breeds = data ?? [];

  return json({
    breeds,
    totalRows: count,
    favorites: favoriteBreedIds,
  });
};

export default function Index() {
  const { breeds, totalRows, favorites } = useLoaderData() as LoaderData;

  return (
    <HomeProvider breeds={breeds} totalRows={totalRows} favorites={favorites}>
      <Home />
    </HomeProvider>
  );
}

import { useRevalidator, useSearchParams } from "@remix-run/react";
import { useLocalStorage } from "@uidotdev/usehooks";
import {
  createContext,
  FC,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { Database } from "types/supabase.generated";
import Cookies from "js-cookie";

export type HomeContextType = {
  breeds: Database["public"]["Tables"]["dog_breeds"]["Row"][];
  totalRows: number;
  showFavorites: boolean;
  favorites: string[];
  setShowFavorites: (show: boolean) => void;
  toggleFavorite: (id: string) => void;
};

const HomeContext = createContext<HomeContextType | undefined>(undefined);

export type HomeProviderProps = {
  children?: ReactNode;
  breeds: Database["public"]["Tables"]["dog_breeds"]["Row"][];
  totalRows: number;
  favorites: string[];
};

export const HomeProvider: FC<HomeProviderProps> = ({
  children,
  breeds,
  totalRows,
  favorites,
}) => {
  const { revalidate } = useRevalidator();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFavorites, _setShowFavorites] = useState(
    searchParams.get("favorites") === "true"
  );
  const [favoriteBreeds, setFavoriteBreeds] = useState(favorites);

  const setShowFavorites = (show: boolean) => {
    _setShowFavorites(show);
    if (show) {
      searchParams.set("favorites", "true");
    } else {
      searchParams.delete("favorites");
    }
    searchParams.delete("page");
    setSearchParams(searchParams, { replace: true });
    revalidate();
  };

  const toggleFavorite = (id: string) => {
    if (favoriteBreeds.includes(id)) {
      setFavoriteBreeds(favoriteBreeds.filter((f) => f !== id));
    } else {
      setFavoriteBreeds([...favoriteBreeds, id]);
    }
  };

  useEffect(() => {
    Cookies.set("favorites", JSON.stringify(favoriteBreeds));
  }, [favoriteBreeds]);

  return (
    <HomeContext.Provider
      value={{
        breeds,
        totalRows,
        showFavorites,
        favorites: favoriteBreeds,
        setShowFavorites,
        toggleFavorite,
      }}
    >
      {children}
    </HomeContext.Provider>
  );
};

export const useHomeContext = () => {
  const ctx = useContext(HomeContext);
  if (!ctx) {
    throw new Error("useHomeContext() must be called inside HomeProvider.");
  }
  return ctx;
};

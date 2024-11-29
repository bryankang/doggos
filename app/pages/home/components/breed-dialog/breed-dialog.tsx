import { Blockquote, Button, Dialog, Flex, Skeleton } from "@radix-ui/themes";
import { FC, useEffect, useState } from "react";
import { Database } from "types/supabase.generated";
import { fetchDetails, fetchImage } from "./breed-dialog.utils";

export type BreedDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  breed?: Database["public"]["Tables"]["dog_breeds"]["Row"];
};

export const BreedDialog: FC<BreedDialogProps> = ({
  open,
  onOpenChange,
  breed,
}) => {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [funFact, setFunFact] = useState("");

  useEffect(() => {
    const fetchExtra = async () => {
      if (!breed) return;
      setLoading(true);

      try {
        await Promise.all([
          new Promise(async (resolve, reject) => {
            const details = await fetchDetails(breed.id);
            setFunFact(details.fun_fact);
            resolve(details);
          }),
          new Promise(async (resolve, reject) => {
            const image = await fetchImage(breed.id);
            setImageUrl(image.imageUrl);
            resolve(image);
          }),
        ]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchExtra();
  }, [breed]);

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          setImageUrl("");
          setFunFact("");
        }
        onOpenChange(open);
      }}
    >
      <Dialog.Content maxWidth="480px">
        <Dialog.Title>{breed?.name}</Dialog.Title>
        <Flex direction="column" gap="3">
          {!imageUrl ? (
            <Skeleton height="400px" />
          ) : (
            <img
              src={imageUrl}
              alt={breed?.name ?? "Dog breed image"}
              style={{
                aspectRatio: "1 / 1",
                borderRadius: "var(--radius-4)",
              }}
            />
          )}
          {!funFact ? (
            <Skeleton height="48px" />
          ) : (
            <Blockquote>{`Fun fact: ${funFact}`}</Blockquote>
          )}
          {!breed?.description ? (
            <Flex direction="column" gap="2">
              <Skeleton height="24px" />
              <Skeleton height="24px" />
              <Skeleton height="24px" />
              <Skeleton height="24px" width="120px" />
            </Flex>
          ) : (
            <Dialog.Description>{breed?.description}</Dialog.Description>
          )}
          <Flex align="center" justify="end">
            <Dialog.Close>
              <Button variant="classic">Close</Button>
            </Dialog.Close>
          </Flex>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};

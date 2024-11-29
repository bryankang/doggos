export type DogBreed = {
  id: string;
  type: string;
  attributes: {
    name: string;
    description: string;
    hypoallergenic: boolean;
  };
};

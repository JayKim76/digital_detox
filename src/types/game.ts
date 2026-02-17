export type EvolutionStage = 'egg' | 'puppy' | 'adult';

export type PetSpecies =
    | 'shiba'
    | 'golden_retriever'
    | 'husky'
    | 'pug'
    | 'poodle'
    | 'unknown'; // For egg stage

export interface CollectionEntry {
    id: string;
    species: PetSpecies;
    name: string; // User can name them later?
    obtainedDate: string;
    description: string;
}

export const PET_SPECIES_DATA: Record<PetSpecies, { name: string; description: string; emoji: string; puppyImage?: any; adultImage?: any }> = {
    unknown: { name: '???', description: 'What will it be?', emoji: '🥚' },
    shiba: { name: 'Shiba Inu', description: 'Loyal and independent.', emoji: '🐕', puppyImage: null, adultImage: null },
    golden_retriever: { name: 'Golden Retriever', description: 'Friendly and intelligent.', emoji: '🦮', puppyImage: null, adultImage: null },
    husky: { name: 'Siberian Husky', description: 'Energetic and vocal.', emoji: '🐺', puppyImage: null, adultImage: null },
    pug: { name: 'Pug', description: 'Charming and mischievous.', emoji: '🐶', puppyImage: null, adultImage: null },
    poodle: { name: 'Poodle', description: 'Active and proud.', emoji: '🐩', puppyImage: null, adultImage: null },
};

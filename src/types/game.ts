export type EvolutionStage = 'egg' | 'puppy' | 'adult';

export type PetSpecies =
    | 'shiba'
    | 'golden_retriever'
    | 'husky'
    | 'pug'
    | 'poodle'
    | 'corgi'
    | 'french_bulldog'
    | 'dachshund'
    | 'chihuahua'
    | 'akita'
    | 'samoyed'
    | 'border_collie'
    | 'dalmatian'
    | 'australian_shepherd'
    | 'shih_tzu'
    | 'unknown'; // For egg stage

export interface CollectionEntry {
    id: string;
    species: PetSpecies;
    name: string; // User can name them later?
    obtainedDate: string;
    description: string;
}

/** Shared egg-stage artwork (species is not known until hatching). */
export const EGG_IMAGE = require('../../assets/알.webp');

export const PET_SPECIES_DATA: Record<PetSpecies, { name: string; description: string; emoji: string; puppyImage?: any; adultImage?: any }> = {
    unknown: { name: '???', description: 'What will it be?', emoji: '🥚' },
    shiba: { name: 'Shiba Inu', description: 'Loyal and independent.', emoji: '🐕', puppyImage: require('../../assets/시바 강아지.webp'), adultImage: require('../../assets/시바 성체.webp') },
    golden_retriever: { name: 'Golden Retriever', description: 'Friendly and intelligent.', emoji: '🦮', puppyImage: require('../../assets/골든리트리버 강아지.webp'), adultImage: null },
    husky: { name: 'Siberian Husky', description: 'Energetic and vocal.', emoji: '🐺', puppyImage: null, adultImage: null },
    pug: { name: 'Pug', description: 'Charming and mischievous.', emoji: '🐶', puppyImage: null, adultImage: null },
    poodle: { name: 'Poodle', description: 'Active and proud.', emoji: '🐩', puppyImage: null, adultImage: null },
    corgi: { name: 'Pembroke Welsh Corgi', description: 'Bold and affectionate. Electric element.', emoji: '🐶', puppyImage: null, adultImage: null },
    french_bulldog: { name: 'French Bulldog', description: 'Playful and adaptable. Wind element.', emoji: '🐶', puppyImage: null, adultImage: null },
    dachshund: { name: 'Dachshund', description: 'Curious and brave. Earth element.', emoji: '🐕', puppyImage: null, adultImage: null },
    chihuahua: { name: 'Chihuahua', description: 'Tiny but fiery. Sun element.', emoji: '🐶', puppyImage: null, adultImage: null },
    akita: { name: 'Akita', description: 'Dignified and loyal. Moon element.', emoji: '🐕', puppyImage: null, adultImage: null },
    samoyed: { name: 'Samoyed', description: 'Gentle and smiling. Snow element.', emoji: '🐶', puppyImage: null, adultImage: null },
    border_collie: { name: 'Border Collie', description: 'Brilliant and tireless. Storm element.', emoji: '🐕', puppyImage: null, adultImage: null },
    dalmatian: { name: 'Dalmatian', description: 'Spotted and spirited. Star element.', emoji: '🐶', puppyImage: null, adultImage: null },
    australian_shepherd: { name: 'Australian Shepherd', description: 'Smart and agile. Aurora element.', emoji: '🐕', puppyImage: null, adultImage: null },
    shih_tzu: { name: 'Shih Tzu', description: 'Regal and sweet. Flower element.', emoji: '🐶', puppyImage: null, adultImage: null },
};

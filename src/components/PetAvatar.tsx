import React from 'react';
import { View, Text, Image, StyleSheet, ImageStyle, TextStyle, ViewStyle } from 'react-native';
import { EvolutionStage, PetSpecies, PET_SPECIES_DATA } from '../types/game';

interface PetAvatarProps {
    species: PetSpecies;
    stage: EvolutionStage;
    size?: number;
    containerStyle?: ViewStyle;
}

export const PetAvatar: React.FC<PetAvatarProps> = ({ species, stage, size = 100, containerStyle }) => {
    const speciesData = PET_SPECIES_DATA[species];
    const isEgg = stage === 'egg';

    // Determine image source based on stage
    let imageSource = null;
    if (stage === 'puppy') imageSource = speciesData.puppyImage;
    if (stage === 'adult') imageSource = speciesData.adultImage;
    if (isEgg) imageSource = null; // Egg image not yet defined in data, forcing emoji for now

    // Determine emoji fallback
    let emoji = speciesData.emoji;
    if (isEgg) emoji = PET_SPECIES_DATA.unknown.emoji;

    // Styles
    const imageStyle: ImageStyle = {
        width: size,
        height: size,
        resizeMode: 'contain',
    };

    const emojiStyle: TextStyle = {
        fontSize: size * 0.6, // Emoji size relative to container
        textAlign: 'center',
    };

    const centerStyle: ViewStyle = {
        justifyContent: 'center',
        alignItems: 'center',
        width: size,
        height: size,
        ...containerStyle,
    };

    if (imageSource) {
        return (
            <View style={centerStyle}>
                <Image source={imageSource} style={imageStyle} />
            </View>
        );
    }

    return (
        <View style={centerStyle}>
            <Text style={emojiStyle}>{emoji}</Text>
        </View>
    );
};

import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, Alert, SafeAreaView, TouchableOpacity, Animated, Image, Modal, FlatList } from 'react-native';
import { useGameStore } from '../store/useGameStore';
import { DetoxTimer } from '../components/DetoxTimer';
import { PetAvatar } from '../components/PetAvatar';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Trash2, Backpack, Utensils, BookOpen } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { PET_SPECIES_DATA, EvolutionStage } from '../types/game';
import { BackgroundLayout } from '../components/BackgroundLayout';
import { AmbiencePlayer } from '../components/AmbiencePlayer';
import { SHOP_ITEMS, Item } from '../data/items';

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

// Helper for growth visual style (reusing old logic for container style, but emoji comes from data)
const getPetGrowth = (level: number, stage: EvolutionStage) => {
    // Stage 1: Egg
    if (stage === 'egg') return {
        containerStyle: {
            width: 100, height: 100, borderRadius: 50,
            borderWidth: 3, borderColor: '#FFD1DC', borderStyle: 'dotted' as 'dotted',
            opacity: 0.8,
        },
        imageStyle: { borderRadius: 50, opacity: 0.7 },
        blurRadius: 1.5,
        overlay: '❓',
        overlayStyle: { bottom: 0, right: 0, fontSize: 24 }
    };

    // Stage 2: Puppy
    if (stage === 'puppy') return {
        containerStyle: {
            width: 120, height: 120, borderRadius: 25,
            borderWidth: 3, borderColor: '#FFF',
            elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84,
        },
        imageStyle: { borderRadius: 22 },
        blurRadius: 0,
        overlay: '🦴',
        overlayStyle: { top: -10, left: -5, fontSize: 32, transform: [{ rotate: '-15deg' }] }
    };

    // Stage 3: Adult
    return {
        containerStyle: {
            width: 150, height: 150, borderRadius: 8,
            borderWidth: 4, borderColor: '#FFD700',
            elevation: 20, shadowColor: '#FFD700', shadowOpacity: 0.8, shadowRadius: 20,
        },
        imageStyle: { borderRadius: 4 },
        blurRadius: 0,
        overlay: '🏆',
        overlayStyle: { top: -25, alignSelf: 'center' as 'center', fontSize: 45 }
    };
};



export const HomeScreen = ({ navigation }: HomeScreenProps) => {
    const {
        coins, addCoins, level, streak, levelUp, calculateLevelUpCost,
        customPetUri, setCustomPetUri, mood, setMood, inventory, useItem,
        evolutionStage, currentSpecies, collectAndRestart
    } = useGameStore();
    const nextLevelCost = calculateLevelUpCost();
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const [inventoryVisible, setInventoryVisible] = useState(false);

    // Check for Sleep Time (10 PM - 7 AM)
    useEffect(() => {
        const hour = new Date().getHours();
        if (hour >= 22 || hour < 7) {
            if (mood !== 'sleeping') setMood('sleeping');
        } else {
            if (mood === 'sleeping') setMood('happy'); // Wake up!
        }
    }, [mood, setMood]);

    const handleLevelUp = () => {
        if (coins >= nextLevelCost) {
            levelUp();
            Animated.sequence([
                Animated.spring(scaleAnim, { toValue: 1.2, useNativeDriver: true, speed: 50 }),
                Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 50 }),
            ]).start();
            Alert.alert("Level Up!", `Your pet evolved to level ${level + 1}!`);
        } else {
            Alert.alert("Not enough coins", `You need ${nextLevelCost} coins to level up.`);
        }
    };

    const handleUseItem = (item: Item) => {
        const success = useItem(item);
        if (success) {
            Alert.alert("Yummy!", `You used ${item.name}.`);
            Animated.sequence([
                Animated.spring(scaleAnim, { toValue: 1.1, useNativeDriver: true, speed: 50 }),
                Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 50 }),
            ]).start();
        } else {
            Alert.alert("Cannot use", "Item not available or effect not applicable.");
        }
    };

    const renderInventoryItem = ({ item }: { item: Item }) => {
        const quantity = inventory[item.id] || 0;
        if (quantity === 0) return null;

        return (
            <View style={styles.invItem}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.invName}>{item.name}</Text>
                    <Text style={styles.invDesc}>{item.description}</Text>
                    <Text style={styles.invQty}>x{quantity}</Text>
                </View>
                {item.type === 'food' ? (
                    <TouchableOpacity style={styles.useButton} onPress={() => handleUseItem(item)}>
                        <Utensils size={16} color="#fff" />
                        <Text style={styles.useButtonText}>Eat</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.passiveTag}>
                        <Text style={styles.passiveText}>Equipped</Text>
                    </View>
                )}
            </View>
        );
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });
        if (!result.canceled) setCustomPetUri(result.assets[0].uri);
    };

    const removeImage = () => setCustomPetUri(null);

    const growth = getPetGrowth(level, evolutionStage);

    return (
        <BackgroundLayout>
            <AmbiencePlayer />
            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Digital Detox Pet</Text>
                    </View>

                    {/* Main Content (Distributed) */}
                    <View style={styles.mainContent}>
                        {/* Pet Animation Area */}
                        <View style={styles.petContainer}>
                            <Animated.View style={{ transform: [{ scale: scaleAnim }], alignItems: 'center' }}>
                                {customPetUri ? (
                                    <View style={[
                                        growth.containerStyle,
                                        { justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.8)' }
                                    ]}>
                                        <Image
                                            source={{ uri: customPetUri }}
                                            style={[{ width: '100%', height: '100%' }, growth.imageStyle]}
                                            blurRadius={growth.blurRadius}
                                        />
                                        <Text style={[styles.overlayEmoji, growth.overlayStyle]}>{growth.overlay}</Text>

                                        <TouchableOpacity onPress={removeImage} style={styles.removeButton}>
                                            <Trash2 size={16} color="white" />
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <PetAvatar
                                        species={currentSpecies}
                                        stage={evolutionStage}
                                        size={growth.containerStyle.width * 0.65}
                                    />
                                )}
                            </Animated.View>

                            <Text style={styles.petName}>
                                {evolutionStage === 'egg' ? 'Mystery Egg' :
                                    evolutionStage === 'puppy' ? 'Playful Puppy' :
                                        PET_SPECIES_DATA[currentSpecies].name}
                            </Text>

                            {evolutionStage === 'adult' ? (
                                <TouchableOpacity style={styles.evolveButton} onPress={collectAndRestart}>
                                    <Text style={styles.evolveButtonText}>Add to Collection & New Egg</Text>
                                </TouchableOpacity>
                            ) : (
                                <Text style={styles.subtitle}>Level {level}</Text>
                            )}

                            <View style={styles.actionRow}>
                                <TouchableOpacity onPress={pickImage} style={styles.uploadButton}>
                                    <Camera size={16} color="#666" />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.inventoryButtonInline}
                                    onPress={() => setInventoryVisible(true)}
                                >
                                    <Backpack size={16} color="#666" />
                                    <Text style={styles.uploadText}>Bag</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.inventoryButtonInline}
                                    onPress={() => navigation.navigate('Collection')}
                                >
                                    <BookOpen size={16} color="#666" />
                                    <Text style={styles.uploadText}>Dex</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Stats */}
                        <View style={styles.statsRow}>
                            <View style={styles.stat}>
                                <Text style={styles.statLabel}>Level</Text>
                                <Text style={styles.statValue}>{level}</Text>
                            </View>
                            <View style={styles.stat}>
                                <Text style={styles.statLabel}>Coins</Text>
                                <Text style={styles.statValue}>{coins}</Text>
                            </View>
                            <View style={styles.stat}>
                                <Text style={styles.statLabel}>Streak</Text>
                                <Text style={styles.statValue}>{streak}</Text>
                            </View>
                        </View>

                        {/* Timer Section */}
                        <View style={styles.timerContainer}>
                            <DetoxTimer />
                        </View>

                        {/* Footer Buttons */}
                        <View style={styles.footer}>
                            <View style={styles.buttonRow}>
                                <TouchableOpacity
                                    style={[styles.footerButton, { backgroundColor: coins < nextLevelCost ? '#B0BEC5' : '#FF9800' }]}
                                    onPress={handleLevelUp}
                                    disabled={coins < nextLevelCost}
                                >
                                    <Text style={styles.footerButtonText}>Level Up ({nextLevelCost})</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.footerButton, { backgroundColor: '#E91E63' }]}
                                    onPress={() => navigation.navigate('Shop')}
                                >
                                    <Text style={styles.footerButtonText}>Shop 🛒</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.footerButton, { backgroundColor: '#2196F3' }]}
                                    onPress={() => navigation.navigate('Stats')}
                                >
                                    <Text style={styles.footerButtonText}>Stats 📊</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </SafeAreaView>

            {/* Inventory Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={inventoryVisible}
                onRequestClose={() => setInventoryVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>My Bag 🎒</Text>
                        <FlatList
                            data={SHOP_ITEMS.filter(item => (inventory[item.id] || 0) > 0)}
                            renderItem={renderInventoryItem}
                            keyExtractor={item => item.id}
                            ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>Bag is empty.</Text>}
                        />
                        <Button title="Close" onPress={() => setInventoryVisible(false)} />
                    </View>
                </View>
            </Modal>
        </BackgroundLayout>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    // Main content container replacing ScrollView
    mainContent: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 10,
    },
    header: {
        marginTop: 40,
        alignItems: 'center',
        marginBottom: 10,
        zIndex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#FFFFFF',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 6,
        letterSpacing: 0.5,
    },
    // Compact Stats
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        borderRadius: 16,
        paddingVertical: 10,
        paddingHorizontal: 15,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        marginBottom: 10,
    },
    stat: {
        alignItems: 'center',
        flex: 1,
    },
    statLabel: {
        fontSize: 11,
        color: '#636e72',
        fontWeight: '700',
        marginBottom: 2,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '800',
        color: '#2d3436',
    },
    // Compact Pet
    petContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        maxHeight: 250,
    },

    overlayEmoji: { position: 'absolute' },
    petName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
        marginTop: 10,
        textShadowColor: 'rgba(0,0,0,0.4)',
        textShadowRadius: 6,
        textShadowOffset: { width: 0, height: 2 },
    },
    subtitle: {
        fontSize: 13,
        color: '#F0F0F0',
        marginTop: 4,
        fontWeight: '500',
        textShadowColor: 'rgba(0,0,0,0.4)',
        textShadowRadius: 4,
    },
    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 25,
        gap: 6,
        elevation: 3,
    },
    uploadText: {
        fontSize: 12,
        color: '#2d3436',
        fontWeight: '700'
    },
    removeButton: {
        position: 'absolute',
        top: -10,
        right: -10,
        backgroundColor: '#FF5252',
        borderRadius: 15,
        padding: 6,
        elevation: 5,
    },
    // Compact Timer
    timerContainer: {
        justifyContent: 'center',
        width: '100%',
        marginVertical: 10,
        alignItems: 'center',
    },
    footer: {
        width: '100%',
        paddingTop: 10,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    footerButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 14,
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    footerButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    inventoryButton: {
        position: 'absolute',
        bottom: 30,
        right: 24,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#4A90E2',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        zIndex: 100,
        borderWidth: 1,
        borderColor: 'rgba(74, 144, 226, 0.2)',
    },
    inventoryButtonInline: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 25,
        gap: 6,
        elevation: 3,
    },
    actionRow: {
        flexDirection: 'row',
        marginTop: 15,
        gap: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Modal Styles
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 30,
        maxHeight: '80%',
        elevation: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '800',
        marginBottom: 20,
        textAlign: 'center',
        color: '#2d3436',
    },
    invItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f2f6',
    },
    invName: { fontWeight: '700', fontSize: 17, color: '#2d3436', marginBottom: 2 },
    invDesc: { fontSize: 13, color: '#636e72' },
    invQty: { fontSize: 15, color: '#4A90E2', fontWeight: '700', marginTop: 4 },
    useButton: {
        flexDirection: 'row',
        backgroundColor: '#4A90E2',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        alignItems: 'center',
        gap: 6,
        elevation: 2,
    },
    useButtonText: { color: 'white', fontWeight: '700', fontSize: 13 },
    passiveTag: {
        backgroundColor: '#FFB74D',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 15,
    },
    passiveText: { color: 'white', fontSize: 12, fontWeight: '700' },
    evolveButton: {
        marginTop: 10,
        backgroundColor: '#FFEB3B',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 25,
        elevation: 5,
        shadowColor: '#FBC02D',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    evolveButtonText: {
        color: '#F57F17',
        fontWeight: '800',
        fontSize: 14,
    },
});

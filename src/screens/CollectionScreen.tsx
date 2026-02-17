import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { useGameStore } from '../store/useGameStore';
import { CollectionEntry, PET_SPECIES_DATA } from '../types/game';
import { BackgroundLayout } from '../components/BackgroundLayout';
import { ArrowLeft, X } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { PetAvatar } from '../components/PetAvatar';

type Props = NativeStackScreenProps<RootStackParamList, 'Collection'>;

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 60) / 2; // 2 Columns with padding

export const CollectionScreen = ({ navigation }: Props) => {
    const { collection } = useGameStore();
    const [selectedPet, setSelectedPet] = useState<CollectionEntry | null>(null);

    // Sort: Newest first
    const sortedCollection = [...collection].sort((a, b) => new Date(b.obtainedDate).getTime() - new Date(a.obtainedDate).getTime());

    const renderItem = ({ item }: { item: CollectionEntry }) => {
        return (
            <TouchableOpacity style={styles.gridItem} onPress={() => setSelectedPet(item)}>
                <View style={styles.avatarContainer}>
                    <PetAvatar species={item.species} stage="adult" size={60} />
                </View>
                <Text style={styles.gridName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.gridDate}>{new Date(item.obtainedDate).toLocaleDateString()}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <BackgroundLayout>
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <ArrowLeft size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Dog Collection</Text>
                    <View style={{ width: 40 }} />
                </View>

                <FlatList
                    data={sortedCollection}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    numColumns={2}
                    columnWrapperStyle={styles.columnWrapper}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>No dogs collected yet.</Text>
                            <Text style={styles.emptySubText}>Raise your puppy to adulthood!</Text>
                        </View>
                    }
                />

                {/* Detail Modal */}
                <Modal
                    transparent={true}
                    visible={!!selectedPet}
                    animationType="fade"
                    onRequestClose={() => setSelectedPet(null)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <TouchableOpacity
                                style={styles.modalClose}
                                onPress={() => setSelectedPet(null)}
                            >
                                <X size={24} color="#666" />
                            </TouchableOpacity>

                            {selectedPet && (
                                <>
                                    <View style={styles.modalImageContainer}>
                                        <PetAvatar species={selectedPet.species} stage="adult" size={120} />
                                    </View>
                                    <Text style={styles.modalName}>{selectedPet.name}</Text>
                                    <Text style={styles.modalSpecies}>{PET_SPECIES_DATA[selectedPet.species].name}</Text>
                                    <View style={styles.divider} />
                                    <Text style={styles.modalDescription}>{selectedPet.description}</Text>
                                    <Text style={styles.modalDate}>
                                        Collected on {new Date(selectedPet.obtainedDate).toLocaleDateString()}
                                    </Text>
                                </>
                            )}
                        </View>
                    </View>
                </Modal>
            </View>
        </BackgroundLayout>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 10,
        marginBottom: 20,
    },
    backButton: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
        color: '#FFF',
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    listContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    columnWrapper: {
        justifyContent: 'space-between',
    },
    gridItem: {
        width: ITEM_WIDTH,
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 20,
        marginBottom: 20,
        padding: 15,
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    avatarContainer: {
        marginBottom: 10,
    },
    gridName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2d3436',
        textAlign: 'center',
        marginBottom: 4,
    },
    gridDate: {
        fontSize: 10,
        color: '#636e72',
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 50,
        padding: 20,
        backgroundColor: 'rgba(255,255,255,0.8)',
        borderRadius: 20,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2d3436',
    },
    emptySubText: {
        fontSize: 14,
        color: '#636e72',
        marginTop: 5,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '90%',
        backgroundColor: '#FFF',
        borderRadius: 25,
        padding: 25,
        alignItems: 'center',
        elevation: 10,
    },
    modalClose: {
        position: 'absolute',
        top: 15,
        right: 15,
        padding: 5,
        zIndex: 1,
    },
    modalImageContainer: {
        marginBottom: 15,
    },
    modalName: {
        fontSize: 24,
        fontWeight: '800',
        color: '#2d3436',
        marginBottom: 5,
    },
    modalSpecies: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0984e3',
        marginBottom: 15,
    },
    divider: {
        width: '100%',
        height: 1,
        backgroundColor: '#f1f2f6',
        marginBottom: 15,
    },
    modalDescription: {
        fontSize: 16,
        color: '#636e72',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 22,
    },
    modalDate: {
        fontSize: 12,
        color: '#b2bec3',
        fontWeight: '600',
    },
});

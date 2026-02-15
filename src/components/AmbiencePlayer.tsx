import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';
import { Audio } from 'expo-av';
import { Music, Volume2, VolumeX, X } from 'lucide-react-native';

// NOTE: Since we cannot bundle MP3s easily in this environment, 
// we will use remote URLs for testing. User can replace these with local require('./assets/...') later.
// NOTE: Using Google Actions Sound Library URLs
const SOUNDS = [
    { id: '1', name: 'Rain 🌧️', uri: 'https://www.gstatic.com/voice_delight/sounds/long/rain.mp3' },
    { id: '2', name: 'Forest 🌲', uri: 'https://www.gstatic.com/voice_delight/sounds/long/forest.mp3' },
    { id: '3', name: 'Fireplace 🔥', uri: 'https://www.gstatic.com/voice_delight/sounds/long/fireplace.mp3' },
    { id: '4', name: 'Ocean 🌊', uri: 'https://www.gstatic.com/voice_delight/sounds/long/ocean.mp3' },
];

export const AmbiencePlayer = () => {
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrack, setCurrentTrack] = useState<string | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        return () => {
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, [sound]);

    const playSound = async (item: typeof SOUNDS[0]) => {
        try {
            if (sound) {
                await sound.unloadAsync();
            }

            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: item.uri },
                { shouldPlay: true, isLooping: true }
            );

            setSound(newSound);
            setIsPlaying(true);
            setCurrentTrack(item.name);
            setModalVisible(false);
        } catch (error) {
            console.error("Failed to load sound", error);
        }
    };

    const togglePlay = async () => {
        if (!sound) {
            setModalVisible(true);
            return;
        }

        if (isPlaying) {
            await sound.pauseAsync();
        } else {
            await sound.playAsync();
        }
        setIsPlaying(!isPlaying);
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={togglePlay} style={styles.button}>
                {isPlaying ? <Volume2 size={24} color="#fff" /> : <VolumeX size={24} color="#fff" />}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.button}>
                <Music size={24} color="#fff" />
            </TouchableOpacity>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Ambience 🎵</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <X size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={SOUNDS}
                            keyExtractor={item => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[styles.trackItem, currentTrack === item.name && styles.activeTrack]}
                                    onPress={() => playSound(item)}
                                >
                                    <Text style={styles.trackName}>{item.name}</Text>
                                    {currentTrack === item.name && isPlaying && <Text>🔊</Text>}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 65,
        right: 20,
        flexDirection: 'column',
        gap: 12,
        zIndex: 100,
    },
    button: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        padding: 8,
        borderRadius: 20,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        height: '40%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    trackItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    activeTrack: {
        backgroundColor: '#e3f2fd',
    },
    trackName: {
        fontSize: 16,
    },
});

import { Alert } from 'react-native';

/**
 * Mock Ad Service for Expo Go
 * Simulates the experience of watching a Rewarded Video Ad.
 */
export const AdService = {
    /**
     * Simulates showing a rewarded video.
     * @returns Promise<boolean> - true if reward earned, false if cancelled/failed
     */
    showRewardedAd: async (): Promise<boolean> => {
        return new Promise((resolve) => {
            // 1. Ask user if they want to watch
            Alert.alert(
                "Watch Ad? 📺",
                "Watch a short video to earn a reward!",
                [
                    {
                        text: "Cancel",
                        style: "cancel",
                        onPress: () => resolve(false)
                    },
                    {
                        text: "Watch (Mock)",
                        onPress: () => {
                            // 2. Simulate "Watching" (Loading)
                            // In a real app, this would show the AdMob interstitial
                            setTimeout(() => {
                                Alert.alert("Ad Complete!", "Thank you for watching.");
                                resolve(true);
                            }, 3000); // 3 second delay
                        }
                    }
                ]
            );
        });
    }
};

// MOCK Service for Expo Go
// In a real app, this would bridge to Native Modules (Java/Swift)

export const DetoxMonitor = {
    checkPermission: async (): Promise<boolean> => {
        // Simulate permission check
        console.log('[DetoxMonitor] Checking permissions...');
        return true; // Always return true for mock
    },

    requestPermission: async (): Promise<boolean> => {
        console.log('[DetoxMonitor] Requesting permissions...');
        return true; // Always granted
    },

    checkAppUsage: async (): Promise<boolean> => {
        // Simulate checking if the user is in a prohibited app
        // Returns TRUE if Safe (User is in our app or allowed app)
        // Returns FALSE if Distracted (User is in prohibited app)

        // For testing: 10% chance to simulate a distraction event every check
        const isDistracted = Math.random() < 0.1;

        if (isDistracted) {
            console.log('[DetoxMonitor] Distraction detected! (Simulation)');
            return false;
        }

        console.log('[DetoxMonitor] User is focused.');
        return true;
    }
};

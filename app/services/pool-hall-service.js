export class PoolHallService {
    constructor() {
        this.poolHalls = new Map();
    }

    async findNearbyPoolHalls(latitude, longitude, radius = 10) { // radius in km
        try {
            // In a real app, this would be an API call to your backend
            const mockPoolHalls = [
                {
                    id: '1',
                    name: "Elite Billiards",
                    address: "123 Main St",
                    city: "Springfield",
                    state: "IL",
                    latitude: latitude + 0.01,
                    longitude: longitude + 0.01,
                    rating: 4.5,
                    tables: {
                        total: 12,
                        available: 5
                    },
                    amenities: ["Bar", "Restaurant", "Pro Shop"],
                    hours: {
                        mon: "12PM-2AM",
                        tue: "12PM-2AM",
                        wed: "12PM-2AM",
                        thu: "12PM-2AM",
                        fri: "12PM-3AM",
                        sat: "11AM-3AM",
                        sun: "11AM-12AM"
                    },
                    isAimlyPartner: true,
                    currentPlayers: 15
                },
                // Add more mock data
            ];

            return mockPoolHalls;
        } catch (error) {
            console.error('Error finding pool halls:', error);
            return [];
        }
    }

    async getPoolHallDetails(id) {
        try {
            const poolHall = this.poolHalls.get(id);
            if (!poolHall) {
                throw new Error('Pool hall not found');
            }
            return poolHall;
        } catch (error) {
            console.error('Error getting pool hall details:', error);
            return null;
        }
    }

    async getTableAvailability(poolHallId) {
        try {
            const poolHall = await this.getPoolHallDetails(poolHallId);
            return poolHall?.tables || { total: 0, available: 0 };
        } catch (error) {
            console.error('Error getting table availability:', error);
            return { total: 0, available: 0 };
        }
    }

    async getCurrentPlayerCount(poolHallId) {
        try {
            const poolHall = await this.getPoolHallDetails(poolHallId);
            return poolHall?.currentPlayers || 0;
        } catch (error) {
            console.error('Error getting current player count:', error);
            return 0;
        }
    }
}
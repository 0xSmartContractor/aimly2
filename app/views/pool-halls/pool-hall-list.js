import { Observable } from '@nativescript/core';
import { PoolHallService } from '../../services/pool-hall-service';
import * as Geolocation from '@nativescript/geolocation';

export function createViewModel() {
    const viewModel = new Observable();
    const poolHallService = new PoolHallService();

    // Initialize properties
    viewModel.poolHalls = [];
    viewModel.searchQuery = '';
    viewModel.currentLocation = null;
    viewModel.isLoading = false;

    // Load initial data
    loadPoolHalls();

    async function loadPoolHalls() {
        try {
            viewModel.set('isLoading', true);

            // Get current location
            const location = await getCurrentLocation();
            viewModel.set('currentLocation', location);

            // Find nearby pool halls
            const halls = await poolHallService.findNearbyPoolHalls(
                location.latitude,
                location.longitude
            );

            // Calculate distances
            const hallsWithDistance = halls.map(hall => ({
                ...hall,
                distance: calculateDistance(
                    location.latitude,
                    location.longitude,
                    hall.latitude,
                    hall.longitude
                )
            }));

            // Sort by distance
            hallsWithDistance.sort((a, b) => a.distance - b.distance);

            viewModel.set('poolHalls', hallsWithDistance);
        } catch (error) {
            console.error('Error loading pool halls:', error);
            alert('Unable to load pool halls. Please try again.');
        } finally {
            viewModel.set('isLoading', false);
        }
    }

    async function getCurrentLocation() {
        const hasPermission = await Geolocation.enableLocationRequest();
        if (!hasPermission) {
            throw new Error('Location permission denied');
        }

        return await Geolocation.getCurrentLocation({
            desiredAccuracy: Geolocation.Accuracy.high,
            maximumAge: 5000,
            timeout: 20000
        });
    }

    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                 Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                 Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const km = R * c;
        return (km * 0.621371).toFixed(1); // Convert to miles and round to 1 decimal
    }

    // Event handlers
    viewModel.onLocationTap = () => {
        loadPoolHalls();
    };

    viewModel.onSearch = (args) => {
        const searchBar = args.object;
        viewModel.searchQuery = searchBar.text;
        filterPoolHalls();
    };

    viewModel.onClearSearch = () => {
        viewModel.searchQuery = '';
        filterPoolHalls();
    };

    viewModel.onPoolHallTap = (args) => {
        const poolHall = viewModel.poolHalls[args.index];
        const frame = require('@nativescript/core').Frame;
        frame.topmost().navigate({
            moduleName: 'views/pool-halls/pool-hall-details',
            context: { poolHallId: poolHall.id }
        });
    };

    function filterPoolHalls() {
        if (!viewModel.searchQuery) {
            loadPoolHalls();
            return;
        }

        const query = viewModel.searchQuery.toLowerCase();
        const filtered = viewModel.poolHalls.filter(hall =>
            hall.name.toLowerCase().includes(query) ||
            hall.address.toLowerCase().includes(query)
        );

        viewModel.set('poolHalls', filtered);
    }

    return viewModel;
}

export function onNavigatingTo(args) {
    const page = args.object;
    page.bindingContext = createViewModel();
}
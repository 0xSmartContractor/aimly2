import { getAuthToken } from './auth';

const API_URL = 'http://your-api-url/api/v1';

async function fetchWithAuth(endpoint, options = {}) {
    const token = await getAuthToken();
    
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...options.headers
        }
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
}

export async function analyzeShotImage(imageData) {
    const formData = new FormData();
    formData.append('file', imageData);
    
    return fetchWithAuth('/shot-analysis/analyze', {
        method: 'POST',
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        body: formData
    });
}

export async function createSubscription() {
    return fetchWithAuth('/payments/create-subscription', {
        method: 'POST'
    });
}

// Export other API functions for tournaments, challenges, etc.
export * from './api/tournaments';
export * from './api/challenges';
export * from './api/leaderboard';
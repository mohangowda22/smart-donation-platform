import { store } from '../store/store';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000'; // Default to localhost if not set

// Store the token
let token: string | null = null;

// Set the token after login
export const setToken = (newToken: string) => {
    token = newToken;
    localStorage.setItem('authToken', newToken); // Persist token in localStorage
};

// Get the token (from memory or localStorage)
const getToken = () => {
    if (!token) {
        token = store.getState().auth.token || localStorage.getItem('authToken');
    }
    return token;
};

// Fetch campaigns
export const fetchCampaigns = async () => {
    try {
        const response = await fetch(`${API_URL}/api/campaigns`, {
            headers: {
                Authorization: `Bearer ${getToken()}`, // Include token in Authorization header
            },
        });

        if (!response.ok) {
            console.error('Failed to fetch campaigns:', response.status, response.statusText);
            throw new Error('Failed to fetch campaigns');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching campaigns:', error);
        throw error;
    }
};

// Refresh campaigns
export const refreshCampaigns = async () => {
    try {
        const data = await fetchCampaigns();
        console.log('Fetched campaigns:', data.campaigns); // Debugging
        return data.campaigns || []; // Return the campaigns to the caller
    } catch (error) {
        console.error('Failed to fetch campaigns:', error);
        return []; // Return an empty array on error
    }
};

// Donate to a campaign
export const donateToCampaign = async (campaignId: string, amount: number) => {
    try {
        const response = await fetch(`${API_URL}/api/donations/donate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${getToken()}`,
            },
            body: JSON.stringify({ campaignId, amount }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Failed to donate:', errorData.message || response.statusText);
            throw new Error(errorData.message || 'Failed to donate');
        }

        return await response.json();
    } catch (error) {
        console.error('Error during donation:', error);
        throw error;
    }
};

// Login
export const login = async (email: string, password: string) => {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
            const data = await response.json();
            return { token: data.token, isAdmin: data.isAdmin };
        }

        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
    } catch (error) {
        console.error('Error during login:', error);
        throw error;
    }
};

// Create a campaign
export const createCampaign = async (campaign: { title: string; description: string; targetAmount: number }) => {
    try {
        const response = await fetch(`${API_URL}/api/campaigns/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${getToken()}`,
            },
            body: JSON.stringify(campaign),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Failed to create campaign:', errorData.message || response.statusText);
            throw new Error(errorData.message || 'Failed to create campaign');
        }

        return await response.json();
    } catch (error) {
        console.error('Error creating campaign:', error);
        throw error;
    }
};
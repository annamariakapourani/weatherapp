import axios from 'axios';

const BEST_TIME_API_KEY = process.env.REACT_APP_BEST_TIME_API_KEY_PRIVATE;
//console.log('BestTime API Key:', BEST_TIME_API_KEY);

/**
 * Fetch live foot-traffic data for a venue.
 * Returns the live crowd level (0-100)
 */
export const fetchLiveFootTraffic = async (venueName, venueAddress) => {
    if (!BEST_TIME_API_KEY) {
        console.error('BestTime API Key is not set. Please check your environment variables.');
        return null;
    }

    const params = new URLSearchParams({
        api_key_private: BEST_TIME_API_KEY,
        venue_name: venueName,
        venue_address: venueAddress,
    });

    try {
        const response = await axios.post(`https://besttime.app/api/v1/forecasts/live?${params}`);
        console.log('API Response:', response.data); // Log the full response

        if (response.data && response.data.analysis) {
            const { venue_live_busyness, venue_live_busyness_available, venue_forecasted_busyness } = response.data.analysis;

            if (venue_live_busyness_available) {
                return { level: venue_live_busyness, type: getCrowdType(venue_live_busyness) }; // Return live busyness
            } else if (response.data.analysis.venue_forecast_busyness_available) {
                console.warn('Live data unavailable. Using forecasted data instead.');
                return { level: venue_forecasted_busyness, type: getCrowdType(venue_forecasted_busyness) }; // Fallback to forecasted busyness
            } else {
                console.warn('No live or forecasted data available for this venue.');
                return { level: null, type: 'Unknown' };
            }
        }
        return { level: null, type: 'Unknown' };
    } catch (error) {
        console.error('Error fetching live foot-traffic data:', error);
        return { level: null, type: 'Unknown' };
    }
};


const getCrowdType = (percentage) => {
    if (percentage <= 30) return 'Low';
    if (percentage <= 70) return 'Moderate';
    return 'High';
};
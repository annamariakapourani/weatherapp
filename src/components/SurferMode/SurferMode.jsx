import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import PopUp from "../../utils/PopUp";
import { CurrentTime } from '../../utils/CurrentTime';
import BeachCard from './BeachCard';
import BeachInfo from './BeachInfo';
import './SurferMode.css';
import { fetchLiveFootTraffic } from './BestTimeApi';

// Icons
import homeIcon from "../../assets/homeIcon.png"
import warning from "../../assets/warning.png"
import sunIcon from "../../assets/sunIcon.png"
import sunCloudy from "../../assets/sunCloudy.png"
import IconSearch from "../../assets/IconSearch.png"
import filterIcon from "../../assets/filterIcon.png"

// Images
import thunderstorm from "../../assets/thunderstorm.png"
import drizzle from "../../assets/drizzle.png"
import rain from "../../assets/rain.png"
import snow from "../../assets/snow.png"
import fog from "../../assets/fog.png"
import quoteIcon from "../../assets/quote.png"
import wave from "../../assets/wave.png"

// Weather condition maps
const WEATHER_ICONS = {
    thunderstorm: { min: 200, max: 232, icon: thunderstorm },
    drizzle: { min: 300, max: 321, icon: drizzle },
    rain: { min: 500, max: 531, icon: rain },
    snow: { min: 600, max: 622, icon: snow },
    fog: { min: 701, max: 781, icon: fog },
    clear: { id: 800, icon: sunIcon },
    clouds: { min: 801, max: 804, icon: sunCloudy }
};

const WEATHER_MESSAGES = {
    thunderstorm: "Storm incoming! Stay out of the water.",
    drizzle: "Light rain? Could be glassy waves!",
    rain: "Rain’s fine, just watch for currents!",
    snow: "Snowy surf? Only for the bold!",
    fog: "Foggy lineup—stay aware!",
    clear: "Sunny and clean! Sunscreen up!",
    clouds: "Cloudy but surf’s still up!",
    default: "Check the surf report!"
};

const quotes = [
    "Ride the wave, chase the sun, and love the ocean.",
    "Let the sea set you free and ride the waves.",
    "Life’s a wave—catch it, ride it, and enjoy it.",
    "Sun, surf, salt, and sand—happiness is where waves land.",
    "Keep calm, paddle on, and ride the waves of life."
];

function SurferMode() {
    const [city, setCity] = useState('London');
    const [weatherData, setWeatherData] = useState(null);
    const [weatherIcon, setWeatherIcon] = useState(sunIcon);
    const [isLoading, setIsLoading] = useState(false);
    const [coordinates, setCoordinates] = useState({ lat: null, lon: null });
    const [error, setError] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [popupButton, setPopupButton] = useState(false);
    const [nearestBeaches, setNearestBeaches] = useState({});
    const [beachesLoading, setBeachesLoading] = useState(false);
    const [selectedBeach, setSelectedBeach] = useState(null);
    const [moreInfoSelected, setMoreInfoSelected] = useState(false);
    const [quote, setQuote] = useState(quotes[0]);
    const [filters, setFilters] = useState({
        wind: null,
        wave: null,
        crowd: null
    });
    const [filteredBeaches, setFilteredBeaches] = useState(null); // New state for filtered beaches
    const [filtersApplied, setFiltersApplied] = useState(false);
    
    useEffect(() => {
        const internal = setInterval(() => {
            setQuote(previousQuote => {
                return quotes[(quotes.indexOf(previousQuote) + 1) % quotes.length];
            });
        }, 1000 * 5); // Change quote every 5 seconds

        return () => clearInterval(internal);
    }, [])

    const navigate = useNavigate();

    // Helper functions
    const getWeatherIcon = useCallback((weatherId) => {
        for (const [type, range] of Object.entries(WEATHER_ICONS)) {
            if (range.id === weatherId || (weatherId >= range.min && weatherId <= range.max)) {
                return range.icon;
            }
        }
        return sunIcon; // Default fallback
    }, []);

    const getPopUpMessage = useCallback((weatherId) => {
        for (const [type, range] of Object.entries(WEATHER_ICONS)) {
            if (range.id === weatherId || (weatherId >= range.min && weatherId <= range.max)) {
                return WEATHER_MESSAGES[type];
            }
        }
        return WEATHER_MESSAGES.default;
    }, []);

    // Fetch data for the selected city
    const fetchData = useCallback(async () => {
        if (!city) return;

        setIsLoading(true);
        try {
            setError(null);
            const response = await axios.get(
                `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${process.env.REACT_APP_OWM_API_KEY}`
            );
            setWeatherData(response.data);
            setCoordinates({
                lat: response.data.coord.lat,
                lon: response.data.coord.lon
            });
            setWeatherIcon(getWeatherIcon(response.data.weather[0].id));
        } catch (error) {
            setError('City not found. Please try again.');
            console.error("Error fetching data:", error);
        } finally {
            setIsLoading(false);
        }
    }, [city, getWeatherIcon]);

    // Give 5 city suggestion on given input
    const fetchSuggestions = useCallback(
        async (query) => {
            if (!query || query.length < 2) {
                setSuggestions([]);
                setShowSuggestions(false);
                return;
            }

            try {
                const response = await axios.get(
                    `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${process.env.REACT_APP_OWM_API_KEY}`
                );

                const cityData = response.data.map(city => ({
                    name: city.name,
                    country: city.country,
                    state: city.state,
                    displayName: city.state
                        ? `${city.name}, ${city.state}, ${city.country}`
                        : `${city.name}, ${city.country}`
                }));

                setSuggestions(cityData);
                setShowSuggestions(true);
            } catch (error) {
                console.error("Error fetching city suggestions:", error);
            }
        },
        []
    );

    const generateBeachScore = (beach) => {
        const wave_height = beach.wave_height_data[0]; // ideal wave height is between 1.5 and 3m
        const wave_period = beach.wave_period_data[0]; //ideal period is 10-15 seconds
        const wave_direction = beach.wave_direction_data[0];// wave and swell direction should align (be within 30 degrees)
        const wind_wave_height = beach.wind_wave_height_data[0]; // less that 0.5m is ideal
        const wind_wave_direction = beach.wind_wave_direction_data[0]; // ideally should satisify Math.abs(wind_wave_direction - 180) <= 45
        const swell_wave_height = beach.swell_wave_height_data[0]; // 1 - 2.5 is ideal
        const swell_wave_direction = beach.swell_wave_direction_data[0];
        const temperature = parseFloat(beach.temperature); // between 20 and 30 is ideal
        const crowdType = beach.crowdType;
        let rating = 0;

        // Wave height stuff
        if (wave_height >= 1.5 && wave_height <= 3) { // perfect score
            rating += 2;
        } else if (wave_height >= 1 && wave_height < 1.5 || wave_height > 3 && wave_height <= 4) { // almost there
            rating += 1;
        }

        // Wave period stuff
        if (wave_period >= 10 && wave_period <= 15) {
            rating += 2;
        } else if (wave_period >= 8 && wave_period < 10 || wave_period > 15 && wave_period <= 18) {
            rating += 1;
        }

        // Wave and swell direction stuff
        if (Math.abs(wave_direction - swell_wave_direction) <= 30) {
            rating += 2;
        } else if (Math.abs(wave_direction - swell_wave_direction) <= 60) {
            rating += 1;
        }

        // Wind wave height stuff
        if (wind_wave_height < 0.5) {
            rating += 2;
        } else if (wind_wave_height >= 0.5 && wind_wave_height <= 1) {
            rating += 1;
        }

        // Wind wave direction stuff
        if (Math.abs(wind_wave_direction - 180) <= 45) {
            rating += 2;
        } else if (Math.abs(wind_wave_direction - 180) <= 90) {
            rating += 1;
        }

        // Swell wave height scoring
        if (swell_wave_height >= 1 && swell_wave_height <= 2.5) {
            rating += 2;
        } else if (swell_wave_height >= 0.5 && swell_wave_height <= 3) {
            rating += 1;
        }

        // Temperature scoring
        if (temperature >= 20 && temperature <= 30) {
            rating += 2;
        } else if (temperature >= 15 && temperature <= 35) {
            rating += 1;
        }

        // Crowd scoring is considered, if present...

        if (!crowdType) {
            // Final score classification
            if (rating <= 5) return "POOR";
            else if (rating <= 10) return "OK";
            else return "GOOD";
        }
        else {
            if (crowdType === "Low") {
                rating += 1;
            } else if (crowdType === "Moderate") {
                rating += 0;
            } else if (crowdType === "High") {
                rating -= 1;
            }
            // Final score classification
            if (rating <= 6) return "POOR";
            else if (rating <= 11) return "OK";
            else return "GOOD";
        }
    };

    // getting the beaches stuff...
    const fetchBeaches = useCallback(async () => {

        if (!coordinates.lat || !coordinates.lon || error === "City not found. Please try again.") return;

        let response;
        let radius = 50000;

        try {
            response = await axios.get(`/api/beaches?lat=${coordinates.lat}&lon=${coordinates.lon}&radius=${radius}`)
        } catch (error) {
            console.error("Error fetching the beaches:", error)
            return;
        }
        
        const beachesData = response.data;
        if (beachesData.length === 0) {
            console.log('No beaches found...');
            return;
        }
        
        const newNearestBeaches = {};
        
        for (const beach of beachesData) {
            // attempt to get the marine data for each location
            try {

                const lat = beach.geometry.location.lat;
                const lon = beach.geometry.location.lng;

                const marineResponse = await axios.get(
                    `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&hourly=wave_height,wave_direction,wave_period,wind_wave_height,wind_wave_direction,swell_wave_height,swell_wave_direction&forecast_days=3`
                );

                const units = marineResponse.data.hourly_units;
                const data = marineResponse.data.hourly;

                // If the location does not have marine data, then we can assume it is not a good location for surfing, so skip it all together
                const hasMarineData = data.wave_height?.length > 0 && data.wave_height[0] !== null;

                if (hasMarineData) {
                    const weatherResponse = await axios.get(
                        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${process.env.REACT_APP_OWM_API_KEY}`
                    );

                    // Fetch live crowd data using BestTime API
                    const crowdData = await fetchLiveFootTraffic(beach.name, beach.vicinity || 'Unknown Address');

                    newNearestBeaches[beach.place_id] = {
                        // Generic information
                        display_name: beach.name,
                        place_id: beach.place_id,
                        lat: beach.geometry.location.lat,
                        lon: beach.geometry.location.lng,
                        rating: beach.rating, // google rating
                        // Normal weather stuff
                        temperature: `${Math.round(weatherResponse.data.main.temp)}°C`,
                        description: weatherResponse.data.weather[0].description,
                        // Now the marine stuff
                        times: data.time,
                        units: units,
                        wave_height_data: data.wave_height,
                        wave_direction_data: data.wave_direction,
                        wave_period_data: data.wave_period,
                        wind_wave_height_data: data.wind_wave_height,
                        wind_wave_direction_data: data.wind_wave_direction,
                        swell_wave_height_data: data.swell_wave_height,
                        swell_wave_direction_data: data.swell_wave_direction,
                        // crowd stuff
                        crowd: crowdData.level !== null ? `${crowdData.level}%` : 'No data available', // Display percentage
                        crowdType: crowdData.type || 'Unknown', // Ensure crowdType is always defined
                        
                    };

                    // If the beach has an associated image, then we can use that instead of the stock photo:
                    if (beach.photos && beach.photos.length > 0) {
                        newNearestBeaches[beach.place_id].photo = beach.photos[0].photo_reference // there can be multiple images. For now, just take the first one.
                    }

                    // Overall score of surfing conditions
                    newNearestBeaches[beach.place_id].score = generateBeachScore(newNearestBeaches[beach.place_id]);
                }
            } catch (error) {
                // Skip this beach - not a valid marine location
                console.log(`Skipping ${beach.display_name} - not a valid marine location or other error occurred`);
                continue;
            }
        }
        console.log(`FInished for lat ${coordinates.lat} and lon ${coordinates.lon} and city ${city}`)
        setNearestBeaches(newNearestBeaches);
    }, [coordinates, error])

    const invokeFetchBeaches = async () => {
        setBeachesLoading(true);
        setNearestBeaches({});
        setSelectedBeach(null);
        setMoreInfoSelected(null);
        await fetchBeaches();
        setBeachesLoading(false);
    }

    // Filter beaches based on the selected filters
    const applyFilters = () => {
        console.log("applying filters")
        if (!Object.keys(nearestBeaches).length) {
            console.warn("No beaches to filter.");
            return; // Ensure there are beaches to filter
        }
    
        console.log("Filters:", filters); // Debug filters

        const filteredBeaches = Object.values(nearestBeaches).filter(beach => {
            const { windWaveHeight, waveHeight, crowdType } = beach;
    
            let windCondition = true;
            let waveCondition = true;
            let crowdCondition = true;
    
            // Wind filter
            if (filters.wind) {
                const windValue = parseFloat(windWaveHeight);
                if (filters.wind === "Light") windCondition = windValue < 0.5;
                else if (filters.wind === "Medium") windCondition = windValue >= 0.5 && windValue <= 1.5;
                else if (filters.wind === "Strong") windCondition = windValue > 1.5;
            }
    
            // Wave filter
            if (filters.wave) {
                const waveValue = parseFloat(waveHeight);
                if (filters.wave === "Small") waveCondition = waveValue < 0.5;
                else if (filters.wave === "Medium") waveCondition = waveValue >= 0.5 && waveValue <= 2.5;
                else if (filters.wave === "Large") waveCondition = waveValue > 2.5;
            }
    
            // Crowd filter
            if (filters.crowd) {
                if (filters.crowd === "Quiet") crowdCondition = crowdType === "Low";
                else if (filters.crowd === "Moderate") crowdCondition = crowdType === "Moderate";
                else if (filters.crowd === "Busy") crowdCondition = crowdType === "High";
            }
    
            return windCondition && waveCondition && crowdCondition;
        });
    
        setFilteredBeaches(filteredBeaches); // Update the filtered beaches state
        if (filteredBeaches.length === 0) {
            setSelectedBeach(null); // Removes the opened more-info tab if no beaches match the filters
            setMoreInfoSelected(false); // Close the info card if no beaches match the filters
        }
    };

    // Filter actions
    const handleClearAll = () => {
        setFilters({ wind: null, wave: null, crowd: null }); // Reset all filters
        setFilteredBeaches(null); // Reset filtered beaches
        setFiltersApplied(false); // Reset filters applied state

        //invokeFetchBeaches() // Reload all beaches without filters
    };

    const handleCancel = () => {
        console.log("Filter action cancelled."); // Log the cancel action
    };

    const handleApply = () => {
        applyFilters(); // Apply the selected filters
        setFiltersApplied(true); // Mark filters as applied
    };

    // Effects
    useEffect(() => {
        setNearestBeaches({}); // Clear previous beaches
        setFilteredBeaches(null); // Clear filtered beaches
        fetchData();
        invokeFetchBeaches();
    }, []);

    useEffect(() => {
        if (coordinates.lat && coordinates.lon) {
            invokeFetchBeaches();
        }
    }, [coordinates]);

    // Event handlers
    const handleInputChange = (e) => {
        const value = e.target.value;
        setCity(value);
        fetchSuggestions(value);
    };

    const handleSuggestionClick = (suggestion) => {
        setCity(suggestion.name);
        setSuggestions([]);
        setShowSuggestions(false);
        setNearestBeaches({}); // Clear previous beaches
        setFilteredBeaches(null); // Clear filtered beaches
        fetchData();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setNearestBeaches({}); // Clear previous beaches
        setFilteredBeaches(null); // Clear filtered beaches
        fetchData();
    };

    // beach info stuff (updates the info card when user selects a beach), and toggles it...
    const onArrowClick = (beach) => {
        if (selectedBeach && moreInfoSelected && beach.display_name === selectedBeach.display_name) {
            setMoreInfoSelected(false);
        }
        else {
            setSelectedBeach(beach);
            setMoreInfoSelected(true);
        }
    };


    return (
        <div className="container containerSurfers">
            <div className='header'>
                <div className='popUpMessage'>
                    <p className='message'>
                        {isLoading
                            ? "Loading..."
                            : weatherData
                                ? getPopUpMessage(weatherData.weather[0].id)
                                : "Check the weather!"}
                    </p>
                    <img className='warningIcon' src={warning} alt='Notification' />
                </div>

                <form onSubmit={handleSubmit} className='searchBar'>
                    <div className="search-container">
                        <input
                            type='text'
                            placeholder='Search a city'
                            value={city}
                            onChange={handleInputChange}
                            onFocus={() => city.length >= 2 && setShowSuggestions(true)}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                            aria-label="Search for a city"
                        />
                        {showSuggestions && suggestions.length > 0 && (
                            <div className="suggestions-dropdown">
                                {suggestions.map((suggestion, index) => (
                                    <div
                                        key={index}
                                        className="suggestion-item"
                                        onClick={() => handleSuggestionClick(suggestion)}
                                        role="option"
                                        aria-selected={false}
                                    >
                                        {suggestion.displayName}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <button type="submit" className='searchButton' aria-label="Search">
                        <img className='searchIcon' src={IconSearch} alt='Search' />
                    </button>
                </form>

                <div
                    className='switchMode'
                    onClick={() => navigate(-1)}
                    role="button"
                    tabIndex={0}
                    aria-label="Switch to normal mode"
                    onKeyDown={(e) => e.key === 'Enter' && navigate(-1)}
                >
                    <img src={homeIcon} alt='Switch to normal mode' />
                </div>
            </div>

            <CurrentTime timezone={weatherData?.timezone} />

            {error ? (
                <div className="error-container">
                    <p className="error">{error}</p>
                </div>
            ) : (
                <>
                    <div className='weatherInfo'>
                        <img className='weatherIcon' src={weatherIcon} alt={weatherData?.weather?.[0]?.description || 'Weather'} />
                        <div>
                            <div>
                                <p className='temp'>{weatherData ? Math.round(weatherData.main.temp) : '--'}°</p>
                                <p className='desc'>{weatherData?.weather?.[0]?.description || 'Loading...'}</p>
                            </div>
                            <p className='city'>{weatherData?.name || 'Loading...'}</p>
                        </div>
                    </div>
                </>
            )}

            <div className='beaches'>
                <div className='cards'>
                    <div className='cardsContainer'>
                        <div className='filterDetails'>
                            <div className='filter' onClick={() => setPopupButton(true)}>
                                <img className='filterIcon' src={filterIcon} alt='Filter' />
                            </div>

                            {/* Display selected filter criteria as tabs only if filters are applied */}
                            {filtersApplied && (
                                <div className='filterTabs'>
                                    {filters.wind && <div className='filterTab'>Wind: {filters.wind}</div>}
                                    {filters.wave && <div className='filterTab'>Wave: {filters.wave}</div>}
                                    {filters.crowd && <div className='filterTab'>Crowd: {filters.crowd}</div>}
                                </div>
                            )}
                            
                            <PopUp trigger={popupButton} setTrigger={setPopupButton} onClearAll={handleClearAll} onCancel={handleCancel} onApply={handleApply}>
                                <h3 className='name'>Filters</h3>

                                <div className='filterOptions'>
                                    <div className='filterRow'>
                                        <label>Wind</label>
                                        <select value={filters.wind || ""} onChange={(e) => setFilters({ ...filters, wind: e.target.value })}>
                                            <option value="">Select filter</option>
                                            <option value="Light">Light</option>
                                            <option value="Medium">Medium</option>
                                            <option value="Strong">Strong</option>
                                        </select>
                                    </div>

                                    <div className='filterRow'>
                                        <label>Wave</label>
                                        <select value={filters.wave || ""} onChange={(e) => setFilters({ ...filters, wave: e.target.value })}>
                                            <option value="">Select filter</option>
                                            <option value="Small">Small</option>
                                            <option value="Medium">Medium</option>
                                            <option value="Large">Large</option>
                                        </select>
                                    </div>

                                    <div className='filterRow'>
                                        <label>Crowd</label>
                                        <select value={filters.crowd || ""} onChange={(e) => setFilters({ ...filters, crowd: e.target.value })}>
                                            <option value="">Select filter</option>
                                            <option value="Quiet">Quiet</option>
                                            <option value="Moderate">Moderate</option>
                                            <option value="Busy">Busy</option>
                                        </select>
                                    </div>
                                </div>

                            </PopUp>

                        </div>
                        {error === "City not found. Please try again." ? (
                            <p>Enter a valid location...</p>
                        ) : beachesLoading ? (
                            <p style={{ textAlign: 'center' }}>Loading forecast...</p>
                        ) : (filteredBeaches || Object.values(nearestBeaches)).length > 0 ? (
                            (filteredBeaches || Object.values(nearestBeaches)).map((beach, i) => (
                                <BeachCard
                                    key={i}
                                    beach={beach}
                                    onArrowClick={onArrowClick}
                                />
                            ))
                        ) : (
                            <p>No beaches found...</p>
                        )}
                    </div>
                </div>

                <div className='additionalInfo'>
                    <div className='quoteSection'>
                        <img className='quoteIcon' src={quoteIcon} alt='Quote' />
                        <p className='quote'>{quote}</p>
                    </div>
                    {moreInfoSelected && selectedBeach ? (
                        <BeachInfo beach={selectedBeach} />
                    ) : (filteredBeaches && filteredBeaches.length === 0) || (!filteredBeaches && Object.keys(nearestBeaches).length === 0) ? (
                        <div className='clickOnBeach no-beaches'>
                            <img className='waveIcon' src={wave} alt='Wave' />
                            <p className='infoText'>No beaches available to view. Adjust your filters.</p>
                        </div>
                    ) : (
                        <div className='clickOnBeach'>
                            <img className='waveIcon' src={wave} alt='Wave' />
                            <p className='infoText'>Click on a beach<br />to see more info</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SurferMode;
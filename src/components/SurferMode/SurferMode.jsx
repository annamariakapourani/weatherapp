import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import PopUp from "../../utils/PopUp";
import { CurrentTime } from '../../utils/CurrentTime';
import BeachCard from './BeachCard';
import BeachInfo from './BeachInfo';
import RadiusScroller from './RadiusScroller';
import './SurferMode.css';

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
    const [radius, setRadius] = useState(50000);
    const [radiusScrollerLocked, setRadiusScrollerLocked] = useState(false); // need to lock the scroller sometimes (specifically when stuff is already loading) to prevent it from incorrectly overwriting data

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

    // get the nearest beaches
    const fetchBeaches = useCallback(async () => {

        if (!coordinates.lat || !coordinates.lon) {
            return;
        }

        setRadiusScrollerLocked(true);
        setNearestBeaches({});
        setBeachesLoading(true);

        let response;

        try {
            response = await axios.get(`/api/beaches?lat=${coordinates.lat}&lon=${coordinates.lon}&radius=${radius}`)
        } catch (error) {
            console.error("Error fetching the beaches:", error)
            setNearestBeaches({});
            setBeachesLoading(false)
            setRadiusScrollerLocked(false);
            return;
        }
        
        const beachesData = response.data;
        if (beachesData.length === 0) {
            console.log('No beaches found...');
            setNearestBeaches({});
            setBeachesLoading(false);
            setRadiusScrollerLocked(false);
            return;
        }
        
        let newNearestBeaches = {};
        
        for (const beach of beachesData) {
            // attempt to get the marine data for each location
            try {

                const lat = beach.geometry.location.lat;
                const lon = beach.geometry.location.lng;

                const marineResponse = await axios.get(
                    `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&current=wave_height,wave_direction,wave_period,wind_wave_height,wind_wave_direction,swell_wave_height,swell_wave_direction`
                );

                let data = marineResponse.data.current;
                let units = marineResponse.data.current_units;

                // If the location does not have marine data, then we can assume it is not a good location for surfing, so skip it all together
                const hasMarineData = data.wave_height !== null && data.wave_direction !== null && data.wave_period !== null && data.wind_wave_height !== null && data.wind_wave_direction !== null && data.swell_wave_height !== null && data.swell_wave_direction !== null

                if (hasMarineData) {
                    const weatherResponse = await axios.get(
                        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${process.env.REACT_APP_OWM_API_KEY}`
                    );
                    newNearestBeaches[beach.place_id] = {
                        display_name: beach.name,
                        place_id: beach.place_id,
                        lat: beach.geometry.location.lat,
                        lon: beach.geometry.location.lng,
                        rating: beach.rating,
                        temperature: `${Math.round(weatherResponse.data.main.temp)}°C`,
                        description: weatherResponse.data.weather[0].description,
                        waveHeight: `${data.wave_height} ${units.wave_height}`,
                        waveDirection: `${data.wave_direction} ${units.wave_direction}`,
                        wavePeriod: `${data.wave_period} ${units.wave_period}`,
                        windWaveHeight: `${data.wind_wave_height} ${units.wind_wave_height}`,
                        windWaveDirection: `${data.wind_wave_direction} ${units.wind_wave_direction}`,
                        swellWaveHeight: `${data.swell_wave_height} ${units.swell_wave_height}`,
                        swellWaveDirection: `${data.swell_wave_direction} ${units.swell_wave_direction}`,
                    };
                    // If the beach has an associated image, then we can use that instead of the stock photo:
                    if (beach.photos && beach.photos.length > 0) {
                        newNearestBeaches[beach.place_id].photo = beach.photos[0].photo_reference // there can be multiple images. For now, just take the first one.
                    }
                }
                
            } catch (error) {
                // Skip this beach - not a valid marine location
                console.log(`Skipping ${beach.display_name} - not a valid marine location or other error occurred`);
                continue;
            }
        }

        setNearestBeaches(newNearestBeaches);
        setBeachesLoading(false);
        setRadiusScrollerLocked(false);
    }, [coordinates, radius])

    // Filter beaches based on the selected filters
    const applyFilters = () => {
        if (!nearestBeaches.length) return;

        const filteredBeaches = nearestBeaches.filter(beach => {
            const { windWaveHeight, waveHeight, rating } = beach;

            let windCondition = true;
            let waveCondition = true;
            let crowdCondition = true;

            if (filters.wind) {
                const windValue = parseFloat(windWaveHeight);
                if (filters.wind === "Light") windCondition = windValue < 0.5;
                else if (filters.wind === "Medium") windCondition = windValue >= 0.5 && windValue <= 1.5;
                else if (filters.wind === "Strong") windCondition = windValue > 1.5;
            }

            if (filters.wave) {
                const waveValue = parseFloat(waveHeight);
                if (filters.wave === "Small") waveCondition = waveValue < 1.5;
                else if (filters.wave === "Medium") waveCondition = waveValue >= 1.5 && waveValue <= 3;
                else if (filters.wave === "Large") waveCondition = waveValue > 3;
            }

            if (filters.crowd) {
                if (filters.crowd === "Light") crowdCondition = rating >= 4;
                else if (filters.crowd === "Medium") crowdCondition = rating >= 2 && rating < 4;
                else if (filters.crowd === "Large") crowdCondition = rating < 2;
            }

            return windCondition && waveCondition && crowdCondition;
        });

        setNearestBeaches(filteredBeaches);
    };

    // Filter actions
    const handleClearAll = () => {
        setFilters({ wind: null, wave: null, crowd: null }); // Reset all filters
        setNearestBeaches({}); // Clear the displayed beaches
        fetchBeaches(); // Reload all beaches without filters
    };

    const handleCancel = () => {
        console.log("Filter action cancelled."); // Log the cancel action
        setFilters({ wind: null, wave: null, crowd: null }); // Reset all filters
    };

    const handleApply = () => {
        applyFilters(); // Apply the selected filters
    };



    // Effects
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (coordinates.lat && coordinates.lon) {
            setSelectedBeach(null);
            setNearestBeaches({});
            setMoreInfoSelected(false);
            setRadiusScrollerLocked(false);
            fetchBeaches();
        }
    }, [coordinates, fetchBeaches]);

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
        fetchData();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
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
                                            <option value="Light">Light</option>
                                            <option value="Medium">Medium</option>
                                            <option value="Large">Large</option>
                                        </select>
                                    </div>
                                </div>

                            </PopUp>

                            <div className = "radius-scroller">
                                {radiusScrollerLocked ? (
                                    <></>
                                ) : (
                                    <RadiusScroller
                                        initialRadius = {radius}
                                        setRadius = {setRadius}
                                    />
                                )}
                            </div>

                        </div>
                        {beachesLoading ?
                            (<p style={{ textAlign: 'center' }}>Loading forecast...</p>)
                            : Object.keys(nearestBeaches).length > 0 ? (
                                Object.values(nearestBeaches).map((beach, i) => (
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
                        {(moreInfoSelected) ? (
                            <BeachInfo
                                beachData={selectedBeach}
                            />) : (
                            <div className='clickOnBeach'>
                                <img className='waveIcon' src={wave} alt='Wave' />
                                <p className='infoText'>Click on beach<br />to see more info</p>
                            </div>)
                        }
                </div>
            </div>
        </div>
    );
};

export default SurferMode;
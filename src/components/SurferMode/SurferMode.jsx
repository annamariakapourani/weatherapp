//#region Imports
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PopUp from "../../utils/PopUp";
import BeachCard from './BeachCard';
import BeachInfo from './BeachInfo';
import { CurrentTime } from '../Shared/CurrentTime';
import SearchBar from '../Shared/SearchBar';
import './SurferMode.css';

// Icons
import homeIcon from "../../assets/homeIcon.png"
import warning from "../../assets/warning.png"
import sunIcon from "../../assets/sunIcon.png"
import sunCloudy from "../../assets/sunCloudy.png"
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
    rain: "Rain's fine, just watch for currents!",
    snow: "Snowy surf? Only for the bold!",
    fog: "Foggy lineup—stay aware!",
    clear: "Sunny and clean! Sunscreen up!",
    clouds: "Cloudy but surf's still up!",
    default: "Check the surf report!"
};

const quotes = [
    "Ride the wave, chase the sun, and love the ocean.",
    "Let the sea set you free and ride the waves.",
    "Life's a wave—catch it, ride it, and enjoy it.",
    "Sun, surf, salt, and sand—happiness is where waves land.",
    "Keep calm, paddle on, and ride the waves of life."
];
//#endregion

function SurferMode() {
    const [city, setCity] = useState('London');
    const [weatherData, setWeatherData] = useState(null);
    const [weatherIcon, setWeatherIcon] = useState(sunIcon);
    const [isLoading, setIsLoading] = useState(false);
    const [coordinates, setCoordinates] = useState({ lat: null, lon: null });
    const [error, setError] = useState(null);
    const [popupButton, setPopupButton] = useState(false);
    const [nearestBeaches, setNearestBeaches] = useState([]);
    const [allBeaches, setAllBeaches] = useState([]); // Store the original unfiltered beaches
    const [beachesLoading, setBeachesLoading] = useState(false);
    const [selectedBeach, setSelectedBeach] = useState(null);
    const [moreInfoSelected, setMoreInfoSelected] = useState(false);
    const [quote, setQuote] = useState(quotes[0]);
    const [filters, setFilters] = useState({
        temperature: null,
        wind_speed: null,
        humidity: null
    });
    const limit = 15; // Increased to get more beaches since some might be filtered out

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

    //#region Functions
    // Fetch data for the selected city
    const fetchData = useCallback(async (cityName) => {
        if (!cityName) return;

        setIsLoading(true);
        try {
            setError(null);
            const response = await axios.get(
                `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=${process.env.REACT_APP_OWM_API_KEY}`
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
    }, [getWeatherIcon]);

    // get the nearest beaches
    const fetchBeaches = useCallback(async () => {
        if (!coordinates.lat || !coordinates.lon) {
            return;
        }
        setBeachesLoading(true);

        let response;
        try {
            const location = city.trim().replace(/\s+/g, '+');
            response = await axios.get(`https://nominatim.openstreetmap.org/search?q=beach+near+${encodeURIComponent(location)}&format=json&limit=${limit}`)
        } catch (error) {
            console.error("Error fetching the beaches:", error)
            setNearestBeaches([]);
            setAllBeaches([]);
            setBeachesLoading(false)
            return;
        }
        
        const beachesData = response.data;
        if (beachesData.length === 0) {
            console.log('No beaches found...');
            setNearestBeaches([]);
            setAllBeaches([]);
            setBeachesLoading(false);
            return;
        }
        
        let newNearestBeaches = [];
        let validBeachCount = 0;
        
        for (const beach of beachesData) {
            // First check if the location is near water before proceeding
            try {
                const weatherResponse = await axios.get(
                    `https://api.openweathermap.org/data/2.5/weather?lat=${beach.lat}&lon=${beach.lon}&units=metric&appid=${process.env.REACT_APP_OWM_API_KEY}`
                );
                // console.log(weatherResponse.data)
                
                const beachInfo = {
                    display_name: beach.display_name,
                    lat: beach.lat,
                    lon: beach.lon,
                    temperature: Math.round(weatherResponse.data.main.temp),
                    description: weatherResponse.data.weather[0].description,
                    main: {
                        feels_like: Math.round(weatherResponse.data.main.feels_like),
                        humidity: weatherResponse.data.main.humidity,
                        pressure: weatherResponse.data.main.pressure,
                        temp_max: Math.round(weatherResponse.data.main.temp_max),
                        temp_min: Math.round(weatherResponse.data.main.temp_min),
                    },
                    weather: {
                        description: weatherResponse.data.weather[0].description,
                        icon: getWeatherIcon(weatherResponse.data.weather[0].id),
                        id: weatherResponse.data.weather[0].id,
                        main: weatherResponse.data.weather[0].main
                    },
                    wind: {
                        deg: weatherResponse.data.wind.deg,
                        speed: Math.round(weatherResponse.data.wind.speed),
                    }
                };
                
                // Calculate beach rating based on weather conditions
                beachInfo.rating = calculateBeachRating(beachInfo);
                
                newNearestBeaches[validBeachCount++] = beachInfo;
            } catch (error) {
                // Skip this beach - not a valid marine location
                console.log(`Skipping ${beach.display_name} - not a valid marine location or other error occurred`);
                continue;
            }
        }

        setNearestBeaches(newNearestBeaches);
        setAllBeaches(newNearestBeaches); // Store the original beaches
        setBeachesLoading(false);
    }, [coordinates, city, getWeatherIcon])

    // Filter beaches based on the selected filters
    function applyFilters() {
        if (!allBeaches.length) return;

        const filteredBeaches = allBeaches.filter(beach => {
            // Temperature filter
            let tempCondition = true;
            if (filters.temperature) {
                const temp = beach.temperature;
                if (filters.temperature === "Hot") tempCondition = temp > 25;
                else if (filters.temperature === "Warm") tempCondition = temp >= 18 && temp <= 25;
                else if (filters.temperature === "Cold") tempCondition = temp < 18;
            }

            // Wind speed filter
            let windCondition = true;
            if (filters.wind_speed) {
                const windSpeed = beach.wind.speed;
                if (filters.wind_speed === "Strong") windCondition = windSpeed > 6;
                else if (filters.wind_speed === "Mild") windCondition = windSpeed >= 2 && windSpeed <= 6;
                else if (filters.wind_speed === "None") windCondition = windSpeed < 2;
            }

            // Humidity filter
            let humidityCondition = true;
            if (filters.humidity) {
                const humidity = beach.main.humidity;
                if (filters.humidity === "Light") humidityCondition = humidity < 50;
                else if (filters.humidity === "Medium") humidityCondition = humidity >= 50 && humidity <= 75;
                else if (filters.humidity === "Large") humidityCondition = humidity > 75;
            }

            return tempCondition && windCondition && humidityCondition;
        });

        setNearestBeaches(filteredBeaches);
        
        // Give feedback if no beaches match the criteria
        if (filteredBeaches.length === 0) {
            console.log("No beaches matched your filter criteria");
        }
    };

    function calculateBeachRating(beach) {
        let rating = 0;
        const maxRating = 5;
        
        // Temperature rating (0-2 points)
        const temp = beach.temperature; // already rounded
        if (temp >= 22 && temp <= 30) {
            rating += 2; // Perfect temperature for beach activities
        } else if ((temp >= 18 && temp < 22) || (temp > 30 && temp <= 35)) {
            rating += 1; // Good but not ideal
        }
        
        // Wind speed rating (0-2 points)
        const windSpeed = beach.wind.speed;
        if (windSpeed <= 3) {
            rating += 2; // Light breeze, perfect
        } else if (windSpeed > 3 && windSpeed <= 6) {
            rating += 1; // Moderate wind, acceptable
        }
        
        // Humidity rating (0-1 point)
        const humidity = beach.main.humidity;
        if (humidity >= 40 && humidity <= 70) {
            rating += 1; // Comfortable humidity
        }
        
        return Math.min(Math.max(Math.round(rating), 1), maxRating); // Ensure rating is between 1-5
    };
    //#endregion

    //#region Event Handlers
    // Filter actions
    const handleClearAll = () => {
        setFilters({ temperature: null, wind_speed: null, humidity: null }); // Reset all filters
        setNearestBeaches(allBeaches); // Restore all beaches from backup
    };

    const handleCancel = () => {
        setFilters({ temperature: null, wind_speed: null, humidity: null }); // Reset all filters
        setPopupButton(false); // Close the popup
    };

    const handleApply = () => {
        applyFilters(); // Apply the selected filters
    };

    // Effects
    useEffect(() => {
        fetchData(city);
    }, []);

    useEffect(() => {
        if (coordinates.lat && coordinates.lon) {
            fetchBeaches();
            setSelectedBeach(null);
            setNearestBeaches([]);
            setMoreInfoSelected(false);
        }
    }, [coordinates, fetchBeaches]);

    // Handle city selection from SearchBar
    const handleCitySelect = (selectedCity) => {
        setCity(selectedCity);
        fetchData(selectedCity);
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
    //#endregion

    //#region Render
    return (
        <div className="container containerSurfers">
            <div className='header'>
                {/* Popup Message on top left */}
                <div className='popUpMessage'>
                    <p className='message'>
                        {isLoading ? "Loading..." : weatherData ? getPopUpMessage(weatherData.weather[0].id) : "Check the weather!"}
                    </p>
                    <img className='warningIcon' src={warning} alt='Notification' />
                </div>
                {/* Popup Message on top left */}

                {/* Searchbar */}
                <SearchBar 
                    onCitySelect={handleCitySelect} 
                    initialCity={city} 
                />
                {/* Searchbar */}

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

            {/* Default Info */}
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
            {/* Default Info */}

            <div className='beaches'>
                <div className='cards'>
                    <div className='cardsContainer'>
                        <div className='filterDetails'>
                            {/* Filters */}
                            <div className='filter' onClick={() => setPopupButton(true)}>
                                <img className='filterIcon' src={filterIcon} alt='Filter' />
                            </div>

                            <PopUp trigger={popupButton} setTrigger={setPopupButton} onClearAll={handleClearAll} onCancel={handleCancel} onApply={handleApply}>
                            <h3 className='name'>Filters</h3>

                            <div className='filterOptions'>
                                <div className='filterRow'>
                                    <label>Temperature</label>
                                    <select value={filters.temperature || ""} onChange={(e) => setFilters({ ...filters, temperature: e.target.value })}>
                                        <option value="">Select filter</option>
                                        <option value="Hot">Hot</option>
                                        <option value="Warm">Warm</option>
                                        <option value="Cold">Cold</option>
                                    </select>
                                </div>

                                <div className='filterRow'>
                                    <label>Wind speed</label>
                                    <select value={filters.wind_speed || ""} onChange={(e) => setFilters({ ...filters, wind_speed: e.target.value })}>
                                        <option value="">Select filter</option>
                                        <option value="Strong">Strong</option>
                                        <option value="Mild">Mild</option>
                                        <option value="None">None</option>
                                    </select>
                                </div>

                                <div className='filterRow'>
                                    <label>Humidity</label>
                                    <select value={filters.humidity || ""} onChange={(e) => setFilters({ ...filters, humidity: e.target.value })}>
                                        <option value="">Select filter</option>
                                        <option value="Light">Light</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Large">Large</option>
                                    </select>
                                </div>
                            </div>
                            {/* Filters */}
                            </PopUp>
                        </div>

                        {/* Beach card */}
                        {beachesLoading ?
                            (<p style={{ textAlign: 'center' }}>Loading forecast...</p>)
                            : nearestBeaches.length > 0 ? (
                                nearestBeaches.map(beach => (
                                    <BeachCard
                                        beachInfo={beach}
                                        onArrowClick={onArrowClick}
                                    />
                                ))
                            ) : (
                                <p>No beaches found...</p>
                            )}
                        {/* Beach card */}
                    </div>
                </div>
                
                {/* Beach Info */}
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
                {/* Beach Info */}
            </div>
        </div>
    );
};
//#endregion

export default SurferMode;
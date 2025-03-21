import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import PopUp from "../../utils/PopUp";
import { CurrentTime } from '../../utils/CurrentTime';
import BeachCard from './BeachCard';
import BeachInfo from './BeachInfo';
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
    const [dailyForecast, setDailyForecast] = useState(null);
    const [weatherIcon, setWeatherIcon] = useState(sunIcon);
    const [isLoading, setIsLoading] = useState(false);
    const [coordinates, setCoordinates] = useState({ lat: null, lon: null });
    const [error, setError] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const FORECAST_DAYS = 5;
    const [popupButton, setPopupButton] = useState(false);
    const [nearestBeaches, setNearestBeaches] = useState({});
    const [beachesLoading, setBeachesLoading] = useState(false);
    const [selectedBeach, setSelectedBeach] = useState(null);
    const [moreInfoSelected, setMoreInfoSelected] = useState(false);

    const [quote, setQuote] = useState(quotes[0]);

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

    // Give n day forecast at given location
    const fetchDailyForecast = useCallback(async () => {
        if (!coordinates.lat || !coordinates.lon) return;

        setIsLoading(true);
        try {
            setError(null);
            const response = await axios.get(
                `https://api.openweathermap.org/data/2.5/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&units=metric&cnt=${FORECAST_DAYS}&appid=${process.env.REACT_APP_OWM_API_KEY}`
            );
            setDailyForecast({
                list: response.data.list,
                timezone: response.data.city.timezone
            });
        } catch (error) {
            setError('Failed to fetch forecast data');
            console.error("Error fetching forecast data:", error);
        } finally {
            setIsLoading(false);
        }
    }, [coordinates, FORECAST_DAYS]);

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
        setBeachesLoading(true);

        // Helper method
        const generateRating = (data) => {
            const {
                wave_height, // ideal wave height is between 1.5 and 3m
                wave_period, //ideal period is 10-15 seconds
                wave_direction, // wave and swell direction should align (be within 30 degrees)
                wind_wave_height, // less that 0.5m is ideal
                wind_wave_direction, // ideally should satisify Math.abs(wind_wave_direction - 180) <= 45
                swell_wave_height, // 1 - 2.5 is ideal
                swell_wave_direction // compared with wave_direction (look at its comment)
            } = data;

            let rating = 0;

            if (wave_height >= 1.5 && wave_height <= 3) rating += 1;
            if (wave_period >= 10 && wave_period <= 15) rating += 1;
            if (Math.abs(wave_direction - swell_wave_direction) <= 30) rating += 1;
            if (wind_wave_height< 0.5) rating += 1;
            if (Math.abs(wind_wave_direction - 180) <= 45) rating += 1;
            if (swell_wave_height >= 1 && swell_wave_height <= 2.5) rating += 1;

            // normalise to make it make it between 0-5, and round to 1 dp

            rating = rating * 5 / 6;
            rating = Math.round(rating * 10) / 10

            return rating;
        };

        const radius = 50000; // (in meters). Finds all the beaches within this radius
        const { lat, lon } = coordinates;
        let response;
        try {
            response = await axios.get(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(`[out:json];(node(around:${radius},${lat},${lon})["natural"="beach"];way(around:50000,lat,lon)["natural"="beach"];relation(around:50000,lat,lon)["natural"="beach"];);out;`)}`);
        } catch (error) {
            console.error("Error fetching the beaches:", error)
            setNearestBeaches({});
            setBeachesLoading(false)
            return;
        }
        const beachesData = response.data.elements;
        if (beachesData.length === 0) {
            console.log('No beaches found...');
            setNearestBeaches({});
            setBeachesLoading(false);
            return;
        }
        // if there are beaches, store them each in the object and update the state
        // Assumes that there are no beaches with the same name in the given radius
        let beachCounter = 0;
        const newNearestBeaches = {};
        /*
        TODO: some of the beaches generated return null values. checking them on maps shows that they are not really proper beaches. Should check that a beach is an actual beach, or delete them if they return null values?
        Also, some beaches are really close to eachother so end up producing the exact same data values. could leave it like that or change it.
        */
        for (const beach of beachesData) {
            let name = beach.tags.name || `Beach ${++beachCounter}`;

            newNearestBeaches[name] = {
                name: name,
                lat: beach.lat,
                lon: beach.lon,
                //info: "Lorem ipsum dolor sit amet, consectetur adipiscing elit"
            };

            // Now get the marine data for each beach
            try {
                response = await axios.get(`https://marine-api.open-meteo.com/v1/marine?latitude=${beach.lat}&longitude=${beach.lon}&current=wave_height,wave_direction,wave_period,wind_wave_height,wind_wave_direction,swell_wave_height,swell_wave_direction`);
                newNearestBeaches[name].hasMarineData = true;

                let data = response.data.current;
                let units = response.data.current_units;

                newNearestBeaches[name].updatedAt = `${data.time} ${units.time}`;
                newNearestBeaches[name].waveHeight = `${data.wave_height} ${units.wave_height}`;
                newNearestBeaches[name].waveDirection = `${data.wave_direction} ${units.wave_direction}`;
                newNearestBeaches[name].wavePeriod = `${data.wave_period} ${units.wave_period}`;
                newNearestBeaches[name].windWaveHeight = `${data.wind_wave_height} ${units.wind_wave_height}`;
                newNearestBeaches[name].windWaveDirection = `${data.wind_wave_direction} ${units.wind_wave_direction}`;
                newNearestBeaches[name].swellWaveHeight = `${data.swell_wave_height} ${units.swell_wave_height}`;
                newNearestBeaches[name].swellWaveDirection = `${data.swell_wave_direction} ${units.swell_wave_direction}`;
                newNearestBeaches[name].rating = generateRating(data);
            } catch (error) {
                // try the next beach if cannot retrieve data
                console.log("Error fetching marine data for " + name);
                newNearestBeaches[name].hasMarineData = false;
            }
        }
        setNearestBeaches(newNearestBeaches);
        setBeachesLoading(false);
    }, [coordinates])

    // Effects
    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (coordinates.lat && coordinates.lon) {
            fetchDailyForecast();
            fetchBeaches();
            setSelectedBeach(null);
            setNearestBeaches({});
            setMoreInfoSelected(false);
        }
    }, [coordinates, fetchDailyForecast, fetchBeaches]);

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
    const onArrowClick = (beachName) => {
        if (selectedBeach && moreInfoSelected && beachName === selectedBeach.name) {
            setMoreInfoSelected(false);
        }
        else {
            setSelectedBeach(nearestBeaches[beachName]);
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

                            <PopUp trigger={popupButton} setTrigger={setPopupButton}>
                                <h3 className='name'>Filters</h3>

                                <div className='filterOptions'>
                                    <div className='filterRow'>
                                        <label>Wind</label>
                                        <select>
                                            <option>Select filter</option>
                                            <option>Light</option>
                                            <option>Medium</option>
                                            <option>Strong</option>
                                        </select>
                                    </div>

                                    <div className='filterRow'>
                                        <label>Wave</label>
                                        <select>
                                            <option>Select filter</option>
                                            <option>Small</option>
                                            <option>Medium</option>
                                            <option>Large</option>
                                        </select>
                                    </div>

                                    <div className='filterRow'>
                                        <label>Crowd</label>
                                        <select>
                                            <option>Select filter</option>
                                            <option>Light</option>
                                            <option>Medium</option>
                                            <option>Large</option>
                                        </select>
                                    </div>

                                    <div className='filterRow'>
                                        <label>Wind</label>
                                        <select>
                                            <option>Select filter</option>
                                            <option>Low</option>
                                            <option>Medium</option>
                                            <option>High</option>
                                        </select>
                                    </div>
                                </div>

                            </PopUp>

                        </div>
                        {beachesLoading ?
                            (<p className="loadingBeaches">Searching<span>.</span><span>.</span><span>.</span></p>)
                            : Object.keys(nearestBeaches).length > 0 ? (
                                Object.keys(nearestBeaches).map(beachName => (
                                    <BeachCard
                                        key={beachName}
                                        beachName={beachName}
                                        rating={nearestBeaches[beachName].rating}
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
                    <div className='info'>
                        {(moreInfoSelected) ? (
                            <BeachInfo
                                beachData={selectedBeach}
                            />) : (
                            <div>
                                <img className='waveIcon' src={wave} alt='Wave' />
                                <p className='infoText'>Click on beach<br />to see more info</p>
                            </div>)
                        }
                    </div>
                </div>

            </div>

        </div>
    );
};

export default SurferMode;
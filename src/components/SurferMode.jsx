import './SurferMode.css';
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


// Icons
import homeIcon from "../assets/homeIcon.png"
import warning from "../assets/warning.png"
import sunIcon from "../assets/sunIcon.png"
import visibility from "../assets/visibility.png"
import humidity from "../assets/humidity.png"
import sunrise from "../assets/sunrise.png"
import sunset from "../assets/sunset.png"
import sunCloudy from "../assets/sunCloudy.png"
import IconSearch from "../assets/IconSearch.png"
import filterIcon from "../assets/filterIcon.png"


// Images
import thunderstorm from "../assets/thunderstorm.png"
import drizzle from "../assets/drizzle.png"
import rain from "../assets/rain.png"
import snow from "../assets/snow.png"
import fog from "../assets/fog.png"
import CamberSands from "../assets/CamberSands.png"
import star from "../assets/star.png"
import quote from "../assets/quote.png"
import wave from "../assets/wave.png"





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
    thunderstorm: "There is a thunderstorm coming! Stay inside.",
    drizzle: "Do not forget your umbrella!",
    rain: "Do not forget your umbrella!",
    snow: "It is snowing! Go outside make a snowman!",
    fog: "It is foggy! Drive safe!",
    clear: "Do not forget your sunscreen!",
    clouds: "Cloudy skies ahead!",
    default: "Check the weather!"
};


function CurrentTime() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(new Date());
        }, 1000); // Update time every second
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{marginTop: '1em'}}>
            <p>{time.toLocaleTimeString()} {time.toDateString()}</p>
        </div>
    );
}

function WeatherInfoCard({ icon, label, value }) {
    return (
        <div className={label.toLowerCase().replace(' ', '')}>
            {icon && <img src={icon} alt={label} />}
            <p>{value}</p>
        </div>
    );
}


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

    const formatTime = (timestamp, timezone = 0) => {
        const date = new Date((timestamp + timezone) * 1000);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

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

    // Effects
    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (coordinates.lat && coordinates.lon) fetchDailyForecast();
    }, [coordinates, fetchDailyForecast]);

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



    return (
        <div className="container2">
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
                    <img src={homeIcon} alt='Switch to normal mode'/>
                </div>
            </div>

            <CurrentTime />
                        
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


            <div className='filter'>
                <img className='filterIcon' src={filterIcon}/>
            </div>

            
            <div className='cardsContainer'>
                <div className='beachCard'>
                    <img className='beachImg' src={CamberSands}/>
                    <div className='infoSection'>
                        <p className='beachName'>Camber Sands</p>
                        <p className='beachInfo'>Lorem ipsum dolor sit amet, consectetur adipiscing elit</p>                        
                        <div className='beachRating'> 
                            <p className='rating'>4.5</p>
                            <img className='star' src={star}/>
                        </div>                      
                    </div>
                </div>
            </div>

            <div className='cardsContainer'>
            <div className='beachCard'>
                    <img className='beachImg' src={CamberSands}/>
                    <div className='infoSection'>
                        <p className='beachName'>Camber Sands</p>
                        <p className='beachInfo'>Lorem ipsum dolor sit amet, consectetur adipiscing elit</p>                        
                        <div className='beachRating'> 
                            <p className='rating'>4.5</p>
                            <img className='star' src={star}/>
                        </div>                      
                    </div>
                </div>
            </div>
            
            <div className='quoteSection'>
                <img className='quoteIcon' src={quote}/>
                {/* <p className='quote'>Good vibes and good tides</p> */}
                <p className='quote'>Tides?????????????????????????</p>
            </div>

            <div className='info'>
                <img className='waveIcon' src={wave}/>
                <p className='infoText'>Click on beach<br/>to see more info</p>
            </div>
            

        </div>
    );
};

export default SurferMode;
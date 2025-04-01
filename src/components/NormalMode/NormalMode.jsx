//#region Imports
// Imports
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './NormalMode.css'
import { CurrentTime } from '../Shared/CurrentTime';
import SearchBar from '../Shared/SearchBar';

// Icons
import sunIcon from "../../assets/sunIcon.png"
import surferIcon from "./../../assets/surferIcon.png"
import bellIcon from "../../assets/bellIcon.png"
import visibility from "../../assets/visibility.png"
import humidity from "../../assets/humidity.png"
import sunrise from "../../assets/sunrise.png"
import sunset from "../../assets/sunset.png"
import sunCloudy from "../../assets/sunCloudy.png"

// Images
import thunderstorm from "../../assets/thunderstorm.png"
import drizzle from "../../assets/drizzle.png"
import rain from "../../assets/rain.png"
import snow from "../../assets/snow.png"
import fog from "../../assets/fog.png"

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
//#endregion

//#region Components
function WeatherInfoCard({ icon, label, value }) {
    return (
        <div className={label.toLowerCase().replace(' ', '')}>
            {icon && <img src={icon} alt={label} draggable={false}/>}
            <p>{value}</p>
        </div>
    );
}

function DayForecast({ day, index, getWeatherIcon }) {
    return (
        <div className='day'>
            <img src={getWeatherIcon(day.weather[0].id)} alt={day.weather[0].description} />
            <p>{Math.round(day.main.temp)}°</p>
            <p>{new Date(new Date().setDate(new Date().getDate() + index + 1)).toLocaleDateString('en-US', { weekday: 'short' })}</p>
        </div>
    );
}
//#endregion

const NormalMode = () => {
    const [city, setCity] = useState('London');
    const [weatherData, setWeatherData] = useState(null);
    const [dailyForecast, setDailyForecast] = useState(null);
    const [weatherIcon, setWeatherIcon] = useState(sunIcon);
    const [isLoading, setIsLoading] = useState(false);
    const [coordinates, setCoordinates] = useState({ lat: null, lon: null });
    const [error, setError] = useState(null);
    const FORECAST_DAYS = 5;

    const navigate = useNavigate();

    //#region Functions
    // Helper functions
    const getWeatherIcon = useCallback((weatherId) => {
        for (const [, range] of Object.entries(WEATHER_ICONS)) {
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
    //#endregion

    //#region Effects
    // Effects
    useEffect(() => {
        fetchData(city);
    }, []);

    useEffect(() => {
        if (coordinates.lat && coordinates.lon) fetchDailyForecast();
    }, [coordinates, fetchDailyForecast]);

    // Handle city selection from SearchBar
    const handleCitySelect = (selectedCity) => {
        setCity(selectedCity);
        fetchData(selectedCity);
    };
    //#endregion

    //#region Render
    return (
        <div className="container">
            <div className='header'>
                <div className='popUpMessage'>
                    <p className='message'>
                        {isLoading 
                            ? "Loading..." 
                            : weatherData 
                                ? getPopUpMessage(weatherData.weather[0].id) 
                                : "Check the weather!"}
                    </p>
                    <img className='bellIcon' src={bellIcon} alt='Notification' />
                </div>

                <SearchBar 
                    onCitySelect={handleCitySelect} 
                    initialCity={city} 
                />

                <div 
                    className='switchMode' 
                    onClick={() => navigate('/surfer')}
                    role="button" 
                    tabIndex={0} 
                    aria-label="Switch to surfer mode"
                    onKeyDown={(e) => e.key === 'Enter' && navigate('/surfer')}
                >
                    <img src={surferIcon} alt='Switch to surfer mode'/>
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

                    <div className='otherInfo'>
                        <WeatherInfoCard 
                            label="Feels Like" 
                            value={weatherData ? `Feels like: ${Math.round(weatherData.main.feels_like)}°` : '--'} 
                        />
                        <WeatherInfoCard 
                            icon={visibility} 
                            label="Visibility" 
                            value={weatherData ? `${weatherData.visibility/1000} km` : '--'} 
                        />
                        <WeatherInfoCard 
                            icon={humidity} 
                            label="Humidity" 
                            value={weatherData ? `${weatherData.main.humidity}%` : '--'} 
                        />
                        <WeatherInfoCard 
                            icon={sunrise} 
                            label="Sunrise" 
                            value={weatherData?.sys?.sunrise 
                                ? formatTime(weatherData.sys.sunrise, weatherData.timezone)
                                : '--'} 
                        />
                        <WeatherInfoCard 
                            icon={sunset} 
                            label="Sunset" 
                            value={weatherData?.sys?.sunset 
                                ? formatTime(weatherData.sys.sunset, weatherData.timezone)
                                : '--'} 
                        />
                    </div>

                    <div className='daysInfo'>
                        {isLoading ? (
                            <p>Loading forecast...</p>
                        ) : error ? (
                            <p className="error">{error}</p>
                        ) : dailyForecast?.list ? (
                            dailyForecast.list.map((day, index) => (
                                <DayForecast 
                                    key={index}
                                    day={day}
                                    index={index}
                                    getWeatherIcon={getWeatherIcon}
                                />
                            ))
                        ) : (
                            <p>Forecast unavailable</p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};
//#endregion

export default NormalMode;
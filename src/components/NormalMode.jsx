import './NormalMode.css'
import React from 'react';
import IconSearch from "../assets/IconSearch.png"
import surferIcon from "../assets/surferIcon.png"
import bellIcon from "../assets/bellIcon.png"
import sunIcon from "../assets/sunIcon.png"
import visibility from "../assets/visibility.png"
import humidity from "../assets/humidity.png"
import sunrise from "../assets/sunrise.png"
import sunset from "../assets/sunset.png"
import sunCloudy from "../assets/sunCloudy.png"
import axios from 'axios';
import { useEffect, useState, useCallback } from 'react';

import thunderstorm from "../assets/thunderstorm.png"
import drizzle from "../assets/drizzle.png"
import rain from "../assets/rain.png"
import snow from "../assets/snow.png"
import fog from "../assets/fog.png"


const NormalMode = () => {
    const [city, setCity] = useState('London');
    const [weatherData, setWeatherData] = useState(null);
    const [dailyForecast, setDailyForecast] = useState(null);
    const [weatherIcon, setWeatherIcon] = useState();
    const [coordinates, setCoordinates] = useState({ lat: null, lon: null });
    const [error, setError] = useState(null);
    const FORECAST_DAYS = 3;

    // Weather icon mapping function remains the same
    const getWeatherIcon = (weatherId) => {
        if (weatherId >= 200 && weatherId <= 232) return thunderstorm;
        if (weatherId >= 300 && weatherId <= 321) return drizzle;
        if (weatherId >= 500 && weatherId <= 531) return rain;
        if (weatherId >= 600 && weatherId <= 622) return snow;
        if (weatherId >= 701 && weatherId <= 781) return fog;
        if (weatherId === 800) return sunIcon;
        if (weatherId >= 801 && weatherId <= 804) return sunCloudy;
        return sunIcon;
    };

    const formatTime = (timestamp, timezone) => {
        const date = new Date((timestamp + timezone) * 1000);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    const fetchData = useCallback(async () => {
        if (!city) return;
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
            setError('Failed to fetch weather data');
            console.error("Error fetching data:", error);
        }
    }, [city]);

    const fetchDailyForecast = useCallback(async () => {
        if (!coordinates.lat || !coordinates.lon) return;
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
        }
    }, [coordinates]);

    useEffect(() => {
        if (city) fetchData();
    }, [city, fetchData]);

    useEffect(() => {
        if (coordinates.lat && coordinates.lon) fetchDailyForecast();
    }, [coordinates, fetchDailyForecast]);

    const handleInputChange = (e) => setCity(e.target.value);

    const handleSubmit = (e) => {
        e.preventDefault();
        fetchData();
    };

    return (
        <div className="container">
            <form onSubmit={handleSubmit} className='searchBar'>
                <input type='text' placeholder='Search a city' value={city} onChange={handleInputChange}/>
                <button type="submit">
                    <img className='searchIcon' src={IconSearch} alt='Search' />
                </button>
            </form>

            <div className='switchMode'>
                <img src={surferIcon} alt=''/>
            </div>

            <div className='popUpMessage'>
                <p className='message'>Don&apos;t forget<br/>your sunscreen!</p>
                <img className='bellIcon' src={bellIcon} alt=''/>
            </div>

            <div className='weatherInfo'>
                <img className='weatherIcon' src={weatherIcon} alt='' />
                <p className='temp'>{Math.round(weatherData?.main?.temp)}°</p>
                <p className='desc'>{weatherData?.weather?.[0]?.description}</p>
                <p className='city'>{weatherData?.name}</p>
            </div>

            <div className='otherInfo'>
                <div className='feelsLike'>
                    <p>Feels Like: {Math.round(weatherData?.main?.feels_like)}°C</p>
                </div>
                <div className='visibility'>
                    <img src={visibility} alt=''/>
                    <p>{weatherData?.visibility}</p>
                </div>
                <div className='humidity'>
                    <img src={humidity} alt=''/>
                    <p>{weatherData?.main?.humidity}%</p>
                </div>
                <div className='sunrise'>
                    <img src={sunrise} alt='' />
                    <p>{weatherData?.sys?.sunrise && formatTime(weatherData.sys.sunrise, weatherData.timezone)}</p>
                </div>
                <div className='sunset'>
                    <img src={sunset} alt='' />
                    <p>{weatherData?.sys?.sunset && formatTime(weatherData.sys.sunset, weatherData.timezone)}</p>
                </div>
            </div>
            <div className='threeDayInfo'>
                {error ? (
                    <p className="error">{error}</p>
                ) : dailyForecast?.list ? (
                    dailyForecast.list.map((day, index) => (
                        <div key={index} className='day'>
                            <p>{new Date((day.dt + (index*24*60*60)) * 1000).toLocaleDateString('en-US', { weekday: 'short' })}</p>
                            <img src={getWeatherIcon(day.weather[0].id)} alt={day.weather[0].description} />
                            <p>{Math.round(day.main.temp)}°</p>
                        </div>
                    ))
                ) : (
                    <p>Loading forecast...</p>
                )}
            </div>
        </div>
    )
}

export default NormalMode;
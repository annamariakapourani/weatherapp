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
    const [weatherIcon, setWeatherIcon] = useState();
    const getWeatherIcon = (weatherId) => {
        if (weatherId >= 200 && weatherId <= 232) {
          return thunderstorm;
        } else if (weatherId >= 300 && weatherId <= 321) {
          return drizzle; 
        } else if (weatherId >= 500 && weatherId <= 531) {
          return rain; 
        } else if (weatherId >= 600 && weatherId <= 622) {
          return snow; // A custom icon for snow
        } else if (weatherId >= 701 && weatherId <= 781) {
          return fog;
        } else if (weatherId === 800) {
          return sunIcon; 
        } else if (weatherId >= 801 && weatherId <= 804) {
          return sunCloudy; 
        } else {
          return sunIcon; 
        }
      };

    const fetchData = useCallback( async () => {
        if (!city) return;
        try{
            const response = await axios.get(
                `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=e1d56bfaafc0e49d4263f9a2786c370b`
            );
            setWeatherData(response.data);
            console.log(response.data);
            const weatherId = response.data.weather[0].id; // Get weather ID from API
            const icon = getWeatherIcon(weatherId);
            setWeatherIcon(icon) ;           
        }catch(error){
            console.log("Error fetching data", error);
        }
    }, [city]);

    useEffect(() => {
        if (city) {
            fetchData();
        }
    }, []); 
    
    const handleInputChange = (e) => {
        setCity(e.target.value);
    };

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
            <p className='temp'>{weatherData?.main?.temp}°</p>
            <p className='desc'>{weatherData?.weather?.[0]?.description}</p>
            <p className='city'>{weatherData?.name}</p>
        </div>

        <div className='otherInfo'>
            <div className='feelsLike'>
                <p>Feels Like: {weatherData?.main?.feels_like}°C</p>
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
                <p>{weatherData?.sys?.sunrise && new Date(weatherData?.sys?.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            <div className='sunset'>
                <img src={sunset} alt='' />
                <p>{weatherData?.sys?.sunset && new Date(weatherData?.sys?.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
        </div>

        <div className='threeDayInfo'>
            <div className='dayOne'>
                <img className='sunIcon' src={sunIcon} alt=''/>
                <p>27°</p>
                <p>12:00</p>
            </div>
            <div className='dayTwo'>
                <img className='sunCloudy' src={sunCloudy} alt=''/>
                <p>28°</p>
                <p>13:00</p>
            </div>

            <div className='dayThree'>
                <img className='sunIcon' src={sunIcon} alt=''/>
                <p>30°</p>
                <p>14:00</p>
            </div>
        </div>


    </div>
  )
}

export default NormalMode;
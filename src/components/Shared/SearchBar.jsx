import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import IconSearch from "../../assets/IconSearch.png";

const SearchBar = ({ onCitySelect, initialCity = '' }) => {
    const [city, setCity] = useState(initialCity);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

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

    useEffect(() => {
        // Update internal state if initialCity changes from parent
        setCity(initialCity);
    }, [initialCity]);

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
        onCitySelect(suggestion.name);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onCitySelect(city);
    };

    return (
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
    );
};

export default SearchBar;
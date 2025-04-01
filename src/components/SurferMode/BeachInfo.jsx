import './BeachInfo.css'

function BeachInfo({beachData}) {
    if (!beachData) {
        return <div className='beachMoreInfo'>No beach data available</div>;
    }
    
    return (
        <div className='beachMoreInfo'>
            <div className='beachName'>
                <p>{beachData.display_name ? beachData.display_name.split(', ')[0] : 'Unknown Beach'}</p>
            </div>
            {beachData ? (
                <>
                    <div className='extraInfo'>
                        <a
                            href={`https://www.google.com/maps?q=${beachData.lat},${beachData.lon}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="googleMapsLink"
                        >
                            Open in Google Maps
                        </a>
                        <div className="map-container">
                            <iframe
                                title="Beach Location"
                                width="100%"
                                height="100%"
                                src={`https://www.openstreetmap.org/export/embed.html?bbox=${(parseFloat(beachData.lon) - 0.01).toFixed(6)},${(parseFloat(beachData.lat) - 0.01).toFixed(6)},${(parseFloat(beachData.lon) + 0.01).toFixed(6)},${(parseFloat(beachData.lat) + 0.01).toFixed(6)}&layer=mapnik&marker=${beachData.lat},${beachData.lon}`}
                                style={{ border: "1px solid #ccc" }}
                                allowFullScreen
                            />
                        </div>
                    </div>
                    <div className='beachDetailsDivMoreInfo'>
                        <div className='beachDetailsTitlesDivMoreInfo'>
                            <ul className='beachDetailsTitlesMoreInfo'>
                                {beachData.temperature && <li>Temperature</li>}
                                {beachData.main.feels_like && <li>Feels like</li>}
                                {beachData.main.humidity && <li>Humidity</li>}
                                {beachData.main.pressure && <li>Pressure</li>}
                                {beachData.main.temp_min && <li>Min temperature</li>}
                                {beachData.main.temp_max && <li>Max temperature</li>}

                                {beachData.wind.deg && <li>Wind direction</li>}
                                {beachData.wind.speed && <li>Wind speed</li>}
                            </ul>
                        </div>
                        <div className='beachDetailsResultsDivMoreInfo'>
                            <ul className='beachDetailsResultsMoreInfo'>
                                {beachData.temperature && <li>{beachData.temperature}°C</li>}
                                {beachData.main.feels_like && <li>{beachData.main.feels_like}°C</li>}
                                {beachData.main.humidity && <li>{beachData.main.humidity}%</li>}
                                {beachData.main.pressure && <li>{beachData.main.pressure} hPa</li>}
                                {beachData.main.temp_min && <li>{beachData.main.temp_min}°C</li>}
                                {beachData.main.temp_max && <li>{beachData.main.temp_max}°C</li>}

                                {beachData.wind.deg && <li>{beachData.wind.deg}°</li>}
                                {beachData.wind.speed && <li>{beachData.wind.speed} m/s</li>}
                            </ul>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <div className='extraInfo'>
                        <p>Failed to retrieve data...</p>
                    </div>
                </>
            )}
        </div>
    );
}

export default BeachInfo;
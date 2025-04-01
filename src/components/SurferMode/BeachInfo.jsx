import { GoogleMap, useLoadScript } from '@react-google-maps/api';
import './BeachInfo.css'

function BeachInfo({beach, showForecast}) {
    const {isLoaded} = useLoadScript({
        googleMapsApiKey : process.env.REACT_APP_GOOGLE_API_KEY
    });

    if (!beach) {
        return <div className='beachMoreInfo'>No beach data available</div>;
    }

    const mapContainerStyle = {
        width: '100%',
        height: '300px',
    };
    
    const center = { // google API want it like this
        lat: parseFloat(beach.lat),
        lng: parseFloat(beach.lon),
    };

    return (
        <div className='beachMoreInfo'>
            <div className='beachName'>
                <p>{beach.display_name ? beach.display_name.split(', ')[0] : 'Unknown Beach'}</p>
            </div>
            <div className='extraInfo'>
                {isLoaded ? (
                    <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        center={center}
                        zoom={20}
                        onLoad = {(map) => { // make it focus on the actually focus on the beach...
                            map.panTo(center)
                            map.setZoom(20)
                        }}
                    />
                ) : (
                    <p>Loading map...</p>
                )}
                <a
                    href={`https://www.google.com/maps?q=${beach.lat},${beach.lon}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="googleMapsLink"
                >
                    Open in Google Maps
                </a>
            </div>
            <div className='beachDetailsDivMoreInfo'>
                <div className='beachDetailsTitlesDivMoreInfo'>
                    <ul className='beachDetailsTitlesMoreInfo'>
                        {beach.wave_height_data && <li>Wave height</li>}
                        {beach.wave_direction_data && <li>Wave direction</li>}
                        {beach.wave_period_data && <li>Wave period</li>}
                        {beach.wind_wave_height_data && <li>Wind wave height</li>}
                        {beach.wind_wave_direction_data && <li>Wind wave direction</li>}
                        {beach.swell_wave_height_data && <li>Swell wave height</li>}
                        {beach.swell_wave_direction_data && <li>Swell wave direction</li>}
                    </ul>
                </div>
                <div className='beachDetailsResultsDivMoreInfo'>
                    <ul className='beachDetailsResultsMoreInfo'>
                        {beach.wave_height_data && <li>{beach.wave_height_data[0]} {beach.units.wave_height}</li>}
                        {beach.wave_direction_data && <li>{beach.wave_direction_data[0]} {beach.units.wave_direction}</li>}
                        {beach.wave_period_data && <li>{beach.wave_period_data[0]} {beach.units.wave_period}</li>}
                        {beach.wind_wave_height_data && <li>{beach.wind_wave_height_data[0]} {beach.units.wind_wave_height}</li>}
                        {beach.wind_wave_direction_data && <li>{beach.wind_wave_direction_data[0]} {beach.units.wind_wave_direction}</li>}
                        {beach.swell_wave_height_data && <li>{beach.swell_wave_height_data[0]} {beach.units.swell_wave_height}</li>}
                        {beach.swell_wave_direction_data && <li>{beach.swell_wave_direction_data[0]} {beach.units.swell_wave_direction}</li>}
                    </ul>
                </div>
            </div>
            <div className="show-forecast">
                <button onClick={showForecast}>Show forecasts</button>
            </div>
        </div>
    );
}

export default BeachInfo;
import { GoogleMap, useLoadScript } from '@react-google-maps/api';
import './BeachInfo.css'

function BeachInfo({beachData}) {
    const {isLoaded} = useLoadScript({
        googleMapsApiKey : process.env.REACT_APP_GOOGLE_API_KEY
    });

    if (!beachData) {
        return <div className='beachMoreInfo'>No beach data available</div>;
    }

    const mapContainerStyle = {
        width: '100%',
        height: '300px',
    };
    
    const center = {
        lat: parseFloat(beachData.lat),
        lng: parseFloat(beachData.lon),
    };

    return (
        <div className='beachMoreInfo'>
            <div className='beachName'>
                <p>{beachData.display_name ? beachData.display_name.split(', ')[0] : 'Unknown Beach'}</p>
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
                    href={`https://www.google.com/maps?q=${beachData.lat},${beachData.lon}`}
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
                        {beachData.waveHeight && <li>Wave height</li>}
                        {beachData.waveDirection && <li>Wave direction</li>}
                        {beachData.wavePeriod && <li>Wave period</li>}
                        {beachData.windWaveHeight && <li>Wind wave height</li>}
                        {beachData.windWaveDirection && <li>Wind wave direction</li>}
                        {beachData.swellWaveHeight && <li>Swell wave height</li>}
                        {beachData.swellWaveDirection && <li>Swell wave direction</li>}
                    </ul>
                </div>
                <div className='beachDetailsResultsDivMoreInfo'>
                    <ul className='beachDetailsResultsMoreInfo'>
                        {beachData.waveHeight && <li>{beachData.waveHeight}</li>}
                        {beachData.waveDirection && <li>{beachData.waveDirection}</li>}
                        {beachData.wavePeriod && <li>{beachData.wavePeriod}</li>}
                        {beachData.windWaveHeight && <li>{beachData.windWaveHeight}</li>}
                        {beachData.windWaveDirection && <li>{beachData.windWaveDirection}</li>}
                        {beachData.swellWaveHeight && <li>{beachData.swellWaveHeight}</li>}
                        {beachData.swellWaveDirection && <li>{beachData.swellWaveDirection}</li>}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default BeachInfo;
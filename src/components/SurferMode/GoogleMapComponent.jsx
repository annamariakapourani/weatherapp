import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { useEffect, useState } from 'react';

const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY

function GoogleMapComponent({lat, lon}) {
    const center = {lat: parseFloat(lat), lon: parseFloat(lon)};
    const [mapLoaded, setMapLoaded] = useState(false);

    useEffect(() => {
        setMapLoaded(true);
    }, []);

    return (
        <LoadScript googleMapsApiKey = {GOOGLE_API_KEY}>
            <GoogleMap
                center = {center}
                zoom = {12}
                onLoad = {() => setMapLoaded(true)}
            >
                {
                    mapLoaded && (
                        <Marker position={center} />
                    )
                }
            </GoogleMap>
        </LoadScript>
    );
}

export default GoogleMapComponent;
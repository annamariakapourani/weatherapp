import './BeachInfo.css'

function BeachInfo({beachData}) {
    return (
        <div className='beachMoreInfo'>
        <div className='beachName'>
            <p>{beachData.display_name ? beachData.display_name.split(', ')[0] : 'Unknown Beach'}</p>
        </div>
            {beachData.hasMarineData ? (<>
                <div className = 'extraInfo'>
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
                            {beachData.waveHeight == null ? (<li>Wave height</li>) : null}
                            {beachData.waveDirection == null ? (<li>Wave direction</li>) : null}
                            {beachData.wavePeriod == null ? (<li>Wave period</li>) : null}
                            {beachData.windWaveHeight == null ? (<li>Wind wave height</li>) : null}
                            {beachData.windWaveDirection == null ? (<li>Wind wave direction</li>) : null}
                            {beachData.swellWaveHeight == null ? (<li>Swell wave height</li>) : null}
                            {beachData.swellWaveDirection == null ? (<li>Swell wave direction</li>) : null}
                        </ul>
                    </div>
                    <div className='beachDetailsResultsDivMoreInfo'>
                        <ul className='beachDetailsResultsMoreInfo'>
                            {beachData.waveHeight == null ? (<li>{beachData.waveHeight}</li>) : null}
                            {beachData.waveDirection == null ? (<li>{beachData.waveDirection}</li>) : null}
                            {beachData.wavePeriod == null ? (<li>{beachData.wavePeriod}</li>) : null}
                            {beachData.windWaveHeight == null ? (<li>{beachData.windWaveHeight}</li>) : null}
                            {beachData.windWaveDirection == null ? (<li>{beachData.windWaveDirection}</li>) : null}
                            {beachData.swellWaveHeight == null ? (<li>{beachData.swellWaveHeight}</li>) : null}
                            {beachData.swellWaveDirection == null ? (<li>{beachData.swellWaveDirection}</li>) : null}
                        </ul>
                    </div>
                </div>
            </>) : (<>
                <div className = 'extraInfo'>
                    <p>Failed to retrieve data...</p>
                </div>
            </>)}
        </div>
    );
}

export default BeachInfo;
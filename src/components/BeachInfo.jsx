function BeachInfo({beachName, waveHeight, waveDirection, wavePeriod, windWaveHeight, windWaveDirection, swellWaveHeight, swellWaveDirection}) {
    return (
        <div className='beachMoreInfo'>
            <div className='beachName'>
                <p>{beachName}</p>
            </div>
            <div className='beachDetailsDivMoreInfo'>
                <div className='beachDetailsTitlesDivMoreInfo'>
                    <ul className='beachDetailsTitlesMoreInfo'>
                        <li>Wave height</li>
                        <li>Wave direction</li>
                        <li>Wave period</li>
                        <li>Wind wave height</li>
                        <li>Wind wave direction</li>
                        <li>Swell wave height</li>
                        <li>Swell wave direction</li>
                    </ul>
                </div>
                <div className='beachDetailsResultsDivMoreInfo'>
                    <ul className='beachDetailsResultsMoreInfo'>
                        <li>{waveHeight}m</li>
                        <li>{waveDirection}</li>
                        <li>{wavePeriod}s</li>
                        <li>{windWaveHeight}m</li>
                        <li>{windWaveDirection}</li>
                        <li>{swellWaveHeight}m</li>
                        <li>{swellWaveDirection}</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default BeachInfo;
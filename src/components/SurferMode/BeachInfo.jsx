import './BeachInfo.css'

function BeachInfo({beachData}) {
    return (
        <div className='beachMoreInfo'>
        <div className='beachName'>
            <p>{beachData.name}</p>
        </div>
            {beachData.hasMarineData ? (<>
                <div className = 'extraInfo'>
                    <p>{beachData.updatedAt}</p>
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
                            <li>{beachData.waveHeight}</li>
                            <li>{beachData.waveDirection}</li>
                            <li>{beachData.wavePeriod}</li>
                            <li>{beachData.windWaveHeight}</li>
                            <li>{beachData.windWaveDirection}</li>
                            <li>{beachData.swellWaveHeight}</li>
                            <li>{beachData.swellWaveDirection}</li>
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
// Images
import star from "../../assets/star.png"
import arrow from "../../assets/arrow.png"
import CamberSands from "../../assets/CamberSands.png"
import './BeachCard.css'


function BeachCard({beachInfo, onArrowClick}) {
    return (
        <div className='beachCard'>
            {/* <img className='beachImg' src={CamberSands} alt='Camber Sands beach' /> */}
            <img src={beachInfo.weather.icon} alt="Weather icon" width={'100em'} height={'100em'} />
            <div className='infoSection'>
                <p className='beachName'>{beachInfo.display_name.split(', ')[0]}</p>
                <div className='beachInfo'>
                    {<p>Beach temperature: {beachInfo.temperature}</p>}
                </div>
            </div>
            <div className='beachRating'> 
                <p className='rating'>{beachInfo.rating}</p>
                <img className='star' src={star} alt='Star'/>
            </div> 
            <div className='arrow'>
                <button onClick={() => onArrowClick(beachInfo)}>
                    <img src={arrow} alt='Arrow'/>
                </button>
            </div>                     
        </div>
    );
}

export default BeachCard;
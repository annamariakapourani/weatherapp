// Images
import star from "../../assets/star.png"
import arrow from "../../assets/arrow.png"
import CamberSands from "../../assets/CamberSands.png"
import './BeachCard.css'


function BeachCard({beach, onArrowClick}) {
    return (
        <div className='beachCard'>
            <img className='beachImg' src={CamberSands} alt='Camber Sands beach' />
            <div className='infoSection'>
                <p className='beachName'>{beach.display_name.split(', ')[0]}</p>
                <div className='beachInfo'>
                    <p>Beach temperature: {beach.temperature}</p>
                    <p>Description: {beach.description}</p>
                </div>
            </div>
            <div className='beachRating'> 
                <p className='rating'>{beach.rating}</p>
                <img className='star' src={star} alt='Star'/>
            </div> 
            <div className='arrow'>
                <button onClick={() => onArrowClick(beach)}>
                    <img src={arrow} alt='Arrow'/>
                </button>
            </div>                     
        </div>
    );
}

export default BeachCard;
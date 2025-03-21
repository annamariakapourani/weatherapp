// Images
import star from "../../assets/star.png"
import arrow from "../../assets/arrow.png"
import CamberSands from "../../assets/CamberSands.png"
import './BeachCard.css'


function BeachCard({beachName, rating, onArrowClick}) {
    return (
        <div className='beachCard'>
            <img className='beachImg' src={CamberSands} alt='Beach Image' />
            <div className='infoSection'>
                <p className='beachName'>{beachName}</p>
            </div>
            <div className='beachRating'> 
                <p className='rating'>{rating}</p>
                <img className='star' src={star} alt='Star'/>
            </div> 
            <div className='arrow'>
                <button onClick={() => onArrowClick(beachName)}>
                    <img src={arrow} alt='Arrow'/>
                </button>
            </div>                     
        </div>
    );
}

export default BeachCard;
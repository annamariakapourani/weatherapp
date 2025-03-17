// Images
import star from "../assets/star.png"
import arrow from "../assets/arrow.png"
import CamberSands from "../assets/CamberSands.png"


function BeachCard({beachName, beachInfo, rating}) {
    return (
        <div className='beachCard'>
            <img className='beachImg' src={CamberSands} alt='Beach Image' />
            <div className='infoSection'>
                <p className='beachName'>{beachName}</p>
                <p className='beachInfo'>{beachInfo}</p>                        
            </div>
            <div className='beachRating'> 
                <p className='rating'>{rating}</p>
                <img className='star' src={star} alt='Star'/>
            </div> 
            <div className='arrow'>
                <img src={arrow} alt='Arrow'/>
            </div>                     
        </div>
    );
}

export default BeachCard;
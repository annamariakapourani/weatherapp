import star from "../../assets/star.png"
import arrow from "../../assets/arrow.png"
import CamberSands from "../../assets/CamberSands.png"
import './BeachCard.css'
import { useEffect, useState } from "react"

function BeachCard({beach, onArrowClick}) {

    const [image, setImage] = useState(CamberSands);
    const crowdTypeClass = beach.crowdType ? beach.crowdType.toLowerCase() : 'unknown';


    useEffect(() => {
        if (beach.photo) {
            setImage(beach.photo);
        }
        else {
            console.log(`Cannot set image for ${beach.display_name}`)
        }
    }, [beach]);

    return (
        <div className='beachCard'>
            <img className='beachImg' src={image} alt={beach.photo ? beach.display_name : "Stock image of Camber Sands beach in England"} onError={() => setImage(CamberSands)} />
            <div className='infoSection'>
                <p className='beachName'>{beach.display_name.split(', ')[0]}</p>
                <div className='beachInfo'>
                    <p>Beach temperature: {beach.temperature}</p>
                    <p>Description: {beach.description}</p>

                </div>
            </div>
            <div className='beachRating'> 
                <div className="google-rating">
                    <p className='rating'>{beach.rating}</p> <img className='star' src={star} alt='Star'/>
                </div>
                <div className='score'>
                    <p className={`score-${beach.score}`}>{beach.score}</p>
                </div>
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
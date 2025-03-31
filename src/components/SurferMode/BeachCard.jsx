// Images
import star from "../../assets/star.png"
import arrow from "../../assets/arrow.png"
import CamberSands from "../../assets/CamberSands.png"
import axios from "axios"
import './BeachCard.css'
import { useEffect, useState } from "react"

const googleMapsApiKey =  process.env.REACT_APP_GOOGLE_API_KEY;

function BeachCard({beach, onArrowClick}) {

    const [image, setImage] = useState(CamberSands);

    useEffect(() => {
        if (beach.photo) {
            setImage(`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${beach.photo}&key=${googleMapsApiKey}`);
        }
        else {
            console.log(`Cannot set image for ${beach.display_name}`)
        }
    }, [beach]);

    return (
        <div className='beachCard'>
            <img className='beachImg' src={image} alt={beach.display_name || "Stock image of Camber Sands beach in England"} />
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
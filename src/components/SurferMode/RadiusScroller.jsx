import { useState } from 'react';
import './RadiusScroller.css';

function RadiusScroller({initialRadius, setRadius}) {
    // Radius is what the final value is that we insert into API calls etc...
    // Currently on is what we show the user on the screen, and lets us handle the user moving the actual scroller etc...
    const [currentlyOn, setCurrentlyOn] = useState(initialRadius);

    const changeRadius = (event) => {
        setRadius(event.target.value);
    };

    const changeCurrentlyOn = (event) => {
        setCurrentlyOn(event.target.value)
    };

    return (
        <div className="radius-selector">
            <label htmlFor="radius-slider">Select Radius: {currentlyOn / 1000} km</label>
            <input
                id="radius-slider"
                type="range"
                min="1000"
                max="100000"
                step="1000"
                value={currentlyOn} 
                onChange={changeCurrentlyOn}
                onMouseUp={changeRadius}
            />
        </div>
    );
}

export default RadiusScroller;
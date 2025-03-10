
import React from 'react'
import "../components/PopUp"

function PopUp(props) {
    return (props.trigger) ? (
      <div className="popup">
        <div className="popup-inner">
            <div className='buttons'>
            <button className="clear-btn" onClick={() => props.setTrigger(false)}>
                Clear All
            </button>
            <button className="cancel-btn" onClick={() => props.setTrigger(false)}>
                Cancel
            </button>
            <button className="apply-btn" onClick={() => props.setTrigger(false)}>
                Apply
            </button>
          </div>
          {props.children}
        </div>
      </div>
    ) : "";
  }
  
  export default PopUp
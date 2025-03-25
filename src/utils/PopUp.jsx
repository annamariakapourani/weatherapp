import React from 'react';
import './PopUp.css';

function PopUp(props) {
  const handleClearAll = () => {
    if (props.onClearAll) {
      props.onClearAll(); // Call the provided clear all function
    }
  };

  const handleCancel = () => {
    if (props.onCancel) {
      props.onCancel(); // Call the provided cancel function
    }
    props.setTrigger(false); // Close the popup
  };

  const handleApply = () => {
    if (props.onApply) {
      props.onApply(); // Call the provided apply function
    }
    props.setTrigger(false); // Close the popup
  };

  return (props.trigger) ? (
    <div className="popup">
      <div className="popup-inner">
        <div className='buttons'>
          <button className="clear-btn" onClick={handleClearAll}>
            Clear All
          </button>
          <button className="cancel-btn" onClick={handleCancel}>
            Cancel
          </button>
          <button className="apply-btn" onClick={handleApply}>
            Apply
          </button>
        </div>
        {props.children}
      </div>
    </div>
  ) : null;
}

export default PopUp;
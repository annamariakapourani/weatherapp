import React, { useEffect, useState } from 'react';

export function CurrentTime({ timezone }) {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(new Date());
        }, 1000); // Update time every second
        return () => clearInterval(interval);
    }, []);

    const getCityTime = () => {
        if (timezone === undefined) return time;
        const utcTime = time.getTime() + (time.getTimezoneOffset() * 60000);
        return new Date(utcTime + (timezone * 1000));
    };

    const cityTime = getCityTime();

    return (
        <div style={{ marginTop: '1em' }}>
            <p>{cityTime.toLocaleTimeString()} {cityTime.toDateString()}</p>
        </div>
    );
}
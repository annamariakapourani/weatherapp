import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer } from "recharts";
import moment from "moment";
import './BeachChart.css';

const BeachChart = ({ beach, onHide }) => {
    if (!beach || !beach.times) return <p>No data available</p>;

    /* Snippet of what the beach object contains:
    times: data.time,
    units: units,
    timezone: marineResponse.data.timezone,
    wave_height_data: data.wave_height,
    wave_direction_data: data.wave_direction,
    wave_period_data: data.wave_period,
    wind_wave_height_data: data.wind_wave_height,
    wind_wave_direction_data: data.wind_wave_direction,
    swell_wave_height_data: data.swell_wave_height,
    swell_wave_direction_data: data.swell_wave_direction,
    */

    // First, format the data into something easier to work with
    const data = [];
    for (let i = 0; i < beach.times.length; i++) {
        data.push({
            time: moment(beach.times[i]).format("DD MMM HH:mm"),
            wave_height: beach.wave_height_data[i],
            wave_direction: beach.wave_direction_data[i],
            wave_period: beach.wave_period_data[i],
            wind_wave_height: beach.wind_wave_height_data[i],
            wind_wave_direction: beach.wind_wave_direction_data[i],
            swell_wave_height: beach.swell_wave_height_data[i],
            swell_wave_direction: beach.swell_wave_direction_data[i],
        });
    }

    return (
        <div className="popup">
            <div className="details">
                <div className="name">
                    <p>Name: {beach.display_name}</p>
                </div>
                <div className="hide-button">
                    <button onClick={onHide}>Hide</button>
                </div>
            </div>
            <div className="chart">
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="wave_height" stroke="#8884d8" name={`Wave Height (${beach.units.wave_height})`} />
                        <Line type="monotone" dataKey="wave_direction" stroke="#82ca9d" name={`Wave Direction (${beach.units.wave_direction})`} />
                        <Line type="monotone" dataKey="wave_period" stroke="#ffc658" name={`Wave Period (${beach.units.wave_period})`} />
                        <Line type="monotone" dataKey="wind_wave_height" stroke="#ff7300" name={`Wind Wave Height (${beach.units.wind_wave_height})`} />
                        <Line type="monotone" dataKey="wind_wave_direction" stroke="#0088FE" name={`Wind Wave Direction (${beach.units.wind_wave_direction})`} />
                        <Line type="monotone" dataKey="swell_wave_height" stroke="#FF0000" name={`Swell Wave Height (${beach.units.swell_wave_height})`} />
                        <Line type="monotone" dataKey="swell_wave_direction" stroke="#800080" name={`Swell Wave Direction (${beach.units.swell_wave_direction})`} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default BeachChart;

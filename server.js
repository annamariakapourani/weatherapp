// Need the backend to make the google API work (annoying but only option it seems...)

// NOTE: to execute this file, go to its local directory and execute: "node server.js" in terminal.
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

app.get("/api/beaches", async (req, res) => {
    try {
        const { lat, lon, radius } = req.query;
        if (!lat || !lon || !radius) {
            return res.status(400).json({ error: "Latitide, longitude and radius are required" });
        }

        // The API has a max limit of 20 beaches per call, which means we may need to do more than 1 call to get all the beaches.
        let beaches = []
        let more = true;
        let nextPageToken = null;
        let pages = 0;
        while (more) {
            // get the results for the current set of beaches we are on
            const response = await axios.get(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=${radius}&keyword=beach&key=${GOOGLE_API_KEY}${nextPageToken ? `&pagetoken=${nextPageToken}` : ''}`);
            for (const beach of response.data.results) {
                beaches.push(beach)
            }
            // Then check if there are more results by seeing if we have a next_page_token, and if there is we start again for the page
            if (response.data.next_page_token) {
                if (pages > 3) { //too many items
                    more = false;
                }
                else {
                    nextPageToken = response.data.next_page_token;
                }
            }
            else {
                more = false;
            }
            // we need to add a delay for the new page to generate on google's side.
            if (more) {
                await new Promise(resolve => setTimeout(resolve, 2000)); //2 second cooldown
            }
        };
        res.json(beaches);
    } catch (error) {
        res.status(500).json({ "error": error.message });
    }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
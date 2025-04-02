// getting the beaches stuff...


let service = null


const beachAPI = async (lat, lon, radius) => {
    // Note that this part was reserved for the backend as it made use of the REST api version of this
    // But as we are not allowed to use a backend, i put it here using the other javascript API
    // there is some formatting here that is only here in order for other parts of the code working without needing to
    // change those parts as well

    let maxTries = 5;
    if (!window.google) {
        maxTries--;
        await new Promise(resolve => setTimeout(resolve, 1000)); // wait 1 second for the script to load
        if (maxTries <= 0) {
            return {error: "Script has not loaded yet, try again."}
        }
    }

    // the place service requies a dummy map to work
    if (!service) {
        service = new window.google.maps.places.PlacesService(new window.google.maps.Map(document.createElement("div"), {
            center: { lat: lat, lng: lon },
            zoom: 15,
        }));
    }
    
    try {
        // The API has a max limit of 20 beaches per call, which means we may need to do more than 1 call to get all the beaches.
        let beaches = [];
        let more = true;
        let nextPageToken = null;
        let pages = 0;
        const maxPages = 2;

        while (more) {
            const local = service; // put it in a local variable to stop the IDE bugging us
            pages++;
            const request = {
                location: { lat: lat, lng: lon },
                radius: radius,
                keyword: "beach",
                pagetoken: nextPageToken
            };
            const response = await new Promise((resolve, reject) => {
                local.nearbySearch(request, (results, status, pagination) => {
                    if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                        resolve({ results, pagination });
                    } else {
                        reject(status);
                    }
                });
            });
            beaches = [...beaches, ...response.results];
            // Handle pagination
            if (response.pagination?.hasNextPage && pages < maxPages) {
                nextPageToken = response.pagination.nextPageToken;
                await new Promise(resolve => setTimeout(resolve, 2000)); // Delay for 2 seconds before requesting next page, as it takes time to generate the page on googles side
            } else {
                more = false;
            }
        }
        console.log((beaches));
        return {
            data: beaches,
        };

    } catch (error) {
        console.error("Error fetching beaches:", error);
        return {
            error: "Failed to fetch beaches",
        };
    }
};

export default beachAPI;
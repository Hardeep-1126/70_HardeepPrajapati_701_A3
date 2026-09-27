const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Home page
app.get("/", function (req, res) {
    res.render("index", {
        weather: null,
        error: null
    });
});

// Weather API route
app.post("/weather", async function (req, res) {

    const city = req.body.city;

    try {

        // Step 1: Find city latitude and longitude
        const locationResponse = await axios.get(
            "https://geocoding-api.open-meteo.com/v1/search",
            {
                params: {
                    name: city,
                    count: 1,
                    language: "en",
                    format: "json"
                }
            }
        );

        const locationData = locationResponse.data;

        if (!locationData.results) {
            return res.render("index", {
                weather: null,
                error: "City not found"
            });
        }

        const location = locationData.results[0];

        const latitude = location.latitude;
        const longitude = location.longitude;

        // Step 2: Get weather information
        const weatherResponse = await axios.get(
            "https://api.open-meteo.com/v1/forecast",
            {
                params: {
                    latitude: latitude,
                    longitude: longitude,
                    current: "temperature_2m,wind_speed_10m"
                }
            }
        );

        const weatherData = weatherResponse.data;

        const weather = {
            city: location.name,
            country: location.country,
            temperature: weatherData.current.temperature_2m,
            windSpeed: weatherData.current.wind_speed_10m
        };

        res.render("index", {
            weather: weather,
            error: null
        });

    } catch (error) {

        console.log(error.message);

        res.render("index", {
            weather: null,
            error: "Unable to get weather information"
        });
    }
});

app.listen(process.env.PORT, function () {
    console.log(
        "Server running at http://localhost:" + process.env.PORT
    );
});
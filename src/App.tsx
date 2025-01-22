import React, { useState, useEffect } from 'react';
import './App.css';

const openWeatherApiToken = process.env.REACT_APP_OPENWEATHER_API_TOKEN;

interface Coord {
	lat: number;
	lon: number;
}

interface City {
	id: number;
	name: string;
	coord: Coord;
	country: string;
	population: number;
	timezone: number;
	sunrise: number;
	sunset: number;
}

interface Main {
	temp: number;
	feels_like: number;
	temp_min: number;
	temp_max: number;
	pressure: number;
	sea_level: number;
	grnd_level: number;
	humidity: number;
	temp_kf: number;
}

interface Weather {
	id: number;
	main: string;
	description: string;
	icon: string;
}

interface Clouds {
	all: number;
}

interface Wind {
	speed: number;
	deg: number;
	gust: number;
}

interface Sys {
	pod: string;
}

interface ForecastItem {
	dt: number;
	main: Main;
	weather: Weather[];
	clouds: Clouds;
	wind: Wind;
	visibility: number;
	pop: number;
	sys: Sys;
	dt_txt: string;
}

interface ForecastData {
	cod: string;
	message: number;
	cnt: number;
	list: ForecastItem[];
	city: City;
}

const WeatherWiz: React.FC = () => {
	const [forecastData, setForecastData] = useState<ForecastData | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch(
					'https://api.openweathermap.org/data/2.5/forecast?q=Kaluga&appid=' + openWeatherApiToken,
				);

				if (!response.ok) {
					throw new Error('Network response was not ok');
				}

				const data: ForecastData = await response.json();
				setForecastData(data);
				setLoading(false);
			} catch (error) {
				setError(error instanceof Error ? error.message : 'An unknown error occurred');
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	if (loading) {
		return <div>Loading...</div>;
	}

	if (error) {
		return <div>Error: {error}</div>;
	}

	return (
		<div>
			<h1>Weather Forecast for {forecastData?.city.name}</h1>
			{forecastData && (
				<div>
					<h2>
						{forecastData.city.name}, {forecastData.city.country}
					</h2>
					<ul>
						{forecastData.list.map((forecast, index) => (
							<li key={index}>
								<p>Date: {forecast.dt_txt}</p>
								<p>Temperature: {forecast.main.temp} K</p>
								<p>Feels Like: {forecast.main.feels_like} K</p>
								<p>Weather: {forecast.weather[0].description}</p>
								<p>Wind Speed: {forecast.wind.speed} m/s</p>
								<p>Cloudiness: {forecast.clouds.all}%</p>
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
}

export default WeatherWiz;

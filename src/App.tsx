import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
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

// Utility function to convert Kelvin to Celsius
const kelvinToCelsius = (temp: number): number => {
	return parseFloat((temp - 273.15).toFixed(2)); // Round to 2 decimal places
};

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

	// Prepare data for the chart (convert temperatures to Celsius)
	const chartData = forecastData?.list.map((item) => ({
		date: item.dt_txt,
		temperature: kelvinToCelsius(item.main.temp),
		feelsLike: kelvinToCelsius(item.main.feels_like),
		zeroLine: 0, // Constant zero line
	}));

	// Function to format X-axis ticks
	const formatXAxisTick = (date: string) => {
		const options: Intl.DateTimeFormatOptions = {
			month: 'short',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			hour12: false,
		};
		const formattedDate = new Date(date).toLocaleDateString('en-US', options);

		// Extract the parts to construct the desired format
		const [monthDay, time] = formattedDate.split(', '); // "Jan 21" and "12:00"
		if (time === '00:00' || time === '12:00') {
			return `${monthDay} ${time}`;
		}
		return '';
	};

	return (
		<main>
			<h1>Weather Forecast for {forecastData?.city.name}</h1>
			{forecastData && (
				<>
					<h2>
						{forecastData.city.name}, {forecastData.city.country}
					</h2>

					{/* Temperature Chart */}
					<div style={{ width: '100%', height: '300px', marginBottom: '20px' }}>
						<ResponsiveContainer>
							<LineChart
								data={chartData}
								margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
							>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis
									dataKey="date"
									tickFormatter={formatXAxisTick} // Format ticks
									interval={0} // Show all ticks
								/>
								<YAxis
									label={{
										value: 'Temperature (°C)',
										angle: -90,
										position: 'insideLeft',
										style: { textAnchor: 'middle' },
									}}
								/>
								<Tooltip />
								<Legend />
								{/* Vertical lines at tick positions */}
								{chartData?.map((entry) => {
									const tickLabel = formatXAxisTick(entry.date);
									if (tickLabel) {
										return (
											<ReferenceLine
												key={entry.date}
												x={entry.date}
												stroke="#999999"
												strokeWidth={1}
											/>
										);
									}
									return null;
								})}
								{/* Temperature Line */}
								<Line
									type="monotone"
									dataKey="temperature"
									stroke="#8884d8"
									dot={false}
									name="Temperature (°C)"
								/>
								{/* Feels Like Line */}
								<Line
									type="monotone"
									dataKey="feelsLike"
									stroke="#82ca9d"
									dot={false}
									name="Feels Like (°C)"
								/>
								{/* Zero Line */}
								<Line
									type="monotone"
									dataKey="zeroLine"
									stroke="#ff0000"
									dot={false} // Remove dots
									name="0 °C"
								/>
							</LineChart>
						</ResponsiveContainer>
					</div>

					{/* Forecast List */}
					{/* <ul>
						{forecastData.list.map((forecast, index) => (
							<li key={index}>
								<p>Date: {forecast.dt_txt}</p>
								<p>Temperature: {kelvinToCelsius(forecast.main.temp)} °C</p>
								<p>Feels Like: {kelvinToCelsius(forecast.main.feels_like)} °C</p>
								<p>Weather: {forecast.weather[0].description}</p>
								<p>Wind Speed: {forecast.wind.speed} m/s</p>
								<p>Cloudiness: {forecast.clouds.all}%</p>
							</li>
						))}
					</ul> */}
				</>
			)}
		</main>
	);
}

export default WeatherWiz;

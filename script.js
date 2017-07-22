/* globals $ */

const APPID = "bd5e378503939ddaee76f12ad7a97608";
const apiUrl = "http://api.openweathermap.org/data/2.5/forecast/daily";
const imgUrl = "http://openweathermap.org/themes/openweathermap/assets/vendor/owm/img/widgets/";

const Weathertron = {
	dom: {},

	/**
	 * Runs once when the app starts.
	 */
	init: function() {
		this.dom = {
			zip: $(".weathertron-header-zip"),
			forecast: $(".weathertron-forecast"),
		};

		// When they change zip input, get the forecast
		this.dom.zip.on("input", function() {
			const zip = this.dom.zip;
			const forecast = this.dom.forecast;
			const value = zip.val();

			// If they enter 5 characters, get the forecast
			if (value.length === 5) {
				zip.blur();
				this.getForecast(value).then(function(forecast) {
					this.renderForecast(forecast);
				}.bind(this))
				.catch(function(err) {
					this.renderMessage(err.message, "error");
				}.bind(this));
			}
			// Otherwise, render a message that says to enter a zipcode
			else {
				this.renderMessage("Enter a zipcode");
			}
		}.bind(this));
	},

	/**
	 * Retrieves the forecast from an API.
	 * @param {string} zip - 5 digit US zipcode
	 * @returns {Promise} - Promise that resolves with the forecast.
	 */
	getForecast: function(zip) {
		return new Promise(function(resolve, reject) {
			$.ajax(apiUrl, {
				data: {
					APPID: APPID,
					zip: zip,
					units: "imperial",
				},
				success: function(res) {
					resolve(res.list);
				},
				error: function(err) {
					if (err.status === 404) {
						reject(new Error("Invalid zip code"));
					}
					else {
						reject(new Error("Something went wrong, try again"));
					}
				},
			});
		});
	},

	/**
	 * Renders the forecast retrieved from getForecast.
	 * @param {array} forecast - The 7 length week forecast array
	 */
	renderForecast: function(forecast) {
		// The forecast we get is very complex, so let's simplify it for rendering
		const simpleForecast = [];

		for (let i = 0; i < forecast.length; i++) {
			simpleForecast.push({
				hiTemp: parseInt(forecast[i].temp.max, 10),
				loTemp: parseInt(forecast[i].temp.min, 10),
				weatherType: forecast[i].weather[0].description,
				icon: forecast[i].weather[0].icon,
			});
		}

		// Now we want to convert that array to a bunch of HTML to insert
		let html = "";
		console.log(simpleForecast);

		// for (let i = 0; i < simpleForecast.length; i++)
		simpleForecast.forEach((element, idx) => {
			const fc = simpleForecast[idx];
			const iconSrc = imgUrl + fc.icon +  ".png";

			html += `<div class="forecast">
			   <img class="forecast-img" src=  ${iconSrc}  />
			   <div class="forecast-type">  ${fc.weatherType}  </div>
			   <div class="forecast-temp">
			     <div class="forecast-temp-hi">Hi   ${fc.hiTemp}  &deg;</div>
			     <div class="forecast-temp-div">/</div>
			     <div class="forecast-temp-lo">Lo  ${fc.loTemp}  &deg;</div>
			   </div>
			 </div>`;
		});

		// Insert the constructed HTML
		this.dom.forecast.html(html);
	},

	/**
	 * Renders a message instead of a forecast.
	 * @param {string} message - The message to display
	 * @param {string} messageType - "message" or "error", defaults to "message"
	 */
	renderMessage(message, messageType)  {
		// Default params
		if (!message) {
			message = "Enter a zipcode";
		}
		if (!messageType) {
			messageType = "message";
		}

		// Render the message
		// let classes = 'weathertron-forecast-empty is-' + messageType;
		let classes = `weathertron-forecast-empty is- ${messageType}`;
		// let messageEl = '<div class="' + classes + '">' + message + '</div>';
		let messageEl = `<div class= ${classes} > ${message} </div>`;
		this.dom.forecast.html(messageEl);
	},
};

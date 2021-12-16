let forecastRow = $("#forecast")

let appid = "d72536f7b081c8bc80ce18b1e71d4181"

let listOfSearchedCities = [{}, {}, {}, {}, {}]

let today = {
    location: "",
    date: moment().format("(DD/MM/YYYY)"),
    temp: 0, // *F
    icon: "", //probably a string to an image
    wind: 0,//MPH
    humidity: 0,//%
    uvIndex: 0, //e.g 0.47
}

let fiveDayForecast = []

/**
 * Adds the city to the list of searched cities and updates the display and localstorage
 * @param cityName
 */
const saveSearches = (cityName) => {
    if (listOfSearchedCities.indexOf(cityName) === -1) {
        listOfSearchedCities.push(cityName)
        localStorage.setItem("weatherCities", JSON.stringify(listOfSearchedCities))
        generateSearchHistory()
    }
}

/**
 * Loads data regarding previous searches from local storage
 */
const loadPastSearches = () => {
    listOfSearchedCities = JSON.parse(localStorage.getItem("weatherCities"))
    if (!listOfSearchedCities) {
        listOfSearchedCities = []
    } else {
        console.log("found existing data")
        generateSearchHistory()
    }
}

/**
 * Generates the list of recent searches from the local data of recently searched cities
 */
const generateSearchHistory = () => {
    let searchHistoryEl = $("#search-history")
    searchHistoryEl.empty();

    for (let i = 0; i < listOfSearchedCities.length; i++) {
        let listItemEl = $("<li>")
        listItemEl.addClass("list-group-item")
        listItemEl.text(listOfSearchedCities[i])
        searchHistoryEl.append(listItemEl)
    }
}

/**
 * Updates the forecast for a requested city
 * @param cityName
 */
const getForecast = (cityName) => {

    console.log(cityName)

    /**
     * Gets the coordinates for a city
     * @param cityName
     */
    const getCityCoordinates = (cityName) => {

        let apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${appid}`

        fetch(apiUrl).then(response => {
            if (response.ok) {
                response.json().then((data) => {
                    const {coord} = data.city;
                    saveSearches(cityName)
                    getWeather(coord.lat, coord.lon)
                })
            } else {
                alert("City does not exist")
            }
        })
    }

    const getWeather = (lat, lon) => {

        let coordinatesUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=metric&appid=${appid}`

        fetch(coordinatesUrl).then(response => {
            if (response.ok) {
                response.json().then(data => {
                    forecastRow.empty()
                    today.location = cityName
                    today.uvIndex = data.uvi
                    today.date = moment().format("DD/MM/YYYY")
                    today.icon = data.current.weather[0].icon
                    today.wind = data.current.wind_speed
                    today.humidity = data.current.humidity
                    today.temp = data.current.temp

                    for (let i = 0; i < 5; i++) {

                        fiveDayForecast[i] = {
                            date: moment().add(i, "days").format("DD/MM/YYYY"),
                            icon: data.daily[i].weather[0].icon,
                            temp: data.daily[i].temp.day,
                            wind: data.daily[i].wind_speed,
                            humidity: data.daily[i].humidity,
                        }

                        generateForecastDay(fiveDayForecast[i])

                    }
                    console.log(fiveDayForecast)
                    console.log(today)
                })
            } else {
                alert("Error: Cannot get weather for these coordinates")
            }
        })

    }


    getCityCoordinates(cityName)

}

/**
 * Generates a forecast day based on the provided object representing a forecast day
 * @param dayObject
 */
const generateForecastDay = (dayObject) => {
    let card = $("<div>").addClass("col card m-1")

    let cardBody = $("<div>").addClass("card-body")
    cardBody.appendTo(card)

    let cardTitle = $("<h5>").addClass("card-title text-center").text(dayObject.date)
    cardTitle.appendTo(cardBody)

    let unorderedList = $("<ul>").addClass("card-text")
    unorderedList.appendTo(cardBody)

    let forecastIcon = $(`<img alt='' src="http://openweathermap.org/img/wn/${dayObject.icon}@2x.png">`)
    forecastIcon.appendTo(unorderedList)
    let tempList = $("<li>").text(`${dayObject.temp} C°`)
    tempList.appendTo(unorderedList)
    let windList = $("<li>").text(`${dayObject.wind} km/h`)
    windList.appendTo(unorderedList)
    let humidityList = $("<li>").text(`${dayObject.humidity} %`)
    humidityList.appendTo(unorderedList)

    forecastRow.append(card)
}

/**
 * An Event listener for searching a specific city
 */
$("form").submit(function (event) {
    event.preventDefault()
    let cityName = $("#cityInput").val().trim()
    if (cityName) {
        getForecast(cityName)
    } else {
        alert(`${cityName} is not a valid city`)
    }
})

/**
 * An Event listener that gets forecast data from the list of recent searches
 */
$("#search-history").on("click", "li", function (event) {
    event.preventDefault()
    let selectedCity = event.target.textContent
    getForecast(selectedCity)
})

loadPastSearches()



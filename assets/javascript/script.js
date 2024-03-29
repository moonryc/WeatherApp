let forecastRow = $("#forecast")
let todayRow = $("#today")

let appid = "d72536f7b081c8bc80ce18b1e71d4181"

//holds the list of previously searched cities
let listOfSearchedCities = []

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
    getForecast("New York")
}

/**
 * Removes the DOm elements that display weather from a previous search
 */
const clearResults = () => {
    forecastRow.empty()
    todayRow.empty()
}

/**
 * Generates the list elements of recent searches from the local data and appends to the DOM
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

    //capitalize the first letter of the city
    cityName = cityName.charAt(0).toUpperCase() + cityName.slice(1);

    /**
     * Gets the coordinates for a city
     */
    const getCityCoordinates = () => {

        let apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${appid}`

        fetch(apiUrl).then(response => {
            if (response.ok) {
                response.json().then((data) => {
                    const { coord } = data.city;
                    saveSearches(cityName)
                    getWeather(coord.lat, coord.lon)
                })
            } else {
                alert("City does not exist")
            }
        })
    }

    /**
     * This function runs a fetch request to get the weather forecast date for a desired cities lat,lon
     * @param lat
     * @param lon
     */
    const getWeather = (lat, lon) => {

        let coordinatesUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=metric&appid=${appid}`

        fetch(coordinatesUrl).then(response => {
            if (response.ok) {
                response.json().then(data => {
                    clearResults()
                    console.log(data)



                    generateWeatherToday({
                        location: cityName,
                        uvIndex: data.current.uvi,
                        date: moment().format("DD/MM/YYYY"),
                        icon: data.current.weather[0].icon,
                        wind: data.current.wind_speed,
                        humidity: data.current.humidity,
                        temp: data.current.temp,
                    })

                    for (let i = 0; i < 5; i++) {

                        generateForecastDay({
                            date: moment().add(i, "days").format("DD/MM/YYYY"),
                            icon: data.daily[i].weather[0].icon,
                            temp: data.daily[i].temp.day,
                            wind: data.daily[i].wind_speed,
                            humidity: data.daily[i].humidity,
                        })

                    }
                })
            } else {
                alert("Error: Cannot get weather for these coordinates")
            }
        })

    }

    getCityCoordinates()
}

/**
 * Generates a forecast day based on the provided object representing a forecast day
 * @param dayObject
 */
const generateForecastDay = (dayObject) => {
    let card = $("<div>").addClass("col card cardMinWidth m-1")

    let cardBody = $("<div>").addClass("card-body text-center")
    cardBody.appendTo(card)

    let cardTitle = $("<h5>").addClass("card-title text-center").text(dayObject.date)
    cardTitle.appendTo(cardBody)

    let forecastIcon = $(`<img alt='' src="http://openweathermap.org/img/wn/${dayObject.icon}@2x.png">`)
    forecastIcon.appendTo(cardBody)

    let unorderedList = $("<div>").addClass("card-text")
    unorderedList.appendTo(cardBody)

    let tempList = $("<p>").text(`Temp: ${dayObject.temp} °C`)
    tempList.appendTo(unorderedList)
    let windList = $("<p>").text(`Wind: ${dayObject.wind} km/h`)
    windList.appendTo(unorderedList)
    let humidityList = $("<p>").text(`Humidity: ${dayObject.humidity}%`)
    humidityList.appendTo(unorderedList)

    forecastRow.append(card)
}

/**
 * Generates the element for displaying todays weather and appends it to the document
 * @param todayObject
 */
const generateWeatherToday = (todayObject) => {
    let card = $("<div>").addClass("col-12 card cardMinWidth m-1")

    let cardBody = $("<div>").addClass("card-body")
    cardBody.appendTo(card)

    let cardTitle = $("<h3>").addClass("card-title text-capitalize").text(`${todayObject.location.toLowerCase()} (${todayObject.date})`)
    cardTitle.appendTo(cardBody)

    let forecastIcon = $(`<img alt='' src="http://openweathermap.org/img/wn/${todayObject.icon}@2x.png">`)
    forecastIcon.appendTo(cardTitle)

    let unorderedList = $("<ul>").addClass("card-text list-unstyled")
    unorderedList.appendTo(cardBody)

    let tempList = $("<li>").text(`Temp: ${todayObject.temp} °C`)
    tempList.appendTo(unorderedList)
    let windList = $("<li>").text(`Wind: ${todayObject.wind} km/h`)
    windList.appendTo(unorderedList)
    let humidityList = $("<li>").text(`Humidity: ${todayObject.humidity}%`)
    humidityList.appendTo(unorderedList)
    let uvList = $("<li>").text(`UV: `)
    let uvIndexSpan = $("<span>").text(`${todayObject.uvIndex}`).addClass("badge badge-secondary")
    uvIndexSpan.appendTo(uvList)

    if(todayObject.uvIndex<2){
        uvIndexSpan.addClass("bg-success")
    }else if(2<=todayObject.uvIndex<5){
        uvIndexSpan.addClass("bg-warning")
    }else{
        uvIndexSpan.addClass("bg-danger")
    }


    uvList.appendTo(unorderedList)



    todayRow.append(card)
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



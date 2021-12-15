// let searchFormEl = $("#cityInput")

let appid = "d72536f7b081c8bc80ce18b1e71d4181"

let listOfSearchedCities = []

const saveSearches = (cityName) => {

    listOfSearchedCities.push(cityName)
    localStorage.setItem("weatherCities",JSON.stringify(listOfSearchedCities))
}

const loadPastSearches = () => {
    listOfSearchedCities = JSON.parse(localStorage.getItem("weatherCities"))
    if (!listOfSearchedCities) {
        listOfSearchedCities = []
    } else {
        console.log("found existing data")
    }
}

let today = {
    location: "",
    date: moment().format("(DD/MM/YYYY)"),
    temp: 0, // *F
    icon: "", //probably a string to an image
    wind: 0,//MPH
    humidity: 0,//%
    uvIndex: 0, //e.g 0.47
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
                    console.log(data)
                    today.location = cityName
                    today.uvIndex = data.uvi
                    today.date = moment().format("DD/MM/YYYY")
                    //TODO
                    // today.icon
                    today.wind = data.current.wind_speed
                    today.humidity = data.current.humidity
                    today.temp = data.current.temp
                })
            } else {
                alert("Error: Cannot get weather for these coordinates")
            }
        })

    }

    getCityCoordinates(cityName)

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


loadPastSearches()
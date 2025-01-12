import { fetchData , url } from "./api.js";
import * as module from './module.js'

const addEventOnElements = function(elements, eventType, callback){
    for(const element of elements){
        element.addEventListener(eventType , callback)
    }
}

// search toggle
const searchView = document.querySelector(".search-wrapper")
const searchTogglers = document.querySelectorAll(".search-wrapper .search-section i")

const toggleSearch = () => searchView.classList.toggle("active")
addEventOnElements(searchTogglers , "click" , toggleSearch)

// search integration
const searchField = document.querySelector('[type="search"]')
const searchResult = document.querySelector(".search-result")


searchField.addEventListener("input" , ()=>{
    if(!searchField.value){
        searchResult.innerHTML = ""
        searchResult.classList.remove("active")
        searchField.classList.remove("searching")
    }else{
        searchField.classList.add("searching")
    }
    if(searchField.value){
        const searchTimeout = setTimeout(()=>{
            fetchData(url.geo(searchField.value) , function(locations){
                searchField.classList.remove("searching")
                searchResult.classList.add("active")
                searchResult.innerHTML = `<ul class="view-list"></ul>`
                const items = []
                for(const {name,lat,lon,country,state} of locations){
                    const searchItem = document.createElement("li")
                    searchItem.innerHTML = `
                    <a href="#/weather?lat=${lat}&lon=${lon}" class="item-link">
                        <i class="fa-solid fa-location-dot me-2"></i>
                        <div>
                            <p class="item-title">${name}</p>
                            <p class="item-subtitle">state of ${state || ""}, ${country}</p>
                        </div>
                    </a>
                    `
                    searchResult.querySelector(".view-list").appendChild(searchItem)
                    items.push(searchItem.querySelector("a"))
                }
                addEventOnElements(items , "click" , ()=>{
                    toggleSearch()
                    searchField.value = ""
                    searchResult.classList.remove("active")
                    searchView.classList.remove("active")
                })
            })
        },500)
    } 
})

console.log(`Updating weather for ${window.location.hash}`);

const content = document.querySelector(".content")
const loading = document.querySelector(".loading")
const errorContent = document.querySelector(".error-content")
const currentLocationBtn = document.querySelector("a.locate-btn")

export const updateWeather = (lat , lon)=>{
    loading.style.setProperty("display", "flex", "important");
    // content.classList.add("hidden")

    const currentWeatherSection = document.querySelector(".side .today-weather")
    const highlightSection = document.querySelector(".weatherInfo .todays-highlights")
    const hourlySection = document.querySelector(".weatherInfo .today-at")
    const forecastSection = document.querySelector(".side .forecast")

    currentWeatherSection.innerHTML = ""
    highlightSection.innerHTML = `<h3 class="title">Todays Highlights</h3>`
    hourlySection.innerHTML = ""
    forecastSection.innerHTML = ""

    if(window.location.hash === "#/current-location"){
        currentLocationBtn.setAttribute("disabled" , "")
        currentLocationBtn.classList.add("disabled")
    }else{
        currentLocationBtn.removeAttribute("disabled")
        currentLocationBtn.classList.remove("disabled")
    }

    // current weather
    fetchData(url.currentWeather(lat , lon),(currentWeather)=>{
        const {
            weather,
            main:{temp, feels_like, pressure, humidity},
            visibility,
            timezone,
            dt:dateUnix,
            sys:{sunrise:sunriseUnixUtc ,sunset:sunsetUnixUtc }
        } = currentWeather
        const [{description,icon}] = weather
        const card = document.createElement("div")
        card.innerHTML= `
            <span>Now</span>
            <div class="deg d-flex align-items-center">
                <span>${parseInt(temp)}&deg;c</span>
                <img src="./assets/images/weather_icons/${icon}.png" alt=${description} width="60px">
            </div>
            <span class="status">${description}</span>
            <div class="info py-3 mt-3">
                <div class="d-flex align-items-center">
                    <i class="fa-solid fa-calendar me-2"></i>
                    <span>${module.getDate(dateUnix,timezone)}</span>
                </div>
                <div class="d-flex align-items-center pt-2">
                    <i class="fa-solid fa-location-dot me-2"></i>
                    <span class="data-location"></span>
                </div>
            </div>
            `
        fetchData(url.geoReverse(lat,lon), function([{name,country}]){
            card.querySelector(".data-location").innerHTML=`${name}, ${country}`
        })
        currentWeatherSection.appendChild(card)
        // Todays Highlight
        fetchData(url.airPollution(lat , lon) , (air)=>{
            const [{
                main:{aqi},
                components:{no2 ,o3, so2 ,pm2_5}
            }] = air.list
            const card = document.createElement("div")
            card.classList.add('data', "row", "mt-3", "row-gap-3")
            card.innerHTML = `
                <div class="col-lg-6">
                    <div class="box p-3">
                        <div class="air d-flex justify-content-between align-items-center">
                            <span class="title">Air Quality Index</span>
                            <span title="${module.aqiText[aqi].message}">${module.aqiText[aqi].level}</span>
                        </div>
                        <div class="result d-flex align-items-center my-4">
                            <i class="fa-solid fa-wind"></i>
                            <div>
                                <span>PM<sub>25</sub></span>
                                <span>${pm2_5.toPrecision(3)}</span>
                            </div>
                            <div>
                                <span>SO<sub>2</sub></span>
                                <span>${so2.toPrecision(3)}</span>
                            </div>
                            <div>
                                <span>NO<sub>2</sub></span>
                                <span>${no2.toPrecision(3)}</span>
                            </div>
                            <div>
                                <span>O<sub>3</sub></span>
                                <span>${o3.toPrecision(3)}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-lg-6">
                    <div class="box p-3">
                        <span class="title">Sunrise & Sunset</span>
                        <div class="result-2 d-flex align-items-center my-4">
                            <div class="sunrise d-flex align-items-center">
                                <i class="fa-regular fa-sun"></i>
                                <div>
                                    <span>Sunrise</span>
                                    <span>${module.getTime(sunriseUnixUtc,timezone)}</span>
                                </div>
                            </div>
                            <div class="sunset d-flex align-items-center">
                                <i class="fa-regular fa-moon"></i>
                                <div>
                                    <span>Sunset</span>
                                    <span>${module.getTime(sunsetUnixUtc,timezone)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-lg-6">
                    <div class="complete-list row ">
                        <div class="col-lg-6 col-md-6">
                                <div class="box p-3">
                                    <span class="title">Humidity</span>
                                    <div class="inbox d-flex justify-content-between align-items-center mt-2">
                                        <i class="fa-solid fa-droplet"></i>
                                        <span>${humidity}<span class="fs-5">%</span></span>
                                    </div>
                                </div>
                        </div>
                        <div class="col-lg-6 col-md-6">
                                <div class="box p-3">
                                    <span class="title">Pressure</span>
                                    <div class="inbox d-flex justify-content-between align-items-center mt-2">
                                        <img src="./assets/images/weather_icons/50d.png" alt="pressure" width="43px">
                                        <span>${pressure}<span class="fs-5">hPa</span></span>
                                    </div>
                                </div>
                        </div>
                    </div>
                </div>
                <div class="col-lg-6">
                    <div class="complete-list row ">
                        <div class="col-lg-6 col-md-6">
                                <div class="box p-3">
                                    <span class="title">Visibility</span>
                                    <div class="inbox d-flex justify-content-between align-items-center mt-2">
                                        <i class="fa-regular fa-eye"></i>
                                        <span>${visibility / 1000}<span class="fs-5">km</span></span>
                                    </div>
                                </div>
                        </div>
                        <div class="col-lg-6 col-md-6">
                                <div class="box p-3">
                                    <span class="title">Feels Like</span>
                                    <div class="inbox d-flex justify-content-between align-items-center mt-2">
                                        <i class="fa-solid fa-temperature-half"></i>
                                        <span>${parseInt(feels_like)}<span class="fs-4">°c</span></span>
                                    </div>
                                </div>
                        </div>
                    </div>
                </div>
            `
            highlightSection.appendChild(card)
        })
        //24h Forecast Section
        fetchData(url.forecast(lat , lon) , (forecast)=>{
            const {
                list:forecastList,
                city:{timezone}
            } = forecast
            hourlySection.innerHTML =`
                <div class="weather d-flex gap-3 mb-3"></div>
                <div class="distances d-flex gap-3"></div>
            `
            for(const [index, data] of forecastList.entries()){
                if(index > 7) break
                const {
                    dt:dateTimeUnix,
                    main:{temp},
                    weather,
                    wind:{deg:windDirection, speed:windSpeed}
                } = data
                const [{icon, description}] = weather
                const tempLi = document.createElement("div")
                tempLi.classList.add("d-flex", "flex-column", "align-items-center", "py-3", "px-4")
                tempLi.innerHTML = `
                    <span>${module.getHours(dateTimeUnix,timezone)}</span>
                    <img src="./assets/images/weather_icons/${icon}.png" alt=${description} class="my-2" width="40px" loading="lazy" >
                    <span>${parseInt(temp)}°</span>
                `
                hourlySection.querySelector(".weather").appendChild(tempLi)
                const windLi = document.createElement("div")
                windLi.classList.add("d-flex", "flex-column", "align-items-center", "py-3", "px-4")
                windLi.innerHTML = `
                    <span>${module.getHours(dateTimeUnix,timezone)}</span>
                    <img src="./assets/images/weather_icons/direction.png" alt="direction" 
                    class="my-2" width="40px" style="transform: rotate(${windDirection-180}deg)">
                    <span>${parseInt(module.mps_to_kmh(windSpeed))} km/h</span>
                `
                hourlySection.querySelector(".distances").appendChild(windLi)
            }
            // 5 Day Forecast Section
            for(let i = 7 , len = forecastList.length; i < len ; i+=8){
                const {
                    main:{temp_max},
                    weather,
                    dt_txt
                } = forecastList[i]
                const [{icon, description}] = weather
                const date = new Date(dt_txt)
                const div = document.createElement("div")
                div.classList.add("pb-4", "day", "d-flex", "justify-content-between", "align-items-center")
                div.innerHTML = `
                    <div class="deg d-flex align-items-center">
                        <img src="./assets/images/weather_icons/${icon}.png" alt=${description} width="20px" class="me-2">
                        <span>${parseInt(temp_max)}</span>
                    </div>
                    <span class="date">${date.getDate()} ${module.monthNames[date.getUTCMonth()]}</span>
                    <span class="day">${module.weekDayNames[date.getUTCDay()]}</span>
                `
                forecastSection.appendChild(div)
            }
            loading.style.setProperty("display", "none", "important");
        })
    })
}

export const error404 = ()=>{
    errorContent.setProperty("display","flex","!important")
}


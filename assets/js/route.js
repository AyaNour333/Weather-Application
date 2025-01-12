import {updateWeather , error404} from './app.js'

const defaultLocation = "#/weather?lat=51.5073219&1on=-0.1276474"

const currentLocation = function(){
    window.navigator.geolocation.getCurrentPosition(res => {
        const { latitude , longitude } = res.coords
        updateWeather(`lat=${latitude}` , `lon=${longitude}`) //
    },err => {
        window.location.hash = defaultLocation
    })
}
const searchedLocation = query => updateWeather(...query.split("&"))
// updateWeather("lat=51.5073219" , "1on=-0.1276474")

const routes = new Map([
    ["/current-location" , currentLocation],
    ["/weather" , searchedLocation]
])

const checkHash = function(){
    const requestUrl = window.location.hash.slice(1)
    const [route , query] = requestUrl.includes("?") ? requestUrl.split("?") : [requestUrl]  //
    routes.get(route) ? routes.get(route)(query) : error404
}

const loading = document.querySelector(".loading")
window.addEventListener("hashchange" , checkHash)
window.addEventListener("load" , ()=>{
    loading.style.setProperty("display", "flex", "important");
    if(!window.location.hash){
        window.location.hash = "#/current-location"
    }else{
        checkHash()
    }
})


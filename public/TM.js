const tmAPI_KEY = "&apikey=S8P66L8bOZUZaq7TME2QoF5NTK2AoAVp"
const concertURL = 'https://app.ticketmaster.com/discovery/v2/events.json?countryCode=US&size=10&sort=date,asc'
var genrePick = "Country"
var dateRangeStart = startTimeStamp()
var dateRangeEnd = endTimeStamp()
var dateRange = '&startDateTime=' + dateRangeStart + 'T00:00:00Z&endDateTime=' + dateRangeEnd + 'T23:59:59Z'
var locationPick = "Houston"
let movieList = $("#movieList")
var artistPass = []
var genre = genreCats[genrePick]
var genresearch = '&classificationId=' + genre
var city = '&dmaId=' + locationPick

function generateList() {
    var genreChoice = document.getElementById("genreSelect").value;
    playlist.css("display", "None")
    //console.log("hiding playlist")
    genre = genreChoice;
    locationPick = getCity()
    genresearch = '&classificationId=' + genre
    dateRangeStart = startTimeStamp()
    //console.log(dateRangeStart)
    dateRangeEnd = endTimeStamp()
    dateRange = '&startDateTime=' + dateRangeStart + 'T00:00:00Z&endDateTime=' + dateRangeEnd + 'T23:59:59Z'
    buildLocation()
    fetchAll()
}

generate.addEventListener('click', function () {
    var genreChoice = document.getElementById("genreSelect").value;
    genre = genreChoice;
    locationPick = getCity()
    genresearch = '&classificationId=' + genre
    dateRangeStart = startTimeStamp()
    //console.log(dateRangeStart)
    dateRangeEnd = endTimeStamp()
    dateRange = '&startDateTime=' + dateRangeStart + 'T00:00:00Z&endDateTime=' + dateRangeEnd + 'T23:59:59Z'
    buildLocation()
    fetchAll()
})

function buildLocation() {
    var locationChoice = locationData[locationPick]
    city = '&dmaId=' + locationChoice
    return city
}

function fetchAll() {
    let searchstring = concertURL + genresearch + city + dateRange + tmAPI_KEY
    //console.log(searchstring)
    fetch(searchstring)
        .then(function (response) { return response.json() })
        .then(function (json) {
            for (event in json["_embedded"]) {
                return json["_embedded"][event]
            }
        })
        .then(function (event) {
            movieList.html("")
            artistPass = []
            for (i in event) {
                let genre = event[i].classifications[0].genre.name
                let eventTitle = event[i].name
                let venue = event[i]._embedded.venues[0].name
                let eventDate = event[i].dates.start.localDate
                let getTickets = event[i].url
                let backdrop = event[i].images[0].url
                let lineup = event[i]._embedded.attractions
                for (index in lineup) {
                    let act = lineup[index].name
                    artistPass.push(act)
                }
                buildit(genre, eventTitle, venue, eventDate, getTickets, backdrop)
            }
        })
}

function buildit(genre, eventTitle, venue, eventDate, getTickets, backdrop) {
    let li = $("<li>").addClass("displayList");
    li.attr('style', `background-image: url(${backdrop})`)
    let itemTitle = $("<title>").addClass("textForm")
    li.append(`<p class="event-title"> ${eventTitle}</p>`)
    li.append(`<p class="venue-class"> Venue: ${venue}</p>`)
    li.append(`<p class="event-date"> Date: ${eventDate}</p>`)
    li.append(`<p class="genre"> Genre: ${genre}</p>`)
    li.append(`<p onclick=(window.open('${getTickets}')) class="buy" >Buy Tickets</p>`)
    movieList.append(li)
}

buildLocation()
fetchAll()
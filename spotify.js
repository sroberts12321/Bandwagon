var access_token = ''  
var currentUser = ''
var playlist_id = ''
var playlist_generator = $('#generatePlaylist')
var authorize = $('#authorize')
var list_of_song_titles = []
var length_of_requests = 0
var successful_requests = 0
var band_id_api_results = []
var band_top_track_api_results = []


// Extracts token from URL after user authorizes client to access Spotify profile
function getHashParams() {
  var hashParams = {};
  var e, r = /([^&;=]+)=?([^&;]*)/g,
      q = window.location.hash.substring(1);
  while ( e = r.exec(q)) {
     hashParams[e[1]] = decodeURIComponent(e[2]);
  }
  return hashParams;
}

// Directs user to Spotify Authorization page so we can get a token
function spotifyAuthorize(){
  window.location = "https://accounts.spotify.com/authorize?client_id=b976c43fb15b44c881e1598f77270193&redirect_uri=http:%2F%2Flocalhost:3000&scope=user-read-private%20user-read-email%20playlist-modify-public%20playlist-modify-private&response_type=token"
}

// Calls extraction function and sets token value to global variable "access_token"
function getToken(){
  var params = getHashParams();
  access_token = params.access_token
  console.log("Token created")
}

// Searches Spotify API for each band name in list given and returns a list of band ID's for later searches
function findBandIds(searchTerms){
  var list_of_band_ids = []
  length_of_requests = searchTerms.length - 1
  searchTerms.forEach((band)=>{
    $.ajax({
      url: `https://api.spotify.com/v1/search?q=${band}&type=artist`,
      headers:{
        'Authorization': 'Bearer ' + access_token
      },
    }).then((response)=>{
        console.log(response)
        band_id_api_results.push(response.artists.items[0].id)
        var searchResults = JSON.stringify(response)
        //console.log(searchResults)
        var bandName = response.artists.items[0].name
        var bandId = response.artists.items[0].id
        list_of_band_ids.push(bandId)
        console.log(bandName)
        console.log(bandId)
        console.log(list_of_band_ids)
        if(length_of_requests == successful_requests){
          console.log("Moving on with the rest of script")
          console.log(band_id_api_results)
          successful_requests = 0
          findTopSongs(band_id_api_results)
          
        }
        successful_requests += 1

    })
  })
  return list_of_band_ids
}

// Takes a list of band ids and finds the top song for each band, appends that song ID to a list and returns it
function findTopSongs(list_of_band_ids){
  var song_ids = []
  console.log(list_of_band_ids)
  length_of_requests = list_of_band_ids.length
  list_of_band_ids.forEach((item)=>{
    $.ajax({
      url: `https://api.spotify.com/v1/artists/${item}/top-tracks?country=US`,
      headers:{
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + access_token
      },
    }).then((response)=>{
      var songName = response.tracks[0].name
      var songId = response.tracks[0].id
      band_top_track_api_results.push(songId)
      list_of_song_titles.push(songName)
      console.log(list_of_song_titles)

        if(length_of_requests == successful_requests){
          console.log("Finished getting top tracks")
          console.log(band_top_track_api_results)
          var songFormat = formattedSongs()
          playlistGenerator(songFormat)
     
          
        }
        successful_requests += 1
    })
  })
  return song_ids
}

// Posts new playlist named "Bandwagon" to user's profile, calls functions to format and add songs to playlist
function playlistGenerator(formatted_songs){
  var playlistName = {name: "Bandwagon"}
  $.ajax({
    method: 'POST',
    url: `https://api.spotify.com/v1/users/${currentUser}/playlists`,
    data:JSON.stringify(playlistName),
    headers:{
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + access_token
    },
    success: (response)=>{
      console.log("playlist created!")
      playlist_id = response.id
      console.log(response.id)
      addSongs(playlist_id, formatted_songs)
      displayPlaylist()
    }
  })
}


// Dynamically injects the playlist after it has been generated
function displayPlaylist(){
  playlistDiv = document.getElementById("playlist")
  console.log(`<iframe src="https://open.spotify.com/embed?uri=spotify:user:${currentUser}:playlist:${playlist_id}" width="300" height="380" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>`)
  playlistDiv.innerHTML = `<iframe src="https://open.spotify.com/embed?uri=spotify:user:${currentUser}:playlist:${playlist_id}" width="300" height="380" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>`
}

// Takes playlist id and formatted track ids and adds the songs to created playlist on user's profile.
function addSongs(playlist, track){
  console.log(track)
  $.ajax({
    method: 'POST',
    url: `https://api.spotify.com/v1/users/${currentUser}/playlists/${playlist}/tracks?position=0&uris=${track}`,
    headers:{
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + access_token
    },
    success: (response)=>{
      console.log(response)
    }
  })
  
}

// Formats list of song IDs to be added to playlist
function formattedSongs(){
  for (var i=0; i<band_top_track_api_results.length; i++){
    band_top_track_api_results[i]="spotify%3Atrack%3A"+band_top_track_api_results[i];
  }
  band_top_track_api_results = band_top_track_api_results.join(',')
  return band_top_track_api_results
}
 
// Retrieves User Id and sets it to global variable, resets variable each time called
function getUserId(){
  currentUser = ''
  $.ajax({
    url: `https://api.spotify.com/v1/me`,
    headers:{
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + access_token
    },
    success: (response)=>{
      currentUser = response.id
      console.log(currentUser)
    }
  })
}


authorize.click(()=>{
  spotifyAuthorize()
})


var search_list = ['coldplay', 'paramore', 'logic']
playlist_generator.click(()=>{
  getToken()
  getUserId()
  let id_list = findBandIds(search_list)
})


{/* <button class="btn" id="authorize">Login to Spotify</button>
<button class="btn" id="generatePlaylist">Generate the Playist!</button>

<div id="playlist">
    
</div> */}
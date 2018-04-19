const CIVIC_SEARCH_URL = 'https://www.googleapis.com/civicinfo/v2/voterinfo';
const REPRESENTATIVES_SEARCH_URL = 'https://www.googleapis.com/civicinfo/v2/representatives';
const GEOCODING_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
let coordinatesArray = [];
let longAddressArray = [];
let formattedAddressArray = [];
let myLatLng;
let representativeResults;
let address;

function getDataFromGeocodingApi(searchTerm, callback) {
	console.log('Geocoding API queried');
	const query = {
		address: `${searchTerm}`,
		key: 'AIzaSyCc83loc2gllyDhzsjFtTs7ueurzLuU_8U'
	}
	$.getJSON(GEOCODING_URL, query, callback);
}

function getDataFromCivicApi(searchTerm, callback) {
	const query = {
		key: 'AIzaSyCc83loc2gllyDhzsjFtTs7ueurzLuU_8U',
		address: `${searchTerm}`
	}
	$.getJSON(CIVIC_SEARCH_URL, query, callback);
}

function getDataFromCivicRepresentativeApi(searchTerm, callback) {
	const query = {
		key: 'AIzaSyCc83loc2gllyDhzsjFtTs7ueurzLuU_8U',
		address: `${searchTerm}`
	}
	$.getJSON(REPRESENTATIVES_SEARCH_URL, query, callback);
}	

function renderHomeScreen() {
	$('#map').addClass('hide-map');
	$('#address-form').removeClass('hidden');
}

//clears global variables and renders address form
function handleHomeButtonClicks() {
	$('#home-button').on('click', event => {
		coordinatesArray = [];
		longAddressArray = [];
		formattedAddressArray = [];
		myLatLng = undefined;
		representativeResults = undefined;
		address = undefined;
		renderHomeScreen();
		$('#no-representative-results-container').addClass('hidden');
		$('#representatives-tab').addClass('hidden', 'active');
		$('#polling-sites-tab').removeClass('active');
		$('#polling-sites-tab').addClass('hidden');
		$('#representatives-list').empty();
		$('#no-election-results-container').addClass('hidden');
		$('#nav-bar').addClass('up')
		$('#nav-bar').removeClass('down')
		$('#banner-container').prepend(`<h1 role='banner' id='banner'>Get Involved</h1>`);
		$('html, body').animate({ scrollTop: 0 }, 'fast');
	});
}


//initiates the Google map
function initMap() {
	myLatLng = coordinatesArray;
	let longAddress = longAddressArray;
	let formattedAddress = formattedAddressArray;
	let map = new google.maps.Map(document.getElementById('map'), {
		center: myLatLng[0],
		zoom: 14
	});
	let marker;
	let infowindow = new google.maps.InfoWindow({});
	for(let i=0; i<myLatLng.length; i++) {
		marker = new google.maps.Marker({
        	map: map,
        	position: new google.maps.LatLng(myLatLng[i]),
    	});
   		google.maps.event.addListener(marker, 'click', (function (marker) {
			return function () {
				infowindow.setContent(longAddress[i] + `</br><a href="https://www.google.com/maps/place/${formattedAddress[i]}" target='_blank'>Directions</a>`);
				infowindow.open(map, marker);
			}
		})(marker));
	}
}

//loops through representative results and adds html to diplay the results
function displayRepresentativeResults(data) {
	for(let i=0; i<data.offices.length; i++){
		let officesArray = data.offices[i].name;
		let myArray = data.offices[i].officialIndices;
		for(let i=0; i<myArray.length; i++){
			arrayIndex = myArray[i];
			let repPic = data.officials[arrayIndex].photoUrl || '#';
			representativeResults = `
				<div class='officials-containers col-xs-12 col-sm-12 col-md-4 col-lg-3'>
					<div class='photo-container'>
						<img src='${repPic}' alt="Politician's headshot" class='photo' onerror="this.onerror=null;this.src='https://d2ytqrx2swf6ug.cloudfront.net/assets/no-image-available-bbdbbe501d2b08a157a21431bc7b49df2c6cf6d892cc3083114229876cd7d6f4.jpg';"></img>
					</div>	
					<h2 class='office-title'>${officesArray}</h2>
						<p class='officials-name'>${data.officials[arrayIndex].name}</p>
						<p class='officials-party'>${data.officials[arrayIndex].party}</p>
						<p class='officials-contact'>Contact: Phone: ${data.officials[arrayIndex].phones} | <a href='${data.officials[arrayIndex].urls}' target='_blank'>Website</a></p>
				</div>
			`;
			$('#representatives-list').append(representativeResults);
		}
	}
}

function displayCoordinateResults(data) {
	//sets the global coordinateArray to coordinates for polling locations based on user's address
	coordinatesArray.push({lat: data.results[0].geometry.location.lat, lng: data.results[0].geometry.location.lng});
	//set the global longAddressArray to addresses for polling location that will be displayed to the user when they select the marker on the Google map
	longAddressArray.push(data.results[0].address_components[0].long_name + '\ ' + data.results[0].address_components[1].short_name);
	//set the global formattedAddressArray to addresses for polling location used to link to the Google Maps app
	formattedAddressArray.push(data.results[0].formatted_address);
	initMap();
}


function displayGoogleVoterInfoResults(data) {
	console.log('displayGoogleVoterInfoResults ran');
	//creates an array out of polling location returned by the Google Civic Information API
	let pollingLocations = data.pollingLocations;
	let pollingLocationsArray = [];
	for(let i = 0; i < pollingLocations.length; i++) {
		pollingLocationsArray.push(data.pollingLocations[i].address.line1 + '\ ' + data.pollingLocations[i].address.city + '\ ' + data.pollingLocations[i].address.state + '\ ' + data.pollingLocations[i].address.zip);
	}
	//feeds the pollingLocationArray through the Google Geolcoding API to return coordinates required for the Google Maps Javascript API
	pollingLocationsArray.map(item => {
		getDataFromGeocodingApi(item, displayCoordinateResults);
	});
}

function renderMap() {
	$('#map').removeClass('hide-map');
	$('#representatives-list').addClass('hidden');
}

//when the 'polling sites' tab is clicked, show the Google map will polling location, or show the error message if no results were returned by the Google Civic Information API
function handlePollingSitesTabClicks() {
	$('#polling-sites-tab').on('click', event => {
		$('#no-representative-results-container').addClass('hidden');
		if(myLatLng == undefined) {
			$('#representatives-list').addClass('hidden');
			$('#no-election-results-container').removeClass('hidden');
			$('#no-representative-results-container').addClass('hidden');
		}
		else {
			renderMap();
		}
		$('#polling-sites-tab').on('click', event => {
			$('#polling-sites-tab').addClass('active');
			$('#representatives-tab').removeClass('active');
		});
	});
}

//If the address entered does not return any results for elected officials, this function will reveal the 'no representatives found' error message
function handleRepError() {
	if(representativeResults == undefined) {
		$('#no-representative-results-container').removeClass('hidden');
	}
	else {
		$('#no-representative-results-container').addClass('hidden');
	}
}

function renderRepresentativesList() {
		$('#representatives-list').removeClass('hidden');
		$('#map').addClass('hide-map');
}

function handleRepresentativeTabClicks() {
	$('#representatives-tab').on('click', event => {
		//when the user submits their address show their list of reps, or show the error if there are no results
		if(representativeResults == undefined) {
			$('#map').addClass('hide-map');
			$('#no-election-results-container').addClass('hidden');
		}
		else {
			renderRepresentativesList();
		}
		//when the 'representative' tab is clicked it will become 'active' and the 'polling sites' tab will deactivate. The 'handleRepError' function will be ran
		$('#representatives-tab').addClass('active');
		$('#polling-sites-tab').removeClass('active');
		handleRepError();
		$('#no-election-results-container').addClass('hidden');
	});
}


//render the second screen showing the 'representatives' and 'polling sites' tab, and the list of elected officials. This function also handles the rendering of the navigation bar.
function renderResultsScreen() {
	$('#address-form').addClass("hidden");
	$('#representatives-tab').removeClass('hidden').addClass('active');
	$('#polling-sites-tab').removeClass('hidden').removeClass('active');
	$('#representatives-list').removeClass('hidden');
	//if the Google Civic Information API returns results, show the container where the results will be listed, if not, keep the container hidden
	setTimeout(function() {
		if(representativeResults == undefined) {
			$('#no-representative-results-container').removeClass('hidden');
		}
		else {
			$('#no-representative-results-container').addClass('hidden');
		}
	}, 600);
	$('#nav-bar').addClass('down');
	$('#banner').empty();
}
 
function watchSubmit() {
	$('#address-form').submit(event => {
		event.preventDefault();
		let streetAddressTarget = $(event.currentTarget).find('#street-address');
		//watch for address submissions and set the global 'address' variable to the value entered by the user.
		let streetAddress = streetAddressTarget.val();
		let cityTarget = $(event.currentTarget).find('#city');
		let city = cityTarget.val();
		let stateTarget = $(event.currentTarget).find('#state');
		let state = stateTarget.val();
		address = streetAddress + '\ ' + city + '\ ' + state;
		//clear out the address form
		streetAddressTarget.val('');
		cityTarget.val('');
		stateTarget.val('');
		//call the Google Civic Information API to get polling locations based on the 'address' variables value
		getDataFromCivicApi(address, displayGoogleVoterInfoResults);
		//call the Google Civic Information API to get elected officials list based on the 'address' variables value
		getDataFromCivicRepresentativeApi(address, displayRepresentativeResults);
		renderResultsScreen();
	});
}

$(watchSubmit);
$(handleHomeButtonClicks);
$(handlePollingSitesTabClicks);
$(handleRepresentativeTabClicks);
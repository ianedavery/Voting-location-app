const CIVIC_SEARCH_URL = 'https://www.googleapis.com/civicinfo/v2/voterinfo';
const GEOCODING_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
let resultsArray = [];

function getDataFromGeocodingApi(searchTerm, callback) {
	console.log('Geocoding API queried');
	const query = {
		address: `${searchTerm}`,
		key: 'AIzaSyCc83loc2gllyDhzsjFtTs7ueurzLuU_8U'
	}
	$.getJSON(GEOCODING_URL, query, callback);
}

function getDataFromCivicApi(searchTerm, callback) {
	console.log('Civic API query performed');
	const query = {
		key: 'AIzaSyCc83loc2gllyDhzsjFtTs7ueurzLuU_8U',
		address: `${searchTerm}`
	}
	$.getJSON(CIVIC_SEARCH_URL, query, callback);
}

function initMap(latitude, longitude, address, longAddress) {
	//let myLatLng = [{lat: 37.541644, lng: -77.433904}, {lat: 37.543269, lng: -77.436210}];
	//let myLatLng = {lat: latitude, lng: longitude};
	//console.log(myLatLng);
	let myLatLng = resultsArray;
	let map = new google.maps.Map(document.getElementById('map'), {
		center: myLatLng[0],
		zoom: 8
	});
	let marker;
	for(let i=0; i<myLatLng.length; i++) {
		marker = new google.maps.Marker({
        	map: map,
        	position: new google.maps.LatLng(myLatLng[i]),
        	//title: ''
    	});
	}
    let infowindow = new google.maps.InfoWindow({});
    google.maps.event.addListener(marker, 'click', (function (marker) {
		return function () {
			infowindow.setContent(longAddress + `</br><a href="https://www.google.com/maps/place/${address}">Directions</a>`);
			infowindow.open(map, marker);
		}
	})(marker));
}

/*function initMap(latitude, longitude, address, longAddress) {
	let myLatLng = {lat: latitude, lng: longitude};
	let map = new google.maps.Map(document.getElementById('map'), {
		center: myLatLng,
		zoom: 17
	});
	let marker = new google.maps.Marker({
        map: map,
        position: myLatLng,
        title: ''
    });
    let infowindow = new google.maps.InfoWindow({});
    google.maps.event.addListener(marker, 'click', (function (marker) {
		return function () {
			infowindow.setContent(longAddress + `</br><a href="https://www.google.com/maps/place/${address}">Directions</a>`);
			infowindow.open(map, marker);
		}
	})(marker));
}*/

function displayGoogleVoterInfoResults(data) {
	let locationNames = data.pollingLocations;
	for(let i = 0; i < locationNames.length; i++){
		console.log(data.pollingLocations[i].address.locationName);
	}0
	console.log('display function ran');
	let locations = data.pollingLocations;
	let locationArray = [];
	for(let i = 0; i < locations.length; i++) {
		locationArray.push(data.pollingLocations[i].address.line1 + '\ ' + data.pollingLocations[i].address.city + '\ ' + data.pollingLocations[i].address.state + '\ ' + data.pollingLocations[i].address.zip);
	}
	console.log(locationArray);
	let coordinatesArray = [];
	locationArray.map(item => {
		getDataFromGeocodingApi(item, displayCoordinateResults);
	});
}

function displayCoordinateResults(data) {
	resultsArray.push({lat: data.results[0].geometry.location.lat, lng: data.results[0].geometry.location.lng});
	console.log(resultsArray);
	console.log(data);
	latitude = data.results[0].geometry.location.lat;
	longitude = data.results[0].geometry.location.lng;
	address = data.results[0].formatted_address;
	longAddress = data.results[0].address_components[0].long_name + '\ ' + data.results[0].address_components[1].short_name;
	initMap(latitude, longitude, address, longAddress);
}

function renderMap() {
	console.log('map rendering');
	$('#address-form').addClass("hidden");
	$('#map').removeClass("hidden");
}

function watchSubmit() {
	$('#address-form').submit(event => {
		event.preventDefault();
		console.log('enter button clicked');
		let streetAddressTarget = $(event.currentTarget).find('#street-address');
		 streetAddress = streetAddressTarget.val();
		let cityTarget = $(event.currentTarget).find('#city');
		let city = cityTarget.val();
		let stateTarget = $(event.currentTarget).find('#state');
		let state = stateTarget.val();
		let zipTarget = $(event.currentTarget).find('#zip');
		let zip = zipTarget.val();
		let address = streetAddress + '\ ' + city + '\ ' + state + '\ ' + zip;
		console.log(address);
		streetAddressTarget.val('');
		cityTarget.val('');
		stateTarget.val('');
		zipTarget.val('');
		getDataFromCivicApi(address, displayGoogleVoterInfoResults);
		address = undefined;
		renderMap();	
	});
}

$(watchSubmit);
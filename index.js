const CIVIC_SEARCH_URL = 'https://www.googleapis.com/civicinfo/v2/voterinfo';
const GEOCODING_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
let coordinatesArray = [];
let longAddressArray = [];
let formattedAddressArray = [];

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

function renderSearchForm() {
	$('#go-back').addClass('hidden');
	$('#map').addClass('hidden');
	$('#address-form').removeClass('hidden');
}

function handleSearchAnotherAddressClicks() {
	$('#go-back').on('click', event => {
		coordinatesArray = [];
		longAddressArray = [];
		formattedAddressArray = [];
		renderSearchForm();
	});
}

function initMap() {
	let myLatLng = coordinatesArray;
	let longAddress = longAddressArray;
	let formattedAddress = formattedAddressArray;
	let map = new google.maps.Map(document.getElementById('map'), {
		center: myLatLng[0],
		zoom: 8
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

function displayGoogleVoterInfoResults(data) {
	console.log('displayGoogleVoterInfoResults ran');
	let locations = data.pollingLocations;
	let locationArray = [];
	for(let i = 0; i < locations.length; i++) {
		locationArray.push(data.pollingLocations[i].address.line1 + '\ ' + data.pollingLocations[i].address.city + '\ ' + data.pollingLocations[i].address.state + '\ ' + data.pollingLocations[i].address.zip);
	}
	let coordinatesArray = [];
	locationArray.map(item => {
		getDataFromGeocodingApi(item, displayCoordinateResults);
	});
}

function displayCoordinateResults(data) {
	coordinatesArray.push({lat: data.results[0].geometry.location.lat, lng: data.results[0].geometry.location.lng});
	longAddressArray.push(data.results[0].address_components[0].long_name + '\ ' + data.results[0].address_components[1].short_name);
	formattedAddressArray.push(data.results[0].formatted_address);
	initMap();
}

function renderMap() {
	console.log('map rendering');
	$('#address-form').addClass("hidden");
	$('#map').removeClass("hidden");
	$('#go-back').removeClass('hidden');
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
$(handleSearchAnotherAddressClicks);
const CIVIC_SEARCH_URL = 'https://www.googleapis.com/civicinfo/v2/voterinfo';
const REPRESENTATIVES_SEARCH_URL = 'https://www.googleapis.com/civicinfo/v2/representatives';
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

function getDataFromCivicRepresentativeApi(searchTerm, callback) {
	console.log('Civic API query performed');
	const query = {
		key: 'AIzaSyCc83loc2gllyDhzsjFtTs7ueurzLuU_8U',
		address: `${searchTerm}`
	}
	$.getJSON(REPRESENTATIVES_SEARCH_URL, query, callback);
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
		$('#representatives').addClass('hidden');
		$('#polling-sites').addClass('hidden');
	});
}

function initMap1() {
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

function displayRepresentativeResults(data) {
	for(let i=0; i<data.offices.length; i++){
		let officesArray = data.offices[i].name;
		let myArray = data.offices[i].officialIndices;
		for(let i=0; i<myArray.length; i++){
			arrayIndex = myArray[i];
			console.log(officesArray + ': ' + data.officials[arrayIndex].name);
		}
	}
}

function displayGoogleVoterInfoResults(data) {
	console.log('displayGoogleVoterInfoResults ran');
	let pollingLocations = data.pollingLocations;
	let pollingLocationsArray = [];
	for(let i = 0; i < pollingLocations.length; i++) {
		pollingLocationsArray.push(data.pollingLocations[i].address.line1 + '\ ' + data.pollingLocations[i].address.city + '\ ' + data.pollingLocations[i].address.state + '\ ' + data.pollingLocations[i].address.zip);
	}
	let coordinatesArray = [];
	pollingLocationsArray.map(item => {
		getDataFromGeocodingApi(item, displayCoordinateResults);
	});
}

function displayCoordinateResults(data) {
	coordinatesArray.push({lat: data.results[0].geometry.location.lat, lng: data.results[0].geometry.location.lng});
	longAddressArray.push(data.results[0].address_components[0].long_name + '\ ' + data.results[0].address_components[1].short_name);
	formattedAddressArray.push(data.results[0].formatted_address);
	initMap1();
}

function renderSearchOptions() {
	console.log('rendering search options');
	$('#address-form').addClass("hidden");
	$('#go-back').removeClass('hidden');
	$('#representatives').removeClass('hidden');
	$('#polling-sites').removeClass('hidden');
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
		let address = streetAddress + '\ ' + city + '\ ' + state;
		streetAddressTarget.val('');
		cityTarget.val('');
		stateTarget.val('');
		getDataFromCivicApi(address, displayGoogleVoterInfoResults);
		getDataFromCivicRepresentativeApi(address, displayRepresentativeResults);
		address = undefined;
		renderSearchOptions();	
	});
}

$(watchSubmit);
$(handleSearchAnotherAddressClicks);
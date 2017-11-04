const CIVIC_SEARCH_URL = 'https://www.googleapis.com/civicinfo/v2/voterinfo';
const GEOCODING_URL = 'https://maps.googleapis.com/maps/api/geocode/json';

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

function initMap(latitude, longitude) {
	let map = new google.maps.Map(document.getElementById('map'), {
		center: {
			lat: latitude, lng: longitude
		},
		zoom: 17
	});
}


function displayGoogleVoterInfoResults(data) {
	console.log(data);
	console.log('display function ran');
	let locations = data.pollingLocations;
	let locationArray = [];
	for(let i = 0; i < locations.length; i++) {
		locationArray.push(data.pollingLocations[i].address.line1 + '\ ' + data.pollingLocations[i].address.city + '\ ' + data.pollingLocations[i].address.state + '\ ' + data.pollingLocations[i].address.zip);
	}
	console.log(locationArray);
	locationArray.map(item => {
		getDataFromGeocodingApi(item, displayCoordinateResults);
	});
}

function displayCoordinateResults(data) {
	//console.log(data.results[0].geometry.location.lat);
	latitude = data.results[0].geometry.location.lat;
	longitude = data.results[0].geometry.location.lng;
	initMap(latitude, longitude);
}


function watchSubmit() {
	$('#address-form').submit(event => {
		event.preventDefault();
		console.log('enter button clicked');
		const streetAddressTarget = $(event.currentTarget).find('#street-address');
		const streetAddress = streetAddressTarget.val();
		const cityTarget = $(event.currentTarget).find('#city');
		const city = cityTarget.val();
		const stateTarget = $(event.currentTarget).find('#state');
		const state = stateTarget.val();
		const zipTarget = $(event.currentTarget).find('#zip');
		const zip = zipTarget.val();
		const address = streetAddress + '\ ' + city + '\ ' + state + '\ ' + zip;
		console.log(address);
		streetAddressTarget.val('');
		cityTarget.val('');
		stateTarget.val('');
		zipTarget.val('');
		getDataFromCivicApi(address, displayGoogleVoterInfoResults);
	});
}

$(watchSubmit);

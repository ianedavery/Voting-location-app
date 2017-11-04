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

function initMap(latitude, longitude, address) {
	let myLatLng = {lat: latitude, lng: longitude};
	console.log(myLatLng);
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
			infowindow.setContent(`<a href="https://www.google.com/maps/place/${address}">Directions</a>`);
			infowindow.open(map, marker);
		}
	})(marker));
}

function displayGoogleVoterInfoResults(data) {
	console.log(data.pollingLocations[0].address.locationName);
	console.log('display function ran');
	let locations = data.pollingLocations;
	let locationArray = [];
	for(let i = 0; i < locations.length; i++) {
		locationArray.push(data.pollingLocations[i].address.line1 + '\ ' + data.pollingLocations[i].address.city + '\ ' + data.pollingLocations[i].address.state + '\ ' + data.pollingLocations[i].address.zip);
	}
	//renderPollingLocationInfo(`${data.pollingLocations[0].address.locationName}`);
	console.log(locationArray);
	locationArray.map(item => {
		getDataFromGeocodingApi(item, displayCoordinateResults);
	});
}

function displayCoordinateResults(data) {
	latitude = data.results[0].geometry.location.lat;
	longitude = data.results[0].geometry.location.lng;
	address = data.results[0].formatted_address;
	console.log(address);
	initMap(latitude, longitude, address);
}

function watchSubmit() {
	$('#address-form').submit(event => {
		event.preventDefault();
		console.log('enter button clicked');
		let streetAddressTarget = $(event.currentTarget).find('#street-address');
		let streetAddress = streetAddressTarget.val();
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
	});
}

$(watchSubmit);
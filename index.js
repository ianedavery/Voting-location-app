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
	$('#map').addClass('hide-map');
	$('#address-form').removeClass('hidden');
}

function handleSearchAnotherAddressClicks() {
	$('#go-back').on('click', event => {
		coordinatesArray = [];
		longAddressArray = [];
		formattedAddressArray = [];
		myLatLng = undefined;
		representativeResults = undefined;
		address = undefined;
		renderSearchForm();
		$('#representatives').addClass('hidden');
		$('#polling-sites').addClass('hidden');
		$('#representatives-list').empty();
	});
}

function initMap() {
	myLatLng = coordinatesArray;
	console.log(coordinatesArray);
	let longAddress = longAddressArray;
	console.log(longAddress);
	let formattedAddress = formattedAddressArray;
	console.log(formattedAddress);
	let map = new google.maps.Map(document.getElementById('map'), {
		center: myLatLng[0],
		zoom: 12
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
			representativeResults = `
				<div class='officials-containers'>
					<h2>${officesArray}</h2>
						<p>${data.officials[arrayIndex].name}</br>${data.officials[arrayIndex].party}</p>
				</div>
			`;
			$('#representatives-list').append(representativeResults);
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
	pollingLocationsArray.map(item => {
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
	$('#map').removeClass('hide-map');
	$('#representatives-list').addClass('hidden');
}

function renderRepresentativesList() {
		$('#representatives-list').removeClass('hidden');
		$('#map').addClass('hide-map');
}

function handleYourRepresentativesClicks() {
	console.log(representativeResults);
	$('#representatives').on('click', event => {
		if(representativeResults == undefined) {
			alert('Sorry. I don\'t have any information based on the addressed you entered.');
		}
		else {
			renderRepresentativesList();
		}	
	});
}

function handleViewPollingLocationClicks() {
	$('#polling-sites').on('click', event => {
		if(myLatLng == undefined){
			alert('Sorry. I currently don\'t have any information on elections in your area.');
		}
		else {
			renderMap();
		}
	});
}

function renderSearchOptions() {
	console.log('rendering search options');
	$('#address-form').addClass("hidden");
	$('#go-back').removeClass('hidden');
	$('#representatives').removeClass('hidden');
	$('#polling-sites').removeClass('hidden');
	$('#representatives-list').addClass('hidden');
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
		address = streetAddress + '\ ' + city + '\ ' + state;
		console.log(address);
		streetAddressTarget.val('');
		cityTarget.val('');
		stateTarget.val('');
		getDataFromCivicApi(address, displayGoogleVoterInfoResults);
		getDataFromCivicRepresentativeApi(address, displayRepresentativeResults);
		renderSearchOptions();
	});
}

$(watchSubmit);
$(handleSearchAnotherAddressClicks);
$(handleViewPollingLocationClicks);
$(handleYourRepresentativesClicks);
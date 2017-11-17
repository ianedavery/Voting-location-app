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
		$('#no-representative-results-container').addClass('hidden');
		$('#representatives').addClass('hidden', 'active');
		$('#polling-sites').removeClass('active');
		$('#polling-sites').addClass('hidden');
		$('#representatives-list').empty();
		$('#no-election-results-container').addClass('hidden');
		$('#nav-bar').addClass('up')
		$('#nav-bar').removeClass('down')
		$('#nav-banner-container').prepend(`<h1 role='banner' id='nav-banner'>Get Involved</h1>`);
		$('html, body').animate({ scrollTop: 0 }, 'fast');
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

function displayRepresentativeResults(data) {
	for(let i=0; i<data.offices.length; i++){
		let officesArray = data.offices[i].name;
		let myArray = data.offices[i].officialIndices;
		for(let i=0; i<myArray.length; i++){
			arrayIndex = myArray[i];
			representativeResults = `
				<div class='officials-containers col-xs-12 col-sm-12 col-md-4 col-lg-3'>
						
							<div class='photo-container'>
								<img src='${data.officials[arrayIndex].photoUrl}' alt="Politician's headshot" class='photo' onerror="this.onerror=null;this.src='https://d2ytqrx2swf6ug.cloudfront.net/assets/no-image-available-bbdbbe501d2b08a157a21431bc7b49df2c6cf6d892cc3083114229876cd7d6f4.jpg';"></img>
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
			$('#map').addClass('hide-map');
			$('#no-election-results-container').addClass('hidden');
		}
		else {
			renderRepresentativesList();
		}	
	});
}

function handleViewPollingLocationClicks() {

	$('#polling-sites').on('click', event => {
		$('#no-representative-results-container').addClass('hidden');
		if(myLatLng == undefined) {
			$('#representatives-list').addClass('hidden');
			$('#no-election-results-container').removeClass('hidden');
			$('#no-representative-results-container').addClass('hidden');
		}
		else {
			renderMap();
		}
	});
}

function handlePollingSitesTabClicks() {
	$('#polling-sites').on('click', event => {
		$('#polling-sites').addClass('active');
		$('#representatives').removeClass('active');
	});
}

function handleRepError() {
	if(representativeResults == undefined) {
		$('#no-representative-results-container').removeClass('hidden');
	}
	else {
		$('#no-representative-results-container').addClass('hidden');
	}
}

function handleRepresentativeTabClicks() {
	$('#representatives').on('click', event => {
		$('#representatives').addClass('active');
		$('#polling-sites').removeClass('active');
		handleRepError();
		$('#no-election-results-container').addClass('hidden');
	});
}

function renderSearchOptions() {
	console.log('rendering search options');
	$('#address-form').addClass("hidden");
	$('#go-back').removeClass('hidden');
	$('#representatives').removeClass('hidden');
	$('#polling-sites').removeClass('hidden');
	$('#representatives-list').removeClass('hidden');
	$('#representatives').addClass('active');
	setTimeout(function() {
		if(representativeResults == undefined) {
			$('#no-representative-results-container').removeClass('hidden');
		}
		else {
			$('#no-representative-results-container').addClass('hidden');
		}
	}, 500);
	$('#polling-sites').removeClass('active');
	$('#nav-bar').addClass('down');
	$('#nav-banner').empty();
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
$(handleRepresentativeTabClicks);
$(handlePollingSitesTabClicks);
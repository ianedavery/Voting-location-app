const CIVIC_SEARCH_URL = 'https://www.googleapis.com/civicinfo/v2/voterinfo';
const REPRESENTATIVES_SEARCH_URL = 'https://www.googleapis.com/civicinfo/v2/representatives';
const GEOCODING_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
let pollingLocationsCoordinatesArray = [];
let earlySitesCoordinatesArray = [];
let dropOffCoordinatesArray = [];
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
		pollingLocationsCoordinatesArray = [];
		earlySitesCoordinatesArray = [];
		dropOffCoordinatesArray = [];
		longAddressArray = [];
		formattedAddressArray = [];
		renderSearchForm();
	});
}

function initMap1() {
	let myLatLng = pollingLocationsCoordinatesArray;
	//console.log(myLatLng);
	let longAddress = longAddressArray;
	//console.log(longAddress);
	let formattedAddress = formattedAddressArray;
	//console.log(formattedAddress);
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
	//creating array for polling location addresses
	let pollingLocations = data.pollingLocations;
	console.log(pollingLocations);
	let pollingLocationsArray = [];
	for(let i = 0; i < pollingLocations.length; i++) {
		pollingLocationsArray.push(data.pollingLocations[i].address.line1 + '\ ' + data.pollingLocations[i].address.city + '\ ' + data.pollingLocations[i].address.state + '\ ' + data.pollingLocations[i].address.zip);
	}
	pollingLocationsArray.map(item => {
		getDataFromGeocodingApi(item, displayCoordinateResults);
	});
}

function displayRepresentativeResults(data) {
	console.log(data.officials[0].name[data.offices[0].officialIndices]);
	/*let foo = data.offices
	for(let i=0; i<foo.length; i++) {
		console.log(data.offices[i].name);
	}
	let bar = data.officials
	for(let i=0; i<bar.length; i++) {
		console.log(data.officials[i].name);
	}*/
}

function displayEarlySiteVoterInfoResults(data) {
	let earlyVotingLocations = data.earlyVoteSites;
	console.log(earlyVotingLocations);
	if(data.earlyVoteSites) {
		let earlyVotingLocationsArray = [];
		for(let i = 0; i < earlyVotingLocations.length; i++){
			earlyVotingLocationsArray.push(data.earlyVoteSites[i].address.line1 + '\ ' + data.earlyVoteSites[i].address.city + '\ ' + data.earlyVoteSites[i].address.state + '\ ' + data.earlyVoteSites[i].address.zip);
		}
		//console.log(earlyVotingLocationsArray);
		earlyVotingLocationsArray.map(item => {
			getDataFromGeocodingApi(item, displayCoordinateResults);
		});
	}
	else {
		alert('Sorry. I was unable to find any early voting sites for this election.');
	}
}

function displayDropOffVoterInfoResults(data) {
	let dropOffVotingLocations = data.dropOffLocations;
	console.log(dropOffVotingLocations);
	if(dropOffVotingLocations) {
		let dropOffCoordinatesArray = [];
		for(let i = 0; i < dropOffVotingLocations.length; i++){
			dropOffCoordinatesArray.push(data.dropOffLocations[i].address.line1 + '\ ' + data.dropOffLocations[i].address.city + '\ ' + data.dropOffLocations[i].address.state + '\ ' + data.dropOffLocations[i].address.zip);
		}
		//console.log(dropOffCoordinatesArray);
		dropOffCoordinatesArray.map(item => {
			getDataFromGeocodingApi(item, displayCoordinateResults);
		});
	}
	else {
		alert('Sorry. I was unable to find any drop off locations for this election.');
	}
}

function displayCoordinateResults(data) {
	//console.log(data.results[0]);
	//pollingLocationsCoordinatesArray = [];
	pollingLocationsCoordinatesArray.push({lat: data.results[0].geometry.location.lat, lng: data.results[0].geometry.location.lng});
	//console.log(pollingLocationsCoordinatesArray);
	//earlySitesCoordinatesArray.push({lat: data.results[0].geometry.location.lat, lng: data.results[0].geometry.location.lng});
	longAddressArray.push(data.results[0].address_components[0].long_name + '\ ' + data.results[0].address_components[1].short_name);
	formattedAddressArray.push(data.results[0].formatted_address);
	initMap1();
}

/*function displayEarlyVotingSites(data) {
	console.log(displayGoogleVoterInfoResults(data.earlyVoteSites[0].address.line1 + '\ ' + data.earlyVoteSites[0].address.city + '\ ' + data.earlyVoteSites[0].address.state + '\ ' + data.earlyVoteSites[0].address.zip));
}

displayEarlyVotingSites();*/

function renderMap() {
	console.log('map rendering');
	$('#address-form').addClass("hidden");
	$('#map').removeClass("hidden");
	$('#go-back').removeClass('hidden');
	$('#early-sites').removeClass('hidden');
	$('#drop-off').removeClass('hidden');
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
		streetAddressTarget.val('');
		cityTarget.val('');
		stateTarget.val('');
		zipTarget.val('');
		//getDataFromCivicApi(address, displayGoogleVoterInfoResults);
		getDataFromCivicRepresentativeApi(address, displayRepresentativeResults);
		//renderMap();
		$('#early-sites').on('click', event => {
			console.log('early-sites button clicked');
			pollingLocationsCoordinatesArray = [];
			dropOffCoordinatesArray = [];
			longAddressArray = [];
			formattedAddressArray = [];
			getDataFromCivicApi(address, displayEarlySiteVoterInfoResults);
		});
		$('#drop-off').on('click', event => {
			console.log('drop-off button clicked');
			pollingLocationsCoordinatesArray = [];
			earlySitesCoordinatesArray = [];
			longAddressArray = [];
			formattedAddressArray = [];
			getDataFromCivicApi(address, displayDropOffVoterInfoResults);
		});		
	});
}

$(watchSubmit);
$(handleSearchAnotherAddressClicks);
//$(watchEarlySitesClick);
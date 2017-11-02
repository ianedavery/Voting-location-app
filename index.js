const CIVIC_SEARCH_URL = 'https://www.googleapis.com/civicinfo/v2/voterinfo';
const GEOCODING_URL = 'https://maps.googleapis.com/maps/api/geocode';

function getDataFromGeocodingApi(searchTerm, callback) {
	console.log('Geocoding API queried');
	const query = {
		key: 'AIzaSyCc83loc2gllyDhzsjFtTs7ueurzLuU_8U',
		address: `${searchTerm}`
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

/*function translateToCoordinates (data) {
	const coordinateArray = data.pollingLocations.map(item => {
		data.pollingLocations.push(`https://maps.googleapis.com/maps/api/geocode/json?address=${item}&key=AIzaSyCc83loc2gllyDhzsjFtTs7ueurzLuU_8U`);

	});
	console.log(coordinateArray);
}*/

function displayGoogleVoterInfoResults(data) {
	console.log('display function ran');
	let locations = data.pollingLocations;
	let locationArray = [];
	for(let i = 0; i < locations.length; i++) {
		locationArray.push(data.pollingLocations[i].address.line1 + '\ ' + data.pollingLocations[i].address.city + '\ ' + data.pollingLocations[i].address.state + '\ ' + data.pollingLocations[i].address.zip);
	}
	console.log(locationArray);
	/*let coordinatesArray = [];
	for (let i = 0; i < locationArray.length; i++) {
		coordinatesArray.push(`https://maps.googleapis.com/maps/api/geocode/json?address=${locationArray[i]}&key=AIzaSyCc83loc2gllyDhzsjFtTs7ueurzLuU_8U`);
	}
	console.log(coordinatesArray);*/
	//}
	//let locationArray = [];
	//for(let i = 0; i < data.length; i++) {

	//}
	//data.pollingLocations.map((item) => 
		//({locationName: item.address}));
		//console.log(item);
	//const coordinateArray = [results.address];
	//console.log(locationArray);
	//console.log(results);
}

function watchSubmit() {
	$('#address-form').submit(event => {
		event.preventDefault();
		console.log('enter button clicked');
		const streetAddressTarget = $(event.currentTarget).find('#street-address');
		const streetAddress = streetAddressTarget.val();
		console.log(streetAddress);
		const cityTarget = $(event.currentTarget).find('#city');
		const city = cityTarget.val();
		console.log(city);
		const stateTarget = $(event.currentTarget).find('#state');
		const state = stateTarget.val();
		console.log(state);
		const zipTarget = $(event.currentTarget).find('#zip');
		const zip = zipTarget.val();
		console.log(zip);
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
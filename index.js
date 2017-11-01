const CIVIC_SEARCH_URL = 'https://www.googleapis.com/civicinfo/v2/voterinfo';

function getDataFromApi(searchTerm, callback) {
	const query = {
		address: `${searchTerm}`,
		key: 'AIzaSyCc83loc2gllyDhzsjFtTs7ueurzLuU_8U'
	}
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
		//streetAddress.val('');
		//cityTarget.val('');
		//stateTarget.val('');
		//zipTarget.val('');
	});
}

$(watchSubmit);
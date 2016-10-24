(function() {
    'use strict'; // turn on Strict Mode
    // hide and show button to acheive some level of responsiveness
$('.hide-search').click(function(){
	$('#show-location').hide();
	$('#maps-area').addClass('col-md-12');
	$('#maps-area').addClass('col-xs-12');
	$('.show-search').removeClass('hide');
	$('#maps-area').removeClass('col-md-7');
	$('#maps-area').removeClass('col-xs-7');
});

$('.show-search').click(function(){
	$('#show-location').show();
	$('#maps-area').removeClass('col-md-12');
	$('#maps-area').removeClass('col-xs-12');
	$('.show-search').addClass('hide');
	$('#maps-area').addClass('col-md-7');
	$('#maps-area').addClass('col-xs-7');
});

//item object containing name and location data
var Item = function(data){
	if( ko.isObservable(data.name)){
		this.name = ko.observable(data.name());
		this.location = ko.observable( {
			lat: ko.observable(data.location().lat()),
			lon: ko.observable(data.location().lon())
		});

	}else{
		this.name = ko.observable(data.name);
		this.location = ko.observable( {
			lat: ko.observable(data.location.lat),
			lon: ko.observable(data.location.lng)
		});
	}
};

var markers = [];

function createMarkers(placeList, map){
	var locations = [];
	placeList.forEach(function(item){
		locations.push([item.location().lat(), item.location().lon()]);
	});

	var marker;

	locations.forEach(function(item){
		marker = new google.maps.Marker({
			position: new google.maps.LatLng(item[0], item[1]),
			map: map
		});
		markers.push(marker);
	});
};

//use for viewing google maps
function initMap(placeList) {
	var map;
	if(placeList.length > 0)
	{
		var map = new google.maps.Map(document.getElementById('map'), {
			zoom: 15,
			center: new google.maps.LatLng(placeList[0].location().lat(),placeList[0].location().lon() )
		});

		var markers = createMarkers(placeList, map);
	}
	return map;
};

function viewModel(){
	var self = this;
	self.filterVal = ko.observable("");
	self.nameList = ko.observableArray([]);
	self.isError = ko.observable(false);
	self.filteredList = ko.observableArray();
	var map;

	//four square api url
	var fromFoursquare =  "https://api.foursquare.com/v2/venues/suggestCompletion?near=winnipeg,MB&";
	var find = "query=sushi";
	var client_id = "&client_id=JLJ4QQ1LQ1QDJTXB55TJERDREOJEVYRVIDRAD34PXTBCRQYW&";
	var client_secret = "client_secret=B4DOCE1DROPQT3WMDOTNB0KUUP0EDIJGA1QIFG5O0H0INB1K&";
	var v = "v=20161020";
	var url = fromFoursquare+find+client_id+client_secret+v;

	//get data from foursquare api and put the places in namelist
	$.getJSON(url, function(data) {
		data.response.minivenues.forEach(function (item){
			self.nameList.push(new Item(item));
		});
	}).then(function(){
		self.map = initMap(self.nameList());
	});



	//filters the locations according to user input in field
	self.showFiltered = ko.computed(function(){
		self.isError(false);
		if(self.filterVal() !== ""){
			//remove all the filtered list if anything new typed
			self.filteredList.removeAll();
			//names were matched with user input will be filtered lit
			self.nameList().forEach(function(item){
        if (item.name().toLowerCase().indexOf(self.filterVal().toLowerCase()) != -1) {
          self.filteredList.push(new Item(item));
        }
			});
			//if something was added then show names with markers
			if(self.filteredList().length > 0){
				return self.filteredList();
      }
			//show error
			else{
				self.isError(true);
      }
		}
		else{
			//if nothing was in the input box then all names were shown
			return self.nameList();
    }
	});
};

ko.applyBindings(new viewModel());
}()); // end of file
Refer


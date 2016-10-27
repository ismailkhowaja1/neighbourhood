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
		this.address = ko.observable(data.location.address);
		this.marker = data.marker;
		this.infowindow = data.infowindow;
		this.location = ko.observable( {
			lat: ko.observable(data.location().lat()),
			lon: ko.observable(data.location().lon()),
		});

	}else{
		var addr = data.location.address;
		if (addr == null){
			addr = "Address Not provided by fourSquare API";
		}
		this.name = ko.observable(data.name  + " - " + addr);
		var crossStr = data.location.crossStreet;
		var postalCodes = data.location.postalCode;
		if (postalCodes == null){postalCodes = "Not provided";}
		if (crossStr == null){crossStr = "";}
		this.address = ko.observable(addr + "\n " + crossStr + ", Postal code: "+ postalCodes);
		var marker;
		var infowindow;
		this.location = ko.observable( {
			lat: ko.observable(data.location.lat),
			lon: ko.observable(data.location.lng)
		});
		this.showMe = ko.observable(true);
	}
};

var markersList = [];
var map,
	bounds,
	infowindow;


function createMarkers(placeList, map){
	var index = 0;
	placeList.forEach(function(item){
		item.marker = new google.maps.Marker({
			id:index,
			position: new google.maps.LatLng(item.location().lat(), item.location().lon()),
			animation: google.maps.Animation.DROP,
			map: map
		});
		infowindow.marker = item.marker;

        item.marker.addListener('click', function() {
        	vm.doAnimate(item);
        });
        bounds.extend(item.marker.position);
		markersList.push(item.marker);
		index = index + 1;
	});
	map.fitBounds(bounds);
}

//use for viewing google maps
function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
		zoom: 15,
		center: new google.maps.LatLng(49.8900, -97.1527)
	});
	bounds = new google.maps.LatLngBounds();
	infowindow = new google.maps.InfoWindow();
}

function showAllMarker (placeList) {
	if(placeList.length > 0){
		placeList.forEach(function (item) {
			if(item.marker){
				item.marker.setVisible(true);
				item.showMe(true);
			}
		});
	}
}

var activeWindow;
self.doAnimate = function(clickedItem){
	var timeout = 700;
	if (activeWindow != null){
		activeWindow.close();
	}
	if(clickedItem.marker){
		if(clickedItem.marker.getAnimation() !== null){
			clickedItem.marker.setAnimation(null);
		}else{
			clickedItem.marker.setAnimation(google.maps.Animation.BOUNCE);
			activeWindow = clickedItem.infowindow;
			infowindow.setContent(clickedItem.address());
			infowindow.open(map, clickedItem.marker);
			setTimeout(function () {
    			clickedItem.marker.setAnimation(null);
			}, timeout);
		}
	}
};





function viewModel(){
	var self = this;
	self.filterVal = ko.observable("");
	self.nameList = ko.observableArray([]);
	self.isError = ko.observable(false);
	self.jsonError = ko.observable(false);
	self.filteredList = ko.observableArray();
		
	//four square api url
	var fromFoursquare =  "https://api.foursquare.com/v2/venues/suggestCompletion?near=winnipeg,MB&";
	var find = "query=starbucks";
	var client_id = "&client_id=JLJ4QQ1LQ1QDJTXB55TJERDREOJEVYRVIDRAD34PXTBCRQYW&";
	var client_secret = "client_secret=B4DOCE1DROPQT3WMDOTNB0KUUP0EDIJGA1QIFG5O0H0INB1K&";
	var v = "v=20161020";
	var url = fromFoursquare+find+client_id+client_secret+v;

	var activeWindow;
	self.doAnimate = function(clickedItem){
		var timeout = 700;
		if (activeWindow != null){
			activeWindow.close();
		}
		if(clickedItem.marker){
			if(clickedItem.marker.getAnimation() !== null){
				clickedItem.marker.setAnimation(null);
			}else{
				clickedItem.marker.setAnimation(google.maps.Animation.BOUNCE);
				activeWindow = clickedItem.infowindow;
				infowindow.setContent(clickedItem.address());
				infowindow.open(map, clickedItem.marker);
				setTimeout(function () {
        			clickedItem.marker.setAnimation(null);
    			}, timeout);
			}
		}
	};


	//get data from foursquare api and put the places in namelist
	$.getJSON(url, function(data) {
		data.response.minivenues.forEach(function (item){
			self.nameList.push(new Item(item));
		});
		createMarkers(self.nameList(), map);
	}).fail(function(){
		self.jsonError(true);
	});

	//filters the locations according to user input in field
	self.showFiltered = ko.computed(function(){
		self.isError(false);
		if(self.filterVal() !== ""){
			//remove all the filtered list if anything new typed
			//names were matched with user input will be filtered lit
			var count = 0;
			self.nameList().forEach(function(item){
		        if (item.name().toLowerCase().indexOf(self.filterVal().toLowerCase()) != -1) {
		          	item.showMe(true);
		          	item.marker.setVisible(true);
		        } else {
		        	infowindow.close();
		        	item.showMe(false);
		        	item.marker.setVisible(false);
		        	count++;
		        }
			});
			if (count === self.nameList().length) {
				self.isError(true);
			}
		} else {//if nothing was in the input box then all names were shown
			showAllMarker(self.nameList());
		}
	});
}

function googleError() {
	alert('Sorry, Google maps crashed');
}

var vm = new viewModel();
ko.applyBindings(vm);



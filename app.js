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
		this.address = ko.observable(data.location.address);
		var	marker;
		var infowindow;
		this.location = ko.observable( {
			lat: ko.observable(data.location().lat()),
			lon: ko.observable(data.location().lon()),
		});

	}else{
		this.name = ko.observable(data.name);
		this.address = ko.observable(data.location.address
		 + "\n " + data.location.crossStreet +
		  ", Postal code: "+ data.location.postalCode);
		var marker;
		var infowindow;
		this.location = ko.observable( {
			lat: ko.observable(data.location.lat),
			lon: ko.observable(data.location.lng)
		});
	}
};

var markersList = [];


function createMarkers(placeList, map){
	var index = 0;
	placeList.forEach(function(item){
		item.marker = new google.maps.Marker({
			id:index,
			position: new google.maps.LatLng(item.location().lat(), item.location().lon()),
			animation: google.maps.Animation.DROP,
			map: map
		});
		item.infowindow = new google.maps.InfoWindow({
          content: item.address()
        });
		markersList.push(item.marker);
		index = index + 1;
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

		createMarkers(placeList, map);


	}
	return map;
};

function showAllMarker (placeList) {
	if(placeList.length > 0){
		placeList.forEach(function (item) {
			if(item.marker){
				item.marker.setVisible(true);

			}
		})
	}
};



function viewModel(){
	var self = this;
	self.filterVal = ko.observable("");
	self.nameList = ko.observableArray([]);
	self.isError = ko.observable(false);
	self.jsonError = ko.observable(false);
	self.filteredList = ko.observableArray();
	var map;
	
	self.doAnimate = function(clickedItem){
		var timeout = 200;
		if(clickedItem.marker){
			if(clickedItem.marker.getAnimation() !== null){
				clickedItem.marker.setAnimation(null);
			}else{
				clickedItem.marker.setAnimation(google.maps.Animation.BOUNCE);
				clickedItem.infowindow.open(map, clickedItem.marker);
				setTimeout(function () {
        			clickedItem.marker.setAnimation(null);
    			}, 1000);
			}
		}
	};
	
	

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
	}).fail(function(){
		self.jsonError(true);
	})

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
		          	item.marker.setVisible(true);
		        }else{
		        	item.infowindow.close();
		        	item.marker.setVisible(false);
		        }
			});
			//if something was added then show names with markers
			if(self.filteredList().length > 0){
				createMarkers(self.filteredList(), map);
				return self.filteredList();
      		}
			//show error
			else{
				self.isError(true);
      		}
		}
		else{//if nothing was in the input box then all names were shown
				showAllMarker(self.nameList());
				return self.nameList();
    		}
	});
};

ko.applyBindings(new viewModel());
}()); // end of file
Refer


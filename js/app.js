var map, markers, infoWindow, foursquareBaseURL, foursquareTokensURL;

markers = [];
foursquareBaseURL = "https://api.foursquare.com/v2/venues/"
foursquareTokensURL = "?client_id=UYBI4GGI2LFQ2153VJ053EDKAGB1OUBTUQ4UBDMDUJXE50YG&client_secret=E4HB1GCMBJJ5CUAZQKWJ4NAGLW4DBO4VDPMRDVXEDZKSF4AR&v=20160621"

function initMap(){
	map = new google.maps.Map(document.getElementById("map"), {
		center: {lat: 43.115, lng: -94.685},
		zoom: 15
	});

	infoWindow = new google.maps.InfoWindow({
	    content: ''
	});

	myMVM.addMarkers();
}

// The MapLocation class is used to create points of interest on the map.
function MapLocation(name, lat, lng, filter, foursquareid) {
	var self = this;

	self.name = name;
	self.lat = lat;
	self.lng = lng;
	self.filter = filter;
	self.foursquareid = foursquareid;
}

// MapViewModel is the Knockout view model
function MapViewModel(){
	var self = this;

	self.locations = ko.observableArray([
		new MapLocation("Pizza Ranch", 43.110068, -94.678419, 'pizza lunch', '4dced120ae603b786d39708a'),
		new MapLocation("Sum Hing", 43.110831, -94.678963, 'chinese lunch dinner', '4bed9e5091380f47f12ea018'),
		new MapLocation("Don Jose's", 43.111546, -94.678973, 'mexican dinner', '4d83e2725ad3a093e469c4fd'),
		new MapLocation("A&W", 43.112178, -94.694073, 'american lunch dinner', '4bb3d81b2397b713a8b338b3')
	]);

	self.currentFilter = ko.observable();

	self.filteredLocations = ko.computed( function(){
		if (!self.currentFilter()) {
			return self.locations();
		} else {
			return ko.utils.arrayFilter(self.locations(), function(loc){
				// the input filter string
				var filter = self.currentFilter().toLowerCase();
				// the 'filter' string for location containing terms to use by filter
				var locationStr = loc.filter
				// index value of the filter in our locationStr; -1 if not present
				var strIndex = locationStr.indexOf(filter);
				// if the filter term is present in out location filter string,
				// return true to include the location in currentFilter
				if (strIndex == -1) {
					return false;
				} else {
					return true;
				};
			});
		}
	});

	self.addMarker = function(name, locationPosition, foursquareid){
		var marker = new google.maps.Marker({
			name: name,
			position: locationPosition,
			foursquareid: foursquareid,
			map: map
		});

		marker.addListener('click', function(){
			self.showInfoWindow(name, marker);
		})
		markers.push(marker);
	};

	self.setMapOnAll = function(map){
		for (var i=0; i<markers.length; i++){
			markers[i].setMap(map);
		}
	};

	self.clearMarkers = function(){
		self.setMapOnAll(null);
	};

	self.deleteMarkers = function(){
		self.clearMarkers();
		markers = [];
	}

	self.showMarkers = function(){
		self.setMapOnAll(map);
	};

	self.addMarkers = function() {
		var locations = self.filteredLocations();
		for (var i=0; i<locations.length; i++){
			var name = locations[i].name;
			var locationPosition = {};
			var foursquareid = locations[i].foursquareid;
			locationPosition.lat = locations[i].lat;
			locationPosition.lng = locations[i].lng;
			self.addMarker(name, locationPosition, foursquareid);
		}
	};

	self.filterLocations = function(){
		self.deleteMarkers();
		self.addMarkers();
		// works without showMarkers, which sets the map, but google examples
		// seem to favor explicitly setting the map, so showMarkers included
		self.showMarkers();
	};

	self.listClick = function(e){
		var listName = e.name;
		for (var i=0; i<markers.length; i++){
			var marker = markers[i];
			var markerName = marker.name;
			if (listName == markerName){
				self.showInfoWindow(markerName, marker);
			}
		};

	};

	self.showInfoWindow = function(name, marker){
		infoWindow.close();
		infoWindow.setContent('<div id="info-window"><span class="info-title">' + name + '</span><br><span class="info-address"></span></div>');
		infoWindow.open(map, marker);
		var foursquareURL = foursquareBaseURL + marker.foursquareid + foursquareTokensURL;
		$.getJSON(foursquareURL, function(data){
			console.log(data);
			var formattedAddress = data.response.venue.location.formattedAddress;
			if (formattedAddress.length > 2){
				$(".info-address").append(data.response.venue.location.formattedAddress[0]);
			} else {
				$(".info-address").append("No Address Available");
			}
		});
	};

	self.ajaxTest = function(){
		var url = "https://api.foursquare.com/v2/venues/4bb3d81b2397b713a8b338b3?client_id=UYBI4GGI2LFQ2153VJ053EDKAGB1OUBTUQ4UBDMDUJXE50YG&client_secret=E4HB1GCMBJJ5CUAZQKWJ4NAGLW4DBO4VDPMRDVXEDZKSF4AR&v=20160621"
		$.getJSON(url, function(data){
			console.log(data.response.venue.location.formattedAddress);
		});
	};
}

myMVM = new MapViewModel();

ko.applyBindings(myMVM);





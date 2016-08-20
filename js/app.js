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
		new MapLocation("Pizza Ranch", 43.110068, -94.678419, 'pizza buffet chicken salad lunch dinner', '4dced120ae603b786d39708a'),
		new MapLocation("Sum Hing", 43.110831, -94.678963, 'chinese lunch dinner', '4bed9e5091380f47f12ea018'),
		new MapLocation("Don Jose's", 43.111546, -94.678973, 'mexican lunch dinner', '4d83e2725ad3a093e469c4fd'),
		new MapLocation("A&W", 43.112178, -94.694073, 'american fast food lunch dinner', '4bb3d81b2397b713a8b338b3'),
		new MapLocation("Dublin's", 43.121483, -94.699426, 'steakhouse american dinner', '4f07a7f4e4b0671f26d5942c'),
		new MapLocation("Pizza Hut", 43.114990, -94.699391, 'pizza buffet pasta lunch salad dinner', '4c5ffa7d3a3703bb8210e406'),
		new MapLocation("Dairy Queen", 43.111683, -94.691821, 'fast food ice cream lunch dinner', '4dfa36d518a8ab1870bd6d9e'),
		new MapLocation("Subway", 43.111729, -94.691090, 'sandwich lunch dinner', '4e1e1ebfae6008881fd00618'),
		new MapLocation("Kirby's", 43.112060, -94.690508, 'american breakfast lunch dinner', '4c851b3ad92ea0936d9b6272'),
		new MapLocation("Your Family Bakery", 43.112057, -94.679220, 'breakfast donuts rolls bread', '50c3582ae4b049fc97496f1f'),
		new MapLocation("Kimbuck's", 43.110232, -94.678929, 'lunch dinner american', '55a2f899498e55581915d989'),
		new MapLocation("McDonald's", 43.112218, -94.668174, 'breakfast lunch dinner american fast food ice cream', '4d18efb01356a0932759e682')
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
				var locationStr = loc.filter;
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

			};
		};

	};

	self.showInfoWindow = function(name, marker){
		infoWindow.close();
		// setZoom and panTo zoom in the map a little and pan to the clicked
		// location; this happens when either the marker or the list item is
		// clicked
		map.setZoom(16);
		map.panTo(marker.getPosition());
		// Immediately Invoke Function Expression (IIFE) is necessary to clear
		// animations on other markers, set by previous click events
		(function(){
			for (var i=0; i<markers.length; i++){
				var marker = markers[i];
				marker.setAnimation(null);
			};
		})();
		marker.setAnimation(google.maps.Animation.BOUNCE);
		infoWindow.setContent('<div id="info-window"><span class="info-title">' + name + '</span>'
								+ '<br><span class="info-address"></span>'
								+ '<br><span class="info-rating"></span>'
								+ '</div>');
		infoWindow.open(map, marker);
		var foursquareURL = foursquareBaseURL + marker.foursquareid + foursquareTokensURL;
		// TODO: save ajax request data to variable to eliminate redundant requests
		// in the same session (will be taxing on Foursquare request limit). This
		// structure is fine for demo/prototype purposes.
		$.getJSON(foursquareURL)
		.done(function(data){
			var formattedAddress = data.response.venue.location.formattedAddress;
			var rating = data.response.venue.rating;
			var $infoAddress = $(".info-address");
			var $infoRating = $(".info-rating");
			// setting the text of $infoAdress to "" prevents multiple appends of
			// formattedAddress from multiple fast clicks
			$infoAddress.text("");
			// the conditional using length > 2 will append an error message when the
			// address is not available
			if (formattedAddress.length > 2){
				$infoAddress.append(data.response.venue.location.formattedAddress[0]);
			} else {
				$infoAddress.append("No Address Available");
			}
			// conditional produces error if no rating is available
			if (rating){
				$infoRating.append(rating);
			} else {
				$infoRating.append("no rating available");
			}
		});
	};

	self.sidebarShowHide = function(){
		var $sidebar = $(".sidebar");
		var $sidebarShowHide = $(".sidebar-show-hide");
		if ($sidebar.hasClass("collapse")){
			$sidebar.removeClass("collapse")
			$sidebarShowHide.css("background-image", "url('/imgs/collapse_gray_left.png')");
		} else{
			$sidebar.addClass("collapse");
			$sidebarShowHide.css("background-image", "url('/imgs/collapse_gray_right.png')");
		}
	};
}

myMVM = new MapViewModel();
ko.applyBindings(myMVM);




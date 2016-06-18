// var body = document.getElementsByTagName("body")[0];
// var paragraph = document.createElement("p");
// paragraph.id = "para";
// body.appendChild(paragraph);
// document.getElementById("para").innerHTML = "Hello World";

// $("body").append("<p>Hello World</p>");

// var map, marker, myLatLng, locations;
// locations = [

// ]
// function initMap() {
//   myLatLng = new google.maps.LatLng(43.112, -94.680);
//   map = new google.maps.Map(document.getElementById('map'), {
//     center: {lat: 43.112, lng: -94.680},
//     zoom: 15
//   });
//   marker = new google.maps.Marker({
//     position: myLatLng,
//     title:"Hello World!"
//   });
//   marker.setMap(map);
// }

var map, markers;

markers = [];

// markers = [
// 	{name: "Pizza Ranch",
// 	lat: 43.110068,
// 	lng: -94.678419},
// 	{name: "Sum Hing",
// 	lat: 43.110831,
// 	lng: -94.678963}
// ];

function initMap(){
	map = new google.maps.Map(document.getElementById("map"), {
		center: {lat: 43.112, lng: -94.680},
		zoom: 16
	});

	myMVM.addMarkers();
}

function MapLocation(name, lat, lng, filter) {
	var self = this;

	self.name = name;
	self.lat = lat;
	self.lng = lng;
	self.filter = filter;
}

function MapViewModel(){
	var self = this;

	self.locations = ko.observableArray([
		new MapLocation("Pizza Ranch", 43.110068, -94.678419, 'pizza'),
		new MapLocation("Sum Hing", 43.110831, -94.678963, 'chinese')
	]);

	self.addLocation = function(){
		self.locations.push(new MapLocation("Tester", 43.111546, -94.678973));
		self.addMarkers();
	};

	self.addMarkers = function() {
		markers = [];
		var locations = self.locations();
		for (var i=0; i<locations.length; i++){
			var locationPosition = {};
			locationPosition.lat = locations[i].lat;
			locationPosition.lng = locations[i].lng;
			var marker = new google.maps.Marker({
				position: locationPosition,
				map: map
			});
			markers.push(marker)
		}
		console.log(markers);
	}

	self.filterLocations = function(){
		console.log(self.locations.removeAll());
	}

	// self.setMapOnMarkers = function() {
	// 	for (var i=0; i<markers.length; i++) {
	// 	    markers[i].setMap(map);
	// 	}
	// }

	self.testLog = function(){
		console.log("this is only a test");
	};
}

myMVM = new MapViewModel();

ko.applyBindings(myMVM);





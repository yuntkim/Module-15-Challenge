// Function to determine the color based on depth
function getColor(d) {
    return d > 21 ? '#FF0000' :
      d > 18 ? '#FF5733' :
      d > 15 ? '#FFA500' :
      d > 12 ? '#FFD700' :
      d > 9 ? '#D9F0A3' :
      d > 6 ? '#F7FCB9' :
      d > 3 ? '#FFFFCC' :
      'FF0000';
  }
  
  // Function to create the popup content for each earthquake feature
  function popUpMsg(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>Magnitude: " + feature.properties.mag + "</p>" +
      "<p>Depth: " + feature.geometry.coordinates[2] + " km</p>" +
      "<p><a href='" + feature.properties.url + "'>LINK</a></p>");
  }
  
  // Define the streetmap layer
  let streetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1
  });
  
  // Define the topographic map layer
  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
    maxZoom: 18
  });
  
  // Define the base map layers
  let baseMaps = {
    "Street Map": streetmap,
    "Topographic Map": topo
  };
  
  // Create the Leaflet map
  let myMap = L.map("map", {
    center: [37.0902, -95.7129], // coordinates for North America
    zoom: 3, 
    layers: [streetmap]
  });
  
  // Add the streetmap layer to the map
  streetmap.addTo(myMap);
  
  // Create a layer group for the earthquakes
  let earthquakes = new L.LayerGroup();
  
  // Define the overlay map layers
  let overlayMaps = {
    "Earthquakes": earthquakes
  };
  
  // Add layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
  
  // Define the API query URL for earthquake data
  const queryUrl = "https://earthquake.usgs.gov/fdsnws/event/1/query.geojson?starttime=2022-07-04%2000:00:00&endtime=2023-07-04%2023:59:59&maxlatitude=75&minlatitude=15&maxlongitude=-50&minlongitude=-180&minmagnitude=4.5&eventtype=earthquake&orderby=time";
  
  // Fetch earthquake data and create GeoJSON layer with circle markers
  fetch(queryUrl)
    .then(response => response.json())
    .then(data => {
      L.geoJSON(data, {
        style: function (feature) {
          return {
            color: getColor(feature.geometry.coordinates[2])
          };
        },
        pointToLayer: function (feature, latlng) {
          return new L.CircleMarker(latlng, {
            radius: feature.properties.mag * 2,
            fillOpacity: 0.7, 
            fillColor: getColor(feature.geometry.coordinates[2]),
            color: '#000',
            weight: 3 
          });
        },
        onEachFeature: popUpMsg
      }).addTo(earthquakes);
  
      // Add the layer group to the map
      earthquakes.addTo(myMap);
  
      // Create the legend
      var legend = L.control({ position: 'bottomright' });
  
      // Define the legend's onAdd function
      legend.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'info legend'),
          grades = [0, 3, 6, 9, 12, 15, 18, 21],
          labels = [];
        div.innerHTML = '<h4>Depth</h4>';
  
        for (var i = 0; i < grades.length; i++) {
          div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + ' km<br>' : '+ km');
        }
  
        return div;
      };
  
      // Add the legend to the map
      legend.addTo(myMap);
    })
    .catch(error => {
      console.log('Error:', error);
    });
  
  // Ensure all data points load in the correct locations
  myMap.on('zoomend', function () {
    earthquakes.eachLayer(function (layer) {
      layer._updatePath();
    });
  });
  
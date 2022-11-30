import Node from "./node.js"

var root = document.querySelector(".main");
var run = root.querySelector(".start-btn");

// result
var result = root.querySelector(".result");

// input
var inputFrom = root.querySelector(".input-from");
var inputTo = root.querySelector(".input-to");

// data fields
var dataFieldBefore = root.querySelector(".data-field-before");
var dataFieldAfter = root.querySelector(".data-field-after");

var rawSrcOptions = [];
var rawDestOptions = [];
var rawData = {};
var rawAirportData = {};

// facts
var totalAirportsField = root.querySelector(".total-airports");
var totalSrcField = root.querySelector(".total-src");
var totalDestField = root.querySelector(".total-dest");
var routesCountField = root.querySelector(".total-routes");
var TotalDistanceField = root.querySelector(".total-distance");
var routesCheckedField = root.querySelector(".routes-checked");
var routesCount = 0;

// map
var map = L.map('map').setView([52.308601, 4.76389], 3);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

var markers = L.markerClusterGroup();

// init data
fetch("./data/airports-ext.json") 
    .then(response => {
        return response.json();
    })
    .then(data => {
        rawAirportData = data;
        totalAirportsField.textContent = Object.keys(data).length;

        // add every airport as node in graph
        for (const airportKey of Object.keys(rawAirportData)) {
            const airport = rawAirportData[airportKey];

            const value = airport.IATA;
            rawData[value] = new Node(airportKey, value)
        }

        console.log("airport data fetched!");
    })
    .then(() => addRoutes())
    .catch(err => {
        console.log(err);
    });

function addRoutes() {    
    fetch("./data/routes.json")
        .then(response => {
            return response.json();
        })
        .then(data => {
            for (let i = 0; i < data.length; i++) {
                addNode(data[i]);
            }
            setOptions();
            routesCount += data.length;
            routesCountField.textContent = routesCount;
            dataFieldBefore.textContent = JSON.stringify(rawData, undefined, 4);
            console.log("route data fetched!");
        })
        .catch(err => {
            console.log(err);
            throw err;
        });
}

function addNode(route) {
    var src = route["Source airport"];
    var dest = route["Destination airport"];

    var node = rawData[src];
    // unknown source airport
    if (!node) {
        routesCount--;
        return;
    }

    // add dest to airports edges
    if (!node.edges[dest]) {
        var destNode = rawData[dest];
        // unknown destination airport
        if (!destNode) {
            routesCount--;
            return;
        }
        node.edges.push(dest);
    }

    // add options to chooce from
    rawSrcOptions.push(src);
    rawDestOptions.push(dest);
}

run.addEventListener("click", () => {
    markers.clearLayers();
    bfs();
});

function bfs() {
    TotalDistanceField.textContent = 0;

    var routesChecked = 0;
    var path = false;
    var data = getData();
    var queue = [];

    var start = data[inputFrom.value];
    var end = data[inputTo.value];

    start.searched = true;
    queue.push(start);

    while (queue.length > 0) {
        var current = queue.shift();
        routesChecked++;
        if (current.value === end.value) {
            path = true;
            var bt = backtrack(data, current);
            var r = "";

            for (let i = bt.length - 1; i >= 0; i--) {
                r += bt[i] + " > \n";
            }
    
            result.textContent = r.substring(0, r.length-3);
            routesCheckedField.textContent = routesChecked + " (" + parseFloat(routesChecked / routesCount * 100).toFixed(2) + "%)";
            break;
        }

        for (const edge of current.edges) {
            var neighbor = data[edge];

            if (!neighbor.searched) {
                neighbor.searched = true;
                neighbor.parent = current.value;
                queue.push(neighbor);
            }
        }
    }

    dataFieldAfter.textContent = JSON.stringify(data, undefined, 4);
    
    if (!path) {
        result.textContent = "No path from " + start.value + " to " + end.value;
    }
}

function backtrack(data, current, path = [], dist = 0) {
    var currentAirport = rawAirportData[current.airportId];
    path.push(current.value + " (" + currentAirport.City + " / " + currentAirport.Country + ")");

    var circle = L.circle([currentAirport.Latitude, currentAirport.Longitude], {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 1,
        radius: 300
    })
    .bindTooltip(currentAirport.IATA)
    .openTooltip();
    markers.addLayer(circle);
    
    if (current.parent !== null) {
        var parent = data[current.parent];
        var parentAirport = rawAirportData[parent.airportId];
        
        dist += calculateDistance(currentAirport.Longitude, currentAirport.Latitude, parentAirport.Longitude, parentAirport.Latitude);

        var route = L.polygon([
            [currentAirport.Latitude, currentAirport.Longitude],
            [parentAirport.Latitude, parentAirport.Longitude]
        ]);
        markers.addLayer(route);

        return backtrack(data, parent, path, dist);
    } else {
        map.addLayer(markers);
        TotalDistanceField.innerHTML = parseFloat(dist).toFixed(2) + " KM" ;
        return path;
    }
}

function calculateDistance(lon1, lat1, lon2, lat2) {
        // The math module contains a function
        // named toRadians which converts from
        // degrees to radians.
        lon1 =  lon1 * Math.PI / 180;
        lon2 = lon2 * Math.PI / 180;
        lat1 = lat1 * Math.PI / 180;
        lat2 = lat2 * Math.PI / 180;
   
        // Haversine formula
        let dlon = lon2 - lon1;
        let dlat = lat2 - lat1;
        let a = Math.pow(Math.sin(dlat / 2), 2)
                 + Math.cos(lat1) * Math.cos(lat2)
                 * Math.pow(Math.sin(dlon / 2),2);
               
        let c = 2 * Math.asin(Math.sqrt(a));
   
        // Radius of earth in kilometers. Use 3956
        // for miles
        let r = 6371;
   
        // calculate the result
        return(c * r);    
}

function getData() {
    return JSON.parse(JSON.stringify(rawData));
}

function setOptions() {
    rawSrcOptions.sort();
    var srcOptions = new Set(rawSrcOptions);
    
    rawDestOptions.sort();
    var destOptions = new Set(rawDestOptions);

    totalSrcField.textContent = srcOptions.size;

    for (const option of srcOptions.values()) {
        var isDestOption = destOptions.has(option) ? "" : " *";
        inputFrom.options[inputFrom.options.length] = new Option(option + isDestOption, option);    
    }

    totalDestField.textContent = destOptions.size;
    for (const option of destOptions.values()) {
        var isSrcOption = srcOptions.has(option) ? "" : " *";
        inputTo.options[inputTo.options.length] = new Option(option + isSrcOption, option);    
    }
}

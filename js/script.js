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
var totalSrcField = root.querySelector(".total-src");
var totalDestField = root.querySelector(".total-dest");
var routesCountField = root.querySelector(".total-routes");
var TotalDistanceField = root.querySelector(".total-distance");
var routesCheckedField = root.querySelector(".routes-checked");
var routesCount = 0;

// init data
fetch("./data/airports.json") 
    .then(response => {
        return response.json();
    })
    .then(data => {
        rawAirportData = data;
        console.log("airport data fetched!", Object.keys(data).length);
    })
    .catch(err => {
        console.log(err);
    });

fetch("./data/routes.json")
    .then(response => {
        return response.json();
    })
    .then(data => {
        routesCountField.textContent = data.length;
        routesCount = data.length;
        for (let i = 0; i < data.length; i++) {
            addNode(data[i]);
        }
        setOptions();
        dataFieldBefore.textContent = JSON.stringify(rawData, undefined, 4);
        console.log("route data fetched!");
    })
    .catch(err => {
        console.log(err);
    });

function addNode(route) {
    var src = route["Source airport"];
    var srcId = route["Source airport ID"]
    var dest = route["Destination airport"];
    var destId = route["Destination airport ID"]

    rawSrcOptions.push(src);
    rawDestOptions.push(dest);

    var node = rawData[src];
    if (!node) {
        rawData[src] = new Node(srcId, src);
        node = rawData[src];
    }
    
    if (!node.edges[dest]) {
        node.edges.push(dest);
    }

    node = rawData[dest];
    if (!node) {
        rawData[dest] = new Node(destId, dest);
    }
}

run.addEventListener("click", () => {
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
                r += bt[i] + " > ";
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

function backtrack(data, current, path = [], dist = 0, trueDistance = true) {
    var currentAirport = rawAirportData[current.airportId];

    if (currentAirport) {
        path.push(current.value + " (" + currentAirport.City + ") ");
    } else {
        path.push(current.value);
    }
    
    if (current.parent !== null) {
        var parent = data[current.parent];
        var parentAirport = rawAirportData[parent.airportId];
        
        if (currentAirport && parentAirport) {
            dist += calculateDistance(currentAirport.Longitude, currentAirport.Latitude, parentAirport.Longitude, parentAirport.Latitude);
            return backtrack(data, parent, path, dist, trueDistance);
        } else {
            return backtrack(data, parent, path, dist, false);
        }
    } else {
        var x = trueDistance ? "" : "<strong> __missing-airport-data__ </strong>"
        TotalDistanceField.innerHTML = parseFloat(dist).toFixed(2) + "KM" + x ;
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

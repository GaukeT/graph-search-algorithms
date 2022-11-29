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

// facts
var totalSrcField = root.querySelector(".total-src");
var totalDestField = root.querySelector(".total-dest");
var routesCountField = root.querySelector(".total-routes");
var routesCheckedField = root.querySelector(".routes-checked");
var routesCount = 0;


// init data
fetch("./routes.json")
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
        dataFieldBefore.textContent = "data fetched! \n" +  JSON.stringify(rawData, undefined, 4);
        console.log("data fetched!")
    })
    .catch(err => {
        console.log(err)
    });

function addNode(route) {
    var src = route["Source airport"];
    var dest = route["Destination airport"];

    rawSrcOptions.push(src);
    rawDestOptions.push(dest);

    var node = rawData[src];
    if (!node) {
        rawData[src] = new Node(src);
        node = rawData[src];
    }
    
    if (!node.edges[dest]) {
        node.edges.push(dest);
    }

    node = rawData[dest];
    if (!node) {
        rawData[dest] = new Node(dest);
    }
}

run.addEventListener("click", () => {
    bfs();
});

class Node {
    constructor(value, edges = []) {
        this.value = value
        this.parent = null;
        this.edges = edges;
        this.searched = false;
    }
}

function bfs() {
    var routesChecked = 0;
    var path = false;
    var data = getData();
    dataFieldBefore.textContent = JSON.stringify(data, undefined, 4);

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

function backtrack(data, current, path = []) {
    path.push(current.value);
    if (current.parent !== null) {
        return backtrack(data, data[current.parent], path);
    } else {
        return path;
    }
}

function getData() {
    return JSON.parse(JSON.stringify(rawData));
}

function setOptions() {
    rawSrcOptions.sort();
    addOptions(totalSrcField, rawSrcOptions, inputFrom);
    
    rawDestOptions.sort();
    addOptions(totalDestField, rawDestOptions, inputTo);
}

function addOptions(field, airports, select) {
    var options = new Set(airports);
    field.textContent = options.size;
    for (const option of options.values()) {
        select.options[select.options.length] = new Option(option, option);    
    }
}
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

run.addEventListener("click", () => {
    bfs();
});

class Node {
    constructor(value, edges) {
        this.value = value
        this.parent = null;
        this.edges = edges;
        this.searched = false;
    }
}

// init
dataFieldBefore.textContent = JSON.stringify(getData(), undefined, 4);
setOptions();

function bfs() {
    var path = false;
    var data = getData();
    var queue = [];

    var start = data[inputFrom.value];
    var end = data[inputTo.value];

    start.searched = true;
    queue.push(start);

    while (queue.length > 0) {
        var current = queue.shift();
        if (current.value === end.value) {
            path = true;
            var bt = backtrack(current);
            var r = "";

            for (let i = bt.length - 1; i >= 0; i--) {
                r += bt[i] + " > ";
            }
    
            result.textContent = r.substring(0, r.length-3);
            
            break;
        }

        var edges = current.edges;

        for (let index = 0; index < edges.length; index++) {
            var neighbor = data[edges[index]];
            if (!neighbor.searched) {
                neighbor.searched = true;
                neighbor.parent = current;
                queue.push(neighbor);
            }
        }
    }

    dataFieldAfter.textContent = JSON.stringify(data, undefined, 4);
    
    if (!path) {
        result.textContent = "No path from " + start.value + " to " + end.value;
    }
    console.log('done!');

    // reset
    console.log(queue.length);
    queue = [];
}

function backtrack(current, path = []) {
    path.push(current.value);
    if (current.parent !== null) {
        return backtrack(current.parent, path);
    } else {
        return path;
    }
}

function getData() {
    return {
        'AMS': new Node('AMS', ['BON', 'SAN']),
        'BON': new Node('BON', ['AMS', 'DHR']),
        'DHR': new Node('DHR', ['EIN', 'EUX']),
        'EIN': new Node('EIN', ['SAN', 'GRQ']),
        'ENS': new Node('ENS', ['AMS', 'DHR']),
        'GRQ': new Node('GRQ', ['BON', 'ENS']),
        'LEY': new Node('LEY', ['RTM', 'GRQ']),
        'RTM': new Node('RTM', ['EIN', 'DHR']),
        'SAN': new Node('SAN', ['AMS', 'EUX']),
        'EUX': new Node('EUX', ['RTM', 'ENS'])
    }
}

function setOptions() {
    var data = Object.keys(getData());
    for (let i = 0; i < data.length; i++) {
        const option = data[i];
        inputFrom.options[inputFrom.options.length] = new Option(option, option);
        inputTo.options[inputTo.options.length] = new Option(option, option);    
    }
}
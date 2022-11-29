export default class Node {
    constructor(id, value, edges = []) {
        this.airportId = id;
        this.value = value
        this.parent = null;
        this.edges = edges;
        this.searched = false;
    }
}
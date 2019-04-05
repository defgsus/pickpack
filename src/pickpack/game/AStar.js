


export default class AStar {

    constructor(waypoints) {
        this.waypoints = waypoints;
    }

    log = (msg) => {
        //console.log(`ASTAR: ${msg}`);
    };

    heuristicGoalCost = (id1, id2) => {
        if (id1 === id2)
            return 0.;
        return this.waypoints.getDistance(id1, id2);
    };

    heuristicStepCost = (id1, id2) => {
        if (id1 === id2)
            return 0.;
        return this.waypoints.getDistance(id1, id2);
    };

    search = (startNode, endNode) => {
        this.log(`SEARCH ${JSON.stringify(startNode)} -> ${JSON.stringify(endNode)}`);
        const infinity = 10000000;

        const closedSet = new Set();
        const openSet = new Set([startNode]);

        // cost of getting from start to this node
        const g_score = {[startNode]: 0};

        // total cost if getting from start to end, through this node
        const f_score = {[endNode]: this.heuristicGoalCost(startNode, endNode)};

        const cameFrom = {};

        while (openSet.size) {
            // pick smallest f from open set
            let currentNode = null;
            let minScore = infinity;
            for (const n of openSet) {
                const f = f_score[n] === undefined ? infinity : f_score[n];
                if (f < minScore || currentNode === null) {
                    minScore = f;
                    currentNode = n;
                }
            }
            openSet.delete(currentNode);
            this.log(`CURRENT ${JSON.stringify(currentNode)}`);

            // found!
            if (currentNode === endNode) {
                const path = [currentNode];
                while (cameFrom[currentNode]) {
                    currentNode = cameFrom[currentNode];
                    path.push(currentNode);
                }
                this.log(`FOUND ${JSON.stringify(path.map((_, i) => path[path.length-1-i]))}`);
                return path.map((_, i) => path[path.length-1-i]);
            }

            // flag as evaluated
            closedSet.add(currentNode);

            for (const neighborNode of this.waypoints.getAdjacentNodes(currentNode)) {

                if (closedSet.has(neighborNode))
                    continue;

                if (!openSet.has(neighborNode)) {
                    openSet.add(neighborNode);

                    const g = g_score[currentNode] + this.heuristicStepCost(currentNode, neighborNode, endNode);

                    // prune this path
                    if (g >= (g_score[neighborNode] || infinity))
                        continue;

                    // continue this path
                    cameFrom[neighborNode] = currentNode;
                    g_score[neighborNode] = g;
                    f_score[neighborNode] = g + this.heuristicGoalCost(neighborNode, endNode);

                    this.log(`NEIGHBOUR ${JSON.stringify(neighborNode)}, g=${g_score[neighborNode]}, f=${f_score[neighborNode]}`);
                    //console.log(g_score, f_score);
                    this.log(`CAMEFROM ${JSON.stringify(cameFrom)}`);
                }
            }
        }

        this.log(`NOT-FOUND ${startNode} -> ${endNode}`);
        return null;
    };
}
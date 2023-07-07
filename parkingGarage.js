class ParkingGarage {
    constructor(rows, columns, gates, seed) {
        this.rows = rows;
        this.columns = columns;
        this.gates = gates;
        this.seed = seed;
        this.grid = [];
        this.gateIndexes = [];
        this.initializeGrid();
        this.initializeGates();
        this.drawLanes();
    }

    initializeGrid() {
        const random = this.seed ? Math.random(this.seed.toString()) : Math.random;

        // render borders
        for (let r = 0; r < this.rows; r++) {
            // add rows and columns
            this.grid[r] = [];
            for (let c = 0; c < this.columns; c++) {

                // define "textures"
                if (r === 0 || r === this.rows - 1) { // define top and bottom borders
                    this.grid[r][c] = "=";
                } else if (c === 0 || c === this.columns - 1) { // define left and right borders
                    this.grid[r][c] = "‖";
                } else { // create empty space
                    this.grid[r][c] = " ";
                }
            };
        };

        // draw pretty corners
        this.grid[0][0] = "╔";
        this.grid[this.rows-1][0] = "╚";
        this.grid[0][this.columns-1] = "╗";
        this.grid[this.rows-1][this.columns-1] = "╝";

        /*
        // Generate parking spaces in clusters
        const clusterSize = Math.floor(Math.random() * 20) + 1; // Size of each cluster
        const clusterGap = 3; // Gap between clusters

        for (let r = clusterGap; r < this.rows - clusterGap; r += clusterSize + clusterGap) {
            for (let c = clusterGap; c < this.columns - clusterGap; c += clusterSize + clusterGap) {
                // check if there is enough space to render the cluster
                if (r + clusterSize + clusterGap - 1 >= this.rows || c + clusterSize + clusterGap - 1 >= this.columns) {
                    break; // skip rendering this cluster if there is not enough space;
                }

                // Generate a cluster of parking spaces at the current position
                for (let i = 0; i < clusterSize; i++) {
                    for (let j = 0; j < clusterSize; j++) {
                        this.grid[r+i][c+j] = "_";
                        this.grid[r+i][c+j+1] = "|";
                    }
                }

                // Add gaps between clusters
                for (let i = 0; i < clusterSize; i++) {
                    if (this.grid[r + i] && this.grid[r+i][c-1]) {
                        this.grid[r + i][c - 1] = "|";
                    }
                    if (this.grid[r + i] && this.grid[r + i][c + clusterSize]) {
                        this.grid[r + i][c + clusterSize] = "|";
                    }
                }
                for (let j = 0; j < clusterSize; j++) {
                    if (this.grid[r - 1] && this.grid[r - 1][c + j]) {
                        this.grid[r - 1][c + j] = "—";
                    }
                    if (this.grid[r + clusterSize + clusterGap - 1] && this.grid[r + clusterSize + clusterGap - 1][c + j]) {
                        this.grid[r + clusterSize + clusterGap - 1][c + j] = "—";
                    }
                }
            }
        }
        */
    };

    // Place gates on the edges of the garage
    initializeGates() {
        const topRow = 0;
        const leftColumn = 0;

        const sides = ["t","b","l","r"] // Possible sides
        let numOfGates = 0;

        do {
            for (let i = 0; i < this.gates; i++) {
                if (numOfGates < this.gates) {
                    const side = sides[Math.floor(Math.random() * sides.length)];
                    
                    if (side === "t" || side === "b") { // top and bottom
                        let column = Math.floor(Math.random() * (this.columns - 2)) + 1;

                        this.grid[topRow][column-1] = "|";
                        this.grid[topRow][column] = " ";
                        this.grid[topRow][column+1] = "|";

                        numOfGates++;
                        this.gateIndexes.push(`${topRow},${column}`);
                        break;
                    } else if (side === "l" || side === "r") { // sides
                        let row = Math.floor(Math.random() * (this.rows - 2)) + 1;

                        this.grid[row-1][leftColumn] = "╚";
                        this.grid[row][leftColumn] = " ";
                        this.grid[row+1][leftColumn] = "╔";

                        numOfGates++;
                        this.gateIndexes.push(`${row},${leftColumn}`);
                        break;
                    }
                }
            }
        } while (numOfGates < this.gates);
    }

    // Draw lanes from gates
    drawLanes() {

        const directions = ["u","d","l","t"];

        this.gateIndexes.forEach((gate, index) => {

            const row = parseInt(gate.split(",")[0]);
            const column = parseInt(gate.split(",")[1]);

            if (row == 0 && column > 0 && column < this.columns) { // Is on top
                const gateLength = Math.floor(Math.random() * 100) + 1;
                console.log(gateLength);


                const maxTurns = 7;
                const directionProbabilities = {
                    up: 0.1,
                    down: 0.40,
                    left: 0.25,
                    right: 0.25
                };

                let currentRow = row-1
                let currentColumn = column;
                let currentDirection = "d"; // Start with a preference to go down
                let turns = 0;
                let laneLength = 0;
                let currentSymbol = "|";

                while (laneLength < gateLength) {
                    // Check if the maximum number of turns has been reached
                    if (turns >= maxTurns) {
                        console.log("turn break");
                        break;
                    }

                    console.log(`Gate ${index}: Currently going ${currentDirection}, ${laneLength}/${gateLength}: ${turns}`);

                    // Check the preference for continuation
                    const continueProbability = Math.random();
                    if (continueProbability < 0.7) {
                        // Continue in the same direction
                        switch(currentDirection) {
                            case "u":
                                currentRow--;
                                currentSymbol = "|";
                                break;

                            case "d":
                                currentRow++;
                                currentSymbol = "|";
                                break;
                            
                            case "l":
                                currentColumn--;
                                currentSymbol = "-";
                                break;

                            case "r":
                                currentColumn++;
                                currentSymbol = "-";
                                break;
                        }
                    } else {
                        // Randomly select the next direction based on the bias
                        const directionProbability = Math.random();
                        if (directionProbability < directionProbabilities.up) {
                            currentRow--;
                            currentDirection = "u";
                        } else if (directionProbability < directionProbabilities.up + directionProbabilities.down) {
                            currentRow++;
                            currentDirection = "d";
                        } else if (directionProbability < directionProbabilities.up + directionProbabilities.down + directionProbabilities.left) {
                            currentColumn--;
                            currentDirection = "l";
                        } else {
                            currentColumn++;
                            currentDirection = "r";
                        }
                    }

                    if (currentDirection === "u") {
                        if (currentRow === 0) {
                            currentDirection = "d"; // Turn away from the top border
                            currentRow++;
                        } else {
                            currentRow--;
                        }
                    } else if (currentDirection === "d") {
                        if (currentRow === this.rows - 1) {
                            currentDirection = "u"; // Turn away from the bottom border
                            currentRow--;
                        } else {
                            currentRow++;
                        }
                    } else if (currentDirection === "l") {
                        if (currentColumn === 0) {
                            currentDirection = "r"; // Turn away from the left border
                            currentColumn++;
                        } else {
                            currentColumn--;
                        }
                    } else if (currentDirection === "r") {
                        if (currentColumn === this.columns - 1) {
                            currentDirection = "l"; // Turn away from the right border
                            currentColumn--;
                        } else {
                            currentColumn++;
                        }
                    }


                    // Check if the next position is within bounds of the garage
                    if (currentRow >= 0 && currentRow < this.rows && currentColumn >= 0 && currentColumn < this.columns) {
                        // Update the lane grid
                        this.grid[currentRow][currentColumn] = currentSymbol;
                        laneLength++;
                    } else {
                        console.log("break");
                        break;
                    }

                    if (currentDirection !== "t" && currentDirection !== "d") {
                        turns++;
                    }
                };
            }
        })
    };

    render() {
        for (let i =0; i < this.rows; i++) {
            let row = "";
            for (let j = 0; j < this.columns; j++) {
                row += this.grid[i][j];
            };
            console.log(row);
        }
        console.info(this.gateIndexes);
    }
};

module.exports = ParkingGarage
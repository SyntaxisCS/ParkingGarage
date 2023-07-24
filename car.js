const PF = require("pathfinding");

class Car {
    constructor(carId, year, make, model, plate, color) {
        this.carId = carId;
        this.year = year;
        this.make = make;
        this.model = model;
        this.plate = {state: plate.state, number: plate.number};
        this.color = color;

        // Storage
        this.location = { row: 0, column: 0}; // Initialize location to 0,0, will be changed to spawn gate/parking spot
        this.currentState = "searching";
        this.parkingTimer = 0;
        this.direction = ""; // Direction the car is moving
        this.originalSymbol = " ";  // Store the original symbol at the car's location
        this.pathStorage = [];
        this.numVisits = 0;
    };

    // Variable functions

    // Increase the number of visits
    incrementVisits() {
        this.numVisits++;
    };

    // Update the car's location
    updateLocation(row, column) {
        this.location.row = row;
        this.location.column = column;
    };

    // Update the car's direction
    updateDirection(direction) {
        this.direction = direction;
    };

    // Update the car's symbol
    updateOriginalSymbol(symbol) {
        this.originalSymbol = symbol;
    };

    updateCurrentState(state) {
        this.currentState = state;
    };

    // Main functions
    
    // Master function
    run(parkingGarage) { // essentially a master clock
        if (this.currentState === "parked") {
            if (this.parkingTimer <= 0) {
                // go back to gate and leave the garage
                this.prepareToLeave(parkingGarage);
            } else {
                this.parkingTimer--;
            }
        } else if (this.currentState === "leaving") {
            // Move to gate (continue along path finding path)
        } else if (this.currentState === "searching") { // default state
            // Search for parking space
            this.wander(parkingGarage);
        }
    };

    // default - blindly moving along lanes (randomly chooses turns, etc)
    wander(parkingGarage) {
        const currentRow = this.location.row;
        const currentColumn = this.location.column;

        // Store the current direction of the car's movement
        let direction = this.direction;

        // get forward left and right postions
        const positions = this.lookAround(currentRow, currentColumn, direction);

        const parkingSpaces = this.checkForParkingSpaces(parkingGarage, positions);

        if (parkingSpaces) {
            // park car
            this.park(parkingGarage, parkingSpaces);

        } else { // none found
            const lanes = this.checkForLanes(parkingGarage, positions);

            if (lanes) {

                // move car
                parkingGarage.moveCar(this, lanes.row, lanes.column);
                // since you will have forgotten whenever you come back to this
                // parkingGarage will handle updating the car's original symbol and location
                // this is in an effort to reduce desynchronization between the various cars
                // and the parking garage itself

            } else { // none found
                // leave garage
                this.prepareToLeave(parkingGarage);
            }
        }
    };

    // park car
    park(parkingGarage, spotLocation) {
        // Set state
        this.currentState = "parked";

        // Generate a random time to be parked for (in seconds)
        const ranParkingTime = Math.floor(Math.random() * 100) + 10;
        this.parkingTimer = ranParkingTime;

        parkingGarage.parkCar(this, spotLocation.row, spotLocation.column);
        // Park the grid on the parking garage grid

    };

    // leave garage
    leave(parkingGarage) {
        if (this.pathStorage.length > 0) {
            // move to first element of path
            const nextRow = parseInt(this.pathStorage[0][1]);
            const nextColumn = parseInt(this.pathStorage[0][0]);

            // remove first element from path
            this.pathStorage.shift();

            if (this.pathStorage.length >= 1) {
                // move to next position
                parkingGarage.moveCar(this, nextRow, nextColumn);
            } else {
                // path is gone
                parkingGarage.leave(this, nextRow, nextColumn);
            }
        } else {
            console.log("path ended");
            // set state to archived
            // tell garage to remove car
        }
    }


    prepareToLeave(parkingGarage) {
        // Perform pathfinding to find the closest gate to the car
        const currentRow = this.location.row;
        const currentColumn = this.location.column;

        // Set original symbol
        this.originalSymbol = "P";

        // Find the closest gate using pathfinding
        const closestGate = this.findClosestGate(parkingGarage, currentRow, currentColumn);

        // Move the car to the closest gate
        if (closestGate) {
            this.pathStorage = closestGate;

            // Update current state
            this.updateCurrentState("leaving");

            // start leaving
            this.leave(parkingGarage);
        } else {
            console.warn(`No gate found. ${this.color} ${this.year} ${this.make} ${this.model} (${this.plate.number} of ${this.plate.state}) cannot leave the garage.`);
        }
    };

    // Helper functions

    // gets correct values for forward left and right - returns object of positions
    lookAround(currentRow, currentColumn, direction) {
        let positions = {
            forward: {
                row: 0,
                column: 0,
                symbol: null
            },
            left: {
                row: 0,
                column: 0,
                symbol: null
            },
            right: {
                row: 0,
                column: 0,
                symbol: null
            }
        };

        // Determine positions based on direction

        if (direction === "u") { // up

        } else if (direction === "d") { // down
            
            // Forward
            positions.forward.row = currentRow+1;
            positions.forward.column = currentColumn;

            // Left
            positions.left.row = currentRow;
            positions.left.column = currentColumn-1;

            // Right
            positions.right.row = currentRow;
            positions.right.column = currentColumn+1;

        } else if (direction === "l") { // left 
            
        } else if (direction === "r") { // right

            // Forward
            positions.forward.row = currentRow;
            positions.forward.column = currentColumn+1;
            
            // Left
            positions.left.row = currentRow-1;
            positions.left.column = currentColumn;

            // Right
            positions.right.row = currentRow+1;
            positions.right.column = currentColumn;

        }

        return positions;
    };

    // Checks for and chooses a lane to go down
    checkForLanes(parkingGarage, positions) {
        // Get symbols
        // Forward
        if (parkingGarage.grid[positions.forward.row]) {
            if (parkingGarage.grid[positions.forward.row][positions.forward.column]) {
                positions.forward.symbol = parkingGarage.grid[positions.forward.row][positions.forward.column];
            } else {
                positions.forward.symbol = null;
            }
        } else {
            positions.forward.symbol = null;
        }

        // Left
        if (parkingGarage.grid[positions.left.row]) {
            if (parkingGarage.grid[positions.left.row][positions.left.column]) {
                positions.left.symbol = parkingGarage.grid[positions.left.row][positions.left.column];
            } else {
                positions.left.symbol = null;
            }
        } else {
            positions.left.symbol = null;
        }

        // Right
        if (parkingGarage.grid[positions.right.row]) {
            if (parkingGarage.grid[positions.right.row][positions.right.column]) {
                positions.right.symbol = parkingGarage.grid[positions.right.row][positions.right.column];
            } else {
                positions.right.symbol = null;
            }
        } else {
            positions.right.symbol = null;
        }

        // Check symbols for lanes

        // Array of lane options
        let laneChoice = [];

        // Check if forward position is a lane
        if (positions.forward.symbol === "|" || positions.forward.symbol === "-") {
            laneChoice.push(`${positions.forward.row},${positions.forward.column}`);
        }

        // Check if left position is a lane
        if (positions.left.symbol === "|" || positions.left.symbol === "-") {
            laneChoice.push(`${positions.left.row},${positions.left.column}`);
        }

        // Check if right position is a lane
        if (positions.right.symbol === "|" || positions.right.symbol === "-") {
            laneChoice.push(`${positions.right.row},${positions.right.column}`);
        }

        // Evaluate lane choices
        if (laneChoice.length > 0) {
            // Randomly choose between the options
            const movementDecisionIndex = Math.floor(Math.random() * laneChoice.length);

            // Get choice from array
            const movementDecision = laneChoice[movementDecisionIndex];

            // Parse values
            const dRow = parseInt(movementDecision.split(",")[0]);
            const dColumn = parseInt(movementDecision.split(",")[1]);

            // Array of next move
            return {row: dRow, column: dColumn};

        } else {
            return null;
        }
    };

    // Checks for and chooses a parking spot to park
    checkForParkingSpaces(parkingGarage, positions) {
        // Get symbols
        // Forward
        if (parkingGarage.grid[positions.forward.row]) {
            if (parkingGarage.grid[positions.forward.row][positions.forward.column]) {
                positions.forward.symbol = parkingGarage.grid[positions.forward.row][positions.forward.column];
            } else {
                positions.forward.symbol = null;
            }
        } else {
            positions.forward.symbol = null;
        }

        // Left
        if (parkingGarage.grid[positions.left.row]) {
            if (parkingGarage.grid[positions.left.row][positions.left.column]) {
                positions.left.symbol = parkingGarage.grid[positions.left.row][positions.left.column];
            } else {
                positions.left.symbol = null;
            }
        } else {
            positions.left.symbol = null;
        }

        // Right
        if (parkingGarage.grid[positions.right.row]) {
            if (parkingGarage.grid[positions.right.row][positions.right.column]) {
                positions.right.symbol = parkingGarage.grid[positions.right.row][positions.right.column];
            } else {
                positions.right.symbol = null;
            }
        } else {
            positions.right.symbol = null;
        }

        // Check symbols for lanes

        // Array of lane options
        let parkingOptions = [];

        // Check if forward position is a lane
        if (positions.forward.symbol === "P") {
            parkingOptions.push(`${positions.forward.row},${positions.forward.column}`);
        }

        // Check if left position is a lane
        if (positions.left.symbol === "P") {
            parkingOptions.push(`${positions.left.row},${positions.left.column}`);
        }

        // Check if right position is a lane
        if (positions.right.symbol === "P") {
            parkingOptions.push(`${positions.right.row},${positions.right.column}`);
        }

        // Evaluate lane choices
        if (parkingOptions.length > 0) {
            // Randomly choose between the options
            const parkingDecisionIndex = Math.floor(Math.random() * parkingOptions.length);

            // Get choice from array
            const parkingDecision = parkingOptions[parkingDecisionIndex];

            // Parse values
            const pRow = parseInt(parkingDecision.split(",")[0]);
            const pColumn = parseInt(parkingDecision.split(",")[1]);

            // Array of next move
            return {row: pRow, column: pColumn};

        } else {
            return null;
        }
    };

    // Finds the closest gate from current location
    findClosestGate(parkingGarage, startRow, startColumn) {
        const grid = parkingGarage.grid;
        const finder = new PF.AStarFinder();

        // Create a pathfinding grid that mirrors the parking garage
        const PFGrid = new PF.Grid(grid[0].length, grid.length);

        // Set the walkable values based on grid contents
        for (let r = 0; r < grid.length; r++) {
            for (let c = 0; c < grid[r].length; c++) {
                if (r === startRow && c === startColumn) {
                    PFGrid.setWalkableAt(c, r, true);
                }

                if (grid[r][c] === "C" || grid[r][c] === "|" || grid[r][c] === "-") {
                    PFGrid.setWalkableAt(c, r, true);
                } else {
                    PFGrid.setWalkableAt(c, r, false);
                }
            }
        };

        // Array of paths to gate
        let gatePaths = [];

        // Path find for each gate
        parkingGarage.gateIndexes.forEach(gate => {
            const gateRow = parseInt(gate.split(",")[0]);
            const gateColumn = parseInt(gate.split(",")[1]);

            // Set gate as walkable
            PFGrid.setWalkableAt(gateColumn, gateRow, true);

            const path = finder.findPath(startColumn, startRow, gateColumn, gateRow, PFGrid);

            // If path to gate exists
            if (path.length > 1) {
                gatePaths.push(path);
            };
        });

        // Check if there are any paths
        if (gatePaths.length > 0) {
            let shortestPath = gatePaths[0];

            // check for shortest path
            gatePaths.forEach(path => {
                if (shortestPath.length > path.length) {
                    shortestPath = path;
                }
            });

            console.log(shortestPath);

            return shortestPath;
        } else {
            return null; // Return null if no gate is found
        }
    };
};

module.exports = Car;
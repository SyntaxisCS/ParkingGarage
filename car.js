class Car {
    constructor(carId, year, make, model, plate, color) {
        this.carId = carId;
        this.year = year;
        this.make = make;
        this.model = model;
        this.plate = {state: plate.state, number: plate.number};
        this.color = color;

        // Storage
        this.currentState = "moving";
        this.parkingTimer = 0;
        this.numVisits = 0;
        this.location = { row: 0, column: 0}; // Initialize location to 0,0, will be changed to spawn gate/parking spot
        this.direction = ""; // Direction the car is moving
        this.originalSymbol = " ";  // Store the original symbol at the car's location
    };

    // Increase number of visits
    incrementVisits() {
        this.numVisits++;
    };

    // Update the car's location
    updateLocation(row, column) {
        this.location.row = row;
        this.location.column = column;
    };

    updateDirection(direction) {
        this.direction = direction;
    };

    // Move the car along the current path
    move(parkingGarage) {
        const currentRow = this.location.row;
        const currentColumn = this.location.column;

        // Store the current direction of the car's movement
        let direction = this.direction;

        // Forward, left, and right positions
        // Forward
        let forwardRow;
        let forwardColumn;
        let forwardSymbol

        // left
        let leftRow;
        let leftColumn;
        let leftSymbol;

        // right
        let rightRow;
        let rightColumn;
        let rightSymbol;

        // Determine positons based on direction
        if (direction === "u") { // up

        } else if (direction === "d") { // down

            // Forward
            forwardRow = currentRow+1;
            forwardColumn = currentColumn;

            // Get symbol
            if (parkingGarage.grid[forwardRow]) {
                if (parkingGarage.grid[forwardRow][forwardColumn]) {
                    forwardSymbol = parkingGarage.grid[forwardRow][forwardColumn];
                } else {
                    forwardSymbol = null;
                }
            } else {
                forwardSymbol = null;
            }

            // Left
            leftRow = currentRow;
            leftColumn = currentColumn-1;

            // Get symbol
            if (parkingGarage.grid[leftRow]) {
                if (parkingGarage.grid[leftRow][leftColumn]) {
                    leftSymbol = parkingGarage.grid[leftRow][leftColumn];
                } else {
                    leftSymbol = null;
                }
            } else {
                leftSymbol = null;
            }

            // Right
            rightRow = currentRow;
            rightColumn = currentColumn+1;

            // Get symbol
            if (parkingGarage.grid[rightRow]) {
                if (parkingGarage.grid[rightRow][rightColumn]) {
                    rightSymbol = parkingGarage.grid[rightRow][rightColumn];
                } else {
                    rightSymbol = null;
                }
            } else {
                rightSymbol = null;
            }

        } else if (direction === "l") { // left

        } else if (direction === "r") { // right
            // Forward
            forwardRow = currentRow;
            forwardColumn = currentColumn+1;

            // Get symbol
            if (parkingGarage.grid[forwardRow]) {
                if (parkingGarage.grid[forwardRow][forwardColumn]) {
                    forwardSymbol = parkingGarage.grid[forwardRow][forwardColumn];
                } else {
                    forwardSymbol = null;
                }
            } else {
                forwardSymbol = null;
            }

            // Left
            leftRow = currentRow-1;
            leftColumn = currentColumn;

            // Get symbol
            if (parkingGarage.grid[leftRow]) {
                if (parkingGarage.grid[leftRow][leftColumn]) {
                    leftSymbol = parkingGarage.grid[leftRow][leftColumn];
                } else {
                    leftSymbol = null;
                }
            } else {
                leftSymbol = null;
            }

            // Right
            rightRow = currentRow+1;
            rightColumn = currentColumn;

            // Get symbol
            if (parkingGarage.grid[rightRow]) {
                if (parkingGarage.grid[rightRow][rightColumn]) {
                    rightSymbol = parkingGarage.grid[rightRow][rightColumn];
                } else {
                    rightSymbol = null;
                }
            } else {
                rightSymbol = null;
            }
        }

        // Array of lane options
        let laneChoice = [];

        // Check if forward position is a lane
        if (forwardSymbol === "|" || forwardSymbol === "-") {
            laneChoice.push(`${forwardRow},${forwardColumn}`);
        }

        // Check if left position is a lane
        if (leftSymbol === "|" || leftSymbol === "-") {
            laneChoice.push(`${leftRow},${leftColumn}`);
        }

        // Check if right position is a lane
        if (rightSymbol === "|" || rightSymbol === "-") {
            laneChoice.push(`${rightRow},${rightColumn}`);
        }

        if (laneChoice.length > 0) {
            const movementDecisionIndex = Math.floor(Math.random() * laneChoice.length);

            const movementDecision = laneChoice[movementDecisionIndex];

            const dRow = parseInt(movementDecision.split(",")[0]);
            const dColumn = parseInt(movementDecision.split(",")[1]);

            // Set original symbol
            this.originalSymbol = parkingGarage.grid[dRow][dColumn];

            // move to positon
            parkingGarage.moveCar(this, dRow, dColumn);
            this.location.row = dRow;
            this.location.column = dColumn;
        }
    };

    searchForParkingSpace(parkingGarage) {
        if (this.currentState === "parked") {
            if (this.parkingTimer <= 0) {
                console.log(this);
                // go back to gate and leave
            } else {
                this.parkingTimer--;
            }
        }

        if (this.currentState === "moving") {
            const currentRow = this.location.row;
            const currentColumn = this.location.column;

            // Determine positions based on direction
            let direction = this.direction;

            // Forward, left, and right positions
            // Forward, left, and right positions
            // Forward
            let forwardRow;
            let forwardColumn;
            let forwardSymbol

            // left
            let leftRow;
            let leftColumn;
            let leftSymbol;

            // right
            let rightRow;
            let rightColumn;
            let rightSymbol;

            // Determine positons based on direction
            if (direction === "u") { // up

            } else if (direction === "d") { // down

                // Forward
                forwardRow = currentRow+1;
                forwardColumn = currentColumn;

                // Get symbol
                if (parkingGarage.grid[forwardRow]) {
                    if (parkingGarage.grid[forwardRow][forwardColumn]) {
                        forwardSymbol = parkingGarage.grid[forwardRow][forwardColumn];
                    } else {
                        forwardSymbol = null;
                    }
                } else {
                    forwardSymbol = null;
                }

                // Left
                leftRow = currentRow;
                leftColumn = currentColumn-1;

                // Get symbol
                if (parkingGarage.grid[leftRow]) {
                    if (parkingGarage.grid[leftRow][leftColumn]) {
                        leftSymbol = parkingGarage.grid[leftRow][leftColumn];
                    } else {
                        leftSymbol = null;
                    }
                } else {
                    leftSymbol = null;
                }

                // Right
                rightRow = currentRow;
                rightColumn = currentColumn+1;

                // Get symbol
                if (parkingGarage.grid[rightRow]) {
                    if (parkingGarage.grid[rightRow][rightColumn]) {
                        rightSymbol = parkingGarage.grid[rightRow][rightColumn];
                    } else {
                        rightSymbol = null;
                    }
                } else {
                    rightSymbol = null;
                }

            } else if (direction === "l") { // left

            } else if (direction === "r") { // right
                // Forward
                forwardRow = currentRow;
                forwardColumn = currentColumn+1;

                // Get symbol
                if (parkingGarage.grid[forwardRow]) {
                    if (parkingGarage.grid[forwardRow][forwardColumn]) {
                        forwardSymbol = parkingGarage.grid[forwardRow][forwardColumn];
                    } else {
                        forwardSymbol = null;
                    }
                } else {
                    forwardSymbol = null;
                }

                // Left
                leftRow = currentRow-1;
                leftColumn = currentColumn;

                // Get symbol
                if (parkingGarage.grid[leftRow]) {
                    if (parkingGarage.grid[leftRow][leftColumn]) {
                        leftSymbol = parkingGarage.grid[leftRow][leftColumn];
                    } else {
                        leftSymbol = null;
                    }
                } else {
                    leftSymbol = null;
                }

                // Right
                rightRow = currentRow+1;
                rightColumn = currentColumn;

                // Get symbol
                if (parkingGarage.grid[rightRow]) {
                    if (parkingGarage.grid[rightRow][rightColumn]) {
                        rightSymbol = parkingGarage.grid[rightRow][rightColumn];
                    } else {
                        rightSymbol = null;
                    }
                } else {
                    rightSymbol = null;
                }
            }

            // Array of parking options
            let parkingOptions = [];

            // Check if forward position is a parking space
            if (forwardSymbol === "P") {
                parkingOptions.push(`${forwardRow},${forwardColumn}`);
            }

            // Check if left position is a parking space
            if (leftSymbol === "P") {
                parkingOptions.push(`${leftRow},${leftColumn}`);
            }

            // Check if right position is a parking space
            if (rightSymbol === "P") {
                parkingOptions.push(`${rightRow},${rightColumn}`);
            }

            if (parkingOptions.length > 0) {
                const parkingDecisionIndex = Math.floor(Math.random() * parkingOptions.length);

                const parkingDecision = parkingOptions[parkingDecisionIndex];

                const pRow = parseInt(parkingDecision.split(",")[0]);
                const pColumn = parseInt(parkingDecision.split(",")[1]);

                // Park car
                this.parkCar(parkingGarage, pRow, pColumn);
            } else {
                // No available parking spaces, continue moving along path
                this.move(parkingGarage);
            }
        }
    };

    // Park the car at the specified location
    parkCar(parkingGarage, row, column) {
        // Set state
        this.currentState = "parked";

        // Generate a random time to be parked for (in seconds)
        const ranParkingTime = Math.floor(Math.random() * 100) + 10;
        this.parkingTimer = ranParkingTime;


        // Park the grid on the parking garage grid
        parkingGarage.parkCar(this, row, column);

        // Update the car's location
        this.updateLocation(row, column);

        // Update the car's original symbol to "c" for parked
        this.originalSymbol = "P";
    };

    leaveGarage(parkingGarge) {

    };
}

module.exports = Car;
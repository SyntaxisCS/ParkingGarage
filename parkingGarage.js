const PF = require("pathfinding");
const {getRandomElement, getRandomElements} = require("./Utils/helpers.js");
const Car = require("./car");

class ParkingGarage {
    constructor(rows, columns, gates, carCount, usage) {
        // Setup variables
        this.rows = rows;
        this.columns = columns;
        this.gates = gates;
        this.carCount = carCount;
        this.usage = usage;


        // Storage
        this.grid = [];
        this.cars = [];
        this.laneIndexes = [];
        this.gateIndexes = [];
        this.parkingSpacesIndexes = [];


        // Initialize all elements of the garage
        this.generateGrid();
        this.generateGates();
        this.generateLanes();
        this.generateParkingSpaces();

        // Cars
        this.spawnCars();
    }

    // Main Methods
    generateGrid() {
        // render borders
        for (let r = 0; r < this.rows; r++) {
            // add rows and columns
            this.grid[r] = [];
            for (let c = 0; c < this.columns; c++) {

                // define "textures"
                if (r === 0 || r === this.rows - 1) { // define top and bottom borders
                    this.grid[r][c] = "═";
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
    };

    // Place gates on the edges of the garage
    generateGates() {
        const topRow = 0;
        const leftColumn = 0;

        const sides = ["t","b","l","r"]; // Possible sides
        let numOfGates = 0;
        
        do {
            for (let i = 0; i < this.gates; i++) {
                if (numOfGates < this.gates) {
                    const side = sides[Math.floor(Math.random() * sides.length)];

                    if (side === "t" || side === "b") { // top and bottom
                        let column = Math.floor(Math.random() * (this.columns - 2)) + 1;
                        
                        this.grid[topRow][column-1] = "╗";
                        this.grid[topRow][column] =  " ";
                        this.grid[topRow][column+1] = "╔";

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
                };
            };
        } while (numOfGates < this.gates);
    };

    // Draw lanes
    generateLanes() {
        const finder = new PF.AStarFinder();
        const pathGrid = new PF.Grid(this.columns, this.rows);

        this.gateIndexes.forEach(gate => {
            const gateRow = parseInt(gate.split(",")[0]);
            const gateColumn = parseInt(gate.split(",")[1]);

            let randomRow, randomColumn;

            do {
                randomRow = Math.floor(Math.random() * (this.rows - 2) + 1);
                randomColumn = Math.floor(Math.random() * (this.columns - 2) + 1);
            } while (
                (randomRow === gateRow || randomColumn === gateColumn) ||
                randomRow === 0 || randomRow === this.rows - 1 ||
                randomColumn === 0 || randomColumn === this.columns - 1
            );

            // Find the path from the gate to the randomly selected point
            let path;
        
            do {
                path = finder.findPath(gateColumn, gateRow, randomColumn, randomRow, pathGrid.clone());

                if (!path || path.length === 0) {
                    // No valid path found, regenerate random point
                    do {
                        randomRow = Math.floor(Math.random() * (this.rows - 2)) + 1;
                        randomColumn = Math.floor(Math.random() * (this.columns - 2)) + 1;
                    } while (
                        (randomRow === gateRow || randomColumn === gateColumn) ||
                        randomRow === 0 || randomRow === this.rows - 1 ||
                        randomColumn === 0 || randomColumn === this.columns - 1
                    );
                }
            } while (!path || path.length === 0);

            // Place lanes
            path.forEach(([column, row], index) => {
                if (row === gateRow && column === gateColumn) return; // Skip the gate itself
                if (row === randomRow && column === randomColumn) return; // Skip the target point

                // Check if the target tile is a border tile
                const targetTile = this.grid[row][column];
                
                // Skip the borders
                if (targetTile === "‖" || targetTile === "═" || targetTile === "╔" || targetTile === "╚" || targetTile === "╗" || targetTile === "╝") return;

                // Determine the direction of the path
                const nextRow = path[index + 1]?.[1];
                const nextColumn = path[index + 1]?.[0];
                // ngl no idea how this is doing this but it works so I'm not touching it

                let symbol;
                if (nextRow === row) {
                    symbol = "-";
                } else if (nextColumn === column) {
                    symbol = "|";
                }

                this.grid[row][column] = symbol;
                this.laneIndexes.push(`${row},${column}`);
            });
        });
    };

    generateParkingSpaces() {
        this.laneIndexes.forEach(lane => {
            const row = parseInt(lane.split(",")[0]);
            const column = parseInt(lane.split(",")[1]);

            // Place parking spaces next to vertical lanes
            if (this.grid[row][column] === "|") {
                // Check if there's space to the left of the lane
                if (column-1 > 0 && this.grid[row][column-1] === " ") {
                    this.grid[row][column-1] = "P";

                    this.parkingSpacesIndexes.push(`${row},${column-1}`);
                }

                // Check if there's space to the right of the lane
                if (column < this.columns - 1 && this.grid[row][column+1] === " ") {
                    this.grid[row][column+1] = "P";

                    this.parkingSpacesIndexes.push(`${row},${column+1}`);
                }
            }

            // Place parking spaces next to horizontal lanes
            if (this.grid[row][column] === "-") {
                // Check if there's space above the lane
                if (row-1 > 0 && this.grid[row-1][column] === " ") {
                    this.grid[row - 1][column] = "P";

                    this.parkingSpacesIndexes.push(`${row-1},${column}`);
                }

                // Check if there's space below the lane
                if (row < this.rows - 1 && this.grid[row + 1][column] === " ") {
                    this.grid[row + 1][column] = "P";

                    this.parkingSpacesIndexes.push(`${row+1},${column}`);
                }
            }
        });
    };

    // Cars ------------------------
    spawnCars() {
        // Generate cars
        this.generateCars(this.carCount);

        // Number of cars generated
        let carsGenerated = 0;
        let usagePercentage = this.calculateUsageLevel(this.usage);

        let carsParked = this.carCount * usagePercentage;
        let carsEntering = Math.floor(this.carCount * (1 - usagePercentage));

        // generate cars in parking spots
        this.spawnCarsInParkingSpaces(carsParked);
        
        // Set the index of where the random function will start spawning cars from
        const ranArrStart = carsParked;
        
        // Randomly spawn cars at a random gate at random intervals
        this.spawnCarsRandomly(carsEntering, ranArrStart);
    };

    // Car movement

    activateCar(car) {
        // Start the car's movement
        setInterval(() => {
            car.run(this);
        }, 1000); // Once per second
    };

    moveCar(car, nextRow, nextColumn) {
        const currentRow = car.location.row;
        const currentColumn = car.location.column;

        // Get the original symbol at the car's current location
        const originalSymbol = car.originalSymbol;

        // Update car's original symbol
        car.updateOriginalSymbol(this.grid[nextRow][nextColumn]);

        // Update the grid with the car's next location
        this.updateGridWithCarLocation(nextRow, nextColumn);

        // Update the grid with the orignal symbol at the car's previous location
        this.updateGridWithOriginalSymbol(currentRow, currentColumn, originalSymbol);

        // Update the car's location
        car.updateLocation(nextRow, nextColumn);

        console.info(`${car.color} ${car.year} ${car.make} ${car.model} (${car.plate.number} of ${car.plate.state}) moving to (${nextRow},${nextColumn})`);
    };

    parkCar(car, parkingRow, parkingColumn) {
        const currentRow = car.location.row;
        const currentColumn = car.location.column;

        // Get the original symbol at the car's current location
        const originalSymbol = car.originalSymbol;

        // Update the grid with the car's next location
        this.grid[parkingRow][parkingColumn] = "c";

        // Update the grid with the original symbol at the car's previous location
        this.updateGridWithOriginalSymbol(currentRow, currentColumn, originalSymbol);

        console.info(`${car.color} ${car.year} ${car.make} ${car.model} (${car.plate.number} of ${car.plate.state}) has parked at (${parkingRow},${parkingColumn})`);
        // Do not update original symbol
    }

    // Helper functions
    generateCars(count) {
        const carModels = [
            {make: "Ford", models: ["Fiesta", "Focus", "Mustang", "Explorer"]},
            {make: "Chevrolet", models: ["Cruze", "Malibu", "Impala", "Tahao"]},
            {make: "Toyota", models: ["Corolla", "Camry", "4Runner", "Highlander", "Rav4", "Tundra"]},
            {make: "Honda", models: ["Civic", "Accord", "CR-V", "HR-V", "Pilot", "Odyssey", "Clarity", "Passport", "Ridgeline", "S2000"]}
        ];

        const colors = ["Red", "Blue", "Silver", "Black", "Yellow", "Green", "Pink", "Grey"];
        const plates = this.generateLicensePlates(count);

        for (let i = 0; i < count; i++) {
            const year = Math.floor(Math.random() * 20) + 2000;
            const makeModel = getRandomElement(carModels);
            const make = makeModel.make;
            const model = getRandomElement(makeModel.models);
            const plate = plates[i];
            const color = getRandomElement(colors);

            const car = new Car(`${plate.state}-${plate.number}`, year, make, model, plate, color);
            car.incrementVisits();
            this.cars.push(car);
        };
    };

    spawnCarsInParkingSpaces(count) {
        // Get indexes of correct number of parking spaces
        const selectedParkingSpaces = getRandomElements(this.parkingSpacesIndexes, count);

        for (let c = 0; c < count; c++) {
            const spaceRow = parseInt(selectedParkingSpaces[c].split(",")[0]);
            const spaceColumn = parseInt(selectedParkingSpaces[c].split(",")[1]);

            let carDirection = "d";
            this.cars[c].updateDirection(carDirection);

            // Update the car's position to the parking space
            this.cars[c].updateLocation(spaceRow, spaceColumn);

            // render car at current location
            this.grid[spaceRow][spaceColumn] = "c";

            // set car's state
            this.cars[c].updateCurrentState("parked");

            // Update original symbol
            this.cars[c].updateOriginalSymbol("P");

            // Start the car's movement
            this.activateCar(this.cars[c]);
        }
    };

    spawnCarsRandomly(count, arrStart) {
        for (let c = 0; c < count; c++) {
            setTimeout(() => {

                // randomly pick a gate to spawn at
                const spawnGate = getRandomElement(this.gateIndexes);
                const gateRow = parseInt(spawnGate.split(",")[0]);
                const gateColumn = parseInt(spawnGate.split(",")[1]);

                let carDirection = this.getCarInitialDirection(gateRow, gateColumn);

                if (carDirection) {
                    this.cars[arrStart+c].updateDirection(carDirection);

                    // Update the car's position to the gate
                    this.cars[arrStart+c].updateLocation(gateRow, gateColumn);

                    // render car at current location
                    this.grid[gateRow][gateColumn] = "C";

                    // Start the car's movement
                    this.activateCar(this.cars[arrStart+c]);
                } else {
                    return;
                }

            }, Math.floor(Math.random() * 4000) + 1000); // between 1 and 5
        }
    };

    generateLicensePlates(count) {
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const numbers = "0123456789";
        const states = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC"];
        const plates = [];

        for (let i = 0; i < count; i++) {
            let plate = "";
            for (let j = 0; j < 3; j++) {
                plate += getRandomElement(letters);
            };

            plate += "-";

            for (let j = 0; j < 3; j++) {
                plate += getRandomElement(numbers);
            };

            // Generate state
            let state = getRandomElement(states);
            plates.push({state: state, number: plate});
        };

        return plates;
    };

    calculateUsageLevel(usage) {
        let usagePercentage = 0.2;

        // Figure out number of cars to start parked
        switch(usage) {
            case "low":
                usagePercentage = this.carCount*0.2;
                break;
            case "medium":
                usagePercentage = this.carCount*0.4;
                break;
            case "high":
                usagePercentage = this.carCount*0.6;
                break;
            case "insane":
                usagePercentage = this.carCount*0.8;
                break;
            default:
                // generate random usage level
                let random = (Math.random() * 0.6) + 0.2;
                usagePercentage = this.carCount*random;
                break;
        };

        return (usagePercentage/10).toFixed(1);
    };

    getCarInitialDirection(gateRow, gateColumn) {
        if (gateRow === 0) {
            return "d";
        } else if (gateRow === this.rows - 1) {
            return "u";
        } else if (gateColumn === 0) {
            return "r";
        } else if (gateColumn === this.columns - 1) {
            return "l";
        } else {
            return null;
        };
    };

    // Update the grid with a car's current location
    updateGridWithCarLocation(row, column) {
        this.grid[row][column] = "C";
    };

    // Update the grid with the original symbol at the given location
    updateGridWithOriginalSymbol(row, column, originalSymbol) {
        this.grid[row][column] = originalSymbol;
    };

    // Rendering
    render() {
        for (let r = 0; r < this.rows; r++) {
            let row = "";
            for (let c = 0; c < this.columns; c++) {
                row += this.grid[r][c];
            };
            console.log(row);
        }
    };

    renderStats() {
        console.info("Cars: ", this.cars);
        console.info("Gates: ", this.gateIndexes);
        console.info("Lanes: ", this.laneIndexes);
        console.info("Parking Spaces: ", this.parkingSpacesIndexes);
    };
};

module.exports = ParkingGarage
const PF = require("pathfinding");
const {getRandomElement} = require("./Utils/helpers.js");
const Car = require("./car");

class ParkingGarage {
    constructor(rows, columns, gates, carCount, ) {
        // Setup variables
        this.rows = rows;
        this.columns = columns;
        this.gates = gates;
        this.carCount = carCount;


        // Storage
        this.grid = [];
        this.cars = [];
        this.laneIndexes = [];
        this.gateIndexes = [];
        this.parkingSpacesIndexes = [];


        // Initialize all elements of the garage
        this.initializeGrid();
        this.initializeGates();
        this.initializeLanes();
        this.initializeParkingSpaces();

        // Cars
        this.spawnCars();
    }

    initializeGrid() {
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

                        this.grid[topRow][column-1] = "=";
                        this.grid[topRow][column] = " ";
                        this.grid[topRow][column+1] = "=";

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
    initializeLanes() {
        const finder = new PF.AStarFinder(); // Create an instance of the A* pathfinder
        const pathGrid = new PF.Grid(this.columns, this.rows); // Create a grid for the pathfinder, Rows and columns are flipped as Grid asks for width, height
    
        this.gateIndexes.forEach((gate, index) => {
            const [gateRow, gateColumn] = gate.split(",").map(Number);

            let randomRow, randomColumn

            do {
                randomRow = Math.floor(Math.random() * (this.rows - 2)) + 1;
                randomColumn = Math.floor(Math.random() * (this.columns - 2)) + 1;
            } while (
                randomRow === gateRow || randomColumn === gateColumn || randomRow === 0 || randomRow === this.rows - 1 || randomColumn === 0 || randomColumn === this.columns - 1
            );

            console.log(`Random Point for gate ${index}: (${randomRow},${randomColumn})`)

            // Find the path from the gate to the randomly selected point
            const path = finder.findPath(gateColumn, gateRow, randomColumn, randomRow, pathGrid.clone());

            // Place lanes
            path.forEach(([column, row], index) => {
                if (row === gateRow && column === gateColumn) return; // Skip the gate itself
                if (row === randomRow && column === randomColumn) return; // Skip the target point

                // Determine the direction of the path argument
                const nextRow = path[index + 1]?.[1];
                const nextColumn = path[index + 1]?.[0];

                let symbol;

                if (nextRow === row) {
                    symbol = "-";
                } else if (nextColumn === column) {
                    symbol = "|";
                }

                this.grid[row][column] = symbol;
                this.laneIndexes.push(`${row},${column}`);
            })
        });
    };

    initializeParkingSpaces() {
        this.laneIndexes.forEach(lane => {
            const row = parseInt(lane.split(",")[0]);
            const column = parseInt(lane.split(",")[1]);

            // Place parking spaces next to vertical lanes
            if (this.grid[row][column] === "|") {
                // Check if ther's space to the left of the lane
                if (column > 0 && this.grid[row][column-1] === " ") {
                    this.grid[row][column-1] = "P";

                    this.parkingSpacesIndexes.push(`${row},${column-1}`);
                }

                // Check if there's space to the right of the lane
                if (column < this.columns - 1 && this.grid[row][column+1] === " ") {
                    this.grid[row][column + 1] = "P";

                    this.parkingSpacesIndexes.push(`${row},${column+1}`);
                }
            }

            // Place parking spaces next to horizontal lanes
            if (this.grid[row][column] === "-") {
                // Check if there's space above the lane
                if (row > 0 && this.grid[row-1][column] === " ") {
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

    // CARS --------------------------
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

            const car = new Car("i", year, make, model, plate, color);
            car.incrementVisits();
            this.cars.push(car);
        }
    };

    spawnCars() {
        // Generate cars
        this.generateCars(this.carCount);

        // Randomly spawn cars at the gates
        this.cars.forEach((car, index) => {
            setTimeout(() => {

                const spawnGate = getRandomElement(this.gateIndexes);
                const gateRow = parseInt(spawnGate.split(",")[0]);
                const gateColumn = parseInt(spawnGate.split(",")[1]);

                // Set car's initial direction
                if (gateRow === 0) {
                    car.updateDirection("d");
                } else if (gateRow === this.rows - 1) {
                    car.updateDirection("u");
                } else if (gateColumn === 0) {
                    car.updateDirection("r");
                } else if (gateColumn === this.columns - 1) {
                    car.updateDirection("l");
                };

                // Update the car's position to the gate
                car.updateLocation(gateRow, gateColumn);
                this.grid[gateRow][gateColumn] = "C";

                // Start the car's movement
                setInterval(() => {
                    car.searchForParkingSpace(this);
                }, 1000); // Once per second

            }, Math.floor(Math.random() * 5000) + 1000);
        });
    };

    generateLicensePlates(count) {
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const numbers = "0123456789";
        const plates = [];

        for (let i = 0; i < count; i++) {
            let plate = "";
            for (let j = 0; j < 3; j++) {
                plate += getRandomElement(letters);
            }

            for (let j = 0; j < 3; j++) {
                plate += getRandomElement(numbers);
            }
            plates.push({state: "SC",number:plate});
        }

        return plates;
    };

    // Car movement
    // Update the grid with a car's current location
    updateGridWithCarLocation(row, column) {
        this.grid[row][column] = "C";
    };

    // Update the grid with the original symbol at the given location
    updateGridWithOriginalSymbol(row, column, originalSymbol) {
        this.grid[row][column] = originalSymbol;
    };

    moveCar(car, nextRow, nextColumn) {
        const currentRow = car.location.row;
        const currentColumn = car.location.column;

        // Get the original symbol at the car's current location
        const originalSymbol = car.originalSymbol;

        // Update the grid with the car's next location
        this.updateGridWithCarLocation(nextRow, nextColumn);

        // Update the grid with the orignal symbol at the car's previous location
        this.updateGridWithOriginalSymbol(currentRow, currentColumn, originalSymbol);

        console.log(`${car.make} ${car.model} moving to (${nextRow},${nextColumn}) with the orignal symbol of ${originalSymbol}`);
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
        console.log(`${car.color} ${car.year} ${car.make} ${car.model} has parked at (${parkingRow},${parkingColumn})`);

    };

    leave(car, gateRow, gateColumn) {
        console.info(`${car.color} ${car.year} ${car.make} ${car.model} (${car.plate.number} of ${car.plate.state}) has left the garage at (${gateRow},${gateColumn})`);
        
        // Update the grid
        this.grid[gateRow][gateColumn] = car.originalSymbol;
    };

    // Rendering
    render() {
        for (let i =0; i < this.rows; i++) {
            let row = "";
            for (let j = 0; j < this.columns; j++) {
                row += this.grid[i][j];
            };
            console.log(row);
        }
    }

    renderStats() {
        console.info("Cars: ", this.cars);
        console.info("Gates: ", this.gateIndexes);
        console.info("Lanes: ", this.laneIndexes);
        console.info("Parking Spaces: ", this.parkingSpacesIndexes);
    }
};

module.exports = ParkingGarage
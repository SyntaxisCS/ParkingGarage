const readline = require("readline-sync");
const ParkingGarage = require("./parkingGarage");

const ROWS = 10;
const COLUMNS = 25;
const GATES = 2;

const garage = new ParkingGarage(ROWS, COLUMNS, GATES);

// Main Loop
while (true) {
    garage.render();

    // Process user input
    const input = readline.question("Enter a command (q to quit): ");
    if (input === "q") {
        break;
    }
};
console.log("Goodbye!");
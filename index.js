const readline = require("readline-sync");
const ParkingGarage = require("./parkingGarage");

const ROWS = 25;
const COLUMNS = 50;
const GATES = 1;
const CARCOUNT = 1;

const garage = new ParkingGarage(ROWS, COLUMNS, GATES, CARCOUNT);

// Main loop
let frames = 0;
let interval = setInterval(() => {
    // Clear the console
    //console.clear();
    //garage.renderStats();
    console.info(`Refreshed! Frame: ${frames}`);
    frames++;
    
    // Render the garage
    garage.render();

    /*
    // Process user input
    const input = readline.question("Enter a command (q to quit): ");
    if (input === "q") {
        clearInterval(interval);
        console.log("Goodbye!");
    }
    */
}, 1000);


// Single Frame Render
// garage.render();
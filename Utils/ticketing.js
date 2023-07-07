/*let car = {
    year: "2016",
    make: "Honda",
    model: "Civic",
    plate: "TWE-274"
};*/

export const createTicket = (car) => {
    // current date and time
    let curDate = new Date();

    let newTicket = {
        id: 0, // Create ids
        entryTime: curDate,
        exitTime: null,
        garageId: 0,
        car: car
    };
    return newTicket;
};

export const finalizeTicket = (ticketId) => {
    let curDate = new Date();

    // find time in parking

    // get ticketId
    ticketId.exitTime = curDate;
    // Finalize payment
    // Send ticket to archive
};

module.exports = {createTicket, finalizeTicket};
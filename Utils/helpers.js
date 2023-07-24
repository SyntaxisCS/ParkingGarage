const getRandomElement = (arr) => {
    const randomIndex = Math.floor(Math.random() * arr.length);
    return arr[randomIndex];
};

const getRandomElements = (arr, count) => {
    // Calculate the number of elements to select
    const targetElements = Math.floor(arr.length - count);

    const randomIndices = [...Array(arr.length).keys()].sort(() => Math.random() - 0.5);

    const selectedIndices = randomIndices.slice(0, targetElements);

    const selectedElements = selectedIndices.map((index) => arr[index]);

    return selectedElements;
};

module.exports = {getRandomElement, getRandomElements};
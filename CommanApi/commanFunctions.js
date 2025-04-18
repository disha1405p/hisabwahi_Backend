// Parse the input date using the specified format


function getServerDate(frontEndDate) {
    // Split the input date string into day, month, and year
    const [day, month, year] = frontEndDate.split('-').map(Number);

    // Create a Date object using the extracted components
    const dateObject = new Date(Date.UTC(year, month - 1, day)); // Month is 0-based, so we subtract 1 from the month

    // Get the date components (year, month, day, hours, minutes, seconds, and milliseconds)
    // const formattedDate = dateObject.toISOString();

    return dateObject;
}

module.exports = getServerDate;
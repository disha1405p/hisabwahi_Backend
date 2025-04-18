async function getMonthStartAndEnd(dateString) {
    // Split the input date string into month and year
    const [month, year] = dateString.split('-').map(Number);

    // Calculate the first day of the month
    const startDate = new Date(Date.UTC(year, month - 1, 1)); // month - 1 because months are zero-indexed
    const start = await formatDate(startDate);

    // Calculate the last day of the month
    const endDate = new Date(Date.UTC(year, month, 0)); // month here automatically handles month rollover
    const end = await formatDate(endDate);
    console.log(start, end);
    return { startDate: start, endDate: end };
    //return { start, end };
}
function formatDate(date) {
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Adding 1 because months are zero-indexed
    const year = date.getUTCFullYear();
    return `${day}-${month}-${year}`;
}

module.exports = getMonthStartAndEnd;
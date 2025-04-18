const express = require('express');
const { ObjectId } = require('mongodb');
const { getDB } = require('../CommanApi/connection');
const router = express.Router();

router.post('/payment', async (req, res) => {
    try {
        const paymentmaster = await getDB("payment_master");

        // Extracting pagination parameters from the request body
        const { startFrom = 0, pageSize = 10, sortColumn, sortOrder, customer_id } = req.body;


         // Determine sort stage based on provided sortColumn and sortOrder
 let sortStage = {};
 if (sortColumn && sortOrder) {
     // Make sure sortOrder is a number: 1 for ascending, -1 for descending
     sortStage = { [sortColumn]: parseInt(sortOrder) };
 } else {
     // Default sort on 'date' descending
     sortStage = { date: -1 };
 }


// Match stage to filter by customer_id (if provided)
let matchStage = {};
if (customer_id) {
    matchStage.customer_id = new ObjectId(customer_id); // Convert to ObjectId if needed
}

// Build the aggregation pipeline
const pipeline = [];


        // Include the match stage only if customer_id is provided
        if (Object.keys(matchStage).length > 0) {
            pipeline.push({ $match: matchStage });
        }


 // Add other stages to the pipeline
 pipeline.push(
    {
        $lookup: {
            from: "customer_master", // Collection to join with
            localField: "customer_id", // Field in payment_master
            foreignField: "_id", // Field in customer_master
            as: "customer_details" // Resulting array field
        }
    },
    {
        $project: {
            _id: 1,
            customer_id: 1,
            customer_name: { $arrayElemAt: ["$customer_details.name", 0] },
            customer_mobile: { $arrayElemAt: ["$customer_details.mobile", 0] },
            amount: 1,
            date: {
                $dateToString: {
                    date: "$date",
                    timezone: "+05:30",
                    format: "%Y-%m-%d %H:%M:%S"
                }
            },
            remarks: 1
        }
    },
    { $sort: sortStage }, // Sorting
    { $skip: startFrom }, // Pagination: skip records
    { $limit: pageSize }  // Pagination: limit number of records
);

// Run the aggregation query
const result = await paymentmaster.aggregate(pipeline).toArray();


        // Aggregation pipeline with pagination
        // const result = await paymentmaster.aggregate([
        //     {
        //         $lookup: {
        //             from: "customer_master", // The collection to join with
        //             localField: "customer_id", // Field in payment_master
        //             foreignField: "_id", // Field in customer_master
        //             as: "customer_details" // The resulting array field
        //         }
        //     },
        //     {
        //         $project: {
        //             _id: 1,
        //             customer_id: 1,
        //             customer_name: { $arrayElemAt: ["$customer_details.name", 0] },
        //             customer_mobile: { $arrayElemAt: ["$customer_details.mobile", 0] },
        //             amount: 1,
        //             date: {
        //                 $dateToString: {
        //                   date: "$date",
        //                   timezone: "+05:30",
        //                   format: "%Y-%m-%d %H:%M:%S"
        //                 }
        //               },
        //             remarks: 1
        //         }
        //     },
        //     { $sort: sortStage },
        //     { $skip: startFrom }, // Skip the specified number of records
        //     { $limit: pageSize }  // Limit the number of records fetched
        // ]).toArray();

        // Getting the total number of records for pagination metadata
        // const totalRecords = await paymentmaster.countDocuments();
        const totalRecords = customer_id
        ? await paymentmaster.countDocuments(matchStage)
        : await paymentmaster.countDocuments();

        // Checking if more data is available
        const hasMore = startFrom + pageSize < totalRecords;

        if (result.length > 0) {
            res.json({
                status: 1,
                message: 'Payment data fetched successfully with customer details',
                data: result,
                pagination: {
                    startFrom: startFrom + pageSize, // New offset for the next request
                    hasMore: hasMore,
                    totalRecords: totalRecords
                }
            });
        } else {
            res.json({
                message: "No more payment data available",
                status: 0,
                pagination: {
                    hasMore: false,
                    totalRecords: totalRecords
                }
            });
        }
    } catch (error) {
        console.error('Error fetching Payment data with aggregation:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

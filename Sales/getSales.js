const express = require("express");
const { ObjectId } = require("mongodb");
const { getDB } = require("../CommanApi/connection");
const router = express.Router();

router.post("/sales", async (req, res) => {
  try {
    const salesmaster = await getDB("sales_master");

    // Extract pagination parameters from the request body
    const {
      startFrom = 0,
      pageSize = 15,
      sortColumn,
      sortOrder,
      customer_id,
    } = req.body;
    // console.log(req.body);
    
    // Determine sort stage based on provided sortColumn and sortOrder
    let sortStage = {};
    if (sortColumn && sortOrder) {
      // Make sure sortOrder is a number: 1 for ascending, -1 for descending
      sortStage = { [sortColumn]: parseInt(sortOrder) };
    } else {
      // Default sort on 'date' descending
      sortStage = { date: -1 };
    }
    console.log(req.body);

    // Create a match stage if customer_id is provided.
    let matchStage = {};
    if (customer_id) {
      // If your customer_id is stored as an ObjectId, convert the id:
      matchStage.customer_id = new ObjectId(customer_id);
      // Otherwise, if it's stored as string, simply assign:
      // matchStage.customer_id = customer_id;
    }

    // Build the aggregation pipeline with a conditional match stage at the beginning
    const pipeline = [];

    // Include the match stage only if matchStage is not empty
    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    pipeline.push(
      {
        $lookup: {
          from: "customer_master", // Collection to join with
          localField: "customer_id", // Field in sales_master
          foreignField: "_id", // Field in customer_master
          as: "customer_details", // Resulting array field
        },
      },
      {
        $project: {
          _id: 1,
          customer_id: 1,
          customer_name: { $arrayElemAt: ["$customer_details.name", 0] },
          customer_mobile: { $arrayElemAt: ["$customer_details.mobile", 0] },
          date: {
            $dateToString: {
              date: "$date",
              timezone: "+05:30",
              format: "%Y-%m-%d %H:%M:%S",
            },
          },
          amount: 1,
          remarks: 1,
        },
      },
      { $sort: sortStage },
      { $skip: startFrom }, // Pagination: skip records
      { $limit: pageSize } // Pagination: limit number of records
    );

    // // Aggregation pipeline with pagination
    // const result = await salesmaster.aggregate([
    //     {
    //         $lookup: {
    //             from: "customer_master", // The collection to join with
    //             localField: "customer_id", // Field in sales_master
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
    //             date: {
    //                 $dateToString: {
    //                   date: "$date",
    //                   timezone: "+05:30",
    //                   format: "%Y-%m-%d %H:%M:%S"
    //                 }
    //               },
    //             amount: 1,
    //             // date: 1,
    //             remarks: 1
    //         }
    //     },
    //     { $sort: sortStage },
    //     { $skip: startFrom }, // Skip the specified number of records
    //     { $limit: pageSize }  // Limit the number of records fetched
    // ]).toArray();

    //
    // Run the aggregation query
    const result = await salesmaster.aggregate(pipeline).toArray();

    // Get the total number of documents in sales_master.
    // Note: if you wish to count documents matching the customer_id then pass matchStage to countDocuments:
    const totalRecords = customer_id
      ? await salesmaster.countDocuments(matchStage)
      : await salesmaster.countDocuments();

    // Determine if more data is available
    const hasMore = startFrom + pageSize < totalRecords;

    if (result.length > 0) {
      res.json({
        status: 1,
        message: "Sales data fetched successfully with customer details",
        data: result,
        pagination: {
          startFrom: startFrom + pageSize, // New offset for the next request
          hasMore: hasMore,
          totalRecords: totalRecords,
        },
      });
    } else {
      res.json({
        status: 0,
        message: "No more sales data available",
        pagination: {
          hasMore: false,
          totalRecords: totalRecords,
        },
      });
    }
  } catch (error) {
    console.error("Error fetching sales data with aggregation:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

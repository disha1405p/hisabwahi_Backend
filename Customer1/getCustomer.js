  const express = require("express");
  const { getDB } = require("../CommanApi/connection");
  const { ObjectId } = require("mongodb");
  const router = express.Router();

  router.post("/customer", async (req, res) => {
    try {
      const customerMaster = await getDB("customer_master");
      const {
        _id,
        startFrom = 0,
        pageSize = 5,
        sortColumn,
        sortOrder,
      } = req.body;

      console.log("Request Pagination:", req.body);

      // Determine sort stage based on provided sortColumn and sortOrder
      let sortStage = {};
      if (sortColumn && sortOrder) {
        sortStage = { [sortColumn]: parseInt(sortOrder) };
      } else {
        sortStage = { createdAt: -1 };
      }

      // Build the aggregation pipeline
      const pipeline = [];

      // Conditionally add $match stage if _id is provided
      if (_id) {
        pipeline.push({
          $match: { _id: new ObjectId(_id) },
        });
      }

      // Add lookup stages
      pipeline.push(
        {
          $lookup: {
            from: "sales_master",
            localField: "_id",
            foreignField: "customer_id",
            as: "sales",
          },
        },
        {
          $lookup: {
            from: "payment_master",
            localField: "_id",
            foreignField: "customer_id",
            as: "payments",
          },
        },
        {
          $addFields: {
            sales_total: { $sum: "$sales.amount" },
            payment_total: { $sum: "$payments.amount" },
            outstanding: {
              $subtract: [
                { $sum: "$sales.amount" },
                { $sum: "$payments.amount" },
              ],
            },
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            mobile: 1,
            address: 1,
            createdAt: {
              $dateToString: {
                date: "$createdAt",
                timezone: "+05:30",
                format: "%Y-%m-%d %H:%M:%S",
              },
            },
            sales_total: 1,
            payment_total: 1,
            outstanding: 1,
            sales: { $slice: ["$sales", startFrom, pageSize] },
            payments: { $slice: ["$payments", startFrom, pageSize] },
          },
        },
        { $sort: sortStage },
        { $skip: startFrom },
        { $limit: pageSize }
      );
      
      // Execute the aggregation pipeline
      const result = await customerMaster.aggregate(pipeline).toArray();
      
      console.log(result);
      // Get the total count of customers
      const totalRecords = await customerMaster.countDocuments();
      const hasMore = startFrom + pageSize < totalRecords;

      if (result.length > 0) {
        res.json({
          status: 1,
          message: "Customer outstanding data fetched successfully",
          data: result,
          pagination: {
            startFrom: startFrom + pageSize,
            hasMore: hasMore,
            totalRecords: totalRecords,
          },
        });
      } else {
        res.json({
          status: 0,
          message: "No customer outstanding data available",
          pagination: {
            hasMore: false,
            totalRecords: totalRecords,
          },
        });
      }
    } catch (error) {
      console.error("Error fetching outstanding data:", error);
      res.status(500).json({ error: error.message });
    }
  });

  module.exports = router;

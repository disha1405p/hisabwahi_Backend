const express = require("express");
const { getDB } = require("../CommanApi/connection");
const { ObjectId } = require("mongodb");
const router = express.Router();

router.post("/individualcustomer", async (req, res) => {
  try {
    const { _id } = req.body;

    if (!_id) {
      return res.status(400).json({
        status: 0,
        message: "Customer ID (_id) is required",
      });
    }

    const salesCollection = await getDB("sales_master");
    const paymentsCollection = await getDB("payment_master");

    // Fetch sales data for the customer
    const salesData = await salesCollection
      .find({ customer_id: new ObjectId(_id) })
      .toArray();

    // Add 'tag' field to sales data
    const taggedSalesData = salesData.map((sale) => ({
      ...sale,
      tag: "sales",
    }));

    // Fetch payment data for the customer
    const paymentsData = await paymentsCollection
      .find({ customer_id: new ObjectId(_id) })
      .toArray();

    // Add 'tag' field to payments data
    const taggedPaymentsData = paymentsData.map((payment) => ({
      ...payment,
      tag: "payment",
    }));

    // Calculate Outstanding
    const totalSales = salesData.reduce((sum, sale) => sum + (sale.amount || 0), 0);
    const totalPayments = paymentsData.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const outstanding = totalSales - totalPayments;

    // Combine sales and payments, and sort by date in descending order
    const combinedData = [
      ...taggedSalesData,
      ...taggedPaymentsData,
    ]
      .map((item) => ({
        ...item,
        date: new Date(item.date), // Ensure the date is a Date object
      }))
      .sort((a, b) => b.date - a.date); // Sort by date in descending order

    res.json({
      status: 1,
      message: "Customer data fetched successfully",
      data: {
        transactions: combinedData,
        outstanding,
      },
    });
  } catch (error) {
    console.error("Error fetching customer data:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

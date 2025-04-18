const express = require("express");
const { ObjectId } = require("mongodb"); // Import ObjectId from mongodb package
const { getDB } = require("../CommanApi/connection");
const router = express.Router();

// Export a function that returns a promise resolving to the initialized router
const initializeRouter = async () => {
  const paymentMaster = await getDB('payment_master');
  const salesMaster = await getDB('sales_master');
  const customerMaster = await getDB('customer_master');

  // DELETE customerMaster API
  router.delete('/customer/:id', async (req, res) => {
    try {
      const customerId = req.params.id;

      // Convert string id to ObjectId
      let objectCustomerId;
      try {
        objectCustomerId = new ObjectId(customerId);
      } catch (err) {
        return res.json({
          status: 0,
          message: "Invalid customer ID format."
        });
      }

      // Check if there's a salesMaster record for this customerMaster with status = 0
      const saleRecord = await salesMaster.findOne({ customer_id: objectCustomerId });
      if (saleRecord) {
        return res.json({
          status: 0,
          message: "Cannot delete customerMaster - active transaction exists."
        });
      }

      // Check if there's a paymentMaster record for this customerMaster with status = 0
      const paymentRecord = await paymentMaster.findOne({ customer_id: objectCustomerId });
      if (paymentRecord) {
        return res.json({
          status: 0,
          message: "Cannot delete customerMaster - active paymentMaster exists."
        });
      }

      // If no blocking salesMaster or paymentMaster history, proceed to delete customerMaster
      const deleteResult = await customerMaster.deleteOne({ _id: objectCustomerId });
      if (deleteResult.deletedCount > 0) {
        return res.json({
          status: 1,
          message: "customerMaster deleted successfully."
        });
      } else {
        return res.json({
          status: 0,
          message: "customerMaster not found."
        });
      }
    } catch (error) {
      console.error("Error in delete customerMaster API:", error);
      res.status(500).json({
        status: 0,
        message: "Server error. Please try again later."
      });
    }
  });

  return router;
};

module.exports = initializeRouter;

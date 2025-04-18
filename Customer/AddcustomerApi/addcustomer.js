const express = require('express');
const { getDB } = require('../../CommanApi/connection');

const router = express.Router();

// Insert or Update Data into customer_master Collection
router.post('/customer', async (req, res) => {
  try {
    const { name, mobile } = req.body;  

    console.log('Cus Body:', req.body);
    
    // Validation
    if (!name || !mobile) {
      return res.status(200).json({
        status: 0,
        message: 'All required fields must be provided',
      });
    }
    
    // Get the Database Instance
    const customerMaster = await getDB("customer_master");

    // Check if a customer with the same mobile number exists
    const result = await customerMaster.findOne({ mobile });
    console.log("Existing Customer:", result);

    if (result) {
      // Update the existing customer record
      const updatedResult = await customerMaster.updateOne(
        { mobile }, // Query to match the existing record
        { $set: { name } } // Data to update (add fields as needed)
      );
    // console.log(result);
    
      if (updatedResult.matchedCount > 0) {
        return res.json({
          status: 1,
          message: "The customer record has been successfully updated.",
          data : {id: result._id}
        });
      } else {
        return res.json({
          status: 0,
          message: "Failed to update the customer record.",
        });
      }
    }
    
    // If no existing customer, insert a new record
    const insertResult = await customerMaster.insertOne({
      name,
      mobile,
      address: "", // Default address or remove this field if not needed
      createdAt: new Date()
    });
    console.log("Insert Result:", insertResult);

    if (insertResult && insertResult.insertedId) {
      return res.json({
        status: 1,
        message: 'Customer added successfully',
        data: {
          id: insertResult.insertedId,
          name,
          mobile,
          createdAt: new Date()
        },
      });
    } else {
      return res.json({
        status: 0,
        message: "Failed to add customer",
      });
    }
  } catch (error) {
    console.error('Error inserting/updating customer data:', error);
    res.status(500).json({
      status: 0,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

module.exports = router;

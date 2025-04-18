const express = require('express');
const { getDB } = require('../CommanApi/connection');
const { ObjectId } = require('mongodb'); // Import ObjectId for MongoDB

const router = express.Router();

// Edit Customer API
router.put('/customer/:id', async (req, res) => {
  try {
    const customerId = req.params.id; // Extract customer ID from URL
    const { name, mobile, address } = req.body; // Extract updated customer details

    // Validate required fields
    if (!customerId || !name || !mobile) {
      return res.status(400).json({
        status: 0,
        message: 'Customer ID, Name, and Mobile Number are required.',
      });
    }

    // Convert customerId to ObjectId
    const customerObjectId = ObjectId.isValid(customerId)
      ? new ObjectId(customerId)
      : null;

    if (!customerObjectId) {
      return res.status(400).json({
        status: 0,
        message: 'Invalid Customer ID format.',
      });
    }

    // Get database instance
    const customerMaster = await getDB('customer_master');

    // Check if the customer exists
    const existingCustomer = await customerMaster.findOne({ _id: customerObjectId });

    if (!existingCustomer) {
      return res.status(404).json({
        status: 0,
        message: 'Customer not found.',
      });
    }

    // Update customer details in the database
    const updateResult = await customerMaster.updateOne(
      { _id: customerObjectId },
      {
        $set: {
          name: name,
          mobile: mobile,
          address: address || existingCustomer.address, // Keep existing address if not provided
        },
      }
    );

    if (updateResult.matchedCount > 0) {
      return res.json({
        status: 1,
        message: 'Customer updated successfully!',
        data: {
          id: customerObjectId,
          name: name,
          mobile: mobile,
          address: address || existingCustomer.address,
        },
      });
    } else {
      return res.json({
        status: 0,
        message: 'Failed to update customer details.',
      });
    }
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({
      status: 0,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

module.exports = router;

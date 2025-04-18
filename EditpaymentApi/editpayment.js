const express = require('express');
const { getDB } = require('../CommanApi/connection');
const { ObjectId } = require('mongodb'); // Import ObjectId from mongodb

const router = express.Router();

// Edit Transaction API
router.put('/payment/:id', async (req, res) => {
  try {
    const paymentId = req.params.id; // Transaction ID from URL
    const { customer_id, mobile_number, customer_name, date, amount, remarks } = req.body; // Updated details

    // Validation
    if (!paymentId || !customer_id || !date || !amount) {
      return res.status(200).json({
        status: 0,
        message: 'All required fields must be provided',
      });
    }

    // Convert IDs to ObjectId
    const paymentObjectId = ObjectId.isValid(paymentId)
      ? new ObjectId(paymentId)
      : null;

    const customerObjectId = ObjectId.isValid(customer_id)
      ? new ObjectId(customer_id)
      : null;

    if (!paymentObjectId || !customerObjectId) {
      return res.status(400).json({
        status: 0,
        message: 'Invalid ID format for transaction or customer',
      });
    }

    const paymentDate = date ? new Date(date) : new Date();

    // Get the Database Instances
    const paymentMaster = await getDB('payment_master');
    const customerMaster = await getDB('customer_master');

    // Check if the transaction exists
    const existingPayment = await paymentMaster.findOne({
      _id: paymentObjectId,
    });

    if (!existingPayment) {
      return res.status(404).json({
        status: 0,
        message: 'Payment not found',
      });
    }

    // Fetch customer details from customer_master
    const customerDetails = await customerMaster.findOne({
      _id: customerObjectId,
    });

    if (!customerDetails) {
      return res.status(404).json({
        status: 0,
        message: 'Customer not found',
      });
    }

    const customerupdatedResult = await customerMaster.updateOne(
      { _id: customerObjectId },
      {
        $set: {
          name: customer_name,
          mobile: mobile_number,
        },
      }
    );

    if (customerupdatedResult.matchedCount > 0) {
     // Update the transaction record
    const updatedResult = await paymentMaster.updateOne(
      { _id: paymentObjectId }, // Match by the transaction's ID
      {
        $set: {
          customer_id: customerObjectId,
          // customer_name: customerName,
          // customer_mobile: customerMobile,
          date: paymentDate,
          amount: parseInt(amount),
          remarks: remarks || '', // Optional field
        },
      }
    );

    if (updatedResult.matchedCount > 0) {
      return res.json({
        status: 1,
        message: 'Payment updated successfully',
        data: {
          id: paymentObjectId,
          customer_id: customerObjectId,
          customer_name: customer_name,
          customer_mobile: mobile_number,
          date: paymentDate,
          amount: parseInt(amount),
          remarks: remarks,
        },
      });
    } else {
      return res.json({
        status: 0,
        message: 'Failed to update the payment',
      });
    }
  } else {
    return res.json({
      status: 0,
      message: 'Failed to update the payment',
    });
  }
  } catch (error) {
    console.error('Error updating payment data:', error);
    res.status(500).json({
      status: 0,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

module.exports = router;

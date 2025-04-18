const express = require('express');
const { getDB } = require('../../CommanApi/connection');
const { ObjectId } = require('mongodb'); // Import ObjectId from mongodb

const router = express.Router();

// Insert Data into payment_master Collection
router.post('/payment', async (req, res) => {
  try {
    const { customer_id, date, amount, remarks } = req.body;

    // Validation
    if (!customer_id || !date || !amount) {
      return res.status(200).json({
        status: 0,
        message: 'All required fields must be provided',
      });
    }

    console.log(req.body);

    const paymentDate = date ? new Date(date) : new Date();

    // Convert customer_id to ObjectId
    const customerObjectId = ObjectId.isValid(customer_id)
      ? new ObjectId(customer_id)
      : null;

    if (!customerObjectId) {
      return res.status(400).json({
        status: 0,
        message: 'Invalid customer_id format',
      });
    }

    // Get the Database Instance
    const paymentMaster = await getDB('payment_master');

    // Insert Data into payment_master Collection
    const result = await paymentMaster.insertOne({
      customer_id: customerObjectId, // Store as ObjectId
      date: paymentDate,
      amount: parseInt(amount),
      remarks: remarks || '', // Optional field
    });

    console.log(result);

    if (result && result.insertedId) {
      res.json({
        status: 1,
        message: 'Payment data inserted successfully',
        data: {
          id: result.insertedId,
          customer_id: customerObjectId,
          date: paymentDate,
          amount,
          remarks,
        },
      });
    } else {
      res.status(500).json({
        status: 0,
        message: 'Failed to insert payment data',
      });
    }
  } catch (error) {
    console.error('Error inserting payment data:', error);
    res.status(500).json({
      status: 0,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

module.exports = router;

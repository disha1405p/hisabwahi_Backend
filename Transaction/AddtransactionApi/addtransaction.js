const express = require('express');
const { getDB } = require('../../CommanApi/connection');
const { ObjectId } = require('mongodb'); // Import ObjectId from mongodb

const router = express.Router();

// Insert or Update Data into sales_master Collection
router.post('/transaction', async (req, res) => {
  try {
    const { customer_id, date, amount, remarks } = req.body;

    // Validation
    if (!customer_id || !date || !amount) {
      return res.status(200).json({
        status: 0,
        message: 'All required fields must be provided',
      });
    }

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
    const salesMaster = await getDB('sales_master');

    // Check if a transaction with the same customer_id and date exists
    // const existingTransaction = await salesMaster.findOne({
    //   customer_id: customerObjectId,
    //   // date: paymentDate,
    // });
    // console.log('Existing Transaction:', existingTransaction);

    // if (existingTransaction) {
    //   // Update the existing transaction record
    //   const updatedResult = await salesMaster.updateOne(
    //     { _id: existingTransaction._id }, // Match by the existing transaction's ID
    //     {
    //       $set: {
    //         amount: parseInt(amount),
    //         remarks: remarks || '',
    //       },
    //     }
    //   );

    //   if (updatedResult.modifiedCount > 0) {
    //     return res.json({
    //       status: 1,
    //       message: 'The transaction record has been successfully updated.',
    //     });
    //   } else {
    //     return res.json({
    //       status: 0,
    //       message: 'Failed to update the transaction record.',
    //     });
    //   }
    // }

    // If no existing transaction, insert a new record
    const insertResult = await salesMaster.insertOne({
      customer_id: customerObjectId,
      date: paymentDate,
      amount: parseInt(amount),
      remarks: remarks || '', // Optional field
    });

    if (insertResult && insertResult.insertedId) {
      return res.json({
        status: 1,
        message: 'Transaction added successfully',
        data: {
          id: insertResult.insertedId,
          customer_id: customerObjectId,
          date: paymentDate,
          amount: amount,
          remarks: remarks,
        },
      });
    } else {
      return res.json({
        status: 0,
        message: 'Failed to add transaction',
      });
    }
  } catch (error) {
    console.error('Error inserting/updating transaction data:', error);
    res.status(500).json({
      status: 0,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

module.exports = router;

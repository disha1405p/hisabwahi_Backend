const express = require('express');
const { getDB } = require('../CommanApi/connection');
const { ObjectId } = require('mongodb');

const router = express.Router();

// Delete Transaction API
router.delete('/transaction/:id', async (req, res) => {
  try {
    const transactionId = req.params.id; // Get Transaction ID from URL

    if (!ObjectId.isValid(transactionId)) {
      return res.status(400).json({
        status: 0,
        message: 'Invalid transaction ID format',
      });
    }

    const transactionObjectId = new ObjectId(transactionId);
    
    // Get Database Instance
    const salesMaster = await getDB('sales_master');

    // Check if transaction exists
    const existingTransaction = await salesMaster.findOne({ _id: transactionObjectId });

    if (!existingTransaction) {
      return res.status(404).json({
        status: 0,
        message: 'Transaction not found',
      });
    }

    // Delete transaction from the database
    const deleteResult = await salesMaster.deleteOne({ _id: transactionObjectId });

    if (deleteResult.deletedCount > 0) {
      return res.json({
        status: 1,
        message: 'Transaction deleted successfully',
      });
    } else {
      return res.json({
        status: 0,
        message: 'Failed to delete transaction',
      });
    }
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({
      status: 0,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

module.exports = router;

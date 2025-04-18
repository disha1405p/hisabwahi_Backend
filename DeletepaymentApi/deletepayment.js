const express = require('express');
const { getDB } = require('../CommanApi/connection');
const { ObjectId } = require('mongodb');

const router = express.Router();

// Delete Payment API
router.delete('/payment/:id', async (req, res) => {
  try {
    const paymentId = req.params.id; // Get Payment ID from URL

    if (!ObjectId.isValid(paymentId)) {
      return res.status(400).json({
        status: 0,
        message: 'Invalid payment ID format',
      });
    }

    const paymentObjectId = new ObjectId(paymentId);
    
    // Get Database Instance
    const paymentMaster = await getDB('payment_master');

    // Check if payment exists
    const existingPayment = await paymentMaster.findOne({ _id: paymentObjectId });

    if (!existingPayment) {
      return res.status(404).json({
        status: 0,
        message: 'Payment not found',
      });
    }

    // Delete payment from the database
    const deleteResult = await paymentMaster.deleteOne({ _id: paymentObjectId });

    if (deleteResult.deletedCount > 0) {
      return res.json({
        status: 1,
        message: 'Payment deleted successfully',
      });
    } else {
      return res.json({
        status: 0,
        message: 'Failed to delete payment',
      });
    }
  } catch (error) {
    console.error('Error deleting payment:', error);
    res.status(500).json({
      status: 0,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

module.exports = router;

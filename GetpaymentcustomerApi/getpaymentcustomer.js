const express = require('express');
const { getDB } = require('../CommanApi/connection');
const router = express.Router();

router.post('/paymentcustomer', async (req, res) => {
    try{
        const { mobileNumber } = req.body;

        if (!mobileNumber) {
            return res.status(200).json({ error: 'All required fields must be provided' });
          }
          console.log(req.body);

          const paymentmaster = await getDB("customer_master");

          const result = await paymentmaster.findOne({
            mobile:mobileNumber,
          });
          console.log(result);
          if(result !== null){
            res.json({
              status:1,
              message: 'Payment data inserted successfully',
              data: {
                customerName:result.name,
              }, // Returns the inserted document
            });
          }
          else{
            res.json({
              message:"Customer Name Not Found",
              status: 0,
            })
          }
    }
    catch (error) {
        console.error('Error inserting payment data:', error);
        res.status(200).json({ error: error.message });
    }
});

module.exports = router;
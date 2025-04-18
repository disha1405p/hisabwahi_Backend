const express = require('express');
const router = express.Router();
const { MongoClient } = require('mongodb');
const connection = require('../CommanApi/connection');
const md5encryption = require('../CommanApi/md5encryption');
const { initializeConnection, getDB, handleapptermination } = require('../CommanApi/connection');
const cors = require('cors');
const bodyParser = require('body-parser');
//const ObjectId = require('mongodb').ObjectId
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));


router.post('/loginApi1', async (req, res) => { 

    try{
      const userMaster = await getDB('user_master')
    //   const userMaster = userMaster.collection('user_master')
       const{ mobileNumber, password } = req.body;
        console.log("loginData ",req.body);

         let encryptedPassword;
          encryptedPassword = md5encryption(password);

          const checkUser = await userMaster.findOne({Mobile:mobileNumber,password:encryptedPassword,userStatus:{$in:["Active","Deactive"]}})

       if(checkUser !== null){
       
        return res.json({ status: 1,message:'Login successfully', data:[checkUser]})
       }

       else{
        return res.json({status: 0,message: 'User not found Or Invalid Credentials',data:[]})
       }
    }
    catch (error){
        await handleapptermination();
        await initializeConnection();
        //  closeDB(client)
        res.status(200).json({success:false,error: 'Error fetching data'});
        } finally{
            // closeDB(client)
        }
})

module.exports = router;
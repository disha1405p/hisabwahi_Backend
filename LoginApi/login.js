const express = require('express');
const router = express.Router();
// const { MongoClient } = require('mongodb');
// const connection = require('../CommanApi/connection');
const md5encryption = require('../CommanApi/md5encryption');
const { initializeConnection, getDB, handleapptermination } = require('../CommanApi/connection');
// const cors = require('cors');
const bodyParser = require('body-parser');
//const ObjectId = require('mongodb').ObjectId
const app = express()
//app.use(cors());
// app.use(cors({
//     origin: 'http://localhost:3000', // Replace with your React app's URL
//   }));
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));


router.post('/loginApi', async (req, res) => {

    try{
        
       const userMaster = await getDB('user_master');
       //const userMaster = hisabwahiDB.collection('user_master')
       const{ emailId, password } = req.body;
        console.log("loginData ",req.body);

        
       let encryptedPassword;
       encryptedPassword = md5encryption(password);

       const checkUser = await userMaster.findOne({email_id:emailId,password:encryptedPassword,userStatus:{$in:["Active","Deactive"]}})

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

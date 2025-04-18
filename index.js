const express = require('express');
// const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const { initializeConnection, handleapptermination } = require('./CommanApi/connection');

// Routes
const addtransaction = require('./Transaction/AddtransactionApi/addtransaction');
const addpayment = require('./Payment/AddpaymentApi/addpayment');
const addcustomer = require('./Customer/AddcustomerApi/addcustomer');
const gettransactioncustomer = require('./GettransactioncustomerApi/gettransactioncustomer');
const getpaymentcustomer = require('./GetpaymentcustomerApi/getpaymentcustomer');
const getSales =  require('./Sales/getSales');
const getPayment = require('./Payment1/getPayment');
const getCustomer = require('./Customer1/getCustomer')
const editTransactionApi = require('./EdittransactionApi/edittransaction');
const editPaymentApi = require('./EditpaymentApi/editpayment');
const editCustomerApi = require('./EditcustomerApi/editcustomer');
const deletePaymentApi = require('./DeletepaymentApi/deletepayment');
const deleteTransactionApi = require('./DeletetransactionApi/deletetransaction');
const loginApi = require('./LoginApi/login');
const loginApi1 = require('./LoginApi1/login1');
const deleteCustomerApi = require('./DeletecustomerApi/deletecustomer');

deleteCustomerApi()
  .then((router) => {
    app.use('/delete', router);
  })
  .catch((err) => {
    console.error("Error initializing deleteCustomerApi:", err);
  });


// App Configuration
const app = express();
const port = 1405;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// API Routes
app.use('/login', loginApi);
app.use('/login1', loginApi1);
app.use('/add', addtransaction);
app.use('/add', addpayment);
app.use('/add', addcustomer);
app.use('/get', gettransactioncustomer);
app.use('/get', getpaymentcustomer);
app.use('/get', getSales);
app.use('/get', getPayment);
app.use('/get', getCustomer);
app.use('/edit', editTransactionApi);
app.use('/edit', editPaymentApi);
app.use('/edit', editCustomerApi);
app.use('/delete', deletePaymentApi);
app.use('/delete', deleteTransactionApi);


// Start Server
app.listen(port, async () => {
  console.log(`Server started on port ${port}`);
  await initializeConnection(); // Initialize database connection
});

// Graceful Shutdown
process.on('SIGINT', async () => {
  await handleapptermination();
  process.exit(0);
});

// // MongoDB Connection
// mongoose
//   .connect('mongodb://localhost:27017/exampleDB', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log('MongoDB connected'))
//   .catch((err) => console.error('MongoDB connection error:', err));

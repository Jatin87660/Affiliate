const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken')
const User = require('../model/user')
const Order = require('../model/order_id')
const Pending = require('../model/pending_orders')
const Wallet = require('../model/wallet')
const Transaction  = require('../model/transaction')
const New_Order = require('../model/new_orders_for_admin')



router.get('/', async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).send('Unauthorized: No token provided');
  }

  try {
    const user_token = jwt.verify(token, process.env.SECRET);
    const user = await User.findById(user_token.id);

    if (!user) {
      return res.status(401).send('Unauthorized: User not found');
    }

    // check for pending orders
    const orders = await Pending.find({ email: user.email });

    // wallet
    const wallet = await Wallet.findOne({email:user.email});



  

    res.render('main', {user,orders,wallet});
  } catch (err) {
    console.error('JWT verification failed:', err);
    res.status(401).send('Invalid token');
  }
});




router.post('/confirm-order/:email', async (req, res) => {
  try {
    const email = req.params.email;
    const { Order_Id, Order_Amount } = req.body;

    if (!Order_Id || !Order_Amount) {
      return res.status(400).json({ message: "Order ID and Amount are required" });
    }

    // Check if order already exists
    const exist = await Order.findOne({ order_id: Order_Id });
    if (exist) {
      return res.status(400).json({ message: "Order already exists" });
    }

    // Create order
    await Order.create({
      email,
      order_id: Order_Id,
      amount: Order_Amount
    });

    // order create for admin (only new)
    await New_Order.create({
      email,
      order_id: Order_Id,
      amount: Order_Amount
    });


    
    // await Pending.create({
    //   email,
    //   order_id: Order_Id,
    //   amount: Order_Amount
    // });

    res.redirect('/main')
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//logout

router.get('/logout',(req,res)=>{
  res.clearCookie('token'); // clears cookie named 'token'
  res.redirect('/login')
})

//transaction page
router.get('/transaction/:name/:id', async (req, res) => {
  try {
    const { id, name } = req.params;

    // Wait for the transaction to be fetched
    const transaction = await Transaction.find({id});

    if (!transaction) {
      return res.status(404).send('Transaction not found');
    }

    // Render the template with the data
    res.render('transactions', { transaction, name });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});













module.exports = router;
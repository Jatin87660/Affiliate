const express = require('express');
const router = express.Router();
const User = require('../model/user')
const Order = require('../model/new_orders_for_admin')
const Pending = require('../model/pending_orders')
const Admin_User = require('../model/admin_user')
const bcrypt = require('bcrypt')
const Checked_Order = require('../model/checked_orders');
const Commision =  require('../model/commission');
const Wallet = require('../model/wallet')


async function acreate(email, name, password) {
  const hashedPassword = await bcrypt.hash(password, 10);

  await Admin_User.create({
    email,
    name,
    password: hashedPassword
  });
  console.log(`${name} user is created as admin user`);
}





router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send('All fields are required');
    }

    const user = await Admin_User.findOne({ email });
    if (!user) {
      return res.status(401).send('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send('Invalid email or password');
    }

    // login success
    res.render('admin', { name: user.name });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).send('Internal server error');
  }
});



// admin page 

// router.get('/jatin',(req,res)=>{          //dont't forget to delete this route
//     res.render('admin',{name:'Jatin'})
// })


router.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

router.post('/update_pending_payment', async (req, res) => {
    try {
        const { email, commission, order_id } = req.body;

        // Check required fields
        if (!email || !commission || !order_id) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        // 1️⃣ Check if the order exists
        const orderExist = await Order.findOne({ email, order_id });
        if (!orderExist) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // 2️⃣ Check if already processed
        const checked = await Checked_Order.findOne({ order_id });
        if (checked) {
            return res.status(400).json({ success: false, message: 'Order already processed' });
        }

        // 3️⃣ Delete from Order
        const deleted = await Order.deleteOne({ order_id });
        if (!deleted.deletedCount) {
            return res.status(500).json({ success: false, message: 'Failed to delete order' });
        }

        // 4️⃣ Add to Checked_Order
        const added_to_checked = await Checked_Order.create({
            email,
            order_id,
            amount: orderExist.amount,
        });
        if (!added_to_checked) {
            return res.status(500).json({ success: false, message: 'Failed to add to Checked_Order' });
        }

        // 5️⃣ Update Wallet
        const update_wallet = await Wallet.updateOne(
            { email },
            { $inc: { pending: Number(commission) } },
            { upsert: true }
        );
        if (!update_wallet.acknowledged) {
            return res.status(500).json({ success: false, message: 'Failed to update Wallet' });
        }

        // 6️⃣ Add to Pending
        const add_to_pending = await Pending.create({
            email,
            order_id,
            amount: commission
        });
        if (!add_to_pending) {
            return res.status(500).json({ success: false, message: 'Failed to add to Pending' });
        }

        // 7️⃣ Add to Commission
        const add_to_commission = await Commision.create({
            email,
            order_id,
            commission
        });
        if (!add_to_commission) {
            return res.status(500).json({ success: false, message: 'Failed to add to Commission' });
        }

        // ✅ All operations succeeded
        res.status(200).json({ success: true });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});








module.exports =router;
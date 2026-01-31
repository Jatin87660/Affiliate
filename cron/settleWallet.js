const cron = require('node-cron');
const Pending = require('../model/pending_orders');
const Wallet = require('../model/wallet');
const Transaction = require('../model/transaction')

cron.schedule('0 0 * * *', async () => {
  console.log('Running wallet settlement job...');

  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
  const cutoffDate = new Date(Date.now() - THIRTY_DAYS);

  // find all pending orders older than 30 days
  const oldPendings = await Pending.find({
    createdAt: { $lte: cutoffDate }
  });

  for (const order of oldPendings) {
    const wallet = await Wallet.findOne({ email: order.email });
    if (!wallet) continue;

    const amount = Number(order.amount);

    // move money
    wallet.pending -= amount;
    wallet.fix += amount;
    await wallet.save();

    // update transaction 
    await Transaction.create({
      email:order.email,
      order_id: order.order_id,
      amount
    })

    // remove pending order
    await Pending.deleteOne({ _id: order._id });
  }

  console.log(`Settled ${oldPendings.length} orders`);
});





const express = require('express');
const router = express.Router();
const User = require('../model/user')
const Order = require('../model/order_id')
const Pending = require('../model/pending_orders')
const Admin_User = require('../model/admin_user')
const bcrypt = require('bcrypt')


async function acreate(email, name, password) {
  const hashedPassword = await bcrypt.hash(password, 10);

  await Admin_User.create({
    email,
    name,
    password: hashedPassword
  });
  console.log(`${name} user is created as admin user`);
}


// (async () => {
//   try {
//     await acreate(
//       'jatinagr1122@gmail.com',
//       'Jatin',
//       'admin@1212'
//     );
//   } catch (err) {
//     console.error(err.message);
//   }
// })();



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

router.get('/jatin',(req,res)=>{          //dont't forget to delete this route
    res.render('admin',{name:'Jatin'})
})



module.exports =router;
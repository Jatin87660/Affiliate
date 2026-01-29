const express = require('express');
const crypto = require('crypto');
const Temp = require('../model/temporary');
const User = require('../model/user');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const Wallet = require('../model/wallet')



const router = express.Router();



async function sendOtpEmail(email) {
  try {
    const response = await fetch(' https://unattentively-gradational-kim.ngrok-free.dev/send-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.EMAIL_API_KEY // add API key for security if your API requires it
      },
      body: JSON.stringify({ email })
    });

    if (!response.ok) {
      throw new Error(`Email API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    return data.otp;  // return the OTP if needed
  } catch (error) {
    console.error('Failed to send OTP:', error);
    throw error;
  }
}










// POST /sign-in 
router.post('/sign-in', async (req, res) => {
  const { email, name, password } = req.body;

  if (!email || !name || !password) {
    return res.status(400).send('All fields are required');
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).send('User already exists. Please log in.');
    }

    //  Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Send OTP via Resend
    const otp = await sendOtpEmail(email); 
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save to Temp collection (upsert)
    await Temp.replaceOne(
      { email },
      {
        email,
        name,
        password: hashedPassword,
        otp,
        otpExpiry: expiry,
      },
      { upsert: true }
    );

    //  Render OTP verification page
    res.render('verify-email', { email });

  } catch (error) {
    console.error(' Error during sign-in:', error);
    res.status(500).send('Internal server error');
  }
});


// POST /verify-otp/:email → Step 2: Verify OTP and create real user
router.post('/verify-otp/:email', async (req, res) => {
  const email = req.params.email;
  const otp = req.body.otp;

  if (!email || !otp) {
    return res.status(400).send('All fields are required');
  }

  try {
    const temp = await Temp.findOne({ email });

    if (!temp) {
      return res.status(400).send('No sign-up attempt found for this email.');
    }

    if (temp.otp !== parseInt(otp)) {
      return res.status(400).send('Incorrect OTP.');
    }

    if (temp.otpExpiry < new Date()) {
      await Temp.deleteOne({ email }); // Optional: clean up expired entry
      return res.status(400).send('OTP has expired. Please sign up again.');
    }

    //  Check again to avoid race condition
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      await Temp.deleteOne({ email }); // Optional cleanup
      return res.status(409).send('User already exists. Please log in.');
    }

    // Move user from Temp to real User collection
    await User.create({
      email: temp.email,
      name: temp.name,
      password: temp.password,
    });

    await Temp.deleteOne({ email }); // cleanup

    await Wallet.create({
      email
    })

    return res.redirect('/login');

  } catch (error) {
    console.error(' Error verifying OTP:', error);
    return res.status(500).send('Internal server error');
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send('All fields are required');
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).send('Invalid email or password');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).send('Invalid email or password');
  }

  const token = jwt.sign({id:user.id, name:user.name},process.env.SECRET,{expiresIn:'1y'});

  res.cookie('token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 1000 * 60 * 60 * 24 * 365
  });

  res.redirect('/main');
});



router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).send('Email is required');
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send('User with this email not found');
    }

    const otp = await sendOtpEmail(email); // OTP generated and emailed
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    res.render('verify-forgot-password', { email });
  } catch (error) {
    console.error('Error during forgot-password:', error);
    res.status(500).send('Internal Server Error');
  }
});


router.post('/verify-forgot-password/:email', async (req, res) => {
  const email = req.params.email;
  const { otp } = req.body;

  if (!otp) {
    return res.status(400).send('OTP is required');
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).send('User not found');
    }

    // Convert to number if OTP is stored as a number
    const enteredOtp = parseInt(otp);

    // Check if OTP matches
    if (user.otp != enteredOtp) {
      return res.status(400).send('Invalid OTP');
    }

    // Check if OTP has expired
    if (new Date(user.otpExpiry) < new Date()) {
      return res.status(400).send('OTP has expired');
    }

    
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    // Proceed to reset password view
    res.render('reset-password', { email });

  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).send('Internal Server Error');
  }
});


router.post('/new-password/:email', async (req, res) => {
  const { password } = req.body;
  const { email } = req.params;

  if (!password || !email) {
    return res.status(400).send('Email and password are required');
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.findOneAndUpdate(
      { email },
      { password: hashedPassword },
      { new: true }
    );

    if (!user) {
      return res.status(404).send('User not found');
    }

    res.redirect('/login');
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).send('Internal Server Error');
  }
});




module.exports = router;

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');

const User = require('../../models/User');

// @route       POST api/users
// @desc        Register user
// @access      Private
router.post(
  '/',
  [
    check('firstname', 'First Name is required')
      .not()
      .isEmpty(),
    check('lastname', 'Last Name is required')
      .not()
      .isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('usertype', 'User type is requires')
      .not()
      .isEmpty(),
    check(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstname, lastname, email, usertype, password, avatar } = req.body;

    try {
      let user = await User.findOne({ email });

      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User already exists' }] });
      }

      user = new User({
        firstname,
        lastname,
        email,
        usertype,
        password,
        avatar
      });

      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt);

      await user.save();

      const payload = {
        user: { id: user.id }
      };

      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: '30 days' },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route       GET api/users
// @desc        Get all user
// @access      Private
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route       GET api/users/:user_id
// @desc        Get user by id
// @access      Private
router.get('/:user_id', async (req, res) => {
  try {
    const user = await User.findById(req.params.user_id);

    if (!user) {
      return res.status(404).json({ msg: 'User does not exist.' });
    }

    res.json(user);
  } catch (err) {
    console.error(err.message);
    if (err.kind == 'ObjectId') {
      return res.status(400).json({ msg: 'User does not exits' });
    }
    res.status(500).send('ServerError');
  }
});

// @route       PUT api/users/:user_id
// @desc        Update user by ID
// @access      Private
router.put('/:user_id', async (req, res) => {
  const { firstname, lastname, email, usertype, password, avatar } = req.body;

  try {
    let user = await User.findById(req.params.user_id).select('-password');

    if (!user) {
      return res.status(400).json({ msg: 'User does not exists.' });
    }

    const userFields = {};
    userFields._id = req.params.user_id;

    // TODO replace if-else with a more classy solution
    if (firstname) userFields.firstname = firstname;
    if (lastname) userFields.lastname = lastname;
    if (email) userFields.email = email;
    if (usertype && user.usertype.includes(usertype)) {
      console.log('Already a user of same type');
      userFields.usertype = user.usertype;
    } else if (usertype) {
      userFields.usertype = user.usertype.concat(usertype);
    } else {
      userFields.usertype = user.usertype;
    }
    if (password) userFields.password = password;
    if (avatar) userFields.avatar = avatar;

    user = await User.findOneAndUpdate(
      { _id: req.params.user_id },
      { $set: userFields },
      { new: true }
    );

    return res.json('User updated');
  } catch (err) {
    console.error(err.message);
    if (err.kind == 'ObjectId') {
      return res.status(400).json({ msg: 'User does not exits' });
    }
    res.status(500).send('Server Error');
  }
});

// @route       DELETE api/users
// @desc        DELETE user by ID
// @access      Private
router.delete('/', async (req, res) => {
  try {
    await User.findByIdAndRemove({ _id: req.body.id });

    res.json('User deleted');
  } catch (err) {
    console.error(err.message);
    res.status(500).json('Server Error');
  }
});

module.exports = router;

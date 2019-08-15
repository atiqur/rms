const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');

const Client = require('../../models/Client');

// @route       POST api/clients
// @desc        Add client
// @access      Private
router.post(
  '/',
  [
    check('name', 'Name of client is required')
      .not()
      .isEmpty(),
    check('clientcontactno', 'Please enter only numbers')
      .optional()
      .isNumeric(),
    check('clientemail', 'Please enter a valid email address')
      .optional()
      .trim()
      .isEmail()
      .normalizeEmail()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      division,
      vertical,
      clientcontactno,
      clientemail,
      logo,
      date
    } = req.body;

    try {
      let client = await Client.findOne({ name });

      if (client) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Client already exists' }] });
      }

      client = new Client({
        name,
        division,
        vertical,
        clientcontactno,
        clientemail,
        logo,
        date
      });

      await client.save();

      res.send('Client added');
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route       GET api/clients
// @desc        Get all client
// @access      Private
router.get('/', async (req, res) => {
  try {
    const client = await Client.find();
    res.json(client);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route       GET api/clients/:client_id
// @desc        Get client by ID
// @access      Private
router.get('/:client_id', async (req, res) => {
  try {
    const client = await Client.findById(req.params.client_id);

    if (!client) {
      return res.status(400).json({ msg: 'Client does not exists.' });
    }

    return res.json(client);
  } catch (err) {
    console.error(err.message);
    if (err.kind == 'ObjectId') {
      return res.status(400).json({ msg: 'Client does not exits' });
    }
    res.status(500).send('Server Error');
  }
});

// @route       PUT api/clients/:client_id
// @desc        Update client by ID
// @access      Private
router.put('/:client_id', async (req, res) => {
  const {
    name,
    division,
    vertical,
    clientcontactno,
    clientemail,
    logo,
    date
  } = req.body;

  try {
    let client = await Client.findById(req.params.client_id);

    if (!client) {
      return res.status(400).json({ msg: 'Client does not exists.' });
    }

    const clientProfile = {};
    clientProfile._id = req.params.client_id;

    if (name) clientProfile.name = name;
    if (division) clientProfile.division = division;
    if (vertical) clientProfile.vertical = vertical;
    if (clientcontactno && client.clientcontactno.includes(clientcontactno)) {
      console.log('Contact Number already exists');
      clientProfile.clientcontactno = client.clientcontactno;
    } else if (clientcontactno) {
      clientProfile.clientcontactno = client.clientcontactno.concat(
        clientcontactno
      );
    } else {
      clientProfile.clientcontactno = client.clientcontactno;
    }
    if (clientemail && client.clientemail.includes(clientemail)) {
      console.log('Email already exists');
      clientProfile.clientemail = client.clientemail;
    } else if (clientemail) {
      clientProfile.clientemail = client.clientemail.concat(clientemail);
    } else {
      clientProfile.clientemail = client.clientemail;
    }
    if (logo) clientProfile.logo = logo;

    client = await Client.findOneAndUpdate(
      { _id: req.params.client_id },
      { $set: clientProfile },
      { new: true }
    );

    return res.json(client);
  } catch (err) {
    console.error(err.message);
    if (err.kind == 'ObjectId') {
      return res.status(400).json({ msg: 'Client does not exits' });
    }
    res.status(500).send('Server Error');
  }
});

// @route       DELETE api/clients/:client_id
// @desc        Delete client by ID
// @access      Private
router.delete('/:client_id', async (req, res) => {
  try {
    const client = await Client.findById(req.params.client_id);

    if (!client) {
      return res.status(400).json({ msg: 'Client does not exists.' });
    }

    await Client.findByIdAndRemove(req.params.id);

    return res.json({ msg: 'Client deleted' });
  } catch (err) {
    console.error(err.message);
    if (err.kind == 'ObjectId') {
      return res.status(400).json({ msg: 'Client does not exits' });
    }
    res.status(500).send('Server Error');
  }
});

// @route       PUT api/clients/address/:client_id
// @desc        Add client address
// @access      Private
router.put(
  '/address/:client_id',
  [
    check('line1', 'Line 1 is required')
      .not()
      .isEmpty(),
    check('city', 'City is required')
      .not()
      .isEmpty(),
    check('state', 'State is required')
      .not()
      .isEmpty(),
    check('pin', 'Please enter a valid PIN code').isNumeric()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const newAddress = ({
      line1,
      line2,
      line3,
      city,
      state,
      pin,
      country,
      gstin
    } = req.body);

    try {
      const client = await Client.findById(req.params.client_id);

      if (!client) {
        return res.status(400).json({ msg: 'Client does not exists.' });
      }

      if (client.address.map(item => item.gstin).includes(gstin)) {
        return res.status(400).json({
          errrors: [{ msg: 'Address with the same GSTIN already exists.' }]
        });
      }

      client.address.unshift(newAddress);

      await client.save();

      return res.json(client);
    } catch (err) {
      console.error(err.message);
      if (err.kind == 'ObjectId') {
        return res.status(400).json({ msg: 'Client does not exits' });
      }
      res.status(500).send('Server Error');
    }
  }
);

// @route       GET api/clients/address/:client_id
// @desc        Get all addresses of a client
// @access      Private
router.get('/address/:client_id', async (req, res) => {
  try {
    const client = await Client.findById(req.params.client_id);

    if (!client) {
      return res.status(400).json({ msg: 'Client does not exists.' });
    }

    res.json(client.address);
  } catch (err) {
    console.error(err.message);
    if (err.kind == 'ObjectId') {
      return res.status(400).json({ msg: 'Client does not exits' });
    }
    res.status(500).send('Server Error');
  }
});

// @route       GET api/clients/address/:client_id/:address_id
// @desc        Get addresses of a client by ID
// @access      Private
router.get('/address/:client_id/:address_id', async (req, res) => {
  try {
    const client = await Client.findById(req.params.client_id);

    if (!client) {
      return res.status(400).json({ msg: 'Client does not exists.' });
    }

    // Pull out address
    const address = client.address.find(
      address => address.id === req.params.address_id
    );

    if (!address) {
      return res.status(404).json({ msg: 'Address not found' });
    }

    res.json(address);
  } catch (err) {
    console.error(err.message);
    if (err.kind == 'ObjectId') {
      return res.status(400).json({ msg: 'Client does not exits' });
    }
    res.status(500).send('Server Error');
  }
});

// @route       PUT api/clients/address/:client_id/:address_id
// @desc        Update addresses of a client by ID
// @access      Private
router.put('/address/:client_id/:address_id', async (req, res) => {
  const { line1, line2, line3, city, state, pin, country, gstin } = req.body;

  try {
    let client = await Client.findById(req.params.client_id);

    if (!client) {
      return res.status(400).json({ msg: 'Client does not exists.' });
    }

    // Pull out address
    const address = client.address.find(
      address => address.id === req.params.address_id
    );

    if (!address) {
      return res.status(404).json({ msg: 'Address not found' });
    }

    const clientAddress = {};

    if (line1) {
      clientAddress.line1 = line1;
    } else {
      clientAddress.line1 = address.line1;
    }
    if (line2) {
      clientAddress.line2 = line2;
    } else {
      clientAddress.line2 = address.line2;
    }
    if (line3) {
      clientAddress.line3 = line3;
    } else {
      clientAddress.line3 = address.line3;
    }
    if (city) {
      clientAddress.city = city;
    } else {
      clientAddress.city = address.city;
    }
    if (state) {
      clientAddress.state = state;
    } else {
      clientAddress.state = address.state;
    }
    if (country) {
      clientAddress.country = country;
    } else {
      clientAddress.country = address.country;
    }
    if (pin) {
      clientAddress.pin = pin;
    } else {
      clientAddress.pin = address.pin;
    }
    if (gstin) {
      clientAddress.gstin = gstin;
    } else {
      clientAddress.gstin = address.gstin;
    }

    client = await Client.findOneAndUpdate(
      {
        'address._id': req.params.address_id
      },
      {
        $set: {
          'address.$.line1': clientAddress.line1,
          'address.$.line2': clientAddress.line2,
          'address.$.line3': clientAddress.line3,
          'address.$.city': clientAddress.city,
          'address.$.state': clientAddress.state,
          'address.$.country': clientAddress.country,
          'address.$.pin': clientAddress.pin,
          'address.$.gstin': clientAddress.gstin
        }
      },
      {
        new: true
      }
    );

    return res.json(client.address);
  } catch (err) {
    console.error(err.message);
    if (err.kind == 'ObjectId') {
      return res.status(400).json({ msg: 'Client or Address does not exits' });
    }
    res.status(500).send('Server Error');
  }
});

// @route       DELETE api/clients/address/:client_id/:address_id
// @desc        Delete client address by ID
// @access      Private
router.delete('/address/:client_id/:address_id', async (req, res) => {
  try {
    const client = await Client.findById(req.params.client_id);

    // Pull out address
    const address = client.address.find(
      address => address.id === req.params.address_id
    );

    if (!address) {
      return res.status(404).json({ msg: 'Address not found' });
    }

    // Get remove index
    const removeIndex = client.address
      .map(item => item._id)
      .indexOf(req.params.address_id);

    client.address.splice(removeIndex, 1);

    await client.save();

    res.json(client);
  } catch (err) {
    console.error(err.message);
    if (err.kind == 'ObjectId') {
      return res.status(400).json({ msg: 'Client or Address does not exits' });
    }
    res.status(500).send('Server Error');
  }
});

// @route       GET api/clients/contactperson/:client_id
// @desc        Get all client contact person
// @access      Private
router.get('/contactperson/:client_id', async (req, res) => {
  try {
    const client = await Client.findById(req.params.client_id);

    if (!client) {
      return res.status(404).json({ msg: 'Client not found' });
    }
    res.json(client.contactperson);
  } catch (err) {
    console.error(err.message);
    if (err.kind == 'ObjectId') {
      return res.status(400).json({ msg: 'Client does not exits' });
    }
    res.status(500).send('Server Error');
  }
});

// @route       GET api/clients/contactperson/:client_id/:contactperson_id
// @desc        Get client contact person by ID
// @access      Private
router.get('/contactperson/:client_id/:contactperson_id', async (req, res) => {
  try {
    // Find the client
    const client = await Client.findById(req.params.client_id);

    if (!client) {
      return res.status(400).json({ msg: 'Client does not exists.' });
    }

    // Find the contact person in the client
    const contactperson = client.contactperson.find(
      contactperson => contactperson.id === req.params.contactperson_id
    );

    if (!contactperson) {
      return res.status(404).json({ msg: 'Contact person not found.' });
    }

    res.json(contactperson);
  } catch (err) {
    console.error(err.message);
    if (err.kind == 'ObjectId') {
      return res
        .status(400)
        .json({ msg: 'Client or Contact Person does not exits' });
    }
    res.status(500).send('Server Error');
  }
});

// @route       PUT api/clients/contactperson/:client_id
// @desc        Add client contact person
// @access      Private
router.put(
  '/contactperson/:client_id',
  [
    check('firstname', 'Firstname is required')
      .not()
      .isEmpty(),
    check('lastname', 'Lastname is required')
      .not()
      .isEmpty(),
    check('contactno', 'Please enter a valid contact number').isNumeric(),
    check('email', 'Please enter a valid email address').isEmail()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const newContact = ({
      firstname,
      lastname,
      designation,
      contactno,
      email
    } = req.body);

    try {
      const client = await Client.findById(req.params.client_id);

      if (!client) {
        return res.status(404).json({ msg: 'Client does not exist' });
      }

      // Create an arry of all email of contact persons
      const contactpersonEmailAll = client.contactperson
        .map(item => item.email)
        .flat();

      // Check if emails already exist
      const emailExists = contactpersonEmailAll.some(item =>
        email.includes(item)
      );

      if (emailExists) {
        return res.status(400).json({ msg: 'Email already exists' });
      }

      client.contactperson.unshift(newContact);

      await client.save();

      return res.json(client.contactperson);
    } catch (err) {
      console.error(err.message);
      if (err.kind == 'ObjectId') {
        return res.status(400).json({ msg: 'Client does not exit' });
      }
      res.status(500).send('Server Error');
    }
  }
);

// @route       PUT api/clients/contactperson/:client_id/:contactperson_id
// @desc        Update client contact person
// @access      Private
router.put('/contactperson/:client_id/:contactperson_id', async (req, res) => {
  const { firstname, lastname, designation, contactno, email } = req.body;

  // Update and save
  try {
    // Find the client
    let client = await Client.findById(req.params.client_id);

    if (!client) {
      return res.status(400).json({ msg: 'Client does not exists.' });
    }

    // Find the contact person in the client
    const contactperson = client.contactperson.find(
      contactperson => contactperson.id === req.params.contactperson_id
    );

    if (!contactperson) {
      return res.status(404).json({ msg: 'Contact person not found.' });
    }

    const clientContactPerson = {};

    clientContactPerson._id = contactperson._id;

    if (firstname) {
      clientContactPerson.firstname = firstname;
    } else {
      clientContactPerson.firstname = contactperson.firstname;
    }
    if (lastname) {
      clientContactPerson.lastname = lastname;
    } else {
      clientContactPerson.lastname = contactperson.lastname;
    }
    if (designation) {
      clientContactPerson.designation = designation;
    } else {
      clientContactPerson.designation = contactperson.designation;
    }
    if (contactno && contactperson.contactno.includes(contactno)) {
      clientContactPerson.contactno = contactperson.contactno;
    } else if (contactno) {
      clientContactPerson.contactno = contactperson.contactno.concat(contactno);
    } else {
      clientContactPerson.contactno = contactperson.contactno;
    }
    if (email && contactperson.email.includes(email)) {
      clientContactPerson.email = contactperson.email;
    } else if (email) {
      clientContactPerson.email = contactperson.email.concat(email);
    } else {
      clientContactPerson.email = contactperson.email;
    }

    // TODO Find an elegant way to update information of contact person

    client = await Client.findOneAndUpdate(
      {
        'contactperson._id': req.params.contactperson_id
      },
      {
        $set: {
          'contactperson.$': clientContactPerson
        }
      },
      {
        new: true
      }
    );

    return res.json(client.contactperson);
  } catch (err) {
    console.error(err.message);
    if (err.kind == 'ObjectId') {
      return res
        .status(400)
        .json({ msg: 'Client or Contact Person does not exits' });
    }
    res.status(500).send(err);
  }
});

// @route       DELETE api/clients/contactperson/:client_id/:contactperson_id
// @desc        Delete client contact person by ID
// @access      Private
router.delete(
  '/contactperson/:client_id/:contactperson_id',
  async (req, res) => {
    try {
      // Find the client
      const client = await Client.findById(req.params.client_id);

      if (!client) {
        return res.status(400).json({ msg: 'Client does not exists.' });
      }

      // Find the contact person in the client
      const contactperson = client.contactperson.find(
        contactperson => contactperson.id === req.params.contactperson_id
      );

      if (!contactperson) {
        return res.status(404).json({ msg: 'Contact person not found.' });
      }

      // Get remove index
      const removeIndex = client.contactperson
        .map(item => item._id)
        .indexOf(req.params.contactperson_id);

      client.contactperson.splice(removeIndex, 1);

      await client.save();

      res.json(client);
    } catch (err) {
      console.error(err.message);
      if (err.kind == 'ObjectId') {
        return res
          .status(400)
          .json({ msg: 'Client or Candidate does not exits' });
      }
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;

// Instantiate Express and the application - DO NOT MODIFY
const express = require('express');
const app = express();

// Import environment variables in order to connect to database - DO NOT MODIFY
require('dotenv').config();
require('express-async-errors');

// Import the models used in these routes - DO NOT MODIFY
const {
  Band,
  Musician,
  Instrument,
  MusicianInstrument,
} = require('./db/models');

// Express using json - DO NOT MODIFY
app.use(express.json());

// STEP 1: Creating from an associated model (One-to-Many)
app.post('/bands/:bandId/musicians', async (req, res, next) => {
  // Your code here
  try {
    let bandId = req.params.bandId;
    let { firstName, lastName } = req.body;

    let band = await Band.findByPk(bandId);
    console.log(band);

    if (band) {
      let musician = await Musician.create({
        firstName: firstName,
        lastName: lastName,
        bandId: band.id,
      });
      res.json({
        message: `Created new musician for band ${band.name}.`,
        musician: musician,
      });
    } else {
      let err = new Error(`Unable to find the band with the id: ${bandId}`);
      next(err);
    }
  } catch (err) {
    next(err);
  }
});

// STEP 2: Connecting two existing records (Many-to-Many)
app.post('/musicians/:musicianId/instruments', async (req, res, next) => {
  // Your code here
  let musicianId = req.params.musicianId;
  let musician = Musician.findByPk(musicianId);
  if (musician) {
    let { instrumentIds } = req.body;
    for (let instrumentId of instrumentIds) {
      let instrument = await Instrument.findByPk(instrumentId);
      if (!instrument) {
        let err = new Error(
          `instrument with id : ${instrumentId} not existing`
        );
        next(err);
      }
    }

    let ids = instrumentIds.join(',');
    for (let instrumentId of instrumentIds) {
      await MusicianInstrument.create({
        musicianId: musicianId,
        instrumentId: instrumentId,
      });
    }
    res.json({
      message: `Associated Adam with instruments ${ids}.`,
    });
  } else {
    let err = new Error(`Unable to find the musician with id: ${musicianId}.`);
    next(err);
  }
});

// Get the details of one band and associated musicians - DO NOT MODIFY
app.get('/bands/:bandId', async (req, res, next) => {
  const payload = await Band.findByPk(req.params.bandId, {
    include: { model: Musician },
    order: [[Musician, 'firstName']],
  });
  res.json(payload);
});

// Get the details all bands and associated musicians - DO NOT MODIFY
app.get('/bands', async (req, res, next) => {
  const payload = await Band.findAll({
    include: { model: Musician },
    order: [['name'], [Musician, 'firstName']],
  });
  res.json(payload);
});

// Get the details of one musician and associated instruments - DO NOT MODIFY
app.get('/musicians/:musicianId', async (req, res, next) => {
  const payload = await Musician.findByPk(req.params.musicianId, {
    include: { model: Instrument },
    order: [[Instrument, 'type']],
  });
  res.json(payload);
});

// Get the details all musicians and associated instruments - DO NOT MODIFY
app.get('/musicians', async (req, res, next) => {
  const payload = await Musician.findAll({
    include: { model: Instrument },
    order: [['firstName'], ['lastName'], [Instrument, 'type']],
  });
  res.json(payload);
});

// Root route - DO NOT MODIFY
app.get('/', (req, res) => {
  res.json({
    message: 'API server is running',
  });
});

// Set port and listen for incoming requests - DO NOT MODIFY
if (require.main === module) {
  const port = 8000;
  app.listen(port, () =>
    console.log('Server for Associations is listening on port', port)
  );
} else {
  module.exports = app;
}

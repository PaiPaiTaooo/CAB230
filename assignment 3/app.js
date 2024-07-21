var createError = require('http-errors');
var express = require('express');
var bcrypt = require('bcrypt');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var jwt = require('jsonwebtoken');
var cors = require('cors');
const options = require('./knexfile.js');
const knex = require('knex')(options);
const swaggerUI = require('swagger-ui-express');
const swaggerDocument = require('./docs/openapi.json');

const authorisation = require('./middleware/authorisation.js');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const { error } = require('console');

const JWT_SECRET = `yXfLDAazhEuJUe6cbwjmGYk4rNSsvMH5nZ2p7WFPtBdCTgR3V8`;

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/docs', swaggerUI.serve);
app.get('/docs', swaggerUI.setup(swaggerDocument));
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use((req, res, next) => {
  req.db = knex
  next()
});

/**
 * 
 * @description CAB230 Assignment 3, 2024 Server-Side Web Application
 * 
 * @author Yongzhi ZHOU
 * @student_number n10044329
 * @date 2024-05-31
 * 
 */



/**
 * /countries  By GET
 *  
 * Returns a list of all countries that are associated with one or more volcanoes, ordered alphabetically.
 * @returns {List} a list of all countries ordered alphabetically.
 * 
 * @throws {Error} 400 - Invalid query parameters. Query parameters are not permitted.
 */
app.get('/countries', function (req, res, next) {
  req.db.raw("SELECT DISTINCT country FROM data ORDER BY country ASC")
    .then((rows) => {
      const countries = rows[0].map(row => row.country);
      res.status(200).json(countries);

    })
    .catch((err) => {
      res.status(400).json({ error: true, message: "Invalid query parameters. Query parameters are not permitted." });
    });
});



/**
 * /volcanoes     By GET
 * 
 * Returns a list of volcanoes that are associated with the queried country.
 * 
 * @param {country} req.query.country - country
 * @param {populatedWithin} req.query.populatedWithin - populatedWithin
 * @returns {Object} An array of objects containing id, name, country, region and subregion properties.
 * 
 * @throws {Error} 400 - Invalid query parameters
 * @throws {Error} 400 - Country is a required query parameter.
 */
app.get('/volcanoes', function (req, res, next) {
  const invalidParams = Object.keys(req.query).filter(param => {
    return param !== 'country' && param !== 'populatedWithin';
  });
  if (invalidParams.length > 0) {
    return res.status(400).json({ message: 'Invalid query parameters' });
  }
  const country = req.query.country;
  if (!req.query.country) {
    return res.status(400).json({ error: true, message: "Country is a required query parameter." });
  }
  var populatedWithin;
  if (!req.query.populatedWithin) {
    req.db.raw("SELECT id, name, country, region, subregion FROM data WHERE country = ?", [country])
      .then(rows => {
        res.status(200).json(rows[0]);
      })
      .catch(err => {
        res.status(400).json({ error: true, message: err.message });
      });
  } else {
    switch (req.query.populatedWithin) {
      case '5km':
        populatedWithin = 'population_5km'
        break
      case '10km':
        populatedWithin = 'population_10km'
        break
      case '30km':
        populatedWithin = 'population_30km'
        break
      case '100km':
        populatedWithin = 'population_100km'
        break
      default:
        return res.status(400).json({ error: true, message: "Country is a required query parameter." });
    }
    req.db.raw(`SELECT id, name, country, region, subregion FROM data WHERE country = ? AND ${populatedWithin} != 0`, [country])
      .then(rows => {
        console.log(rows.length);
        res.status(200).json(rows[0]);
      })
      .catch(err => {
        res.status(400).json({ error: true, message: err.message });
      });

  }

});



/**
 * /volcanoes/year/:year   By GET
 * 
 * Return to the list of all countries associated with one or more volcanoes according to B.C.E as well as C.E.
 * 
 * @param {year} year - req.params.year
 * @returns {Object} Return to the list of all countries associated with one or more volcanoes according to B.C.E as well as C.E.
 * 
 * @throws {Error} 400 - Error in MySQL query
 */
app.get('/volcanoes/year/:year', function (req, res, next) {
  const year = req.params.year;
  req.db.raw(`SELECT * FROM data WHERE last_eruption != 'Unknown' AND SUBSTRING_INDEX(last_eruption, ' ', -1) = ?`, [year])
    .then((rows) => {
      res.status(200).json(rows[0][0]);
    })
    .catch((err) => {
      res.status(400).json({ Error: true, Message: "Error in MySQL query" });
    });
})



/**
 * /volcano/:id       By GET
 * 
 * Returns an object containing data for the queried volcano.
 * 
 * @param {year} year - req.params.year
 * @returns {Object} 	Returns an object containing id, name, country, region, subregion, last eruption, summit, elevation, latitude and longitude data for the queried volcano.
 * 
 * @throws {Error} 400 - Invalid query parameters. Query parameters are not permitted.
 * @throws {Error} 404 - Volcano with ID:'+ req.params.id+' not found.
 */
app.get('/volcano/:id', authorisation, function (req, res, next) {

  if (!isNaN(req.params.id)) {
    if (req.userId) {
      req.db.raw("SELECT * FROM data WHERE id = ?", [req.params.id])
        .then((rows) => {
          console.log(rows[0].length)
          if (rows[0].length > 0) {
            const countries = rows[0][0];
            res.status(200).json(countries);
          } else {
            res.status(404).json({ error: true, message: 'Volcano with ID:' + req.params.id + ' not found.' });
            return;
          }
        })
    } else {

      req.db.raw("SELECT * FROM data WHERE id = ?", [req.params.id])
        .then((rows) => {
          if (rows[0].length > 0) {
            const { id, name, country, region, subregion, last_eruption, summit, elevation, latitude, longitude } = rows[0][0];

            res.status(200).json({ error: false, message: "Success", id, name, country, region, subregion, last_eruption, summit, elevation, latitude, longitude });
            return;
          } else {
            res.status(404).json({ error: true, message: 'Volcano with ID:' + req.params.id + ' not found.' });
            return;
          }
        })
    }
  } else {
    res.status(400).json({ success: true, message: 'Invalid query parameters. Query parameters are not permitted.' });
    return;
  }
});



/**
 * /user/:email/profile     By PUT
 * 
 * Updates a user's profile information.
 * 
 * @param {string} [req.params.emaill] - req.params.emaill
 * @param {string} [req.params.firstname] - req.params.firstname
 * @param {string} [req.params.lastname] - req.params.lastname
 * @param {string} [req.params.address] - req.params.address
 * @param {string} [req.params.dob] - req.params.dob
 * 
 * @returns {object} An object containing email, firstName, lastName, address (authenticated only) and dob (authenticated only) properties.
 * 
 * @throws {Error} 400 - Request body incomplete: firstName, lastName, dob and address are required.
 * @throws {Error} 401 - Unauthorized.
 * @throws {Error} 403 - Forbidden.
 */
app.put('/user/:email/profile', authorisation, function (req, res, next) {

  if (req.params.emaill === req.email) {
    return res.status(403).json({ error: true, message: "Forbidden" });
  }

  if (!req.body.firstname || !req.body.lastname || !req.body.dob || !req.body.address) {
    return res.status(400).json({ error: true, message: "Request body incomplete: firstName, lastName, dob and address are required." });
  }
  if (typeof req.body.dob !== 'string' || typeof req.body.firstname !== 'string' || typeof req.body.lastname !== 'string' || typeof req.body.address !== 'string') {
    return res.status(400).json({ error: true, message: 'Request body invalid: firstName, lastName and address must be strings only.' });
  }
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!req.body.dob.match(regex)) {
    return res.status(400).json({ error: true, message: 'Invalid input: dob must be a real date in format YYYY-MM-DD.' });
  }
  const dateOfBirth = new Date(req.body.dob);
  const now = new Date();
  if (dateOfBirth >= now) {
    return res.status(400).json({ message: 'Invalid date: Date of birth must be in the past.' });
  }

  if (req.userId) {
    req.db.raw(`UPDATE user
        set firstname = ?,
        lastName = ?,
        dob= ?,
        address=?
        WHERE email = ?`, [req.body.firstname, req.body.lastname, req.body.dob, req.body.address, req.params.email])
      .then(rows => {
        req.db.raw("SELECT firstname, lastname, dob, address FROM user WHERE email = ?", [req.params.email])
          .then((rows) => {
            if (rows.length > 0) {
              const firstRow = rows[0];
              console.log(firstRow)
              res.status(200).json(firstRow[0]);
              return;
            }
          })
      })
  } else {
    return res.status(401).json({ error: true, message: 'Unauthorized' });
  }
});



/**
 * 
 * /user/:email/profile   By GET
 * 
 * Returns an object containing a user's profile information. 
 * 
 * @param {string} email - req.params.email
 * 
 * @returns {Object} - An object containing email, firstName, lastName, address (authenticated only) and dob (authenticated only) properties.
 * 
 * @throws {Error} 404 - User not found
 */
app.get('/user/:email/profile', authorisation, function (req, res, next) {

  const email = req.params.email;

  if (req.userId) {
    req.db.raw("SELECT email,firstname,lastname,dob,address FROM user WHERE email = ?", [email])
      .then((rows) => {
        if (rows[0].length > 0) {
          let user = rows[0];
          if (!user && !user[0].firstname && !user[0].lastname) {
            return res.status(200).json(null);
          }
          res.status(200).json(user[0]);
          return;
        } else {
          res.status(404).json({ error: true, message: "User not found" });
          return;
        }
      })
  } else {
    req.db.raw("SELECT email, firstname, lastname FROM user WHERE email = ?", [email])
      .then((rows) => {
        if (rows[0].length > 0) {
          let user = rows[0];
          if (!user && !user[0].firstname && !user[0].lastname) {
            return res.status(200).json(null);
          }
          res.status(200).json(user[0]);
          return;
        } else {
          res.status(404).json({ error: true, message: "User not found" });
          return;
        }
      })
  }
});



/**
 * 
 * /user/register  By POST
 * 
 * Creates a new user account. A request body containing the user to be registered must be sent.
 * 
 * @param {String} email - req.body.email
 * @param {string} password - req.body.password
 * 
 * @returns {object} User successfully created
 * 
 * @throws {Error} 400 - Request body incomplete, both email and password are required
 * @throws {Error} 409 - Error message
 */
app.post('/user/register', function (req, res, next) {
  const InputEmailRegister = req.body.email;
  const InputpasswordRegister = req.body.password;
  if (!InputEmailRegister || !InputpasswordRegister) {
    res.status(400).json({
      error: true,
      message: 'Request body incomplete, both email and password are required'
    });
    return;
  }
  const queryUser = req.db.raw("SELECT * FROM user WHERE email = ?", [InputEmailRegister])
  queryUser.then((user) => {
    console.log(user[0])
    if (user[0].length > 0) {
      throw new Error("User already exists");
    }
    const saltRounds = 10;
    const password = bcrypt.hashSync(InputpasswordRegister, saltRounds);
    const email = InputEmailRegister;
    return req.db.from('user').insert({ email, password });
  })
    .then(() => {
      res.status(201).json({ success: true, message: 'User created' });
      return;
    })
    .catch(e => {
      res.status(409).json({ success: false, message: e.message });
    });
});


/**
 * 
 * /user/login  By POST
 * 
 * Log in to an existing user account. A request body containing the user credentials must be sent.
 * 
 * @param {string} email - req.body.email
 * @param {string} password - req.body.password
 * 
 * @returns {Object} - Log in successful
 * 
 * @throws {Error} 400 - Request body incomplete, both email and password are required
 * @throws {Error} 401 - Error message
 */
app.post('/user/login', function (req, res, next) {
  const InputEmailLogin = req.body.email;
  const InputpasswordLogin = req.body.password;
  if (!InputEmailLogin || !InputpasswordLogin) {
    res.status(400).json({
      error: true,
      message: 'Request body incomplete, both email and password are required',
    });
    return;
  }
  const queryUser = req.db.raw("SELECT * FROM user WHERE email = ?", [InputEmailLogin])
  queryUser
    .then((user) => {
      if (user[0].length === 0) {
        res.status(401).json({ success: false, message: "e.message" });

      } else {
        const users = user[0];
        return bcrypt.compare(InputpasswordLogin, users[0].password)
          .then((passwordMatch) => {
            if (passwordMatch) {
              const expires_in = 60 * 60 * 24;
              const exp = Math.floor(Date.now() / 1000) + expires_in;
              const token = jwt.sign({ InputEmailLogin, exp }, JWT_SECRET);
              res.status(200).json({
                "token": token,
                "token_type": 'Bearer',
                "expires_in": expires_in
              });

            } else {
              throw new Error('Incorrect email or password');
            }
          })
          .catch(e => {
            res.status(401).json({ success: true, message: e.message });
          });
      }
    })
});



/**
 * 
 * /me   By GET
 * 
 * QUT's Student personal information.
 * 
 * @returns {object} - name and studnet_number
 */
app.get('/me', function (req, res, next) {

  return res.status(200).json({ "name": "Yongzhi ZHOU", "student_number": "n10044329" });

});



/**
 * 
 * /star/like/:id    By POST
 * 
 * Users can like the volcano.
 * 
 * @param {int} id - req.params.id
 * @returns {Object} - 	An array of object star.
 * 
 * @throws {Error} 401 - Authorization header ('Bearer token') not found, Please Login
 */
app.post('/star/like/:id', authorisation, function (req, res, next) {

  const id = req.params.id;
  if (req.userId) {
    if (jwt.verify(req.headers.authorization.replace(/^Bearer /, ''), JWT_SECRET).InputEmailLogin != null) {
      req.db
        .raw(`UPDATE data
          SET star = JSON_ARRAY(star, ?)
          WHERE id = ?;`, [jwt.verify(req.headers.authorization.replace(/^Bearer /, ''), JWT_SECRET).InputEmailLogin, id])
        .then(() => {
          res.status(200).json({ Error: false, Message: "Success" });
          return;
        })
    } else {
      res.status(401).json({
        error: true,
        message: "Authorization header ('Bearer token') not found, Please Login",
      });
    }

  } else {
    res.status(401).json({
      error: true,
      message: "Authorization header ('Bearer token') not found, Please Login",
    });
  }
});



/**
 * 
 * /star/search     By GET
 * 
 * Return to Volcanoes Liked by Users.
 * 
 * @returns {object} 	Return to Volcanoes Liked by Users.
 * 
 * @throws {Error} 400 - Error in MySQL query
 */
app.get('/star/search', function (req, res, next) {
  req.db.raw("SELECT data.star FROM data")
    .then((rows) => {
      res.status(200).json(rows[0]);
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json({ Error: true, Message: "Error in MySQL query" });
    });
});



/**
 * /knex      By GET
 * 
 * Testing database
 * 
 * @returns {string} - Version Logged successfully
 */
app.get("/knex", function (req, res, next) {
  req.db
    .raw("SELECT DISTINCT country FROM data ORDER BY country ASC")
    .then((rows) => {
      res.status(200).json(rows);
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
  res.send("Version Logged successfully");
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

const axios = require("axios");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../database/dbConfig")

const { authenticate } = require("../auth/authenticate");
const secrets = require("../config/secrets");

function generateToken(user) {
  return jwt.sign(
    {
      userId: user.id
    },
    secrets.jwt,
    {
      expiresIn: "1h"
    }
  );
}

module.exports = server => {
  server.post("/api/register", register);
  server.post("/api/login", login);
  server.get("/api/jokes", authenticate, getJokes);
};

function register(req, res) {
  const creds = req.body;
  const hash = bcrypt.hashSync(creds.password, 10);
  creds.password = hash;
  db("users")
    .insert(creds)
    .then(ids => {
      res.status(201).json(ids);
    })
    .catch(err => res.status(400).json(err));
}

function login(req, res) {
	// implement user login
	const creds = req.body;
	db('users')
		.where({ username: creds.username })
		.first()
		.then((user) => {
			if (user && bcrypt.compareSync(creds.password, user.password)) {
				const token = generateToken(user);
				res.status(200).json({ message: 'Welcome!', token });
			} else {
				res.status(401).json({ message: 'NO NO NO' });
			}
		})
		.catch((err) => res.status(400).json(err));
}

function getJokes(req, res) {
  const requestOptions = {
    headers: { accept: "application/json" }
  };

  axios
    .get("https://icanhazdadjoke.com/search", requestOptions)
    .then(response => {
      res.status(200).json(response.data.results);
    })
    .catch(err => {
      res.status(500).json({ message: "Error Fetching Jokes", error: err });
    });
}

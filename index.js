const express = require('express');
const cookie = require('cookie-parser');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const faker = require('faker');
const app = express();

const savePeople = (res, people) => {
  res.cookie('people', JSON.stringify(people));
};

const makeUser = () => ({
  first: faker.name.firstName(),
  last: faker.name.lastName(),
  username: faker.internet.userName(),
});

const makeManyUsers = (num = 1) => {
  let users = [];

  for (let index = 0; index < num; index++) {
    users.push(Object.assign({}, makeUser(), { id: (index + 1).toString() }));
  }

  return users;
};

const getPeople = (req, res, reset = false) => {
  let peopleParsed;
  let { people = undefined } = req.cookies || {};

  if (reset || !people) {
    peopleParsed = makeManyUsers(3);

    savePeople(res, peopleParsed);
  } else {
    peopleParsed = JSON.parse(people);
  }

  return peopleParsed;
}

app.use(cookie());
app.use(bodyParser.json());

app.get('/people', (req, res) => {
  const peopleParsed = getPeople(req, res);

  res.send(peopleParsed);
});

app.get('/people/reset', (req, res) => {
  const peopleParsed = getPeople(req, res, true);

  res.send(peopleParsed);
});

app.get('/people/:id', (req, res) => {
  const { id } = req.params;
  const peopleParsed = getPeople(req, res);

  const person = peopleParsed.find((p) => p.id === id);

  if (!person) {
    res.status(404).send();
  }

  res.send(person);
});

app.post('/people', (req, res)  => {
  const { first, last, username } = req.body || {};
  const peopleParsed = getPeople(req, res);
  peopleParsed.push(Object.assign({}, {
    first, last, username
  }))

  res.send(peopleParsed);
});

app.put('/people/:id', (req, res) => {
  const { id } = req.params;
  const { first, last, username } = req.body || {};
  const peopleParsed = getPeople(req, res);

  const people = peopleParsed.map((p) =>
    p.id === id ?
    Object.assign({}, p, { first, last, username }) :
    p);
  const person = people.find((p) => p.id === id);

  savePeople(res, people);

  if (!person) {
    res.status(404).send();
  }

  res.send(person);
});

app.delete('/people/:id', (req, res) => {
  const { id } = req.params;
  const peopleParsed = getPeople(req, res);
  const people = peopleParsed.filter((p) => p.id !== id);
  savePeople(res, people);

  res.status(204).send();
});

const port = process.env.PORT || 3000;

app.listen(port, () => console.log('Example app listening on port 3000!'));

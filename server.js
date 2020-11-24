const path = require('path');
const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const redis = require('redis');

const PORT = process.env.PORT || 5000;
const app = express();

let redisClient;

if (process.env.REDIS_URL){
  redisClient = redis.createClient(process.env.REDIS_URL)
} else {
  redisClient = redis.createClient()
}

redisClient.on('connect', () => {
  console.log('Connected to redis');
});

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}));
app.use(methodOverride('_method'));

app.get('/', (req, res) => {
  res.render('searchusers');
});

app.get('/users/add', (req, res) => {
  res.render('adduser');
});

app.post('/users/search', (req, res) => {
  const id = req.body.id;

  redisClient.hgetall(id, (err, obj) => {
    if (!obj) {
      res.render('searchusers', {
        error: 'User does not exist',
      });
    } else {
      obj.id = id;
      res.render('details', {
        user: obj,
      });
    }
  });
});

app.post('/users/add', (req, res) => {
  const id = req.body.id;
  const first_name = req.body.first_name;
  const last_name = req.body.last_name;
  const phone = req.body.phone;
  const email = req.body.email;

  client.hmset(id, [
    'first_name', first_name,
    'last_name', last_name,
    'phone', phone,
    'email', email,
  ], (err, reply) => {
    if (err) {
      console.log(err);
    }

    console.log(reply);

    res.redirect('/');
  });
});

app.delete('/users/delete/:id', (req, res) => {
  client.del(req.params.id);
  res.redirect('/');
});

app.listen(PORT, () => console.log(`Server running on localhost:${PORT}`));

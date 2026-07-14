require('dotenv').config();

const dns = require('dns');
const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const routes = require('./routes/routes');
dns.setServers(['8.8.8.8', '8.8.4.4']);
mongoose.set('strictQuery', false);

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connecté à MongoDB Atlas'))
    .catch((error) => console.error('Erreur de connexion MongoDB :', error));

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use('/bootstrap', express.static('node_modules/bootstrap/dist'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 4 }
}));

app.use((req, res, next) => {
    res.locals.currentUrl = req.path;
    next();
});

app.use('/', routes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log('Application démarrée sur le port ' + PORT);
});

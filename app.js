'use strict'
const express = require('express')
const path = require('path')

let app = express();
app.set('view engine', 'ejs');
const port = 3000;
app.use(express.urlencoded({ extended: true }))

//helper
// const scoreLetter = require('./helpers/scoreLetter')
// app.locals.scoreLetter = scoreLetter
app.use(express.static(path.join(__dirname, 'public')));

//models
const {User, Album, Photo, Contributor} = require('./models')

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/user/register', (req, res) => {
    let err = {}
    res.render('user/register', { err });
});

app.post('/user/register', (req, res) => {
    User.create(req.body)
        .then(() => {
            res.redirect('/')
        }).catch((err) => {
            res.render('user/register', { err });
        });
});

app.get('/user/login', (req, res) => {
    let err = {}
    res.render('user/login', { err });
});

app.get('/album', (req, res) => {
    Album.findAll()
        .then(albums => {
            res.render('album/index', { albums });
        })
        .catch((err) => {
            res.render('err', { err });
        });
});


app.get('/album/add', (req, res) => {
    let err = {}
    res.render('album/add', { err });
});

app.post('/album/add', (req, res) => {
    Album.create(req.body)
        .then(() => {
            res.redirect('/album')
        }).catch((err) => {
            res.render('album/add', { err });
        });
});

app.get('/album/show/:id', (req, res) => {
    res.render('album/show');
});

app.get('/album/delete/:id', (req, res) => {
    Album.destroy({ where: { id: req.params.id } })
        .then(() => {
            res.redirect('/album')
        }).catch((err) => {
            res.render('err', { err });
        });
});



console.clear()
console.log(`Server start in port ${port}`);
app.listen(port)
'use strict'
const express = require('express')
const session = require('express-session')
const path = require('path')
const fs = require('fs')
const multer = require('multer')
const upload = multer({
    dest: "images/"
});
//models
const {User, Album, Photo, Contributor} = require('./models')

let app = express();
app.set('view engine', 'ejs');
const port = process.env.PORT || 4000;
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')));

//helper
const blob = require('./helper/blob')
app.locals.blob = blob

//login logic
//1.session
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false
    }
}))

//session checker ? 
// middleware function to check for logged-in users
const sessionChecker = (req, res, next) => {
    if (req.session.user) {
        res.redirect('/');
    } else {
        next();
    }
};

//need login
const needLogin = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/user/login');
    }
};

//global user
app.use(function (req, res, next) {
    app.locals.user = req.session.user;
    next();
});

app.get('/',  (req, res) => {
    res.render('index');
});

//2.routing buat register
app.route('/user/register')
    .get(sessionChecker, (req, res) => {
        res.render('user/register');
    })
    .post((req, res) => {
        User.create(req.body)
            .then((user) => {
                res.redirect('/user/login')
            }).catch((err) => {
                res.send(err)
            });
    });


//3. logic login 
app.route('/user/login')
    .get(sessionChecker, (req, res) => {
        res.render('user/login');
    })
    .post((req, res) => {
        const email = req.body.email
        const password = req.body.password;

        User.findOne({
            where: {
                email : email
            }
        }).then(function (user) {
            if (!user) {
                res.redirect('/user/login');
            } else if (!user.validPassword(password)) {
                res.redirect('/user/login');
            } else {
                req.session.user = {
                            UserId: user.id,
                            email: user.email
                        }
                        
                res.redirect('/', );
            }
        });
    });

//4.logic logout
// route for user logout
app.get('/user/logout', (req, res) => {
    if (req.session.user) {
        req.session.destroy(err => {
            if(err) {
                res.send(err)
            } else {
                res.redirect('/')
            } 
        })
    } else {
        res.redirect('/user/login');
    }
});


app.get('/album/public', needLogin, (req, res) => {
    Album.findPublicAlbum()
        .then(albums => {
            res.render('album/public', {
                albums
            });
        })
        .catch((err) => {
            res.send(err)
        });
});

app.get('/album/private', needLogin, (req, res) => {
    Album.findPrivateAlbum(req.session.user.UserId)
        .then(albums => {
            res.render('album/private', { albums });
        })
        .catch((err) => {
            res.send(err)
        });
});

app.get('/album/add', needLogin, (req, res) => {
    res.render('album/add');
});

app.post('/album/add', needLogin, (req, res) => {
    Album.create(req.body)
        .then((album) => {
            return Contributor.create({
                AlbumId : album.id,
                UserId : req.session.user.UserId
            })
        })
        .then((contributor) => {
            res.redirect('/')
        })
        .catch((err) => {
            res.send(err)
        });
});

app.get('/album/show/:id', needLogin, (req, res) => {
    Album.findPhotos(req.params.id)
        .then(contributors => {
            const album = contributors[0].Album
            let isContributor = false
            for (let i = 0; i < contributors.length; i++) {
                const con = contributors[i];
                if(con.UserId === req.session.user.UserId){
                    isContributor = true
                    break
                }                
            }

            res.render('album/show', {
                contributors, album, isContributor
            });
        })
        .catch((err) => {
            res.send(err)
        });
});

app.get('/album/edit/:id', needLogin, (req, res) => {
    const {
        id
    } = req.params

    Album.findByPk(id)
        .then((album) => {
            res.render('album/edit', {
                album
            });
        }).catch((err) => {
            res.send(err)
        });
});

app.post('/album/edit/:id', needLogin, (req, res) => {
    Album.update(req.body, {
            where: {
                id: req.params.id
            }
        })
        .then(() => {
            res.redirect('/')
        }).catch((err) => {
            res.send(err)
        });
});

app.get('/album/delete/:id', needLogin, (req, res) => {
    Album.destroy({ where: { id: req.params.id } })
        .then(() => {
            res.redirect('/')
        }).catch((err) => {
            res.send(err)
        });
});

//contributor
app.route('/contributor/:id/add')
    .get(needLogin, (req, res) => {
        res.render('album/contributor')
    })
    .post(needLogin, (req, res) => {
       User.findOne({
           where : {
               email : req.body.email
           }
       })
           .then(contributor => {
               if(contributor) {
                   return Contributor.create({
                       AlbumId: req.params.id,
                       UserId: contributor.id
                   })
               } else {
                   throw new Error('email not found')
               }
           })
           .then((contributor) => {
               res.redirect(`/album/show/${req.params.id}`)
           })
           .catch((err) => {
               res.send(err)
           });
    })


//photo
app.route('/photo/:id/add')
    .get(needLogin, (req, res) => {
        res.render('photo/add')
    })
    .post(needLogin, upload.single('path'), (req, res) => {
        let type = req.file.mimetype.split('/')[0];
        if (type !== 'image') {
            res.send("file is not an image!");
        } else {
            Contributor.findOne({
                where: {
                    UserId: req.session.user.UserId,
                    AlbumId: req.params.id
                }
            }).then(contributor => {
                if (contributor) {
                    console.log(contributor.id, '<===================')
                    return Photo.create({
                        ContributorId: contributor.id,
                        filename: fs.readFileSync(req.file.path),
                        createdAt: new Date(),
                        updatedAt: new Date()
                    })
                } else {
                    throw new Error('contributor not found')
                }
            }).then(() => {
                res.redirect(`/album/show/${req.params.id}`)
            }).catch((err) => {
                res.send(err)
            });
        }
    });

app.listen(port, function() {
    console.log(`server at ${port}`)
})
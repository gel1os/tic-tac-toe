var User = require('./models/user').User;

var user = new User({
   username: 'Denis',
   password: 'secret'
});

user.save(function (err, user, affected) {
    if (err) throw err;
    User.findOne({username: 'Oksana'}, function (err, user) {
        if (err) throw err;
        console.log(user)
    })
});
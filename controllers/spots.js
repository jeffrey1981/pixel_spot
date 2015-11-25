// Require resource's model(s).
var User = require("../models/user");
var rp = require("request-promise");
var env     = require('../config/environment');

//Show Results from Search Function (finding tags embedded in spots and returning those spots to view)
var index = function (req, res, next) {

  User.find({}, function(error, users){
    var tagSearch = 'cat'; //route our search parameters to here
    var spots = [];
    users.forEach(function(user) {
      spots = spots.concat(user.spots);
    });
    spots = spots.filter(function(spot) {
      var found = false;
      spot.tags.forEach(function(tag) {
        if (tag.tag_name === tagSearch) found = true;
      });
      return found;
    });
    res.render('spots/index', {spots: spots});
  });
};

//Show one spot
var show = function(req, res, next) {
  User.find({"spots._id":req.params.id}, function(err,users){
    var spot = users[0].spots.filter(function(s){
      return s._id == req.params.id;
    });
      res.render('spots/show', {spot: spot});
  }).select('spots');
};


var newSpot = function(req, res, next) {
  res.render('spots/new');
};

//Create a new spot
var create = function(req, res, next) {

  var title = req.body.title,
      description = req.body.description,
      flickrUrl = req.body.flickr_url,
      address = req.body.address,
      rating = 0,
      tags = req.body.tags;

  var self = res;

  userId="5654ddeaba55b7c38f23f9ef"

  User.findById(userId, function(err, user){ //user id is hardcoded to run in Postman, change to req.user.id later
    // if i have time later go back and refactor the regex to be something better cause this one is terrible
    var re = /https:\/\/www\.flickr\.com\/photos\/(.*)/i
    var res = re.exec(flickrUrl)[1].split('/')

    userId = res[0];
    photoId = res[1];
    // get farm, server, and secret from user, filter on photo id
    rp.get("https://api.flickr.com/services/rest/?method=flickr.photos.getInfo&api_key=" + env.FLICKR_KEY + "&photo_id=" + photoId + "&format=json&nojsoncallback=1")
    .then(function(data){
      data = JSON.parse(data);
      console.log(data)
      // generate url directly to image
      imageUrl = "https://farm" + data.photo.farm + ".staticflickr.com/" + data.photo.server + "/" + photoId + "_" + data.photo.secret + ".jpg";
      // get getlocation using flickr
      lat = data.photo.location.latitude;
      lng = data.photo.location.longitude;
      accuracy = data.photo.location.accuracy;

      return rp.get("http://api.geonames.org/findNearbyPostalCodesJSON?lat=" + lat + "&lng=" + lng + "&username=pixelspot")
    })
    .then(function(data){
      console.log(JSON.parse(data).postalCodes[0].postalCode)
      zipcode = JSON.parse(data).postalCodes[0].postalCode;

      user.spots.push({
        title: title,
        description: description,
        flickr_url: flickrUrl,
        image_url: imageUrl,
        address: address,
        lat: lat,
        lng: lng,
        zipcode: zipcode,
        rating: rating,
        tags: {tag_name: tags} //need logic on how to insert multiple tags data into tagSchema
      });
      user.save(function(err) {
        self.render('spots/new');
      });
    })
  });
};

//Delete a new spot
var destroy = function(req, res) {
  spotId = req.params.id;
  User.find({"spots._id":spotId}, function(err, user){ //user id is hardcoded to run in Postman, change to req.user.id later
    user[0].spots.id(spotId).remove();
    user[0].save(function(err){
      res.render('welcome/index');
    });
  });
};

module.exports = {
  index: index,
  show: show,
  create: create,
  new: newSpot,
  destroy: destroy
}




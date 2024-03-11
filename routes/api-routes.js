// nothing in timer
//
// new file that contains the api route information.
// moved from server.js file
//
var express = require("express");
var router = express.Router();
var db = require("../models");
// just the image Schema
//var imgModel = require("../model"); // this is now being removed from code below.
// require method to sort ages array by number
// var sortAges = require("sort-ids");

// var reorder = require("array-rearrange");
var path = require("path");

//following is more from images upload to mongodb process - step 5
//set up multer for storing uploaded files  -- not being used currently, code in server.js
var multer = require("multer");

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads")
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
});
var upload = multer({ storage: storage });
//and from Step 1 of uploading images to mongodb:
var fs = require('fs');

// initialize image variables
var imgHold = [];
var imagesHold = [];

module.exports = function(router) {

    // route for getting all the robots out of the db
    router.get("/getAllRobots", function(req, res) {
        db.Robot.find({})
            .then(function(dbAllRobots) {
                console.log("dbAllRobots from /getAllRobots; ", dbAllRobots);
                res.json(dbAllRobots);
            })
            .catch(function(err) {
                // or send the error
                res.json(err);
            });
    });
  
    // Route for getting a specific Robot by id, and then populate it with an array for Images
    router.get("/popRobot/:id", function(req, res) {
        // Using the id passed in the id parameter, and make a query that finds the matching one in the db
        db.Robot.findOne({ _id: req.params.id })
            // then populate the kitten schema associated with it
            .populate([
                {
                    path: "image",
                    model: "Image"
                }
            ])
            .then(function(dbRobot) {
            // If successful, find a User with the given id, send it back to the client
            console.log("api-routes.js, JUST POPULATE ROBOT, dbRobot: ", dbRobot);
            res.json(dbRobot);
            })
            .catch(function(err) {
            // but if an error occurred, send it to the client
            res.json(err);
            });
    });

    // Route for creating a new Robot
    router.get("/createRobot/", function(req, res) {
        console.log("from /createRobot, req.query: ", req.query);
        db.Robot.create(req.query)
            .then(function(dbRobot) {
                // View the added result in the console
            console.log("what was created in the robot db, dbRobot: ", dbRobot);
            res.json(dbRobot);
            })
            .catch(function(err) {
            // If an error occurred, send it to the client
            return res.json(err);
            });
    });

    //This is Step 8 from notes on uploading the images chosen by the user
    //It's now being called from robot.js, not directly from html form
    // 
    router.post("/createImageRobot/:id", upload.single("robotImageInput"), (req, res, next) => {
        console.log("from api-routes step 8, req.file.filename: ", req.file.filename);
        var obj = {
            title: req.body.title,
            desc: req.body.desc,
            img: {
                data: fs.readFileSync(path.join(__dirname + "/../uploads/" + req.file.filename)),
                contentType: "image/jpeg"
            }
        }
        db.Image.create(obj)
            .then(function(dbImage) {
                console.log("after .create Image - dbImage: ", dbImage);
                //pushing the new kitten image into the document kitten array
                return db.Robot.findOneAndUpdate(
                    { _id: req.params.id },
                    { $push: { image: dbImage._id } },
                    { new: true }
                );
            })
            .then(function(dbRobot) {
                //send back the correct robot with the new data in the image array
                res.json(dbRobot);

            })
            .catch(function(err) {
                //If an error occurred, send back
                res.json(err);
            });
    });

    //This route gets one robot document from robot collection
    router.get("/getARobot/:id", function(req, res) {
        console.log("inside api-routes: req.params: ", req.params);
        // need to find the correct robot, and retrieve it's data, 
        db.Robot.find({ _id: req.params.id })
            .then(function(dbARobot) {
                res.json(dbARobot);
                console.log("from route /getARobot:id, dbARobot: ", dbARobot);
            })
            .catch(function(err) {
            // However, if an error occurred, send it to the client
            res.json(err);
            });
    });

    // the GET route for getting all the images from the db
    // this is old one with .exec
    // router.get("/getImages/:id" , (req, res) => {
    //     console.log("in /getImages/, req.params.id: ", req.params.id );
    //     db.Image.find({ _id: req.params.id}) //.catch, below, isn't correct. it used to be .exec
    //     .exec((error, records) => { // db is the database schema model. 
    //         console.log("this is records from api route /getImages/: ", records);
    //         //for loop to create array of robot images from records from db
    //         //study: I'm only getting one record, instead of all of them,
    //         // so this loop doesn't really need to be here,
    //         // it's only going through once, and client side has the .forEach
    //         // to go through the full array. Leaving it for now...
    //         for (i=0; i<records.length; i++) {
    //             imgHold[i] = Buffer.from(records[i].img.data, "base64");
    //             imagesHold.push(imgHold[i]);
    //         }
    //         console.log("inside /getImages/, records[0]._id: " + records[0]._id);
    //         const formattedImages = imagesHold.map(buffer => {
    //             return `<img data-id=` + records[0]._id + ` class="theImages" title="Click to Enlarge" src="data:image/jpeg;base64,${buffer.toString("base64")}"/>`
    //         }).join("");
            
    //         res.send(formattedImages)  //this should be going back to user.js
    //         //empty out arrays
    //         imgHold = [];
    //         imagesHold = [];
    //     })
    // });
    
    // duplicate of /gitImages/ above to tinker with.
    // the GET route for getting all the images from the db
    router.get("/getImages/:id" , (req, res) => {
        console.log("in /getImages/, req.params.id: ", req.params.id );
            db.Image.find({ _id: req.params.id})
            .then((records) => {
                // console.log("this is records from api route /getImages/: ", records);
                //for loop to create array of robot images from records from db
                //study: I'm only getting one record, instead of all of them, so this loop doesn't really need to be here,
                // it's only going through once, and client side has the .forEach to go through the full array. Leaving it for now...
                for (i=0; i<records.length; i++) {
                    imgHold[i] = Buffer.from(records[i].img.data, "base64");
                    imagesHold.push(imgHold[i]);
                }
                console.log("inside /getImages/, records[0]._id: " + records[0]._id);
                console.log("inside /getImages/, records[0].title: " + records[0].title);
                const formattedImages = imagesHold.map(buffer => {
                    //return `<img data-title=` + records[0].title + ` data-id=` + records[0]._id + ` class="theImages" title=` + records[0].title + ` src="data:image/jpeg;base64,${buffer.toString("base64")}"/>`
                    return `<div class="robotTitles"><h3>` + records[0].title + `</h3><br><img data-id=` + records[0]._id + ` id="robotImg" class="theImages" title="` + records[0].title + `" alt="robotpic" src="data:image/jpeg;base64,${buffer.toString("base64")}"/></div>`
                });
                res.send(formattedImages)  //this should be going back to robots.js
                //empty out arrays
                imgHold = [];
                imagesHold = [];
            })
                .catch(error => {
                    console.log("Iam getting an error", error);
                });
        
    });

};
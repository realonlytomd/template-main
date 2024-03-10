var currentRobotId;
var robots;
var dataGetImages = [];
var allRobotNameswithImages = [];
var allRobotImageIds = [];
var allImagesOfRobots = [];
var allImageDataId = [];
var sortedAllImageDataId = [];

jQuery.noConflict();
jQuery(document).ready(function( $ ){
    // initialize vari;ables
    var currentRobotId = "";

    // Need to add the inital load code that shows the user the robot's currently in the db.
    getAllData();

    //Code to get all the robots in the db listed 
    // then go through each robot, and creat in the currentRobots div a name and 1st image of that robot.
    // Make that pic clickable to bring up other biography and other pictures down below.
    // This should be visible to all users.
    function getAllData() {
        //empty out the current div
        $("#currentRobots").empty();
        //get the list of robots from the db
        $.getJSON("/getAllRobots")
            .done ( function(robots) {
                console.log("robots array, from getAllData function", robots);
                for (i=0; i<robots.length; i++) {
                    // console.log("in loop, i= " + i);
                    // console.log("in loop, robots[i].name: " + robots[i].name);
                    // console.log("in loop, robots[i].bio: " + robots[i].bio);
                    // console.log("in loop, robots[i].image[0]: " + robots[i].image[0]);
                    // var showSpan = $("<span>");
                    // showSpan.attr("data-name", robots[i].name);
                    // showSpan.attr("data-bio", robots[i].bio);
                    allRobotNameswithImages.push(robots[i].name);
                    //$("#currentRobots").append("<h4>" + robots[i].name + "</h4>");
                    //put all the robot names in an array?????it alreay is
                    //now get just the FIRST image for each robot
                    if (typeof robots[i].image[0] === "undefined") { //need to remove the names without an image
                        $("#currentRobots").append ("<h4>" + robots[i].name + "</h4><h5>No Image</h5><br>");
                        //remove THIS robot from allRobotNameswithImages array
                        allRobotNameswithImages.pop();
                        //console.log("after .pop(), allRobotNameswithImages: ", allRobotNameswithImages);
                    } else {
                        allRobotImageIds.push(robots[i].image[0]);
                        //console.log("inside else, i: " + i);
                        $.ajax({
                        method: "GET",
                        url: "/getImages/" + robots[i].image[0]
                        })
                        .then(function(dataGetImages) { // dataGetImages should be formattedImages from api-routes.js
                            // attach this specific image to the name span created above, and join them.
                            // console.log("inside ajax call, i: " + i);
                            // console.log("inside ajax call, allRobotNameswithImages: ", allRobotNameswithImages);
                            // console.log("after getAllRobots, then /getImages, the new dataGetImages: ", dataGetImages);
                            allImagesOfRobots.push(dataGetImages);
                        });    
                    }
                       
                }
                console.log("outside loop, allRobotNameswithImages: ", allRobotNameswithImages);
                console.log("outside loop, allRobotImageIds: ", allRobotImageIds);
                console.log("outside of loop, allImagesOfRobots: ", allImagesOfRobots);
            });            
    }

    // when button to show all Robots is clicked
    $(document).on("click", "#revealAllRobots", function(event) {
        event.preventDefault();
        showAllRobots();
    });

    // show completed robots
    function showAllRobots() {
        console.log("inside function showAllRobots()");
        console.log("allRobotNameswithImages: ", allRobotNameswithImages); // array of robot names, correct order
        console.log("allRobotImageIds: ", allRobotImageIds); // array of robot image data-ids, same correct order as names
        console.log("allImagesOfRobots: ", allImagesOfRobots);// array of robot image objects in incorrect order from db
        // write the current list of robot names to the DOM followed by the INCORRECT order of images
        for (i = 0; i < allRobotNameswithImages.length; i++) {
            $("#currentRobots").append("<h4>" + 
            allRobotNameswithImages[i] + "</h4>" +
            allImagesOfRobots[i] + "<br>");
        }
        //now, make an array of data-ids from this INCORRECT order of images
        allImageDataId = $("img#robotImg").map(function () {
            return $(this).attr("data-id");
        }).get();
        
        console.log ("BEFORE reorder, allImageDataId: ", allImageDataId);// this is still the incorrect order
        sortedAllImageDataId = allImageDataId;
        //now, sort correctAllImageDataId array so that it's order matches the order of allRobotImageIds array
        // write to DOM
        // adding the .slice() was supposed to preserve the original array, but didn't seem to work
        sortedAllImageDataId.sort((prev, next) => {
        return  allRobotImageIds.indexOf(prev) - allRobotImageIds.indexOf(next);
        }) // ugh, this is actually already known from above where I get the image id's directly
        // from the original robot objects,  - because they SHOULD match the robot name order.
        // this does the same thing...
        //order = Object.fromEntries(allRobotImageIds.map((value, index) => [value, index + 1]));
        //allImageDataId.sort((a, b) => order[a] - order[b]);
        
        console.log ("AFTER reorder - sortedAllImageDataId: ", sortedAllImageDataId);
        
    }

    // this function happens when Mark clicks the submit a new robot button
    $(document).on("click", "#submitNewRobot", function(event) {
        event.preventDefault();
        console.log("name: ", $("#robotNameInput").val().trim());
        console.log("bio: ", $("#robotBioInput").val().trim());
        $.ajax({
            method: "GET",
            url: "/createRobot/",
            data: {
                name: $("#robotNameInput").val().trim(),
                bio: $("#robotBioInput").val().trim()
            }
        })
        .then(function(dataRobot) {
            console.log("Creation of new robot (dataRobot) in robot.js: ", dataRobot);
            // save id of current (last created) robot
            console.log("currentRobotId: " + dataRobot._id);
            currentRobotId = dataRobot._id;
            // empty out the input fields
            $("#robotNameInput").val("");
            $("#robotBioInput").val("");
            // Hide the current modal
            $("#newRobotModal").modal("hide");
            //Now add a button to add the main image for the new robot
            $("#mainImageButtonSpace").append("<button type='button' data-toggle='modal' " +
                "data-target='#newRobotImageModal' id='createImageRobot'" + 
                ">Add Main Image for Robot</button>");
        });
    });

    // this function is after Mark clicks the add image button. A modal appears for him to
    // enter the title, description and browse for an image,
    // but first the individual robot must be found and populated to accept an array of images
    $(document).on("click", "#createImageRobot", function(event) {
    event.preventDefault();
    // make an ajax call for the robot to be populated
        $.ajax({
            method: "GET",
            url: "/popRobot/" + currentRobotId
            })
            .then(function(dataAddImage) {
            // this sets up the fields populated to receive robot name and image data
            console.log("in robot.js, dataAddImage, after Robot is populated: ", dataAddImage);
            });
    });

    // this function enters the robot image into the correct robot in the db
    $(document).on("click", "#submitNewRobotImage", function(event) {
        event.preventDefault();
        //get form from html
        var imageform = $("#RobotImageInputForm")[0];
        // Create an FormData object called imageData
        var imageData = new FormData(imageform);
        $.ajax({
          type: "POST",
          enctype: "multipart/form-data",
          url: "/createImageRobot/" + currentRobotId,
          data: imageData,
          processData: false,
          contentType: false
        })
        .then(function(robotdb) {
            console.log("after .then for submitting an image, robotdb: ", robotdb);
            // robotdb here is the robot document with the new image data
            // then hide this modal
            $("#title").val("");
            $("#desc").val("");
            $("#robotImageInput").val("");
            $("#newRobotImageModal").modal("hide");
            //reload the current robot div showing the changes
            $("#imageDiv").empty();
            writeRobotDom();
          });
    });

        // function called after a particular robot button is clicked - gets and displays robot data
    function writeRobotDom() {
        console.log("currentRobotId inside writeRobotdom: " + currentRobotId);
        $("#specificRobot").empty(); // empties out the div containing robot data and images. 
        // gets the array of metrics associated with the current kitten
        $.getJSON("/getARobot/" + currentRobotId, function(currob) {
            console.log("WHAT'S IN HERE currob[0]: ", currob[0]);
            console.log("more specific, currob[0].name is: ", currob[0].name);
            // strings with multiple words are not being assigned.
            // try to to write the h5 element with data attributes instead.
            var showSpan = $("<span>");
            showSpan.attr("id", "editThisRobot");
            showSpan.css("color","red");
            showSpan.attr("data-name", currob[0].name);
            showSpan.attr("data-breed", currob[0].bio);
            showSpan.text("HERE");
            //this works!
            // appends the name of the current robot and other constants
            $("#specificRobot").append("<p class='keepInline'>(CLICK</p>");
            $("#specificRobot").append(showSpan);
            $("#specificRobot").append("<p class='keepInline'> to Edit or Delete " +
            currob[0].name + ")</p><h4>Robot: " + 
            currob[0].name + "<br>Bio: " +
            currob[0].bio + "</h4>");
            //
            // Add new images Button - to add more picture of the robot
            $("#specificRobot").append("<button type='button' data-toggle='modal' " +
            "data-target='#newRobotImageModal' id='createImageRobot'" + 
            ">Add Image for Robot</button>");
            // So HERE is where the div of the current robot's images will go.
            $("#specificRobot").append("<div id='imageDiv'></div>");
            //go through the array of images for this kitten
            currob[0].image.forEach(innerImageForEach);

            function innerImageForEach(innerItem, innerIndex) { //innerItem here is id of images
                console.log("THIS INNER image, innerIndex and innerItem: " + innerIndex + " and " + innerItem);
                $.ajax({
                method: "GET",
                url: "/getImages/" + innerItem
                })
                .then(function(dataGetImages) { // dataGetImages should be formattedImages from api-routes.js
                    // this is the current image data
                    // console.log("in robot.js, after each get images dataGetImages: ", dataGetImages);
                    // then dataGetImages should be something I can send to index.html through jQuery
                    $("#imageDiv").append(dataGetImages);
                    //console.log("currentRobotId: " + currentRobotId);
                });
            }
        });
    }
});

var currentRobotId;
var robots;
var dataGetImages = [];
var allRobotNameswithImages = [];
var allRobotImageIds = [];
var allImagesOfRobots = [];
var allImageDataId = [];
var sortedAllImageDataId = [];
var wrongOrderIds = [];
var item = "";
var index = 0;
var secondItem = "";
var secondIndex = 0;

jQuery.noConflict();
jQuery(document).ready(function( $ ){
    // initialize variables
    var currentRobotId = "";

    // Need to add the inital load code that shows the user the robot's currently in the db.
    getAllData();

    //Code to get all the robots in the db listed 
    // then go through each robot, and create in the currentRobots div a name and 1st image of that robot.
    // Make that pic clickable to bring up other biography and other pictures down below.
    // This should be visible to all users.
    function getAllData() {
        //empty out the current div
        $("#currentRobots").empty();
        // test to see what an array looks like:
        arr2.sort((prev, next) => {
            return  arr1.indexOf(prev) - arr1.indexOf(next);
        })
        let firstArr = ["un","deux","trois"];
        let secondArr = ["deux", "trois", "un"];
        let thirdArr = ["zwei", "drei", "eins"];
        let nested = [firstArr, secondArr, thirdArr];
        
        //let nested = [[2, 3, 1],["deux", "trois", "un"],["zwei", "drei", "eins"]];
        console.log("nested: ", nested);
          let srcArr;
          nested = nested.map((arr, i) => {
            if (i === 0) { // the reference
              srcArr = arr.slice(0); // take a copy of first array
              console.log("srcArr: ", srcArr);
              arr.sort((a, b) => a - b); // sort the nested verions of first array
              console.log("arr: ", arr);
              return arr;
            }
            return arr.map((item, i) => arr[
              srcArr.indexOf(nested[0][i]) // return in the order of the reference 
            ]);
          })
          console.log("nested: ", nested);
          let lastArr;
          lastArr = nested.slice(2);
          console.log("lastArr: ", lastArr);
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
                        $("#currentRobots").append ("<div class=robotTitles><h4>" + robots[i].name + "</h4><br><h5 class=noImage>No Image</h5></div>");
                        //remove THIS robot from allRobotNameswithImages array
                        allRobotNameswithImages.pop();
                        //console.log("after .pop(), allRobotNameswithImages: ", allRobotNameswithImages);
                    } else {
                        console.log("robots[" + i + "].image[0]: " + robots[i].image[0]);
                        allRobotImageIds.push(robots[i].image[0]);
                        $.ajax({
                        method: "GET",
                        url: "/getImages/" + robots[i].image[0]
                        })
                        .then(function(dataGetImages) { // dataGetImages should be formattedImages from api-routes.js
                            // attach this specific image to the name span created above, and join them.
                            // console.log("after getAllRobots, then /getImages, the new dataGetImages: ", dataGetImages);
                            allImagesOfRobots.push(dataGetImages);
                            const myArray = dataGetImages[0].split("data-id=", 6);
                            const myDataId = myArray[1].split(" ", 1);
                            console.log("myDataId: ", myDataId);
                            // this was to "flatten" the array to become just an array of strings instead of array of array
                            wrongOrderIds.push.apply(wrongOrderIds, myDataId);
                            
                            
                            //$("#currentRobots").append(dataGetImages);
                        });    
                    }
                }
                console.log("outside loop, allRobotNameswithImages: ", allRobotNameswithImages);
                console.log("outside of loop, allImagesOfRobots(dataGetImages): ", allImagesOfRobots);
                console.log("outside loop, allRobotImageIds: ", allRobotImageIds);
                console.log("wrongOrderIds: ", wrongOrderIds);
                // call the showAllRobots() funtion to run for loop out of this function
                //showAllRobots();
                //now do a nested loop to reorder dataGetImages to match the original order
                // of the names and id's of the Robots, allRobotNameswithImages and allRobotImageIds 
                // for (let j = 0; j < allRobotImageIds.length; j++) {
                //     for (let k = 0; k < wrongOrderIds.length; k++) {
                //         if (allRobotImageIds[j] = wrongOrderIds[k]) {
                //             console.log("condition satisfied, allRobotImagesIds["+ j + "] = wrongOrderIds[" + k + "]");
                //             $("#currentRobots").append("<div class='robotTitles'><h3>" + allRobotNameswithImages[j] + "</h3><br>" + dataGetImages[k]);
                //             break;
                //         }
                //     }
                // }

            });            
    }

    // when button to show all Robots is clicked.  already removed button from html
    $(document).on("click", "#revealRobots", function(event) {
        event.preventDefault();
        showAllRobots();
    });

    // show completed robots
    function showAllRobots() {
        
        console.log("inside function showAllRobots()");
        console.log("inside function showAllRobots(), allRobotNameswithImages: ", allRobotNameswithImages); // array of robot names, correct order
        console.log("inside function showAllRobots(), allRobotImageIds: ", allRobotImageIds); // array of robot image data-ids, same correct order as names
        console.log("typeof allRobotImageIds: ", typeof allRobotImageIds);
        console.log("inside function showAllRobots(), allImagesOfRobots: ", allImagesOfRobots);// array of robot image objects in incorrect order from db
        console.log("inside function showAllRobots(), wrongOrderIds: ", wrongOrderIds);
        console.log("typeof wrongOrderIds: ", typeof wrongOrderIds);
        // using for loops
        // for (var j = 0; j < allRobotImageIds.length; j++) {
        //     for (var k = 0; k < wrongOrderIds.length; k++) {
        //         if (allRobotImageIds[j] = wrongOrderIds[k]) {
        //             console.log("condition satisfied, allRobotImagesIds["+ j + "] = wrongOrderIds[" + k + "]");
        //             $("#currentRobots").append("<div class='robotTitles'><h3>" + allRobotNameswithImages[j] + "</h3><br>" + allImagesOfRobots[k] + "</div>");
        //             // remove these elements from the arrays
        //             allRobotImageIds.splice(j, 1);
        //             wrongOrderIds.splice(k, 1);
                    
        //         }
        //     }
        // }
        // try using .forEach


        // then using .map
        const newArr = allRobotImageIds.map(myFunction); //array.map(function(currentValue, index, arr), thisValue)
        function myFunction(item, index) {
            // console.log("inside myFunction, item: " + item);
            // console.log("inside myFunction, index: " + index);
            // console.log("allRobotImageIds[" + index + "]: " + item);
            // console.log("allRobotImageIds[" + index + "]: " + allRobotImageIds[index]);

            const secondArr = wrongOrderIds.map(anotherFunction);
            function anotherFunction(secondItem, secondIndex) {
                // console.log("inside anotherFuntion, secondItem: " + secondItem);
                // console.log("inside anotherFunction, secondIndex: " + secondIndex);
                // console.log("wrongOrderIds[" + secondIndex + "]: " + secondItem);
                // console.log("wrongOrderIds[" + secondIndex + "]: " + wrongOrderIds[secondIndex]);
                if ( item = secondItem ) {
                    console.log("condition satisfied, allRobotImagesIds["+ index + "] = wrongOrderIds[" + secondIndex + "]");
                    console.log("condition satisfied, does item = secondItem? item = "+ item + "  secondItem = " + secondItem);
                    $("#currentRobots").append("<div class='robotTitles'><h3>" + allRobotNameswithImages[index] + "</h3><br>" + allImagesOfRobots[secondIndex] + "</div>");
                    // allRobotImageIds.splice(index, 1);
                    // wrongOrderIds.splice(secondIndex, 1);
                }
            }
        }

        //saving from a failed attempt, but liked finding the data-id from img#robotImg
        //now, make an array of data-ids from this INCORRECT order of images
        // allImageDataId = $("img#robotImg").map(function () {
        //     return $(this).attr("data-id");
        // }).get();
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

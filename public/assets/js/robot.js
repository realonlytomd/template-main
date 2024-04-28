jQuery.noConflict();
jQuery(document).ready(function( $ ){
    // initialize variables
    var currentRobotId;
    var robots = [];
    var allRobotIds = [];
    var allRobotNameswithImages = [];
    var numberOfImages = [];
    var allRobotBios = [];
    var allRobotImageIds = [];
    var allImagesOfRobots = [];
    var wrongOrderIds = [];
    var markLoggedIn = false;

    // variables for editing data
    var thisImageId; //data-id of image
    // Need to add the inital load code that shows the user the robot's currently in the db.
    getAllData();
    //Code to get all the robots in the db listed 
    // then go through each robot, and create in the currentRobots div a name and 1st image of that robot.
    // Make that pic clickable to bring up other biography and other pictures down below.
    // This should be visible to all users.
    function getAllData() {
        //empty out the current div
        $("#logoutButton").hide();
        $("button#createRobot").hide();
        $("#revealRobots").show();
        $("#currentRobots").empty();
        $("#currentRobots").hide();
        $("#robotHeader").hide();
        $("#editRobotName").empty();
        $("#specificRobot").empty();
        $("#additionalImages").empty();
        $("#largeAddtlImages").empty();
        console.log("markLoggedIn: " + markLoggedIn);
        if (markLoggedIn === true) {
            $("#logoutButton").show();
            $("button#createRobot").show();
        }
        // empty out robots from the db
        robots = [];
        //get the list of robots from the db
        $.getJSON("/getAllRobots", function(robots) {
            console.log("robots array, from getAllData function", robots);
            for (i=0; i<robots.length; i++) {
                allRobotIds.push (robots[i]._id);
                allRobotNameswithImages.push(robots[i].name);
                allRobotBios.push(robots[i].bio);
                //this is a list of all the robots without a main image
                if (typeof robots[i].image[0] === "undefined") { //need to remove the names without an image
                    // The following should be written to the DOM ONLY when Mark is in edit mode
                    $("#currentRobots").append("<div class=robotTitles><h4>" + robots[i].name + 
                    "</h4><br><h5 class=noImage data-robotid=" + robots[i]._id + " data-toggle='modal' data-target='#newRobotImageModal'>No Image</h5></div>");
                    //remove THIS robot from allRobotNameswithImages array
                    allRobotIds.pop();
                    allRobotNameswithImages.pop();
                    allRobotBios.pop();
                    //console.log("after .pop(), allRobotNameswithImages: ", allRobotNameswithImages);
                } else {
                    //console.log("robots[" + i + "].image[0]: " + robots[i].image[0]);
                    allRobotImageIds.push(robots[i].image[0]); // array of image ids from 1st robot db
                    //console.log("robots[" + i + "].image.length: ", robots[i].image.length);
                    //make an array of the number of images for each robot
                    numberOfImages.push(robots[i].image.length);
                    $.ajax({
                    method: "GET",
                    url: "/getImages/" + robots[i].image[0]
                    })
                    .then(function(dataGetImages) { // dataGetImages is formatted Images from api-routes.js
                        //console.log("after getAllRobots, then /getImages, the new dataGetImages: ", dataGetImages);
                        allImagesOfRobots.push(dataGetImages);
                        const myArray = dataGetImages[0].split("data-id=", 6);
                        const myDataId = myArray[1].split(" ", 1);
                        //console.log("myDataId: ", myDataId);
                        // this was to "flatten" the array to become just an array of strings instead of array of array
                        wrongOrderIds.push.apply(wrongOrderIds, myDataId); //array of image ids from 2nd robot db (differing order)
                    });
                }
            }
        });
    }
    //function for Mark to log in to see editable sections
    $(document).on("click", "#markserafin", function(event) {
        event.preventDefault();
        console.log("Mark has clicked log in!");
        $("#loginMark").modal("show");
    });

    // after Mark enters his password and clicks submit
    $(document).on("click", "#submitPassword", function(event) {
        event.preventDefault();
        var password = $("#enterPass").val();
        console.log("password: " + password);
        if (password === "marshaandrob") {
            console.log("password is correct!");
            markLoggedIn = true;
            console.log("markLoggedIn: " + markLoggedIn);
            $("#enterPass").val("");
            $("#loginMark").modal("hide");
            // now enter functions that are called to show Mark what he can edit.
            $("#logoutButton").show();
            $("button#createRobot").show();
        } else {
            console.log("wrong password!");
            alert("wrong password!");
            $("#enterPass").val("");
        }
    });

    // when Mark clicks the Logout Button
    $(document).on("click", "#logoutButton", function(event) {
        event.preventDefault();
        markLoggedIn = false;
        console.log("markLoggedIn: " + markLoggedIn);
        $("#logoutButton").hide();
        $("button#createRobot").hide();
        window.location.replace("/");
    });

    // function to show the robots from the databas, sorted to match names with images
    $(document).on("click", "#revealRobots", function(event) {
        event.preventDefault();
        $("#currentRobots").show();
        $("#robotHeader").show();
        $("#revealRobots").hide();
        $("#currentRobots").empty();
        //$("h2#editRobotName").empty();
        //$("#exploreRobots").empty();
        $("#specificRobot").empty();
        $("#additionalImages").empty();
        $("#largeAddtlImages").empty();
        let myNested = [allRobotImageIds, wrongOrderIds, allImagesOfRobots];
        //console.log("myNested: ", myNested);
        let mySrcArr;
        let myNewNested;
        myNewNested = myNested.map((myArr, myI) => {
            if (myI === 0) {
                //console.log("Inside myI ===0, myArr: ", myArr);
                return myArr;
            } else if (myI === 1) { // the reference, this just needs to be done once!
                    mySrcArr = myArr.slice(0); // take a copy of the second array
                    //console.log("inside if, mySrcArr: ", mySrcArr);
                    myArr.sort((prev, next) => {
                        return allRobotImageIds.indexOf(prev) - allRobotImageIds.indexOf(next);
                    });
            }
                // console.log("again, outside of if: myArr: ", myArr);
                // console.log("HEY!!! outside of if, mySrcArr: ", mySrcArr);
                // console.log("outside of if: myNested[1][0]: " + myNested[1][0]);
                if (myI === 1) {
                    return myArr;
                }
                //console.log("this should be myI === 2, myArr: ", myArr);
                return myArr.map((myItem, myI) => myArr[
                    mySrcArr.indexOf(myNested[1][myI]) // return in the order of the reference
                ]);
        });
        // console.log("myNewNested: ", myNewNested);
        // console.log("myNewNested[2].length = " + myNewNested[2].length); //the third array (index 2) is the dataGetIMages 
                // to here
                // so, myNewNested 3rd array is the images of the robots in the same order of the names of robots
        for (let i=0; i<myNewNested[2].length; i++) {
            $("#currentRobots").append ("<div class=robotTitles data-robotid='" + allRobotIds[i] + "' data-name='" + allRobotNameswithImages[i] + 
            "' data-bio='" + allRobotBios[i] + "' data-noofimages='" + numberOfImages[i] + "'><h4>" + allRobotNameswithImages[i] + 
            "</h4><br>" + myNewNested[2][i] + "</div>");  //<a href="#about" target="_self">About</a>
        }
    });

    //clicking on the picture of all the robots displayed brings up a large pic and info about that robot
    // adding the display of additional pictures
    $(document).on("click", "#robotImg", function(event) {
        event.preventDefault();
        console.log("I clicked on a specific robot");
        $("#specificRobot").empty();
        $("#editRobotName").empty();
        $("#additionalImages").empty();
        $("#largeAddtlImages").empty();

        // retrieve the id of the robot whose image was clicked. Used in edits of name and bio.
        thisRobotId = $(this).parent().data("robotid");
        console.log("thisRobotId: ", thisRobotId);

        // retrieve the id of the clicked image from the db. Used in any of the edits of title and desc.
        thisImageId = $(this).attr("data-id");
        console.log("thisImageId: ", thisImageId);

        //retrieve the name of the robot and write to DOM
        var name = $(this).parent().data("name");
        console.log("name: ", name);
        $("#editRobotName").text(name);
        $("#editRobotName").attr("data-id", thisRobotId);
        
        // put the biography here
        var specificRobotBio = $("<h4>");
        specificRobotBio.attr("data-id", thisRobotId);
        specificRobotBio.attr("id", "editRobotBio");
        specificRobotBio.addClass("lightText");
        var bio = $(this).parent().data("bio");
        console.log("bio: ", bio);
        specificRobotBio.text(bio);
        $("#specificRobot").append(specificRobotBio);

        // loads the main image, as wide as the screen
        // currently adding the number of images
        var dataNoOfImages = $(this).parent().data("noofimages");
        console.log("dataNoOfImages: " + dataNoOfImages);
        //setting the currentRobotId to thisRobotId for retrieving additional pics later
        currentRobotId = thisRobotId;
        console.log("id of thisRobotId: " + thisRobotId);
        console.log("id of currentRobotId: ", currentRobotId);
        var imgSrc = $(this).attr("src");
        var bigImage = $("<img>");
        bigImage.addClass("bigRobotImage");
        bigImage.attr("data-robotid", currentRobotId);
        bigImage.attr("src", imgSrc);
        bigImage.attr("data-toggle", "modal");
        bigImage.attr("data-target", "#newRobotImageModal");
        $("#specificRobot").append(bigImage);

        // put the title of this picture underneath
        var specificRobotPicTitle = $("<h3>");
        specificRobotPicTitle.attr("id", "imageTitleEdit");
        specificRobotPicTitle.attr("data-id", thisImageId);
        var title = $(this).attr("title");
        console.log("title: ", title);
        specificRobotPicTitle.text(title);
        $("#specificRobot").append(specificRobotPicTitle);

        // put the desc of this picture underneath that
        var specificRobotPicDesc = $("<h3>");
        specificRobotPicDesc.attr("id", "imageDescEdit");
        specificRobotPicDesc.attr("data-id", thisImageId);
        var desc = $(this).data("desc");
        console.log("desc: ", desc);
        specificRobotPicDesc.text(desc);
        $("#specificRobot").append(specificRobotPicDesc);

        if (dataNoOfImages > 1) {
            $("#specificRobot").append("<button type='button' id='showAdditionalImages'" + 
            ">Additional Images</button>");
        }
    });

    //click on the enlarged pic of an individual robot brings up a modal to add more images
    // will later have to be available only to Mark in an "edit" mode
    // in addition to bringing up the modal, currentRobotId is set, but the big image is not pressed by a regular user
    $(document).on("click", ".bigRobotImage", function(event) {
        event.preventDefault();
        currentRobotId = $(this).data("robotid"); 
        console.log("currentRobotId of big Image just clicked: " + currentRobotId);
        // the calling of the modal to add an image is built into the large pic - modal target, etc.
    });

    // when Additional Images button (#showAdditionalImages) is clicked
    // go to db and retrieve addtional images from the correct robot and display the small versions in a div
    $(document).on("click", "#showAdditionalImages", function(event) {
        event.preventDefault();
        // hide the addtl images button
        $("#showAdditionalImages").hide();
        console.log("currentRobotId: ", currentRobotId);
        // get the images, but don't print out the first one again
        $.getJSON("/getARobot/" + currentRobotId, function(currob) {
            currob[0].image.forEach(innerImageForEach);

            function innerImageForEach(innerItem, innerIndex) { //innerItem here is id of images
                if (innerIndex !== 0){ //excluding the first image id because we don't need to show the main image again
                    console.log("THIS INNER image, innerIndex and innerItem: " + innerIndex + " and " + innerItem);
                    $.ajax({
                    method: "GET",
                    url: "/getImages/" + innerItem
                    })
                    .then(function(dataGetImages) { // dataGetImages should be formattedImages from api-routes.js
                        $("#additionalImages").append(dataGetImages);
                        // change the id from robotImg to addtlImg. It was robotImg from db retrieval in the api-routes file.
                        $("div#additionalImages img").attr("id", "addtlImg");
                    });
                }
            }
        });
    });

    // click on the additional images icon, and display the large verion alone with it's title and description
    $(document).on("click", "#addtlImg", function(event) {
        event.preventDefault();
        console.log("I clicked on an additional image");
        $("#largeAddtlImages").empty();
        
        // loads the main image, as wide as the screen
        var thisDataId = $(this).data("id");
        console.log("image data-id of the clicked pic (id of the image): ", thisDataId);
        var imgSrc = $(this).attr("src");
        var bigImage = $("<img>");
        bigImage.addClass("bigRobotImage");
        bigImage.data("id", thisDataId);
        bigImage.attr("src", imgSrc);
        $("#largeAddtlImages").append(bigImage);

        // put the title of this picture underneath
        var specificRobotPicTitle = $("<h3>");
        specificRobotPicTitle.attr("id", "imageTitleEdit");
        specificRobotPicTitle.attr("data-id", thisDataId);
        console.log("title before: ", title);
        var title = $(this).attr("title");
        console.log("title after: ", title);
        specificRobotPicTitle.text(title);
        $("#largeAddtlImages").append(specificRobotPicTitle);

        // put the desc of this picture underneath that
        var specificRobotPicDesc = $("<h3>");
        specificRobotPicDesc.attr("id", "imageDescEdit");
        specificRobotPicDesc.attr("data-id", thisDataId);
        console.log("desc before: ", desc);
        var desc = $(this).data("desc");
        console.log("desc after: ", desc);
        specificRobotPicDesc.text(desc);
        $("#largeAddtlImages").append(specificRobotPicDesc);
    });

    // this function happens when Mark clicks the submit a new robot button, info is stored in the appropriate robot db
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
                ">Add Main Image for Robot</button><button type='button' id='noImageYet'>No Image Yet</button>");
        });
    });

    // function to refresh Dom if no image is initially given to a new robot, the No Image button is clicked by Mark
    $(document).on("click", "#noImageYet", function(event) {
        event.preventDefault();
        //window.location.replace("/");
        getAllData();
    });

     // this function is after Mark clicks the noimage label under a previously created robot
     // but with no image added.. A modal appears for him to
    // enter the title, description and browse for an image,
    // but first the individual robot must be found and populated to accept an array of images
    $(document).on("click", ".noImage", function(event) {
        event.preventDefault();
        currentRobotId = $(this).data("robotid");
        console.log("inside noImage class click, currentRobotId: ", currentRobotId);
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

    // this function is after Mark clicks the add image button. A modal appears for him to
    // enter the title, description and browse for an image,
    // but first the individual robot must be found and populated to accept an array of images
    $(document).on("click", "#createImageRobot", function(event) {
    event.preventDefault();
    //currentRobotId is already set from Mark entering a new robot
    console.log("inside createImageRobot click, currentRobotId: ", currentRobotId);
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

    // this function enters the robot image into the correct robot in the db after data entered into the modal
    $(document).on("click", "#submitNewRobotImage", function(event) {
        event.preventDefault();
        //get form from html
        console.log("inside 'submitNewRobotImage' click, currentRobotId: ", currentRobotId);
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
            //refresh the DOM after adding a new robot with new image
            //window.location.replace("/");
            getAllData();
          });
    });

    // This function shows the form for Mark to edit the Name of a Robot - after it's been displayed 
    // as a large pic.
    $(document).on("click", "#editRobotName", function(event) {
        event.preventDefault();
        var thisRobotName = $(this).text();
        console.log("thisRobotName: ", thisRobotName);
        thisRobotId = $(this).attr("data-id");
        console.log("thisRobotId: ", thisRobotId);
        // show the modal to edit the current robot name
        $("#editNameForm").modal("show");
        $("#editName").val(thisRobotName);
    });

    // This function shows the form for Mark to edit the Bio of a Robot - after it's been displayed 
    // as a large pic.
    $(document).on("click", "#editRobotBio", function(event) {
        event.preventDefault();
        var thisRobotBio = $(this).text();
        console.log("thisRobotBio: ", thisRobotBio);
        thisRobotId = $(this).attr("data-id");
        console.log("thisRobotId: ", thisRobotId);
        // show the modal to edit the current robot Bio
        $("#editBioForm").modal("show");
        $("#editBio").val(thisRobotBio);
    });

    // This function shows the form for Mark to edit the Title
    // of an image, either the main one or additional pics
    $(document).on("click", "#imageTitleEdit", function(event) {
        event.preventDefault();
        var thisTitle = $(this).text();
        console.log("thisTitle: " + thisTitle);
        thisImageId = $(this).attr("data-id");
        console.log("the id of the image for this title: ", thisImageId);
        // show the modal to edit the current title
        $("#editTitleForm").modal("show");
        $("#editTitle").val(thisTitle);
    });

    // This function shows the form for Mark to edit the Description
    // of an image, either the main one or additional pics
    $(document).on("click", "#imageDescEdit", function(event) {
        event.preventDefault();
        var thisDesc = $(this).text();
        console.log("thisDesc: " + thisDesc);
        thisImageId = $(this).attr("data-id");
        console.log("the id of the image for this description: ", thisImageId);
        // show the div to edit the current title
        
        $("#editDescForm").modal("show");
        $("#editDesc").val(thisDesc);
    });

    //After user clicks Submit, this function changes the Robot's Name in the db
    $(document).on("click", "#submitEditedRobotName", function(event) {
        event.preventDefault();
        $.ajax({
        method: "POST",
        url: "/editRobotName/" + thisRobotId,
        data: {
            name: $("#editName").val().trim()
        }
        })
        .then(function(editedRobotdb) {
            console.log("Robotdb after Name edit (editedRobotdb) in robot.js: ", editedRobotdb);
            // empty out the input fields
            $("#editName").val("");
            // then hide the div to edit and this modal
            $("#editNameForm").modal("hide");
            //window.location.replace("/");
            getAllData();
        });
    });

    //After user clicks Submit, this function changes the Robot's Bio in the db
    $(document).on("click", "#submitEditedRobotBio", function(event) {
        event.preventDefault();
        $.ajax({
        method: "POST",
        url: "/editRobotBio/" + thisRobotId,
        data: {
            bio: $("#editBio").val().trim()
        }
        })
        .then(function(editedRobotdb) {
            console.log("Robotdb after Bio edit (editedRobotdb) in robot.js: ", editedRobotdb);
            // empty out the input fields
            $("#editBio").val("");
            // then hide the div to edit and this modal
            $("#editBioForm").modal("hide");
            //window.location.replace("/");
            getAllData();
        });
    });

    //After user clicks Submit, this function changes the title 
    // of the image in the db
    $(document).on("click", "#submitEditedImageTitle", function(event) {
        event.preventDefault();
        $.ajax({
        method: "POST",
        url: "/editImageTitle/" + thisImageId,
        data: {
            title: $("#editTitle").val().trim()
        }
        })
        .then(function(editedImagedb) {
            //console.log("Imagedb after title edit (editedImagedb) in user.js: ", editedImagedb);
            // empty out the input fields
            $("#editTitle").val("");
            // then hide the div to edit and this modal
            $("#editTitleForm").modal("hide");
            //window.location.replace("/");
            getAllData();
        });
    });

    //After user clicks Submit, this function changes the description
    // of the image in the db
    $(document).on("click", "#submitEditedImageDesc", function(event) {
        event.preventDefault();
        $.ajax({
        method: "POST",
        url: "/editImageDesc/" + thisImageId,
        data: {
            desc: $("#editDesc").val().trim()
        }
        })
        .then(function(editedImagedb) {
            //console.log("Imagedb after desc edit (editedImagedb) in user.js: ", editedImagedb);
            // empty out the input fields
            $("#editDesc").val("");
            // then hide the div to edit and this modal
            $("#editDescForm").modal("hide");
            //window.location.replace("/");
            getAllData();
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

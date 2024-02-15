var currentRobotId;

jQuery.noConflict();
jQuery(document).ready(function( $ ){
    // initialize vari;ables
    var currentRobotId = "";
    // this function happens when Mark clicks the submit a new robot button
    // 
    //
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
            // Hide the current modal, then bring up 2nd modal that allows user to enter kitten metrics.
            $("#newRobotModal").modal("hide");
        });
    });

    // this function is after Mark clicks the add image button. A modal appears for him to
    // enter the title, description and browse for an image,
    // but first the individual robot must be found and populated to accept an array of images
    $(document).on("click", "#addImage", function(event) {
    event.preventDefault();
    // make an ajax call for Mark to add a robot
    $.ajax({
        method: "GET",
        url: "/popRobot/" + currentRobotId
    })
        .then(function(dataAddImage) {
        // this sets up the fields populated to receive robot name and image data
        console.log("in robot.js, dataAddImage, after Robot is populated: ", dataAddImage);
        });
    });
  


});

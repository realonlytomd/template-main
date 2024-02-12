var currentRobotId;

jQuery.noConflict();
jQuery(document).ready(function( $ ){

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
    // this function happens when the user clicks the button
    // to get the modal with the form to enter the name, etc. for a new robot
    //
    $(document).on("click", "#submitNewRobot", function(event) {
        event.preventDefault();
          $.ajax({
              method: "POST",
              url: "/createRobot/",
              data: {
                name: $("#robotNameInput").val().trim(),
                bio: $("#robotBioInput").val().trim()
              }
          })
          .then(function(dataRobot) {
              console.log("Creation of new robot (dataRobot) in robot.js: ", dataRobot);
              // save id of current (last created) robot
              // currentRobotId = dataRobot.kitten[dataKittenUser.kitten.length - 1];???
              // console.log(currentKittenId: " + currentKittenId);
              // empty out the input fields
              $("#robotNameInput").val("");
              $("#robotBioInput").val("");
              // Hide the current modal, then bring up 2nd modal that allows user to enter kitten metrics.
              $("#newRobotModal").modal("hide");
            });
      });


});

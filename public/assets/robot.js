jQuery.noConflict();
jQuery(document).ready(function( $ ){

    // this function happens when the user clicks the button
    // to get the modal with the form to enter the name, etc. for a new kitten
    // It populates the specific user in the db with the kitten and metric schema
    $(document).on("click", "#createRobot", function(event) {
    event.preventDefault();
    // make an ajax call for Mark to add a robot
    $.ajax({
        method: "GET",
        url: "/popRobot"
    })
        .then(function(dataCreateRobot) {
        // this sets up the fields populated to receive robot name and image data
        console.log("in robot.js, dataCreateRobot, after Robot is populated: ", dataCreateRobot);
        });
    });
});

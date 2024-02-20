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

        // function called after a particular kitten button is clicked - gets and displays kitten data
    function writeRobotDom() {
        //console.log(currentKittenId inside writeKittendom: " + currentKittenId);
        $("#kittenMetrics").empty(); // empties out the div containing image and metric data of chosen kitten
        $("#chartContainer").empty();
        // gets the array of metrics associated with the current kitten
        $.getJSON("/getAKitten/" + currentKittenId, function(curkat) {
        //console.log(WHAT'S IN HERE curkat[0]: ", curkat[0]);
        //console.log(more specific, curkat[0].furcolor is: ", curkat[0].furcolor);
        // strings with multiple words are not being assigned.
        // try to to write the h5 element with data attributes instead.
        var showSpan = $("<span>");
        showSpan.attr("id", "editThisKitten");
        showSpan.css("color","red");
        showSpan.attr("data-name", curkat[0].name);
        showSpan.attr("data-breed", curkat[0].breed);
        showSpan.attr("data-furlength", curkat[0].furlength);
        showSpan.attr("data-furcolor", curkat[0].furcolor);
        showSpan.attr("data-sex", curkat[0].sex);
        showSpan.text("HERE");
        //this works!
        // appends the name of the current kitten and other constants
        $("#kittenMetrics").append("<p class='keepInline'>(CLICK</p>");
        $("#kittenMetrics").append(showSpan);
        $("#kittenMetrics").append("<p class='keepInline'> to Edit or Delete " +
        curkat[0].name + ")</p><h4>Kitten: " + 
        curkat[0].name + "<br>Breed: " +
        curkat[0].breed + "<br>Fur Length: " +
        curkat[0].furlength + "<br>Fur Color: " +
        curkat[0].furcolor + "<br>Sex: " +
        curkat[0].sex +  "</h4>");
        //
        // Add new images Button - to add a picture of the kitten
        $("#kittenMetrics").append("<button type='button' data-toggle='modal' " +
        "data-target='#newKittenImageModal' id='createImageKitten'" + 
        ">Add Image for Kitten</button>");
        // So HERE is where the div of the current kitten's images will go.
        $("#kittenMetrics").append("<div id='imageDiv'></div>");
        //go through the array of images for this kitten
        curkat[0].image.forEach(innerImageForEach);

        function innerImageForEach(innerItem, innerIndex) { //innerItem here is metric id of images
            //console.log(THIS INNER image, innerIndex and innerItem: " + innerIndex + " and " + innerItem);
            $.ajax({
            method: "GET",
            url: "/getImages/" + innerItem
            })
            .then(function(dataGetImages) { // dataGetImages should be formattedImages from api-routes.js
                // this is the current image data
                //console.log(in user.js, after each get images dataGetImages: ", dataGetImages);
                // then dataGetImages should be something I can setnd to user.html through jQuery
                $("#imageDiv").append(dataGetImages);
                // does user still have currentKittenId?
                //console.log(currentKittenId: " + currentKittenId);
            });
        }
        // Add Metrics Button - print to DOM: button with id of kitten to add metrics to kitten
        $("#kittenMetrics").append("<button type='submit' id='submitNewKittenMetrics' data-id=" + 
            curkat[0]._id + ">Add Metrics</button><h5>Click in a Metric Box to Delete or Edit</h5>");
            //console.log(curkat[0].metric: ", curkat[0].metric);
            //console.log(curkat[0].metric.length: " + curkat[0].metric.length);

        // this .forEach goes through each metric id to obtain associated metrics from db
        curkat[0].metric.forEach(innerMetricForEach);

        function innerMetricForEach(innerItem, innerIndex) {
            //console.log(THIS INNER metric, innerIndex and innerItem: " + innerIndex + " and " + innerItem);
            $.getJSON("/getAMetric/" + innerItem, function(curmet) {
            //console.log("this innerItem or _id: " + curmet[0]._id);
            //console.log("curmet[0].age: ", curmet[0].age);
            //console.log("curmet[0].weight: ", curmet[0].weight);
            console.log("curmet[0].weightunit: ", curmet[0].weightunit);
            console.log("curmet[0].sizeunit: ", curmet[0].sizeunit);
            if (curmet[0].weightunit === undefined) {
                curmet[0].weightunit = "ounces";
            }
            if (curmet[0].sizeunit === undefined) {
                curmet[0].sizeunit = "inches";
            }
            // change old entries of units to lower case
            curmet[0].weightunit = curmet[0].weightunit.toLowerCase();
            console.log("after to lower case, curmet[0].weightunit: ", curmet[0].weightunit);
            curmet[0].sizeunit = curmet[0].sizeunit.toLowerCase();
            console.log("after to lower case, curmet[0].sizetunit: ", curmet[0].sizeunit);
            //console.log("curmet[0].size: ", curmet[0].size);
            //create the arrays of kitten metrics
            metricIds.push(curmet[0]._id);
            kittenAges.push(curmet[0].age);
            kittenWeights.push(curmet[0].weight);
            kittenWeightUnits.push(curmet[0].weightunit);
            console.log("user.js: kittenWeightUnits: ", kittenWeightUnits);
            kittenSizes.push(curmet[0].size);
            kittenSizeUnits.push(curmet[0].sizeunit);
            //console.log(kittenAges.length = " + kittenAges.length);
            //console.log(curkat[0].metric.length = " + curkat[0].metric.length);
            // only print the arrays of kitten metrics to DOM if they are completely finished
            if (kittenAges.length === curkat[0].metric.length) {
                // perform sort function to get arrays in order of kitten ages
                //console.log(metricIds: " + metricIds);
                //console.log(kittenAges: " + kittenAges);
                //console.log(kittenWights: " + kittenWeights);
                //console.log(kittenSizes: " + kittenSizes);
                // this array is emptied out here instead of after being built
                // so the user has access to it if needed to delete all the metrics
                // associated with a kitten
                sortedMetricIds = [];

                // now feed the arrays to the server side to sort them according to age
                $.ajax({
                method: "GET",
                url: "/sortArrays/",
                data: {
                    ids: metricIds,
                    ages: kittenAges,
                    weights: kittenWeights,
                    weightunits: kittenWeightUnits,
                    sizes: kittenSizes,
                    sizeunits: kittenSizeUnits
                }
                })
                .then(function(sortedMetrics) {
                //console.log(from creation of sortedMetrcis: ", sortedMetrics);
                sortedMetricIds = sortedMetrics.ids;
                sortedAges = sortedMetrics.ages;
                sortedWeights = sortedMetrics.weights;
                sortedWeightUnits = sortedMetrics.weightunits;
                console.log("sortedWeightUnits: ", sortedWeightUnits);
                sortedSizes = sortedMetrics.sizes;
                sortedSizeUnits = sortedMetrics.sizeunits;
                console.log("sortedSizeUnits: ", sortedSizeUnits);

                // console.log("CHECK THIS!!!! sortedMetricIds: " + sortedMetricIds);
                console.log("sortedAges: " + sortedAges);
                // console.log("sortedWights: " + sortedWeights);
                // console.log("sortedSizes: " + sortedSizes);
                // call the function to print arrays to the DOM
                showDom();
                });
            }
            });
        }
        // function to print the newly created arrays to the Dom
        // the first time, these arrays are not filled yet, printing nothing to DOM
        function showDom() {
            //console.log(inside function showDom, kittenAges: " + kittenAges);
            //console.log(inside function showDom, sortedAges: " + sortedAges);
            for (i=0; i<kittenAges.length; i++) {
                //console.log(I'm INSIDE THE showDom FORLOOP");
                $("#kittenMetrics").append("<div class='metricInfo'><h5 class='metricGroup' data_idKitten=" + 
                currentKittenId + " data_id=" + 
                sortedMetricIds[i] + " data_age=" +
                sortedAges[i] + " data_weight=" +
                sortedWeights[i] + " data_weightunit=" +
                sortedWeightUnits[i] + " data_size=" +
                sortedSizes[i] + " data_sizeunit=" +
                sortedSizeUnits[i] +  ">age: " +
                sortedAges[i] + " weeks" + "<br>Weight: " +
                sortedWeights[i] + " " + sortedWeightUnits[i] + "<br>Length: " +
                sortedSizes[i] + " " + sortedSizeUnits[i] + "</h5></div>");
            }
            //
            // I think here is where the function to make the chart should be called.
            displayChart();
            //
            //empty out arrays before clicking a new kitten
            metricIds = [];
            kittenAges = [];
            kittenWeights = [];
            kittenWeightUnits = [];
            kittenSizes = [];
            kittenSizeUnits = [];
            // try: keep this array in case user wants to delete all the metrics referenced from
            // a kitten they are deleting.
            //sortedMetricIds = [];
            sortedAges = [];
            sortedWeights = [];
            sortedWeightUnits = [];
            sortedSizes = [];
            sortedSizeUnits = [];
            //console.log("CHECK THIS TOO!!!! sortedMetricIds: " + sortedMetricIds);
        }
        });
    }
  

});

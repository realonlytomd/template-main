//  each robot has a name, array of images and a biography
var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

// Using the Schema constructor, create a new RobotSchema object
var RobotSchema = new Schema({
  // `name` of robot is required and of type String
  name: {
    type: String,
    required: true
  },
  // `bio` of robot is required and of type String
  bio: {
    type: String,
    required: true
  },
  // image is an array of images Mark uploads for each robot
  image: [{
    type: Schema.Types.ObjectId,
    ref: "Image"
  }]
}, {
  // adding timestamps: created at and updated at
  timestamps: true
});

// This creates our model from the above schema, using mongoose's model method
var Robot = mongoose.model("Robot", RobotSchema);

// Export the Article model
module.exports = Robot;
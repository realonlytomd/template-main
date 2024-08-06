//  each item has a name, array of images and a biography
var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

// Using the Schema constructor, create a new ItemSchema object
var ItemSchema = new Schema({
  // `name` of item is required and of type String
  name: {
    type: String,
    required: true
  },
  // `bio` of item is required and of type String
  bio: {
    type: String,
    required: true
  },
  // `order` of item is required and of type Number
  order: {
    type: Number,
    required: true
  },
  // image is an array of images Mark uploads for each item
  image: [{
    type: Schema.Types.ObjectId,
    ref: "Image"
  }]
}, {
  // adding timestamps: created at and updated at
  timestamps: true
});

// This creates our model from the above schema, using mongoose's model method
var Item = mongoose.model("Item", ItemSchema);

// Export the Article model
module.exports = Item;
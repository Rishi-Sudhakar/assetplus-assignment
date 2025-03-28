var mongoose = require("mongoose");

var postSchema = mongoose.Schema(
    {
        // @AssetPlus: Describe schema here

    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Post", postSchema)
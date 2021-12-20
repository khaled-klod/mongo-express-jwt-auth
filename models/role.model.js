const mongoose = require('mongoose')

const Schema = mongoose.Schema;
const model = mongoose.model;

const RoleSchema = new Schema({
    name: {type: String, required: true}
})

const roleModel = model("Role", RoleSchema)

module.exports = roleModel
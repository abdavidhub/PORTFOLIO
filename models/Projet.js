const mongoose = require('mongoose') 
const Schema = mongoose.Schema; 
const projetSchema = new mongoose.Schema({ 
titre: {type: String, required: true},
description: {type: String, required: true},
technologie: {type: String, required: true},
lienCode: {type: String},
lienDemo:{type: String},
image: {type: String},
imagePublicId:{type: String}
},
{timestamps: true})
const Projet = mongoose.model('Projet',projetSchema); 
module.exports = Projet
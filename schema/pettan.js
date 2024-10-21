const mongoose = require('mongoose');

const pettanSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true
    },
    num: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    type: {
        type: String, 
        required: true
    },
    rarity: {
        type: String,
        required: true
    },
    series: {
        type: Number,
        required: true
    }

});

const Pettan = mongoose.model('Pettan', pettanSchema, 'Pettan');

module.exports = Pettan;

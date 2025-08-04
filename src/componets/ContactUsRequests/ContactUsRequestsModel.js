const mongoose = require('mongoose')

const ContactUsRequestsSchema=mongoose.Schema({
    name:{
        type:String,
        required:[true,'Name is required']
    },
    email:{
        type:String,
        required:[true,'Email is required']
    },
    phone:{
        type:String,
        // required:[true,'Phone is required']
    },
    subject:{
        type:String,
        required:[true,'Subject is required']
    },
    message:{
        type:String,
        // required:[true,'Message is required']
    },
},{
    timestamps: {
        createdAt: 'created_at', 
        updatedAt: 'updated_at' 
    }
})
module.exports.ContactUsRequests= mongoose.model('contactUsRequest',ContactUsRequestsSchema)
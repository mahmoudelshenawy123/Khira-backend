const mongoose = require('mongoose')

const UserNotificationsSchema = mongoose.Schema({
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:[true,'User Id is required']
    },
    translation:{
        en:{
            title:{
                type:String,
                required:[true,'Notifications English title is required']
            },
            body:{
                type:String,
                required:[true,'Notifications English body is required']
            }
        },
        ar:{
            title:{
                type:String,
                required:[true,'Notifications Arabic title is required']
            },
            body:{
                type:String,
                required:[true,'Notifications Arabic body is required']
            }
        },
        ur:{
            title:{
                type:String,
                // required:[true,'Notifications Urdu title is required']
            },
            body:{
                type:String,
                // required:[true,'Notifications Urdu body is required']
            }
        },
    }

},{
    timestamps: {
        createdAt: 'created_at', 
        updatedAt: 'updated_at' 
    }
})

module.exports.UserNotification = mongoose.model('UserNotification',UserNotificationsSchema)
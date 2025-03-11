var mongoose = require('mongoose')
var logger = require('../helper/logger')

mongoose.connect(process.env.MONGODB_URI, 
//     {
//     maxPoolSize: 50,
//     wtimeoutMS: 2500,
//     useNewUrlParser: true
// }
).then(() => {
    logger.info(`DB Connection Established`)
    console.log("DB Connected")
}).catch(err => {
    logger.error(`DB Connection Fail | ${err.stack}`)
    console.log(err)
})

const User = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
    },
    emailId: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        validate: {
            validator: function(v) {
                return /^[0-9]{10}$/.test(v);
            },
            message: props => `${props.value} is not a valid phone number!`
        },
        required: true,
        unique: true
    },
    notificationToken: {
        type: String,
        required: true,
    }
})

const Group = new mongoose.Schema({
    groupName: {
        type: String,
        required: true
    },
    groupDescription: {
        type: String
    },
    groupCurrency: {
        type: String,
        default: "NPR"
    },
    groupOwner: {
        type: String,
        required: true
    },
    groupMembers: {
        type: Array,
        required: true
    },
    groupCategory: {
        type: String,
        default: "Others"
    },groupTotal: {
        type: Number, 
        default: 0
    },
    split: {
        type: Array
    }
})

const Expense = new mongoose.Schema({
    groupId: {
        type: String,
        required: true
    },
    expenseName: {
        type: String,
        required: true
    },
    expenseDescription: {
        type: String,
    },
    expenseAmount: {
        type: Number,
        required: true
    },
    expenseCategory:{
        type: String,
        default: "Others"
    },
    expenseCurrency:{
        type: String,
        default: "NPR"
    },
    expenseDate:{
        type: Date,
        default: Date.now
    },
    expenseOwner: {
        type: String,
        required: true
    },
    expenseMembers: {
        type: Array,
        required: true
    },
    expensePerMember: {
        type: Number,
        required: true
    },
    expenseType: {
        type: String, 
        default: "Cash"
    }
})

const Settlement = new mongoose.Schema({
    groupId:{
        type: String,
        required: true
    },
    settleTo:{
        type:String,
        required: true
    },
    settleFrom:{
        type:String,
        required: true
    }, 
    settleDate:{
        type:String,
        required: true
    },
    settleAmount:{
        type:Number, 
        required: true
    }
})


const deviceTokenSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    token: {
        type: String,
        required: true,
    },
    platform: {
        type: String,
        enum: ['ios', 'android', 'web'],
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }
});

// Create a compound index to ensure email + token combination is unique
deviceTokenSchema.index({ email: 1, token: 1 }, { unique: true });

module.exports.DeviceToken = mongoose.model('DeviceToken', deviceTokenSchema);
module.exports.Expense = mongoose.model('expense', Expense)
module.exports.User = mongoose.model('user', User)
module.exports.Group = mongoose.model('group', Group)
module.exports.Settlement = mongoose.model('settlement', Settlement)
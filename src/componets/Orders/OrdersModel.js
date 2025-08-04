const mongoose = require('mongoose');

const OrdersSchema = mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  item_number:{
    type: Number,
    // required: [true, 'item Number Is Required'],
  },
  
  billing_address:{
    name:{
      type: String,
      required: [true, 'Billing Address Name Is Required'],
    },
    city:{
      type: String,
      required: [true, 'Bil/ling Address City Is Required'],
    },
    street_address:{
      type: String,
      required: [true, 'Billing Address Street ADdress Is Required'],
    },
    phone:{
      type: String,
      required: [true, 'Billing Address Phone Is Required'],
    },
    email:{
      type: String,
    },
  },

  shipping_address:{
    name:{
      type: String,
      required: [true, 'Shipping Address Name Is Required'],
    },
    city:{
      type: String,
      required: [true, 'Shipping Address City Is Required'],
    },
    street_address:{
      type: String,
      required: [true, 'Shipping Address Street ADdress Is Required'],
    },
    state:{
      type: String,
    },
  },

  shipping_charges: {
    type: Number,
    default:0
  },
  total_price: {
    type: Number,
    default:0
  },
  sub_total_price: {
    type: Number,
    default:0
  },
  payment_method: {
    type: String,
    enum:['cash','online','online_success'],
    required: [true, 'Payment Method Is Required'],
  },
  
  products:[
    {
      product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'Product Id Is Required'],
      },
      selected_size_id: {
        type: String,
        // required: [true, 'Product Id Is Required'],
      },
      quantity: {
        type: Number,
        required: [true, 'Product Quantity Is Required'],
      },
      buying_price: {
        type: Number,
        required: [true, 'Product Price Is Required'],
      },
      is_gift: {
        type: Boolean,
        default:false
      },
      is_gift_value: {
        type: Number,
        default:0
      },
      send_receipt:{
        type: Boolean,
        default:true
      },
      send_greeting_card:{
        type: Boolean,
        default:false
      },
      send_greeting_card_message:{
        type: String,
        default:'false'
      },
    },
  ],
  status: {
    type: Number,
    enum: [1, 2, 3, 4,5],
    default: 1,
    // 1 => order Processing
    // 2 => order Delivery
    // 3 => order Completed
    // 4 => order Failled
    // 5 => order Cancelled
  },
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});


var CounterSchema = mongoose.Schema({
  id: {type: String, required: true},
  seq: { type: Number, default: 0 }
});
var counter = mongoose.model('counter', CounterSchema);

// var entitySchema = mongoose.Schema({
//   testvalue: {type: String}
// });

OrdersSchema.pre('save', function(next) {
  var doc = this;
  counter.findOneAndUpdate({id: 'orderCounter'}, {$inc: { seq: 1} },async function(error, counterr)   {
    if(counterr==null){
      await counter.create({id:'orderCounter',seq:1})
      return
    }
      if(error) return next(error);

      doc.item_number = counterr.seq;
      next();
  });
});
module.exports.Orders = mongoose.model('Order', OrdersSchema);

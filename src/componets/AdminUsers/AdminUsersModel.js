const mongoose = require('mongoose');

const AdminUsersSchema = mongoose.Schema({
  name: {
    type: String,
    required: 'User Name Is required',
  },
  email: {
    type: String,
    required: 'User phone Is Required',
    unique: [true, 'Email alredy exists'],
  },
  password: {
    type: String,
    default: '',
  },
  is_admin: {
    type: Boolean,
    default: true,
  },
  status: {
    type: String,
    enum: [1, 2],
    default: 1,
    // 1 => Active
    // 2 => Block
  },

}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

module.exports.AdminUsers = mongoose.model('AdminUser', AdminUsersSchema);

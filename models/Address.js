const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    label: { type: String, trim: true, maxlength: 30, default: '' }, // เช่น บ้าน ที่ทำงาน
    name: { type: String, required: true, trim: true, maxlength: 80 },
    tel: { type: String, required: true, trim: true, maxlength: 30 },
    line: { type: String, required: true, trim: true, maxlength: 300 },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

addressSchema.methods.toPublic = function () {
  return {
    id: this._id.toString(),
    label: this.label,
    name: this.name,
    tel: this.tel,
    line: this.line,
    isDefault: this.isDefault,
  };
};

module.exports = mongoose.model('Address', addressSchema);

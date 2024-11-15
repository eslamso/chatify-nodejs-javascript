const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First Name is required"],
      minLength: [3, "First Name must be at least 3 characters"],
      maxLength: [50, "First Name must be at most 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last Name is required"],
      minLength: [3, "Last Name must be at least 3 characters"],
      maxLength: [50, "Last Name must be at most 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      // match:
      //   /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    photo: {
      type: String,
      default: "default.webp",
    },
    //this is for email activation
    activated: {
      type: Boolean,
      default: false,
    },
    lastAppearance: Date,
    isOnline: {
      type: Boolean,
    },
    // for email activation
    activationCode: String,
    activationCodeExpires: Date,
    activationToken: String,
    // for change password of user
    passwordChangedAt: Date,
    // for reset password
    passwordResetCode: String,
    passwordResetCodeExpires: Date,
    passwordResetVerificationToken: String,
    passwordResetCodeVerified: Boolean,
    passwordResetToken: String,
  },

  { timestamps: true }
);

userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

//this is for hashing password before saving it in data base

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
userSchema.methods.correctPassword = async function (
  password,
  candidatePassword
) {
  return await bcrypt.compare(password, candidatePassword);
};
module.exports = mongoose.model("User", userSchema);

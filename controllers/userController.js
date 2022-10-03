const User = require("../models/userModel");
const bcryptjs = require("bcryptjs");
const config = require("../config/config");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const randomstring = require("randomstring");

const sendResetPasswordMail = async (name, email, token) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: config.emailUser,
        pass: config.emailPassword,
      },
    });

    const mailOptions = {
      from: config.emailUser,
      to: email,
      subject: "For Reset Password",
      html:
        "<p> Hii" +
        name +
        ', Please copy the link <a href = "http://localhost:3000/api/reset-password?token=' +
        token +
        '"> and reset your password<a/>',
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Mail has been sent:= ", info.response);
      }
    });
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};

const create_token = async (id) => {
  try {
    const token = await jwt.sign({ _id: id }, config.secret_jwt);
    return token;
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const securePassword = async (password) => {
  try {
    const passwordHash = await bcryptjs.hash(password, 10);
    return passwordHash;
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const register_user = async (req, res) => {
  try {
    const spassword = await securePassword(req.body.password);

    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: spassword,
      mobile: req.body.mobile,
      image: req.file.filename,
      type: req.body.type,
    });

    const userData = await User.findOne({ email: req.body.email });
    if (userData) {
      res
        .status(200)
        .send({ success: false, msg: "This email already exists" });
    } else {
      const user_data = await user.save();
      res.status(200).send({ success: true, data: user_data });
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
};

//login method

const user_login = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const userData = await User.findOne({ email: email });
    if (userData) {
      const passwordMatch = await bcryptjs.compare(password, userData.password);
      if (passwordMatch) {
        const tokenData = await create_token(userData._id);
        const userResult = {
          _id: userData._id,
          name: userData.name,
          email: userData.email,
          password: userData.password,
          image: userData.image,
          mobile: userData.mobile,
          type: userData.type,
          token: tokenData,
        };
        const response = {
          seccess: true,
          msg: "User Details",
          data: userResult,
        };
        res.status(200).send(response);
      }
    } else {
      res
        .status(200)
        .send({ success: false, msg: "login details are incorrect" });
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
};

// update password
const update_password = async (req, res) => {
  try {
    const user_id = req.body.user_id;
    const password = req.body.password;

    const data = await User.findOne({ id: user_id });

    if (data) {
      const newPassword = await securePassword(password);

      const userData = await User.findByIdAndUpdate(
        { _id: user_id },
        {
          $set: {
            password: newPassword,
          },
        }
      );

      res
        .status(200)
        .send({ success: true, msg: "Your password has been updated" });
    } else {
      res.status(200).send({ success: false, msg: "User Id not found!!" });
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
};

//forgot passwrod

const forgot_password = async (req, res) => {
  try {
    const email = req.body.email;
    const userData = await User.findOne({ email: email });

    if (userData) {
      const randomString = randomstring.generate();
      const data = await User.updateOne(
        { email: email },
        { $set: { token: randomString } }
      );
      sendResetPasswordMail(userData.name, userData.email, randomString);
      res
        .status(200)
        .send({
          success: true,
          msg: "Please check your inbox and reset your password",
        });
    } else {
      res
        .status(200)
        .send({ success: true, msg: "This email does not exists" });
    }
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};

const reset_password = async (req, res) => {
  try {
    const token = req.query.token;
    const tokenData = await User.findOne({token:token})
    if(tokenData){
      const password = req.body.password;
      const newPassword = await securePassword(password)
      const userData = await User.findByIdAndUpdate({_id:tokenData._id}, {$set: {password:newPassword,token:''}},{new:true})
      res.status(200).send({success:true, msg:"User password has been reset",data:userData})
    }
    else{
      res.status(200).send({success:true, msg:"This link has been expired"})
    }
  } catch (err) {
    res.status(400).send({ success: false, msg: error.message });
  }
};
module.exports = {
  register_user,
  user_login,
  update_password,
  forgot_password,
  reset_password,
};

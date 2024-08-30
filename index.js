const createError = require('http-errors');
const debug = require('debug')
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const logger = require("morgan");
const cors = require("cors");
require('dotenv').config();
const nodemailer = require("nodemailer");

const app = express();
// app.use(cors());
app.use(cors({
    origin: process.env.FRONT_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow the necessary HTTP methods
  credentials: true, 
  }));
  
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(bodyParser.json());

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: 'Gmail', 
  auth: {
      user: process.env.EMAIL_USER, 
      pass: process.env.EMAIL_PASSWORD, 
  },
});


app.get("/", (req, res)=>{
    return res.json({message: "hello"});
})
app.post("/submit-form", (req, res) => {
    try {
      console.log(req.body);
      
        const { name, email, message } = req.body;

        // const transporter = nodemailer.createTransport({
        //   service: "Gmail",
        //   host: "smtp.gmail.com",
        //   port: 465,
        //   secure: true,
        //   auth: {
        //     user: process.env.EMAIL_USER,
        //     pass: process.env.EMAIL_PASSWORD,
        //   },
        // });
      
        const mailOptions = {
          from: email, 
          // replyTo: email,
          to: process.env.EMAIL_USER,
          subject: `Contact form submission from ${name}`,
          text: `Name: ${name}\nEmail: ${email}\nMessage:\n${message}`,
        };
      
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log("error: ", error);
            
            return res.status(500).json({ message: "Error sending email" });
          }
          res.status(200).json({ 
            success: true,
            message: "Message sent successfully" });
        });

        // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          console.error('Error sending email:', error);
          res.status(500).send('Something went wrong.');
      } else {
          console.log('Email sent:', info.response);

          // Send a confirmation email to the user
          const confirmationMailOptions = {
              from: process.env.EMAIL_USER, // sender address
              to: email, // user's email address
              subject: 'Thank you for contacting us!',
              text: `Hello ${name},\n\nThank you for reaching out! We have received your message and will get back to you soon.\n\nBest regards,\n Michias Hailu`,
          };

          transporter.sendMail(confirmationMailOptions, (error, info) => {
              if (error) {
                  console.error('Error sending confirmation email:', error);
              } else {
                  console.log('Confirmation email sent:', info.response);
              }
          });

          res.status(200).send('Email sent successfully.');
      }
  });
    } catch (error) {
        console.error(error);
       return res.status(500).json({ message: "Server error" }); 
    }
});


app.use(function(req, res, next) {
    next(createError(404));
  });
  
  // error handler
  app.use(function(err, req, res, next) {
    console.log("err", err);
    
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
  
    res.status(err.status || 500);
    res.json({
        message: res.locals.message,
        error: res.locals.error
    });
});


app.listen(3001, () => {
  console.log("Server running on port 3001");
});

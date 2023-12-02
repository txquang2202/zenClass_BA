import passport from "passport";
import LocalStrategy from "passport-local";
import User from "../models/user.js";
import bcrypt from "bcryptjs";
import env from "dotenv";
import GoogleStrategy from "passport-google-oauth20";
import FacebookStrategy from "passport-facebook";
import { createToken } from "./jwt.js";

env.config();

passport.use(
  new LocalStrategy(async function verify(username, password, cb) {
    try {
      const user = await User.findOne({ username: username });
      if (!user) {
        return cb(null, false, { message: "The user is not exist!!" });
      }

      const hashedPassword = await bcrypt.compare(password, user.password);
      if (!hashedPassword) {
        return cb(null, false, { message: "Incorrect password." });
      }

      return cb(null, user);
    } catch (err) {
      return cb(err);
    }
  })
);
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.BA_BASE_URL + "/api/v1/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, cb) => {
      try {
        const existingUser = await User.findOne({
          email: profile.emails[0].value,
        });

        if (existingUser) {
          const token = createToken(existingUser);
          return cb(null, { user: existingUser, token });
        } else {
          return cb(null, false, { message: "The user is not exist!!" });
        }
      } catch (err) {
        return cb(err);
      }
    }
  )
);
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: process.env.BA_BASE_URL + "/api/v1/auth/facebook/callback",
      profileFields: ["email"],
    },
    async (accessToken, refreshToken, profile, cb) => {
      try {
        const existingUser = await User.findOne({
          email: profile.emails[0].value,
        });

        if (existingUser) {
          const token = createToken(existingUser);
          return cb(null, { user: existingUser, token });
        } else {
          return cb(null, false, { message: "The user is not exist!!" });
        }
      } catch (err) {
        return cb(err);
      }
    }
  )
);
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

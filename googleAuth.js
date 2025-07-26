const passport = require('passport');
const User = require('./models/user.model');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_REDIRECT_URI || "http://localhost:8000/api/v1/auth/google/callback",
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      console.log("Google profile received:", profile);
      
      try {
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
          const existingUser = await User.findOne({ email: profile.emails?.[0]?.value });
          if (existingUser) {
            return done(new Error('Email is already used for another account'));
          }

          user = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails?.[0]?.value || "",
            profilePicture: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
            role: "student",
            bio: "",
          });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);
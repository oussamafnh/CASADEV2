// passport-setup.js
import passport from 'passport';
import GoogleStrategy from 'passport-google-oauth20';
import GitHubStrategy from 'passport-github2';
import User from './models/user.model.js'; // Adjust the path as needed

// Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID, // Your Google Client ID
  clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Your Google Client Secret
  callbackURL: "/auth/google/callback", // The URL to handle the response
}, async (accessToken, refreshToken, profile, done) => {
  // Check if user already exists in our db
  const existingUser = await User.findOne({ googleId: profile.id });
  
  if (existingUser) {
    done(null, existingUser);
  } else {
    // If not, create a new user in our db
    const newUser = await new User({
      googleId: profile.id,
      username: profile.displayName,
      email: profile.emails[0].value, // Assuming user has at least one email
      // Optionally add other fields as needed
    }).save();
    done(null, newUser);
  }
}));

// GitHub Strategy
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID, // Your GitHub Client ID
  clientSecret: process.env.GITHUB_CLIENT_SECRET, // Your GitHub Client Secret
  callbackURL: "/auth/github/callback", // The URL to handle the response
}, async (accessToken, refreshToken, profile, done) => {
  // Check if user already exists in our db
  const existingUser = await User.findOne({ githubId: profile.id });
  
  if (existingUser) {
    done(null, existingUser);
  } else {
    // If not, create a new user in our db
    const newUser = await new User({
      githubId: profile.id,
      username: profile.username,
      email: profile.emails[0].value, // Assuming user has at least one email
      // Optionally add other fields as needed
    }).save();
    done(null, newUser);
  }
}));

// Serialize user to store in session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser((id, done) => {
  User.findById(id).then((user) => {
    done(null, user);
  });
});

import dotenv from "dotenv";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { prisma } from "./config/prisma.config.js";
import jwt from "jsonwebtoken";

dotenv.config();

const secret = process.env.JWT_SECRET;

// JWT 토큰 생성 함수
export const generateAccessToken = (user) => {
  return jwt.sign(
    { id: Number(user.userId), email: user.email },
    secret,
    { expiresIn: '1h' }
  );
};

export const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: Number(user.userId) },
    secret,
    { expiresIn: '14d' }
  );
};

// GoogleVerify
const googleVerify = async (profile) => {
  const email = profile.emails?.[0]?.value;
  if (!email) {
    throw new Error(`profile.email was not found: ${profile}`);
  }

  const user = await prisma.user.findFirst({ where: { email } });

  if (user !== null) {
    return { userId: user.userId, email: user.email, name: user.name };
  }

  const created = await prisma.user.create({
    data: {
      email,
      name: profile.displayName,
      gender: "NONE",
      birth: new Date(1970, 0, 1),
      address: null,
      phone: null,
      password: "", // 소셜 로그인은 비밀번호가 없음
      socialType: "GOOGLE",
      userStatus: "ACTIVE",
      userType: "GENERAL",
      agreements: {
        create: {
          isServiceAgreed: true,
          isPersonalAgreed: true,
          isLocationAgreed: true,
          isAlarmAgreed: true,
          isFourteenAgreed: true,
        }
      }
    },
  });

  return { userId: created.userId, email: created.email, name: created.name };
};

// GoogleStrategy
export const googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.PASSPORT_GOOGLE_CLIENT_ID,
    clientSecret: process.env.PASSPORT_GOOGLE_CLIENT_SECRET,
    callbackURL: "/oauth2/callback/google",
    scope: ["email", "profile"],
  },
  async (accessToken, refreshToken, profile, cb) => {
    try {
      const user = await googleVerify(profile);
      
      const jwtAccessToken = generateAccessToken(user);
      const jwtRefreshToken = generateRefreshToken(user);
     
      return cb(null, {
        accessToken: jwtAccessToken,
        refreshToken: jwtRefreshToken,
      });
    } catch (err) {
      return cb(err);
    }
  }
);

// JWT Strategy
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

export const jwtStrategy = new JwtStrategy(jwtOptions, async (payload, done) => {
  try {
    const user = await prisma.user.findFirst({ where: { userId: BigInt(payload.id) } });
    if (user) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  } catch (err) {
    return done(err, false);
  }
});


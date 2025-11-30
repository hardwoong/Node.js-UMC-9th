import passport from "passport";

// 인증 미들웨어
export const isLogin = passport.authenticate('jwt', { session: false });


import connectPgSimple from 'connect-pg-simple';
import session from 'express-session';
import { pool } from '../db/connection.js';

const ONE_DAY_IN_MS = 1000 * 60 * 60 * 24;
const SESSION_SECRET = process.env.SESSION_SECRET ?? 'development-session-secret';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const PgSessionStore = connectPgSimple(session);

const sessionOptions: session.SessionOptions = {
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: IS_PRODUCTION,
    maxAge: ONE_DAY_IN_MS,
  },
};

sessionOptions.store = new PgSessionStore({
  pool,
  tableName: 'user_sessions',
  createTableIfMissing: true,
});

export const sessionMiddleware = session(sessionOptions);

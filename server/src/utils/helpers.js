import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import config from '../config/env.js';

export const generateToken = (userId) => {
  return jwt.sign({ userId }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
};

export const verifyToken = (token) => {
  return jwt.verify(token, config.jwtSecret);
};

export const hashPassword = async (password) => {
  return bcrypt.hash(password, config.bcryptSaltRounds);
};

export const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

export const getInitials = (firstName, lastName) => {
  if (!firstName && !lastName) return '';
  const first = firstName ? firstName.charAt(0).toUpperCase() : '';
  const last = lastName ? lastName.charAt(0).toUpperCase() : '';
  return `${first}${last}`;
};

export const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')       // Replace spaces with -
    .replace(/[^\w\-]+/g, '')   // Remove all non-word chars
    .replace(/\-\-+/g, '-');    // Replace multiple - with single -
};

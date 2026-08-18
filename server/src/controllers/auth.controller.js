import prisma from '../config/database.js';
import { hashPassword, comparePassword, generateToken } from '../utils/helpers.js';
import { UnauthorizedError, ConflictError } from '../utils/errors.js';
import jwt from 'jsonwebtoken';
import config from '../config/env.js';

export const register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, educationLevel } = req.body;
    
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictError('Email already in use');
    }

    const hashedPassword = await hashPassword(password);
    
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        firstName,
        lastName,
        educationLevel
      }
    });

    const token = generateToken(user.id);

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        educationLevel: user.educationLevel,
        onboardingCompleted: user.onboardingCompleted
      },
      token
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const token = generateToken(user.id);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        educationLevel: user.educationLevel,
        onboardingCompleted: user.onboardingCompleted
      },
      token
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (user) {
      const resetToken = jwt.sign({ userId: user.id }, config.jwtSecret, { expiresIn: '1h' });
      if (config.nodeEnv === 'development') {
        console.log(`Password reset token for ${email}: ${resetToken}`);
      }
      // Future: Send email
    }

    res.json({ message: 'Password reset instructions sent' });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    
    const decoded = jwt.verify(token, config.jwtSecret);
    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: decoded.userId },
      data: { passwordHash: hashedPassword }
    });

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      next(new UnauthorizedError('Invalid or expired reset token'));
    } else {
      next(error);
    }
  }
};

export const googleAuth = async (req, res, next) => {
  try {
    const { credential, email: directEmail, firstName: directFirstName, lastName: directLastName, picture } = req.body;
    
    let email = directEmail;
    let firstName = directFirstName || 'Google';
    let lastName = directLastName || 'User';
    let avatar = picture;

    // Decode Google ID token if provided
    if (credential) {
      try {
        const decoded = jwt.decode(credential);
        if (decoded && decoded.email) {
          email = decoded.email;
          firstName = decoded.given_name || firstName;
          lastName = decoded.family_name || lastName;
          avatar = decoded.picture || avatar;
        }
      } catch (e) {
        console.warn('Google token decode warning:', e);
      }
    }

    if (!email) {
      throw new UnauthorizedError('Google authentication failed: Email is required');
    }

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      const defaultPassword = await hashPassword(`google_${Date.now()}_${Math.random()}`);
      user = await prisma.user.create({
        data: {
          email,
          firstName,
          lastName,
          passwordHash: defaultPassword,
          educationLevel: 'Undergraduate',
          profilePictureUrl: avatar || null,
          onboardingCompleted: false
        }
      });
    }

    const token = generateToken(user.id);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        educationLevel: user.educationLevel,
        onboardingCompleted: user.onboardingCompleted
      },
      token
    });
  } catch (error) {
    next(error);
  }
};

export const appleAuth = async (req, res, next) => {
  try {
    const { email, firstName = 'Apple', lastName = 'User' } = req.body;

    if (!email) {
      throw new UnauthorizedError('Apple authentication failed: Email is required');
    }

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      const defaultPassword = await hashPassword(`apple_${Date.now()}_${Math.random()}`);
      user = await prisma.user.create({
        data: {
          email,
          firstName,
          lastName,
          passwordHash: defaultPassword,
          educationLevel: 'Undergraduate',
          onboardingCompleted: false
        }
      });
    }

    const token = generateToken(user.id);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        educationLevel: user.educationLevel,
        onboardingCompleted: user.onboardingCompleted
      },
      token
    });
  } catch (error) {
    next(error);
  }
};

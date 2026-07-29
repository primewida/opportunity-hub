import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import config from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import opportunityRoutes from './routes/opportunity.routes.js';
import jobRoutes from './routes/job.routes.js';
import roadmapRoutes from './routes/roadmap.routes.js';
import courseRoutes from './routes/course.routes.js';
import skillRoutes from './routes/skill.routes.js';
import communityRoutes from './routes/community.routes.js';
import mentorRoutes from './routes/mentor.routes.js';
import messageRoutes from './routes/message.routes.js';
import cvRoutes from './routes/cv.routes.js';
import coverLetterRoutes from './routes/coverLetter.routes.js';
import interviewRoutes from './routes/interview.routes.js';
import testRoutes from './routes/test.routes.js';

const app = express();

// Security
app.use(helmet());
app.use(cors({ origin: config.clientUrl, credentials: true }));

// Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), environment: config.nodeEnv });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/roadmaps', roadmapRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/cv', cvRoutes);
app.use('/api/cover-letter', coverLetterRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/tests', testRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// Error handler
app.use(errorHandler);

export default app;

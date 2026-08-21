export const validate = (schema) => async (req, res, next) => {
  try {
    const parsedData = await schema.parseAsync(req.body);
    req.body = parsedData;
    next();
  } catch (error) {
    if (error.name === 'ZodError') {
      const firstMessage = error.errors?.[0]?.message || 'Validation failed';
      return res.status(400).json({
        error: firstMessage,
        details: error.errors
      });
    }
    next(error);
  }
};

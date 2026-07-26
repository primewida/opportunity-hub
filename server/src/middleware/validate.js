export const validate = (schema) => async (req, res, next) => {
  try {
    const parsedData = await schema.parseAsync(req.body);
    req.body = parsedData;
    next();
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      });
    }
    next(error);
  }
};

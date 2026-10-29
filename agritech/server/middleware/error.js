exports.notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Not found: ${req.originalUrl}`));
};

// eslint-disable-next-line no-unused-vars
exports.errorHandler = (err, req, res, next) => {
  let code = res.statusCode >= 400 ? res.statusCode : 500;
  let message = err.message;
  if (err.name === 'ValidationError' || err.name === 'CastError') code = 400;
  if (err.code === 11000) {
    code = 400;
    message = 'A record with this value already exists';
  }
  console.error(`[error] ${code} ${message}`);
  res.status(code).json({ message });
};

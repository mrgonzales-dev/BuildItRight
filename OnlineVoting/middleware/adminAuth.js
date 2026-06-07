function adminAuth(req, res, next) {
  const pin = req.headers['x-admin-pin'];
  const adminPin = process.env.ADMIN_PIN || '1234';
  if (!pin || pin !== adminPin) {
    return res.status(401).json({ error: 'Invalid admin PIN' });
  }
  next();
}

module.exports = adminAuth;

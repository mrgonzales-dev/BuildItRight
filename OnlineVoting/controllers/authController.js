const authController = {
  verify(req, res) {
    try {
      const { pin } = req.body;
      if (!pin) {
        return res.status(400).json({ error: 'PIN is required' });
      }
      const adminPin = process.env.ADMIN_PIN || '1234';
      if (pin !== adminPin) {
        return res.status(401).json({ valid: false, error: 'Invalid PIN' });
      }
      res.json({ valid: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = authController;

module.exports = {
    homepage: async (req, res) => {
      try {
        res.json({ message: "welcome to homepage" });
      } catch (err) {
        return res.status(400).json({ error: "Internal Server Error" });
      }
    },
  };
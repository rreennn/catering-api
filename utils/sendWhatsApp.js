const axios = require("axios");

const sendWhatsApp = async (target, message) => {
  try {
    const response = await axios.post(
      "https://api.fonnte.com/send",
      {
        target,
        message,
      },
      {
        headers: {
          Authorization: process.env.FONNTE_TOKEN,
        },
      }
    );

    console.log("FONNTE RESPONSE:", response.data);
  } catch (err) {
    console.error("Fonnte error:", err.response?.data || err.message);
  }
};

module.exports = sendWhatsApp;
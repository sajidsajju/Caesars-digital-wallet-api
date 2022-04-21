const axios = require("axios");

const config = {
  headers: {
    "Content-Type": "application/json",
  },
};

exports.api = async (method, url, data) => {
  const response = await axios({
    method: `${method}`,
    url: `${url}`,
    data: data,
    headers: config,
  })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      throw err;
    });

  return response;
};

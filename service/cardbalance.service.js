const { api } = require("../Api");
const { PatronData } = require("../config");

GetCardholderProfile = async () => {
  try {
    const data = await api(
      "post",
      " https://ceapspan.slpuat.com/Transaction/test/GetCardholderProfile",
      PatronData
    );
    return data.Profile;
  } catch (err) {
    throw err;
  }
};

GetCardBalance = async () => {
  try {
    const data = await api(
      "post",
      "https://ceapspan.slpuat.com/Transaction/test/GetCardBalance",
      PatronData
    );

    return data;
  } catch (err) {
    throw err;
  }
};

exports.CardBalance = async () => {
  try {
    let response = { message: "", enrolled: false };

    const cardholderProfile = await GetCardholderProfile();

    if (cardholderProfile === null) {
      response.message = "Patron Not yet Enrolled";
      response.enrolled = false;
    } else {
      const cardBalance = await GetCardBalance();
      response.message = cardBalance.Balance;
      response.enrolled = true;
    }
    return response;
  } catch (err) {
    throw err;
  }
};

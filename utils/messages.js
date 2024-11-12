const moment = require("moment");
const formatMessage = (user, message) => {
  return {
    user,
    message,
    time: moment().format("LT"),
  };
};
module.exports = formatMessage;

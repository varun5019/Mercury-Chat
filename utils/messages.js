const { text } = require('express');
const moment = require('moment');
const { format } = require('path');

function formatMessage(name, text) {

  return {
    username:name,
    text:text,
    time: moment().format('h:mm a'),
  };
}

module.exports = formatMessage;


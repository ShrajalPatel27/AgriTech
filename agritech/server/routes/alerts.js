const PestAlert = require('../models/PestAlert');
const { adminWriteCrud } = require('../utils/crud');

module.exports = adminWriteCrud(PestAlert);

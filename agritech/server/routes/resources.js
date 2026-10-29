const Resource = require('../models/Resource');
const { adminWriteCrud } = require('../utils/crud');

module.exports = adminWriteCrud(Resource);

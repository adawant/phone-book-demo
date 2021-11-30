exports.ensureArray = (array) => array ? Array.isArray(array) ? array : [array] : [];
exports.sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

// this files helps to build paths relativ to the root of this project

var path = require('path');
var _root = __dirname;
function root(args) {
    args = Array.prototype.slice.call(arguments, 0);
    return path.join.apply(path, [_root].concat(args));
}
module.exports = root;
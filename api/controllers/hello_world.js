const util = require('util');

/*
  Functions in a127 controllers used for operations should take two parameters:

  Param 1: a handle to the request object
  Param 2: a handle to the response object
 */
function hello(req, res) {
    // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
    const name = req.swagger.params.name.value || 'stranger';
    const msg = util.format('Hello, %s!', name);

    // this sends back a JSON response which is a single string
    res.json(msg);
}

module.exports = {
    hello,
};

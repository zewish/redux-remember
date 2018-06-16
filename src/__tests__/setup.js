const sinon = require('sinon');

const chai = require('chai');
const sinonChai = require('sinon-chai');

global.sinon = sinon;
global.spy = sinon.spy;
global.expect = chai.expect;

chai
.use(sinonChai)
.should();

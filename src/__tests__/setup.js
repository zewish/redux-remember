const sinon = require('sinon');

const chai = require('chai');
const sinonChai = require('sinon-chai');

global.sinon = sinon;
global.spy = sinon.spy;

chai
.use(sinonChai)
.should();

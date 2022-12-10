import isDeepEqual from '../is-deep-equal.js';

const stringObj = new String('c');
const intObj = new Number(2161);
const floatObj = new Number(-273.15);
const boolObj = new Boolean(true);
const bigIntObjPos = BigInt(8675309);
const bigIntObjNeg = BigInt(-8675309);
const arrayObj = ['a', 42, 3.14, null];
const objectObj = { a: 1, b: 2 };
const dateObj = new Date('2000-01-01T00:00:00.000Z');
const errorObj = new Error('error object');
const functionObj = () => {
  return 42;
};
export const generatorObj = (function* () {
  yield 1;
  yield 'a';
  yield true;
})();
const mapObj = new Map([
  ['a', 1],
  ['b', 2],
]);
const promiseObj = new Promise(() => {});
const regexObj = new RegExp('[a-fd]', 'gi');
const setObj = new Set(['a', 'b']);
const symbolObj = Symbol('a symbol');

export const weakMapObj = new WeakMap();
export const weakMapObj2 = new WeakMap();
const wmObj1 = {};
const wmObj2 = () => {};
weakMapObj.set(wmObj1, 37);
weakMapObj.set(wmObj2, 'yay');
weakMapObj2.set(wmObj1, 37);
weakMapObj2.set(wmObj2, 'yay');

export const weakSetObj = new WeakSet();
export const weakSetObj2 = new WeakSet();
const wsObj1 = {};
const wsObj2 = {};
weakSetObj.add(wsObj1);
weakSetObj.add(wsObj2);
weakSetObj2.add(wsObj1);
weakSetObj2.add(wsObj2);

const arrayBuffer1 = new ArrayBuffer(16);
const arrayBuffer2 = new ArrayBuffer(32);
const dataView1 = new DataView(arrayBuffer1);
const dataView2 = new DataView(arrayBuffer2);
dataView1.setInt8(0, 66);
dataView2.setInt8(0, 67);

const int16ArrayObj1 = new Int16Array(21);
const int16ArrayObj2 = new Int16Array(31);
int16ArrayObj1.set([67, 68], 0);
int16ArrayObj2.set([68, 69, 70], 0);

const sameTypesData: any[] = [
  // strings
  [true, 'String', stringObj, stringObj],
  [false, 'String', new String('b'), stringObj],
  [true, 'String', 'c', 'c'],
  [false, 'String', 'd', 'e'],
  [true, 'String', '', ''],

  // integers
  [true, 'Integer', intObj, intObj],
  [true, 'Integer', 42, 42],
  [false, 'Integer', 43, 42],
  [true, 'Integer', -18, -18],
  [false, 'Integer', -19, -18],
  [true, 'Integer', 0, 0],
  [true, 'Integer', -0, 0],

  // floats
  [true, 'Float', floatObj, floatObj],
  [true, 'Float', 98.6, 98.6],
  [false, 'Float', 3.141592653589793, 3.141592653589794],

  // booleans
  [true, 'Boolean', boolObj, boolObj],
  [true, 'Boolean', false, false],

  // bigints
  [true, 'BigInt', bigIntObjPos, bigIntObjPos],
  [true, 'BigInt', 10n, 10n],
  [true, 'BigInt', bigIntObjNeg, bigIntObjNeg],
  [true, 'BigInt', -20n, -20n],

  // number-like
  [true, 'Number', NaN, NaN],
  [true, 'Number', Number.MAX_VALUE, Number.MAX_VALUE],
  [true, 'Number', Number.MIN_VALUE, Number.MIN_VALUE],
  [true, 'Number', Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY],
  [true, 'Number', Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY],

  // null
  [true, 'null', null, null],

  // arrays
  [true, 'Array', arrayObj, arrayObj],
  [true, 'Array', [], []],
  [false, 'Array', [1, 2, 3], [1, 2, 3, 4]],
  [false, 'Array', [1, 2, 3, 4, 5], [1, 2, 3, 4]],
  [false, 'Array', ['b', 42, 3.14, null], ['a', 42, 3.14, null]],
  [false, 'Array', [['c', ['d', ['e', ['f']]]]], [['d', [['g'], 'e']], 'c']],

  // objects
  [true, 'Object', objectObj, objectObj],
  [true, 'Object', {}, {}],
  [false, 'Object', { c: 3, d: 4 }, { c: 3, d: 4, e: 5 }],
  [false, 'Object', { c: 3, d: 4, e: 5, f: 6 }, { c: 3, d: 4, e: 5 }],
  [false, 'Object', { e: 5, f: 6 }, { e: 5, f: 7 }],
  [
    true,
    'Object',
    { g: 5, h: { i: [1, 2, 3], j: ['a', 'b', 'c'] } },
    { h: { j: ['a', 'b', 'c'], i: [1, 2, 3] }, g: 5 },
  ],
  [
    false,
    'Object',
    { k: { l: { m: [1, 2, { o: 'p' }] } } },
    { k: { l: { m: [1, 2, { o: 'q' }] } } },
  ],

  // dates
  [true, 'Date', dateObj, dateObj],
  [true, 'Date', new Date(), new Date()],

  // errors
  [true, 'Error', errorObj, errorObj],
  [false, 'Error', new Error('error 2'), new Error('error 2')],
  [false, 'Error', new TypeError('error'), new RangeError('error')],

  // functions
  [true, 'Function', functionObj, functionObj],
  [true, 'Function', generatorObj, generatorObj],
  [false, 'Function', () => {}, () => {}],
  [false, 'Function', () => 'a', () => 'b'],

  // maps
  [true, 'Map', mapObj, mapObj],
  [true, 'Map', new Map([]), new Map()],
  [false, 'Map', new Map([['d', 4]]), new Map([['e', 5]])],

  // promises
  [true, 'Promise', promiseObj, promiseObj],
  [false, 'Promise', Promise.resolve(true), Promise.resolve(true)],

  // regular expressions
  [true, 'RegularExpression', regexObj, regexObj],
  [true, 'RegularExpression', /\d+/g, /\d+/g],
  [false, 'RegularExpression', /[0-9]+/g, /[\d]+/g],

  // sets
  [true, 'Set', setObj, setObj],
  [true, 'Set', new Set(), new Set()],
  [true, 'Set', new Set([1, 2, 3]), new Set([1, 2, 3])],

  // undefined
  [true, 'undefined', undefined, undefined],

  // Array Buffers
  [true, 'ArrayBuffer', arrayBuffer1, arrayBuffer1],
  [false, 'ArrayBuffer', arrayBuffer2, arrayBuffer1],
  [true, 'ArrayBuffer', new ArrayBuffer(12), new ArrayBuffer(12)],
  [false, 'ArrayBuffer', new ArrayBuffer(32), new ArrayBuffer(16)],

  // Data Views
  [true, 'DavaView', dataView1, dataView1],
  [false, 'DavaView', dataView2, dataView1],
  [true, 'DavaView', new DataView(new ArrayBuffer(8)), new DataView(new ArrayBuffer(8))],
  [false, 'DavaView', new DataView(new ArrayBuffer(16)), new DataView(new ArrayBuffer(32))],

  // TypedArray
  [false, 'TypedArray', int16ArrayObj1, int16ArrayObj2],
  [true, 'TypedArray', Int8Array.from([0]), Int8Array.from([0])],
  [false, 'TypedArray', Int8Array.from([1]), Int8Array.from([2])],
  [true, 'TypedArray', Uint8Array.from([2]), Uint8Array.from([2])],
  [false, 'TypedArray', Uint8Array.from([3]), Uint8Array.from([4])],
  [true, 'TypedArray', Uint8ClampedArray.from([4]), Uint8ClampedArray.from([4])],
  [false, 'TypedArray', Uint8ClampedArray.from([5]), Uint8ClampedArray.from([6])],
  [true, 'TypedArray', Int16Array.from([6]), Int16Array.from([6])],
  [false, 'TypedArray', Int16Array.from([7]), Int16Array.from([8])],
  [true, 'TypedArray', Uint16Array.from([8]), Uint16Array.from([8])],
  [false, 'TypedArray', Uint16Array.from([9]), Uint16Array.from([10])],
  [true, 'TypedArray', Int32Array.from([10]), Int32Array.from([10])],
  [false, 'TypedArray', Int32Array.from([11]), Int32Array.from([12])],
  [true, 'TypedArray', Uint32Array.from([12]), Uint32Array.from([12])],
  [false, 'TypedArray', Uint32Array.from([13]), Uint32Array.from([14])],
  [true, 'TypedArray', Float32Array.from([14]), Float32Array.from([14])],
  [false, 'TypedArray', Float32Array.from([15]), Float32Array.from([16])],
  [true, 'TypedArray', Float64Array.from([16]), Float64Array.from([16])],
  [false, 'TypedArray', Float64Array.from([17]), Float64Array.from([18])],
];

const diffTypesData: any[] = [];
for (const ndxOuter in sameTypesData) {
  for (const ndxInner in sameTypesData) {
    if (ndxOuter !== ndxInner) {
      const type1 = sameTypesData[ndxOuter][1];
      const type2 = sameTypesData[ndxInner][1];
      const type = `${type1} vs ${type2}`;
      const a = sameTypesData[ndxOuter][2];
      const b = sameTypesData[ndxInner][2];

      diffTypesData.push([
        type1 === 'Integer' && type2 === 'Integer' && a === b,
        type,
        a,
        b
      ]);
    }
  }
}
sameTypesData.push(...diffTypesData);

describe('is-deep-equal.ts', () => {
  test.each(sameTypesData)('Should return %s for "%s" %p and %p', (
    expected: boolean,
    type: string,
    a: any,
    b: any
  ) => {
    expect(isDeepEqual(a, b)).toEqual(expected);
  });

  it('Returns false on first wrong key of Set', () => {
    expect(isDeepEqual(
      new Set(['one', 'two']),
      new Set(['one', 'wrong!'])
    )).toEqual(false);
  });

  it('Returns false on first wrong key of Map', () => {
    expect(isDeepEqual(
      new Map([['one', 1], ['two', 2]]),
      new Map([['one', 1], ['two', -1]])
    )).toEqual(false);
  });

  it('Symbol refs are the same', () => {
    expect(isDeepEqual(symbolObj, symbolObj)).toEqual(true);
  });

  it('Two Symbols are different', () => {
    expect(isDeepEqual(Symbol(), Symbol())).toEqual(false);
  });

  it('WeakMap refs are the same', () => {
    expect(isDeepEqual(weakMapObj, weakMapObj)).toEqual(true);
  });

  it('Two WeakMaps are different', () => {
    expect(isDeepEqual(weakMapObj, weakMapObj2)).toEqual(false);
  });

  it('WeakSet refs are the same', () => {
    expect(isDeepEqual(weakSetObj, weakSetObj)).toEqual(true);
  });

  it('Two WekSets are different', () => {
    expect(isDeepEqual(weakSetObj, weakSetObj2)).toEqual(false);
  });
});

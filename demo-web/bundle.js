(function (require$$0, reactRedux, toolkit, reduxRemember) {
  'use strict';

  var client = {};

  var m = require$$0;
  {
    var i = m.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
    client.createRoot = function (c, o) {
      i.usingClientEntryPoint = true;
      try {
        return m.createRoot(c, o);
      } finally {
        i.usingClientEntryPoint = false;
      }
    };
    client.hydrateRoot = function (c, h, o) {
      i.usingClientEntryPoint = true;
      try {
        return m.hydrateRoot(c, h, o);
      } finally {
        i.usingClientEntryPoint = false;
      }
    };
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }
    return obj;
  }

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      if (enumerableOnly) symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
      keys.push.apply(keys, symbols);
    }
    return keys;
  }
  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};
      if (i % 2) {
        ownKeys(Object(source), true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(Object(source)).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }
    return target;
  }

  var textToBePersisted = toolkit.createSlice({
    name: 'set-persisted-text',
    initialState: {
      text: ''
    },
    reducers: {
      setPersistedText: function setPersistedText(state, action) {
        state.text = action.payload;
      }
    }
  });
  var textToBeForgotten = toolkit.createSlice({
    name: 'set-forgotten-text',
    initialState: {
      text: ''
    },
    reducers: {
      setForgottenText: function setForgottenText(state, action) {
        state.text = action.payload;
      }
    }
  });
  var reducers = {
    textToBePersisted: textToBePersisted.reducer,
    textToBeForgotten: textToBeForgotten.reducer,
    someExtraData: function someExtraData() {
      var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'bla';
      return state;
    }
  };
  var actions = _objectSpread2(_objectSpread2({}, textToBePersisted.actions), textToBeForgotten.actions);

  var rememberedKeys = ['textToBePersisted'];
  var store = toolkit.configureStore({
    reducer: reduxRemember.rememberReducer(reducers),
    enhancers: [reduxRemember.rememberEnhancer(window.localStorage, rememberedKeys, {
      persistWholeStore: true
    })]
  });
  var useAppDispatch = reactRedux.useDispatch;
  var useAppSelector = reactRedux.useSelector;

  var _this = window,
    _jsxFileName$1 = "/Users/wish/Desktop/redux-remember/demo-web/src/App.tsx";
  var App = function App() {
    var textToBePersisted = useAppSelector(function (store) {
      return store.textToBePersisted.text;
    });
    var textToBeForgotten = useAppSelector(function (store) {
      return store.textToBeForgotten.text;
    });
    var dispatch = useAppDispatch();
    return /*#__PURE__*/React.createElement("div", {
      __self: _this,
      __source: {
        fileName: _jsxFileName$1,
        lineNumber: 10,
        columnNumber: 5
      }
    }, /*#__PURE__*/React.createElement("h1", {
      __self: _this,
      __source: {
        fileName: _jsxFileName$1,
        lineNumber: 11,
        columnNumber: 7
      }
    }, "redux-remember demo (uses window.localStorage)"), /*#__PURE__*/React.createElement("h2", {
      __self: _this,
      __source: {
        fileName: _jsxFileName$1,
        lineNumber: 12,
        columnNumber: 7
      }
    }, "Type something into the inputs and reload the page"), /*#__PURE__*/React.createElement("div", {
      __self: _this,
      __source: {
        fileName: _jsxFileName$1,
        lineNumber: 14,
        columnNumber: 7
      }
    }, /*#__PURE__*/React.createElement("label", {
      __self: _this,
      __source: {
        fileName: _jsxFileName$1,
        lineNumber: 15,
        columnNumber: 9
      }
    }, "I shall be remembered :)")), /*#__PURE__*/React.createElement("div", {
      __self: _this,
      __source: {
        fileName: _jsxFileName$1,
        lineNumber: 18,
        columnNumber: 7
      }
    }, /*#__PURE__*/React.createElement("input", {
      type: "text",
      value: textToBePersisted,
      onChange: function onChange(ev) {
        return dispatch(actions.setPersistedText(ev.target.value));
      },
      __self: _this,
      __source: {
        fileName: _jsxFileName$1,
        lineNumber: 19,
        columnNumber: 9
      }
    })), /*#__PURE__*/React.createElement("div", {
      __self: _this,
      __source: {
        fileName: _jsxFileName$1,
        lineNumber: 26,
        columnNumber: 7
      }
    }, /*#__PURE__*/React.createElement("label", {
      __self: _this,
      __source: {
        fileName: _jsxFileName$1,
        lineNumber: 27,
        columnNumber: 9
      }
    }, "I shall be forgotten :(")), /*#__PURE__*/React.createElement("div", {
      __self: _this,
      __source: {
        fileName: _jsxFileName$1,
        lineNumber: 30,
        columnNumber: 7
      }
    }, /*#__PURE__*/React.createElement("input", {
      type: "text",
      value: textToBeForgotten,
      onChange: function onChange(ev) {
        return dispatch(actions.setForgottenText(ev.target.value));
      },
      __self: _this,
      __source: {
        fileName: _jsxFileName$1,
        lineNumber: 31,
        columnNumber: 9
      }
    })), /*#__PURE__*/React.createElement("div", {
      className: "source-code",
      __self: _this,
      __source: {
        fileName: _jsxFileName$1,
        lineNumber: 38,
        columnNumber: 7
      }
    }, /*#__PURE__*/React.createElement("a", {
      href: "https://github.com/zewish/redux-remember/tree/master/demo-web/src",
      target: "_blank",
      rel: "noopener noreferrer nofollow",
      __self: _this,
      __source: {
        fileName: _jsxFileName$1,
        lineNumber: 39,
        columnNumber: 9
      }
    }, "[ See demo source ]")));
  };

  var _jsxFileName = "/Users/wish/Desktop/redux-remember/demo-web/src/index.tsx";
  var root = client.createRoot(document.getElementById('root'));
  root.render( /*#__PURE__*/React.createElement(reactRedux.Provider, {
    store: store,
    __self: window,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 11,
      columnNumber: 3
    }
  }, /*#__PURE__*/React.createElement(App, {
    __self: window,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 12,
      columnNumber: 5
    }
  })));

})(ReactDOM, ReactRedux, RTK, ReduxRemember);

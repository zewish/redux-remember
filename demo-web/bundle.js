(function (React, reactDom, reactRedux, redux, reduxRemember) {
    'use strict';

    React = React && React.hasOwnProperty('default') ? React['default'] : React;

    var SET_TEXT1 = 'SET_TEXT1';
    var SET_TEXT2 = 'SET_TEXT2';
    var setText1 = function setText1(text) {
      return {
        type: SET_TEXT1,
        payload: text
      };
    };
    var setText2 = function setText2(text) {
      return {
        type: SET_TEXT2,
        payload: text
      };
    };

    var textToBePersisted = function textToBePersisted() {
      var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

      var _ref = arguments.length > 1 ? arguments[1] : undefined,
          type = _ref.type,
          payload = _ref.payload;

      switch (type) {
        case SET_TEXT1:
          return payload;

        default:
          return state;
      }
    };

    var textToBeForgotten = function textToBeForgotten() {
      var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

      var _ref2 = arguments.length > 1 ? arguments[1] : undefined,
          type = _ref2.type,
          payload = _ref2.payload;

      switch (type) {
        case SET_TEXT2:
          return payload;

        default:
          return state;
      }
    };

    var reducers = {
      textToBePersisted: textToBePersisted,
      textToBeForgotten: textToBeForgotten,
      someData: function someData() {
        var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'bla';
        return state;
      }
    };

    var rememberedKeys = ['textToBePersisted'];
    var store = redux.createStore(reduxRemember.rememberReducer(redux.combineReducers(reducers)), {
      someData: 'asdf'
    }, redux.compose(redux.applyMiddleware(), reduxRemember.rememberEnhancer(window.localStorage, rememberedKeys)));

    var _jsxFileName = "/Users/wish/Desktop/redux-remember/demo-web/src/app.js";

    var App = function App(_ref) {
      var _ref$textToBePersiste = _ref.textToBePersisted,
          textToBePersisted = _ref$textToBePersiste === void 0 ? '' : _ref$textToBePersiste,
          _ref$textToBeForgotte = _ref.textToBeForgotten,
          textToBeForgotten = _ref$textToBeForgotte === void 0 ? '' : _ref$textToBeForgotte,
          setText1 = _ref.setText1,
          setText2 = _ref.setText2;
      return React.createElement("div", {
        __source: {
          fileName: _jsxFileName,
          lineNumber: 11
        },
        __self: this
      }, React.createElement("h1", {
        __source: {
          fileName: _jsxFileName,
          lineNumber: 12
        },
        __self: this
      }, "redux-remember demo (uses window.localStorage)"), React.createElement("h2", {
        __source: {
          fileName: _jsxFileName,
          lineNumber: 13
        },
        __self: this
      }, "Type something into the inputs and reload the page"), React.createElement("div", {
        __source: {
          fileName: _jsxFileName,
          lineNumber: 15
        },
        __self: this
      }, React.createElement("label", {
        __source: {
          fileName: _jsxFileName,
          lineNumber: 16
        },
        __self: this
      }, "I shall be remembered :)")), React.createElement("div", {
        __source: {
          fileName: _jsxFileName,
          lineNumber: 19
        },
        __self: this
      }, React.createElement("input", {
        type: "text",
        value: textToBePersisted,
        onChange: function onChange(ev) {
          return setText1(ev.target.value);
        },
        __source: {
          fileName: _jsxFileName,
          lineNumber: 20
        },
        __self: this
      })), React.createElement("div", {
        __source: {
          fileName: _jsxFileName,
          lineNumber: 27
        },
        __self: this
      }, React.createElement("label", {
        __source: {
          fileName: _jsxFileName,
          lineNumber: 28
        },
        __self: this
      }, "I shall be forgotten :(")), React.createElement("div", {
        __source: {
          fileName: _jsxFileName,
          lineNumber: 31
        },
        __self: this
      }, React.createElement("input", {
        type: "text",
        value: textToBeForgotten,
        onChange: function onChange(ev) {
          return setText2(ev.target.value);
        },
        __source: {
          fileName: _jsxFileName,
          lineNumber: 32
        },
        __self: this
      })), React.createElement("div", {
        className: "source-code",
        __source: {
          fileName: _jsxFileName,
          lineNumber: 39
        },
        __self: this
      }, React.createElement("a", {
        href: "https://github.com/zewish/redux-remember/tree/master/demo-web/src",
        target: "_blank",
        rel: "noopener noreferrer nofollow",
        __source: {
          fileName: _jsxFileName,
          lineNumber: 40
        },
        __self: this
      }, "[ See demo source ]")));
    };

    var App$1 = reactRedux.connect(function (_ref2) {
      var textToBePersisted = _ref2.textToBePersisted,
          textToBeForgotten = _ref2.textToBeForgotten;
      return {
        textToBePersisted: textToBePersisted,
        textToBeForgotten: textToBeForgotten
      };
    }, function (dispatch) {
      return {
        setText1: function setText1$1(text) {
          return dispatch(setText1(text));
        },
        setText2: function setText2$1(text) {
          return dispatch(setText2(text));
        }
      };
    })(App);

    var _jsxFileName$1 = "/Users/wish/Desktop/redux-remember/demo-web/src/index.js";
    reactDom.render(React.createElement(reactRedux.Provider, {
      store: store,
      __source: {
        fileName: _jsxFileName$1,
        lineNumber: 9
      },
      __self: undefined
    }, React.createElement(App$1, {
      __source: {
        fileName: _jsxFileName$1,
        lineNumber: 10
      },
      __self: undefined
    })), document.getElementById('root'));

}(React, ReactDOM, ReactRedux, Redux, ReduxRemember));

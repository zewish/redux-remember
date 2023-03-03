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
    someExtraData: function someExtraData(state) {
      if (state === void 0) {
        state = 'bla';
      }
      return state;
    }
  };
  var actions = Object.assign({}, textToBePersisted.actions, textToBeForgotten.actions);

  var rememberedKeys = ['textToBePersisted'];
  var reducer = reduxRemember.rememberReducer(reducers);
  var store = toolkit.configureStore({
    reducer: reducer,
    enhancers: [reduxRemember.rememberEnhancer(window.localStorage, rememberedKeys, {
      prefix: '@@rememebered-',
      persistWholeStore: true
    })]
  });
  var useAppDispatch = reactRedux.useDispatch;
  var useAppSelector = reactRedux.useSelector;

  var App = function App() {
    var textToBePersisted = useAppSelector(function (store) {
      return store.textToBePersisted.text;
    });
    var textToBeForgotten = useAppSelector(function (store) {
      return store.textToBeForgotten.text;
    });
    var dispatch = useAppDispatch();
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", null, "redux-remember demo (uses window.localStorage)"), /*#__PURE__*/React.createElement("h2", null, "Type something into the inputs and reload the page"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "I shall be remembered :)")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("input", {
      type: "text",
      value: textToBePersisted,
      onChange: function onChange(ev) {
        return dispatch(actions.setPersistedText(ev.target.value));
      }
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "I shall be forgotten :(")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("input", {
      type: "text",
      value: textToBeForgotten,
      onChange: function onChange(ev) {
        return dispatch(actions.setForgottenText(ev.target.value));
      }
    })), /*#__PURE__*/React.createElement("div", {
      className: "source-code"
    }, /*#__PURE__*/React.createElement("a", {
      href: "https://github.com/zewish/redux-remember/tree/master/demo-web/src",
      target: "_blank",
      rel: "noopener noreferrer nofollow"
    }, "[ See demo source ]")));
  };

  var root = client.createRoot(document.getElementById('root'));
  root.render( /*#__PURE__*/React.createElement(reactRedux.Provider, {
    store: store
  }, /*#__PURE__*/React.createElement(App, null)));

})(ReactDOM, ReactRedux, RTK, ReduxRemember);

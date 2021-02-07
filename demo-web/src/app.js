import React from 'react';
import { connect } from 'react-redux';
import { setText1, setText2 } from './store/actions';

const App = ({
  textToBePersisted = '',
  textToBeForgotten = '',
  setText1,
  setText2
}) => (
  <div>
    <h1>redux-remember demo (uses window.localStorage)</h1>
    <h2>Type something into the inputs and reload the page</h2>

    <div>
      <label>I shall be remembered :)</label>
    </div>

    <div>
      <input
        type="text"
        value={textToBePersisted}
        onChange={ev => setText1(ev.target.value)}
      />
    </div>

    <div>
      <label>I shall be forgotten :(</label>
    </div>

    <div>
      <input
        type="text"
        value={textToBeForgotten}
        onChange={ev => setText2(ev.target.value)}
      />
    </div>

    <div className="source-code">
      <a
        href="https://github.com/zewish/redux-remember/tree/master/demo-web/src"
        target="_blank"
        rel="noopener noreferrer nofollow"
      >
        [ See demo source ]
      </a>
    </div>
  </div>
);

export default connect(
  ({ textToBePersisted, textToBeForgotten }) => ({
    textToBePersisted, textToBeForgotten
  }),
  dispatch => ({
    setText1: text => dispatch(
      setText1(text)
    ),
    setText2: text => dispatch(
      setText2(text)
    )
  })
)(App);

import React from 'react';
import { connect } from 'react-redux';
import { setText1, setText2 } from './store/actions';

const App = ({
    text = '',
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
                value={text}
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
    </div>
);

export default connect(
    ({ text, textToBeForgotten }) => ({ text, textToBeForgotten }),
    dispatch => ({
        setText1: text => dispatch(
            setText1(text)
        ),
        setText2: text => dispatch(
            setText2(text)
        )
    })
)(App);

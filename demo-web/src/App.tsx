import React from 'react';
import { useAppDispatch, useAppSelector } from './store';
import { actions } from './store/reducers';

const App = () => {
  const textToBePersisted = useAppSelector((store) => store.textToBePersisted.text);
  const textToBeForgotten = useAppSelector((store) => store.textToBeForgotten.text);
  const dispatch = useAppDispatch();

  return (
    <div>
      <div>
        <img
          alt="redux-remember logo"
          src="https://raw.githubusercontent.com/zewish/redux-remember/master/logo.png"
        />
      </div>

      <p>
        <h1>redux-remember demo</h1>
        <h2>Type something into the inputs and reload the page</h2>
      </p>

      <div className="fields-wrapper">
        <div>
          <label>I shall be remembered :)</label>
        </div>

        <div>
          <input
            type="text"
            value={textToBePersisted}
            onChange={ev => dispatch(actions.setPersistedText(ev.target.value))}
          />
        </div>

        <div>
          <label>I shall be forgotten :(</label>
        </div>

        <div>
          <input
            type="text"
            value={textToBeForgotten}
            onChange={ev => dispatch(actions.setForgottenText(ev.target.value))}
          />
        </div>
      </div>

      <p>
        <a
          href="https://github.com/zewish/redux-remember/tree/master/demo-web/src"
          target="_blank"
          rel="noopener noreferrer nofollow"
        >
          [ See demo source ]
        </a>
      </p>
    </div>
  );
};

export default App;

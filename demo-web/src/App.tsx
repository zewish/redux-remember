import { useAppDispatch, useAppSelector } from './store';
import { actions } from './store/reducers';

const App = () => {
  const textToBePersisted = useAppSelector((store) => store.textToBePersisted.text);
  const textToBeForgotten = useAppSelector((store) => store.textToBeForgotten.text);
  const dispatch = useAppDispatch();

  return (
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
};

export default App;

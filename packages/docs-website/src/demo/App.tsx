import { actions, useAppDispatch, useAppSelector } from './store/index.ts';
import { styles } from './App.styles.ts';

const App = () => {
  const textToBePersisted = useAppSelector((store) => store.persisted.text);
  const textToBeForgotten = useAppSelector((store) => store.forgotten.text);
  const {
    isRehydrated,
    rehydratedDate,
    isPersisted,
    persistedDate
  } = useAppSelector((store) => store.reduxRemember);
  const dispatch = useAppDispatch();

  return (
    <>
      <div style={styles.row}>
        <img
          alt="Redux Remember logo"
          width={160}
          src="https://raw.githubusercontent.com/zewish/redux-remember/master/packages/docs-website/src/assets/logo-remember.webp"
        />
      </div>

      <div style={styles.row}>
        <label style={styles.label}>I shall be remembered :)</label>
        <input
          type="text"
          style={styles.input}
          value={textToBePersisted}
          onChange={ev => dispatch(actions.setPersistedText(ev.target.value))}
        />

        <label style={styles.label}>I shall be forgotten :(</label>
        <input
          type="text"
          style={styles.input}
          value={textToBeForgotten}
          onChange={ev => dispatch(actions.setForgottenText(ev.target.value))}
        />
      </div>

      <div style={styles.row}>
        <strong>Status</strong>
        <p style={styles.p}>
          Rehydrated:
          <strong>
            {(isRehydrated
              ? `✓ Yes (at ${rehydratedDate})`
              : '✗ Not yet'
            )}
          </strong>

          <br />Persisted:
          <strong>
            {(isPersisted
              ? ` ✓ Yes (at ${persistedDate})`
              : ' ✗ Not yet'
            )}
          </strong>
        </p>
      </div>
    </>
  );
};

export default App;

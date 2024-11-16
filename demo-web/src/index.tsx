import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './store';
import App from './App';
import RehydrateGate from './RehydrateGate';

const root = ReactDOM.createRoot(
  document.getElementById('root')!
);

root.render(
  <Provider store={store}>
    <RehydrateGate>
      <App />
    </RehydrateGate>
  </Provider>
);

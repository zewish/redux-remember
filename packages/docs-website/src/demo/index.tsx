import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './store/index.ts';
import App from './App.tsx';
import RehydrateGate from './RehydrateGate.tsx';

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

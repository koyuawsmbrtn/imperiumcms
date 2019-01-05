import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import 'bootstrap/dist/css/bootstrap.min.css';

//Never touch this class except if you know what you're doing!
ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();

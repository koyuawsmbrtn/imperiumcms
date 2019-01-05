import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

//This is the testing version of our app, so we see what it'll look like
//when we try to ignore everything. Don't use it at all or we will
//have a nuclear catastrophe.

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
  ReactDOM.unmountComponentAtNode(div);
});

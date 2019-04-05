import React from 'react';
import { render } from 'react-dom';

import { Provider } from 'react-redux';

import AppRoot from './app-root'
import store, { history } from './store'
import { ConnectedRouter } from 'connected-react-router'

import i18n from './i18n'
import { I18nextProvider } from 'react-i18next'

const appEl = document.querySelector('.frontend');
//appEl.classList.add(...styles.frontend.split(' '));
const rootEl = document.createElement('div');

import 'moment/locale/de'
import 'moment/locale/en-gb'


let renderApp = () => {
    render(
        (
            <Provider store={store}>
                <ConnectedRouter history={history}>
                    <I18nextProvider i18n={i18n}>
                        <AppRoot/>
                    </I18nextProvider>
                </ConnectedRouter>
            </Provider>
        ),
        rootEl
    );
};

/* Hot Replacement support, won't be bundled to production */
/* eslint-disable modules/no-exports-typo */
if (module.hot) {
  const renderAppHot = renderApp;

  renderApp = () => {
    renderAppHot();
  };

  module.hot.accept('./app-root', () => {
    setTimeout(renderApp);
  });
}

renderApp();
appEl.appendChild(rootEl);

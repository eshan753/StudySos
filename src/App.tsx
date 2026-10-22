/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HashRouter } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { AppRoutes } from './routes';

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <HashRouter>
          <AppRoutes />
        </HashRouter>
      </AppProvider>
    </ErrorBoundary>
  );
}

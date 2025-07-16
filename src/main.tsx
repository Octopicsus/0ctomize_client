import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { Provider } from 'react-redux'
import { store } from './store/store.ts'
import { BrowserRouter } from 'react-router'
import { createGlobalStyle } from 'styled-components'
import colors from './ui/colorsPalette.ts'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './ui/fonts.css'

const GlobalStyle = createGlobalStyle`
  :root {
    font-family: system-ui, Avenir, Helvetica, Arial, sans-serif;
    font-weight: 400;
    color-scheme: light dark;
    color: rgba(255, 255, 255, 0.87);
    background-color: ${colors.backgroundMain};
    font-synthesis: none;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

    ::-webkit-scrollbar {
    display: none;
  }

  * {
    margin: 0;
    padding: 0;
    text-decoration: none;
  }
`

createRoot(document.getElementById('root')!).render(
  <GoogleOAuthProvider
    clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ""}
    onScriptLoadError={() => {}}
    onScriptLoadSuccess={() => {}}
  >
    <Provider store={store}>
      <BrowserRouter>
        <GlobalStyle />
        <App />
      </BrowserRouter>
    </Provider>
  </GoogleOAuthProvider>
)
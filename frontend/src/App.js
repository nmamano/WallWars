import React, { useState } from "react";
import { BrowserRouter, Route, Redirect, Switch } from "react-router-dom";
import socketIoClient from "socket.io-client";
import { CookiesProvider } from "react-cookie";

import LobbyPage from "./lobby/LobbyPage";

const App = () => {
  const BACKEND_ENDPOINT =
    process.env.REACT_APP_BACKEND_URL || "localhost:4001";
  console.log(`connecting to backend at ${BACKEND_ENDPOINT}`);
  const [socket] = useState(socketIoClient(BACKEND_ENDPOINT));

  //every route redirects back to '/wallwars/index.html',
  //where the entire app exists as a single-page application
  return (
    <React.StrictMode>
      <CookiesProvider>
        <BrowserRouter>
          <Switch>
            <Route path="/wallwars/index.html" exact>
              <LobbyPage socket={socket} />
            </Route>
            <Redirect to="/wallwars/index.html" />
          </Switch>
        </BrowserRouter>
      </CookiesProvider>
    </React.StrictMode>
  );
};

export default App;

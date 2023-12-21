import { Redirect, Route } from "react-router-dom";
import { IonApp, IonRefresher, IonRefresherContent, IonRouterOutlet, IonSplitPane, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";

// import Home from "./pages/Home";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/* Theme variables */
import "./theme/variables.css";

import { Classes } from "./pages/classes";
import { Group } from "./pages/groups";
import { GlobalContextProvider, useGlobalContext } from "./context/globalContext";
import useSQLiteDB from "./composables/useSQLiteDB";
import Menu from "./components/Menu";



setupIonicReact();



const App: React.FC = () => {

  

  return (


    <IonApp>
      <GlobalContextProvider >

        <IonReactRouter>
          <IonSplitPane contentId="main">
            <Menu />
            <IonRouterOutlet id="main" >
              <Route exact path="/">
               <Classes />
              </Route>
              <Route exact path="/:group">
               <Group />
              </Route>
            </IonRouterOutlet>
          </IonSplitPane>
        </IonReactRouter>
      </GlobalContextProvider>
    </IonApp>

  );
};

export default App;

import { Route } from "react-router-dom";
import { IonApp, IonLoading, IonRouterOutlet, IonSplitPane, setupIonicReact } from "@ionic/react";
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
import { useGlobalContext } from "./context/globalContext";
import { Menu } from "./components/Menu";
import { Session } from "./pages/sessions";
import Auth from "./pages/auth";



setupIonicReact();



const App: React.FC = () => {



  const { isLoading: isloadingContext } = useGlobalContext()





  if (isloadingContext) return <>
    <IonLoading className="custom-loading" isOpen={true} spinner={'bubbles'} message="Loading" duration={2000} />
  </>

  return (
    <IonApp>
      <IonReactRouter>
        <IonSplitPane contentId="main">
          <Menu />
          <IonRouterOutlet id="main"  >
            <Route path="/" exact={true} >
              <Classes />
            </Route>
            <Route path="/sessions" exact={true} >
              <Session />
            </Route>
            <Route path="/auth" exact={true} >
              <Auth />
            </Route>
          </IonRouterOutlet>
        </IonSplitPane>
      </IonReactRouter>

    </IonApp>

  );
};

export default App;

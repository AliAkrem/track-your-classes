import {
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenu,
  IonMenuToggle,
  IonNote,
} from '@ionic/react';

import { useLocation } from 'react-router-dom';
import { archiveOutline, archiveSharp, bookmarkOutline, heartOutline, heartSharp, mailOutline, mailSharp, paperPlaneOutline, paperPlaneSharp, schoolOutline, trashOutline, trashSharp, warningOutline, warningSharp } from 'ionicons/icons';
import './Menu.css';
import { useEffect, useState } from 'react';

interface AppPage {
  url: string;
  iosIcon: string;
  mdIcon: string;
  title: string;
}

const appPages: AppPage[] = [
  {
    title: 'Classes',
    url: '/classes',
    iosIcon: schoolOutline,
    mdIcon: schoolOutline
  },
  // {
  //   title: 'students',
  //   url: '/Outbox',
  //   iosIcon: paperPlaneOutline,
  //   mdIcon: paperPlaneSharp
  // },
  // {
  //   title: 'calender',
  //   url: '/calender',
  //   iosIcon: heartOutline,
  //   mdIcon: heartSharp
  // },

];



const Menu: React.FC = () => {
  const location = useLocation();

  const [page, setPage] = useState("")


  useEffect(() => {

    appPages.map((appPage, index) => {
        if(location.pathname === appPage.url)
          setPage(appPage.title)
     } )


  }, [location.pathname])
  


  return (
    <IonMenu    contentId="main" type="reveal">
      <IonContent>
        <IonList id="inbox-list">
          {/* <IonListHeader>{page}</IonListHeader> */}
          {appPages.map((appPage, index) => {
            return (
              <IonMenuToggle key={index} autoHide={false}>
                <IonItem className={location.pathname === appPage.url ? 'selected' : ''} href={appPage.url} routerDirection="none" lines="none" detail={false}>
                  <IonIcon aria-hidden="true" slot="start" ios={appPage.iosIcon} md={appPage.mdIcon} />
                  <IonLabel>{appPage.title}</IonLabel>
                </IonItem>
              </IonMenuToggle>
            );
          })}
        </IonList>

      </IonContent>
    </IonMenu>
  );
};

export default Menu;

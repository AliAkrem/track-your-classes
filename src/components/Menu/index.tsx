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
  IonSelect,
  IonSelectOption,
} from '@ionic/react';

import { useLocation } from 'react-router-dom';
import { archiveOutline, archiveSharp, bookmarkOutline, calendar, heartOutline, heartSharp, leaf, mailOutline, mailSharp, paperPlaneOutline, paperPlaneSharp, schoolOutline, trashOutline, trashSharp, warningOutline, warningSharp } from 'ionicons/icons';
import './Menu.css';
import { useEffect, useState } from 'react';
import useSQLiteDB from '../../composables/useSQLiteDB';
import { SQLiteDBConnection } from '@capacitor-community/sqlite';
import { nanoid } from 'nanoid';
import { useGlobalContext } from '../../context/globalContext';

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
  const _location = useLocation();

  const [page, setPage] = useState("")


  
  const {years, setYears, year, setYear, setRevalidate} = useGlobalContext()



  const { initialized, performSQLAction } = useSQLiteDB()

  useEffect(() => {

    appPages.map((appPage, index) => {
      if (_location.pathname === appPage.url)
        setPage(appPage.title)
    })

  }, [_location.pathname])


  useEffect(() => {

    setRevalidate(Math.random())
    
  }, [year])
  






  const CHANGE_SELECTED_YEARS = async (year_id : number ) => {
    try {
      await performSQLAction(async (db: SQLiteDBConnection | undefined) => {
  
          await db?.query(`
          UPDATE Keys SET selected_year_id = ? WHERE selected_year_id = ? ;
          `, [year_id,year])
          setYear(year_id)

      })
      setRevalidate(Math.random)

    } catch (error) {
      alert((error as Error).message);
    }

  };



  const YearsOptions = years?.map((year) => {
    return (<IonSelectOption key={year.scholar_year_id} value={String(year.scholar_year_id)}>{year.year}</IonSelectOption>
    )
  })

  const handleYearChange = async (ev: any) => {

    await CHANGE_SELECTED_YEARS(Number(ev.detail.value))


  }

  return (
    <IonMenu contentId="main" type="reveal">
      <IonContent>
        <IonList id="inbox-list">
          {/* <IonListHeader>{page}</IonListHeader> */}

          <IonItem style={{ padding: "20px 0 " }} >
            <IonIcon slot="start" icon={calendar} aria-hidden="true"></IonIcon>
            <IonSelect onIonChange={()=>{handleYearChange}} labelPlacement='stacked' label={"year scholar"} value={String(year)}  >
              {YearsOptions}
            </IonSelect>




          </IonItem>
          {appPages.map((appPage, index) => {
            return (
              <IonMenuToggle key={index} autoHide={false}>
                <IonItem className={location.pathname === appPage.url ? 'selected' : ''} routerLink={appPage.url} routerDirection="none" lines="none" detail={false}>
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

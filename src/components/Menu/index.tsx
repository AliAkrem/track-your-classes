import {
  IonButton,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonMenu,
  IonMenuToggle,
  IonSelect,
  IonSelectOption,

} from '@ionic/react';

import { add, calendar, calendarClear, eye, lockClosed, person, schoolOutline } from 'ionicons/icons';
import './Menu.css';
import { useRef, useState } from 'react';
import useSQLiteDB from '../../composables/useSQLiteDB';
import { SQLiteDBConnection } from '@capacitor-community/sqlite';
import { useGlobalContext } from '../../context/globalContext';
import { useLocation } from 'react-router';

interface AppPage {
  url: string;
  iosIcon: string;
  mdIcon: string;
  title: string;
}

const appPages: AppPage[] = [
  {
    title: 'Classes',
    url: '/',
    iosIcon: schoolOutline,
    mdIcon: schoolOutline
  },

  {
    title: 'Calendar',
    url: '/calendar',
    iosIcon: calendar,
    mdIcon: calendar
  },
  {
    title: 'Account',
    url: '/auth',
    iosIcon: person,
    mdIcon: person
  },

];






export const Menu: React.FC = () => {



  const [page, setPage] = useState("")

  const { counter, setCounter, year, years, setYear, setRevalidate, isLoading } = useGlobalContext()



  const { performSQLAction } = useSQLiteDB()











  const CHANGE_SELECTED_YEARS = async (new_year: string ) => {
    try {
      await performSQLAction(async (db: SQLiteDBConnection | undefined) => {

        await db?.query(`
          UPDATE Keys SET selected_year = ? WHERE selected_year = ? ;
          `, [new_year, year])
        setYear(new_year)

      })
      setRevalidate(Math.random)

    } catch (error) {
      alert((error as Error).message);
    }

  };


  

  // ? fixme select year group by classes 
  const YearsOptions = years?.map((year) => {
    return (<IonSelectOption key={year.collage_year} value={String(year.collage_year)}>{year.collage_year}</IonSelectOption>
    )
  })

  const selectOptionYear = useRef<HTMLIonSelectElement | null>(null)
  const handleYearChange = async (ev: any) => {



    await CHANGE_SELECTED_YEARS(String(ev.detail.value))


  }


  const location  = useLocation()










  if (isLoading) return null;





  return (


    <IonMenu contentId="main" type="reveal">
      <IonContent>
        <IonList id="inbox-list">
          {/* <IonListHeader>{page}</IonListHeader> */}


          {years.length > 0 ?
            <IonItem style={{ padding: "10px 0 " }} >
              <IonIcon slot="start" icon={calendar} size='small' aria-hidden="true"></IonIcon>
              <IonSelect ref={selectOptionYear} interface="popover" onIonChange={handleYearChange} labelPlacement='stacked' label={"year scholar"} value={String(year)}  >
                {YearsOptions}
              </IonSelect>
            </IonItem>
            : null
          }

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

import {
  IonButton,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonMenu,
  IonMenuButton,
  IonMenuToggle,
  IonSelect,
  IonSelectOption,
  IonToggle,
  ToggleCustomEvent,

} from '@ionic/react';

import { calendar, moon, moonOutline, moonSharp, person, schoolOutline, sunny, sunnyOutline, sunnySharp } from 'ionicons/icons';
import './Menu.css';
import { useEffect, useRef, useState } from 'react';
import useSQLiteDB from '../../composables/useSQLiteDB';
import { SQLiteDBConnection } from '@capacitor-community/sqlite';
import { useGlobalContext } from '../../context/globalContext';
import { useLocation } from 'react-router';
import { Icon } from 'ionicons/dist/types/components/icon/icon';
import { Preferences } from '@capacitor/preferences';




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
    title: 'Sessions',
    url: '/sessions',
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


export const setTheme = async (theme: string) => {
  if (theme) {
    await Preferences.set({
      key: 'theme',
      value: theme,
    });
  }
};

export const getTheme = async () => {

  const { value } = await Preferences.get({ key: 'theme' });

  return value

};





export const Menu: React.FC = () => {




  const { year, years, setYear, setRevalidate, isLoading } = useGlobalContext()



  const { performSQLAction } = useSQLiteDB()


  const [themeToggle, setThemeToggle] = useState(false);

  // Listen for the toggle check/uncheck to toggle the dark theme
  const toggleChange = () => {

    toggleDarkTheme(!themeToggle);

    setThemeToggle(!themeToggle)

    if (!themeToggle)
      setTheme('dark')
    else
      setTheme('light')


  };

  // Add or remove the "dark" class on the document body
  const toggleDarkTheme = (shouldAdd: boolean) => {
    document.body.classList.toggle('dark', shouldAdd);
  };

  // Check/uncheck the toggle and update the theme based on isDark
  const initializeDarkTheme = (isDark: boolean) => {
    setThemeToggle(isDark);
    toggleDarkTheme(isDark);
  };

  useEffect(() => {

    // Use matchMedia to check the user preference
    // const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

    getTheme().then(res => {

      if (res) {
        if (res === 'dark')
          initializeDarkTheme(true);
        else {
          initializeDarkTheme(false);
        }
      } else {

        setTheme('light').then(() => {
          initializeDarkTheme(false);
        })

      }


    })





    // Initialize the dark theme based on the initial
    // value of the prefers-color-scheme media query



    // Listen for changes to the prefers-color-scheme media query
    // prefersDark.addEventListener('change', (mediaQuery) => initializeDarkTheme(mediaQuery.matches));
  }, []);








  const CHANGE_SELECTED_YEARS = async (new_year: string) => {
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





  const YearsOptions = years?.map((year) => {

    return (<IonSelectOption key={year.collage_year} value={String(year.collage_year)}>{year.collage_year}</IonSelectOption>
    )
  })



  const selectOptionYear = useRef<HTMLIonSelectElement | null>(null)
  const handleYearChange = async (ev: any) => {



    await CHANGE_SELECTED_YEARS(String(ev.detail.value))


  }


  const location = useLocation()










  if (isLoading) return null;





  return (


    <IonMenu contentId="main" type="reveal">
      <IonContent>
        <IonList id="inbox-list">
          {/* <IonListHeader>{page}</IonListHeader> */}

          <IonItem>
            {/* checked={themeToggle} */}
            <IonButton fill='default' size='default' onClick={toggleChange}  >
              <IonIcon icon={!themeToggle ? moonSharp : sunnySharp} color='white'  ></IonIcon>
            </IonButton>


          </IonItem>
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

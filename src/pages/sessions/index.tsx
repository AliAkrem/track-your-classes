import { IonButtons, IonChip, IonContent, IonDatetime, IonDatetimeButton, IonFab, IonFabButton, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonMenuButton, IonModal, IonPage, IonTitle, IonToolbar } from '@ionic/react'
import { add, calendar, closeCircle } from 'ionicons/icons'
import { GroupSQL, SQLClass, Students, useGlobalContext } from '../../context/globalContext'
import { useEffect, useState } from 'react'
import { CreateSession } from '../../components/createSession'
import Calendar from '../../components/calendar'
import SessionsList from '../../components/sessionsList'
import useSQLiteDB from '../../composables/useSQLiteDB'
import { SQLiteDBConnection } from '@capacitor-community/sqlite'


export type ClassGroup = {

    group: GroupSQL
    class: SQLClass


}




export type SessionData = {
    group_number: number

    group_type: string

    level_year: number

    module_name: string

    session_date: string

    session_id: number

    specialty_level: string

    specialty_name: string
}






export const Session = () => {

    const { year } = useGlobalContext()

    const { performSQLAction, initialized } = useSQLiteDB()


    const [openCreateSessionModal, setOpenCreateSessionModal] = useState(false)


    const fetchDistinctSessionDates = async () => {

        try {
            await performSQLAction(async (db: SQLiteDBConnection | undefined) => {
                const result = await db?.query(`
                    SELECT *
                    FROM attendance;
                `);

                console.log(result?.values)

                // Process the result (assuming 'result' is an array of rows)
                console.log(result);
            });
        } catch (error) {
            alert(error);
        }
    };



    const [sessionsData, setSessionsData] = useState<SessionData[] | []>([])


    const [selectedDate, setSelectedDate] = useState(() => { return new Date().toISOString().slice(0, 19) })





    useEffect(() => {
        // fetchDistinctSessionDates()


        fetchSessionsByDate(selectedDate)

        

    }, [selectedDate, initialized])






    const fetchSessionsByDate = async (inputDate: string) => {
        // 2023-12-20T14:13:00

        const new_date = new Date(inputDate)

        const day = new_date.getDate().toString().padStart(2, '0');
        const month = (new_date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
        const year = new_date.getFullYear();
        const formattedDate = `${day}-${month}-${year}`;

        try {
            await performSQLAction(async (db: SQLiteDBConnection | undefined) => {


                await db?.query(`
                        SELECT 
                        sp.session_id,
                        sp.session_date,
                            c.module_name,  
                            g.group_number,
                            g.group_type,
                            c.specialty_name,
                            c.specialty_level,
                            c.level_year
                        FROM 
                            session_presence sp
                        JOIN 
                            Groupp g ON sp.group_id = g.group_id
                        JOIN 
                            class  c ON g.class_id = c.class_id 
                      WHERE    STRFTIME('%d-%m-%Y', sp.session_date) = ? ;
                    `,
                    [formattedDate]
                ).then((res) => {


                    if (res)
                        setSessionsData(res.values as SessionData[])
                    else {
                        setSessionsData([])
                    }


                }).catch((err) => {

                    console.log(err)

                })


                // Process the result (assuming 'result' is an array of rows)
            });
        } catch (error) {
            alert((error as Error).message);
        }
    };










    return (

        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonMenuButton />
                    </IonButtons>
                    <IonTitle size="small" >
                        {year &&
                            <IonChip color={"success"} >
                                <IonIcon icon={calendar}></IonIcon>
                                <IonLabel>{String(year)}</IonLabel>
                            </IonChip>
                        }
                    </IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen >





                <Calendar selectedDate={selectedDate} setSelectedDate={setSelectedDate} />



                {selectedDate !== "" && sessionsData.length > 0 ? <SessionsList sessionData={sessionsData} selectedDate={selectedDate} /> : null}

                {openCreateSessionModal ? <CreateSession isOpen={openCreateSessionModal} close={setOpenCreateSessionModal} /> : null}

            </IonContent>
            <IonFab vertical="top" horizontal="end">
                <IonFabButton id="create-class-modal" onClick={() => { setOpenCreateSessionModal(!openCreateSessionModal) }}  >
                    <IonIcon icon={add}></IonIcon>
                </IonFabButton>
            </IonFab>

        </IonPage>

    )
}

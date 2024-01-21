import { IonButtons, IonChip, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonLabel, IonLoading, IonMenuButton, IonPage, IonSpinner, IonTitle, IonToolbar } from '@ionic/react'
import { add, calendar } from 'ionicons/icons'
import { GroupSQL, SQLClass, useGlobalContext } from '../../context/globalContext'
import { Suspense, lazy, useEffect, useState } from 'react'




const CreateSession = lazy(() => import('../../components/createSession'))


// const Calendar = lazy(() => import('../../components/calendar'))




const SessionsList = lazy(() => import('../../components/sessionsList'))



import { SQLiteDBConnection } from '@capacitor-community/sqlite'

import useSQLiteDB from '../../composables/useSQLiteDB'
import { exportJsonToXlsx } from '../../composables/exportSessionDataXSLX'
import Calendar from '../../components/calendar'







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

    const { year, setRevalidate, revalidate } = useGlobalContext()

    const { performSQLAction, initialized } = useSQLiteDB()


    const [openCreateSessionModal, setOpenCreateSessionModal] = useState(false)




    const [sessionsData, setSessionsData] = useState<SessionData[] | []>([])


    const [selectedDate, setSelectedDate] = useState(() => { return new Date().toISOString().slice(0, 19) })



    const [revalidateSessionsList, setRevalidateSessionsList] = useState(0)


    useEffect(() => {

        fetchSessionsByDate(selectedDate)

    }, [selectedDate, initialized, revalidateSessionsList, revalidate])






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



    const export_session = async (session: SessionData) => {


        try {
            await performSQLAction(async (db: SQLiteDBConnection | undefined) => {

                await db?.query(`
                    SELECT
                        s.student_code as N  ,
                        s.first_name,
                        s.last_name,
                        a.state
                    FROM
                        attendance a
                    JOIN
                        student s ON a.student_id = s.student_id
                    WHERE
                        a.session_id = ?;
        ` , [session.session_id]).then(async (res) => {

                    if (res.values) {

                        console.log('export to xlsx called')
                        await exportJsonToXlsx(res.values, [{
                            scholar_year: year,
                            class_name: session.module_name,
                            specialty: session.specialty_name,
                            specialty_level: session.specialty_level,
                            specialty_level_year: session.level_year,
                            group_type: session.group_type,
                            group_number: session.group_number,
                        }]).catch(() => {


                        }

                        ).then(() => {



                        })


                    }



                }).catch(err => {
                    alert(err);
                    console.log('export to xlsx error')

                });




            }).catch(
                () => {
                    console.log('error preform SQL action')
                }
            )

                ;
        } catch (error) {
            console.log('export to xlsx error 2 ');
            alert((error as Error).message);
        }
    };



    const delete_session = async (sessionId: number) => {
        try {
            await performSQLAction(async (db: SQLiteDBConnection | undefined) => {
                await db?.query(
                    'DELETE FROM session_presence WHERE session_id = ?',
                    [sessionId]
                ).catch((err) => {

                });


            }, async () => {
                setRevalidate(Math.random())
                setRevalidateSessionsList(Math.random())
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




                {/* <Suspense > */}
                    <Calendar setSelectedDate={setSelectedDate} />
                {/* </Suspense> */}


                <Suspense >
                    {selectedDate !== "" && sessionsData.length > 0 ? <SessionsList delete_session={delete_session} export_session={export_session} setRevalidateSessionsList={setRevalidateSessionsList} sessionData={sessionsData} />
                        : null
                    }
                </Suspense>


                <Suspense >
                    {openCreateSessionModal ? <CreateSession setRevalidateSessionsList={setRevalidateSessionsList} isOpen={openCreateSessionModal} close={setOpenCreateSessionModal} /> : null}
                </Suspense>
            </IonContent>


            <IonFab vertical="top" horizontal="end">
                <IonFabButton id="create-class-modal" onClick={() => { setOpenCreateSessionModal(!openCreateSessionModal) }}  >
                    <IonIcon icon={add}></IonIcon>
                </IonFabButton>
            </IonFab>

        </IonPage>

    )
}

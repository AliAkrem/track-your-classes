import { IonChip, IonIcon, IonItem, IonLabel, IonLoading, IonSelect, IonSelectOption, IonSpinner } from "@ionic/react";
import { ellipsisVertical } from "ionicons/icons";
import { UpdateSession } from "../updateSession";
import { useRef, useState } from "react";
import useConfirmationAlert from "../../composables/useConfirmationAlert";
import { ViewSession } from "../viewSession";
import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import useSQLiteDB from "../../composables/useSQLiteDB";
import { SessionData } from "src/pages/sessions";
import { nanoid } from "nanoid";
import { useGlobalContext } from "../../context/globalContext";
import { exportJsonToXlsx } from "../../composables/exportSessionDataXSLX";


type Props = {
    sessionData: SessionData[]
    setRevalidateSessionsList: React.Dispatch<React.SetStateAction<number>>
}


export const formatDateTime = (dateTime: string): string => {
    const dateObj = new Date(dateTime);

    if (isNaN(dateObj.getTime())) {
        // If parsing as-is fails, try replacing 'T' with a space and parse again
        const correctedDateTimeString = dateTime.replace('T', ' ');
        return formatDateTime(correctedDateTimeString);
    }

    const hours = dateObj.getHours().toString().padStart(2, '0');
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');

    return `${hours}:${minutes}`;
}



export default function SessionsList({ sessionData, setRevalidateSessionsList }: Props) {


    const [updateSessionModalOpened, setUpdateSetSessionModalOpened] = useState(false)

    const [viewSessionModalOpened, setViewSetSessionModalOpened] = useState(false)

    const { setRevalidate } = useGlobalContext()

    const [selectedSessionId, setSelectedSessionId] = useState<number | undefined>(undefined)

    const sessionOptionRef = useRef<HTMLIonSelectElement | null>(null)



    const { ConfirmationAlert, showConfirmationAlert } = useConfirmationAlert()


    const [selectedSessionDate, setSelectedSessionDate] = useState("")



    const handleOpenUpdateSessionModal = (session_id: number, session_date: string) => {



        setSelectedSessionId(session_id)
        setSelectedSessionDate(session_date)
        setUpdateSetSessionModalOpened(true)



    }

    const handleOpenViewSessionModal = (session_id: number,) => {
        setViewSetSessionModalOpened(true)
        setSelectedSessionId(session_id)
    }



    const handleSessionOption = async (e: any, session: SessionData) => {

        e.preventDefault()

        if (e.detail.value === "edit") {

            handleOpenUpdateSessionModal(session.session_id, session.session_date)


        }
        else if (e.detail.value === "delete") {

            showConfirmationAlert("are you sure you want to delete this session!", () => {

                delete_session(session.session_id)

            })

        } else if (e.detail.value === "exportToXLSX") {

            console.log('exportToXLSX')

            await export_session(session)




        }


        if (sessionOptionRef.current) {
            sessionOptionRef.current.value = "";
        }

    }

    const { performSQLAction } = useSQLiteDB()


    const delete_session = async (sessionId: number) => {
        try {
            performSQLAction(async (db: SQLiteDBConnection | undefined) => {
                await db?.query(
                    'DELETE FROM session_presence WHERE session_id = ?',
                    [sessionId]
                ).catch((err) => {
                    console.log(err)
                })
                    ;
            }, async () => {
                setRevalidate(Math.random())
                setRevalidateSessionsList(Math.random())
            });
        } catch (error) {
            alert((error as Error).message);
        }
    };


    const export_session = async (session: SessionData) => {
        try {
            performSQLAction(async (db: SQLiteDBConnection | undefined) => {

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
        ` , [session.session_id]).then(async ({ values: sessionPresence }) => {

                    if (sessionPresence) {
                        console.log(sessionPresence)

                       await exportJsonToXlsx(sessionPresence, [{
                            class_name: session.module_name,
                            specialty: session.specialty_name,
                            specialty_level: session.specialty_level,
                            specialty_level_year: session.level_year,
                            group_type: session.group_type,
                            group_number: session.group_number,
                        }])


                    }
                }).catch(err => {
                    console.log(err)
                });




            });
        } catch (error) {
            alert((error as Error).message);
        }
    };



    const displaySessions =  sessionData  ?  sessionData.map(session => {

        const timePart = formatDateTime(session.session_date)

        return (

            <IonItem key={nanoid()}  >
                <IonLabel style={{ display: 'flex', alignItems: 'center' }} >



                    <IonChip
                        style={{ width: '100%' }}
                    >
                        <div style={{
                            display: 'flex', width: '100%', justifyContent: 'space-between',
                            alignItems: 'center'
                        }} >

                            <div style={{ width: '80%' }} onClick={() => { handleOpenViewSessionModal(session.session_id) }}  >
                                <IonLabel className="ion-text-wrap" >
                                    {session.module_name + " " + session.specialty_name + " " + session.specialty_level + session.level_year} group {session.group_number + " " + session.group_type}
                                    <IonChip><IonLabel>{timePart}</IonLabel></IonChip>

                                </IonLabel>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'end', margin: '0', padding: '0px 0px' }}   >
                                <IonChip >
                                    <IonSelect
                                        style={{ border: '', width: '0', height: '0', padding: '0', margin: '0' }}
                                        // toggleIcon={ellipsisVertical}
                                        ref={sessionOptionRef}
                                        interface="popover"
                                        // aria-label=""
                                        onIonChange={(e) => { handleSessionOption(e, session) }}

                                    >
                                        <IonSelectOption value="exportToXLSX">export to .xlsx</IonSelectOption>
                                        <IonSelectOption value="edit">edit</IonSelectOption>
                                        <IonSelectOption value="delete">delete</IonSelectOption>
                                    </IonSelect>
                                    <IonIcon icon={ellipsisVertical} />


                                </IonChip>
                            </div>

                        </div>



                    </IonChip>
                </IonLabel>
            </IonItem>

        )

    }) :    <IonSpinner   duration={2000} /> 






    return (

        <>


            {displaySessions}

            <UpdateSession setRevalidateSessionsList={setRevalidateSessionsList} isOpen={updateSessionModalOpened} close={setUpdateSetSessionModalOpened} session_id={selectedSessionId}
                selectedDate={selectedSessionDate}

            />



            {selectedSessionId != undefined && viewSessionModalOpened == true ? <ViewSession

                session_id={selectedSessionId}

                isOpen={viewSessionModalOpened}

                close={setViewSetSessionModalOpened}


            /> : null  }

            {ConfirmationAlert}
        </>
    )
}


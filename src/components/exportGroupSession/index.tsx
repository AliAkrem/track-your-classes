import { IonButton, IonChip, IonContent, IonDatetime, IonDatetimeButton, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonModal, IonSelect, IonSelectOption, IonSpinner, IonTitle, IonToast, IonToolbar } from '@ionic/react'
import { useRef, useState } from 'react'
import { formatDateTime } from '../sessionsList'
import { nanoid } from 'nanoid'
import { chevronBack, ellipsisVertical } from 'ionicons/icons'
import useConfirmationAlert from '../../composables/useConfirmationAlert'
import { ViewSession } from '../viewSession'
import { exportJsonToXlsx } from '../../composables/exportSessionDataXSLX'
import { useGlobalContext } from '../../context/globalContext'
import useSQLiteDB from '../../composables/useSQLiteDB'
import { SQLiteDBConnection } from '@capacitor-community/sqlite'
import { session } from 'grammy'
import { Capacitor } from '@capacitor/core'

type rangeDate = {
    start: string,
    end: string
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

type props = {
    sessionsData: [] | SessionData[]
    isOpen: boolean,
    close: React.Dispatch<React.SetStateAction<boolean>>
    range: rangeDate
    setRange: React.Dispatch<React.SetStateAction<rangeDate>>
    group_id: number
}




export default function ExportSessionGroupModal({ group_id, sessionsData, close, isOpen, range, setRange }: props) {


    const sessionOptionRef = useRef<HTMLIonSelectElement | null>(null)


    const { ConfirmationAlert, showConfirmationAlert } = useConfirmationAlert()




    const handleSessionOption = async (e: any, session: SessionData) => {

        e.preventDefault()

        if (e.detail.value === "exportToXLSX") {


            showConfirmationAlert("are you sure you want to export this session", () => {

                export_session(session) // export one session

            })



        }


        if (sessionOptionRef.current) {
            sessionOptionRef.current.value = "";
        }

    }


    const [selectedSessionId, setSelectedSessionId] = useState<number | undefined>(undefined)
    const [viewSessionModalOpened, setViewSetSessionModalOpened] = useState(false)

    const { year } = useGlobalContext()

    const { performSQLAction } = useSQLiteDB();


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

                        if (res.values?.length > 0) {


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

                                setToast(true)

                            })

                        } else {
                            console.log('res values is empty')
                        }

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

    const export_session_in_range = async () => {
        try {

            const selectColumns = sessionsData.map((date, index) => {

                console.log(date.session_date.replaceAll("-", "_").replaceAll(':', "_").slice(0, 16))

                return `MAX(CASE WHEN sp.session_date = '${date.session_date}' THEN a.state ELSE NULL END) AS date_${date.session_date.replaceAll("-", "_").replaceAll(':', "_").slice(0, 16)}`;
            }).join(', ');


            await performSQLAction(async (db: SQLiteDBConnection | undefined) => {

                await db?.query(`
                SELECT
                    s.student_code AS N,
                    s.first_name,
                    s.last_name,
                    ${selectColumns}
                FROM
                    student s
                JOIN
                    group_student gs ON s.student_id = gs.student_id
                JOIN
                    Groupp g ON gs.group_id = g.group_id
                JOIN
                    session_presence sp ON g.group_id = sp.group_id
                LEFT JOIN
                    attendance a ON sp.session_id = a.session_id AND s.student_id = a.student_id
                WHERE
                    sp.session_date BETWEEN ? AND ?  
                AND
                    sp.group_id = ? 
                GROUP BY
                    s.student_id, s.student_code, s.first_name, s.last_name
                ORDER BY
                    s.first_name;
        
        ` , [range.start, range.end, group_id]).then(async (res) => {

                    if (res.values) {

                        console.log(res.values)

                        if (res.values?.length > 0) {




                            await exportJsonToXlsx(res.values, [{
                                scholar_year: year,
                                class_name: sessionsData[0].module_name,
                                specialty: sessionsData[0].specialty_name,
                                specialty_level: sessionsData[0].specialty_level,
                                specialty_level_year: sessionsData[0].level_year,
                                group_type: sessionsData[0].group_type,
                                group_number: sessionsData[0].group_number,
                            }]).catch(() => {


                            }


                            ).then(() => {

                                setToast(true)

                            })

                        } else {
                            console.log('res values is empty')
                        }

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


    }


    const [toast, setToast] = useState(false)



    const displaySessions = sessionsData ? sessionsData.map(session => {

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

                            <div style={{ width: '80%' }}
                                onClick={() => {


                                    setViewSetSessionModalOpened(true)
                                    setSelectedSessionId(session.session_id)


                                }}
                            >
                                <IonLabel className="ion-text-wrap" >
                                    {session.module_name + " " + session.specialty_name + " " + session.specialty_level + session.level_year} group {session.group_number + " " + session.group_type}
                                    {/* <IonChip><IonLabel>{timePart}</IonLabel></IonChip> */}
                                    <IonChip><IonLabel>{new Date(session.session_date).toUTCString().slice(0, 22)}</IonLabel></IonChip>
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
                                    </IonSelect>
                                    <IonIcon icon={ellipsisVertical} />


                                </IonChip>
                            </div>

                        </div>



                    </IonChip>
                </IonLabel>
            </IonItem>

        )

    }) : <IonSpinner duration={2000} />



    return (
        <IonModal
            isOpen={isOpen}
            onIonModalDidDismiss={
                () => {
                    close(false)
                }}
        >
            <IonHeader>
                <IonToolbar>
                    <IonButton fill="clear" slot="start" onClick={() => { close(false) }}    >
                        <IonIcon size="small" icon={chevronBack}></IonIcon>
                    </IonButton>

                    <IonTitle class="ion-text-wrap" >
                        export attendance
                    </IonTitle>


                </IonToolbar>
            </IonHeader>


            <IonItem  >
                <div style={{ display: 'flex', padding: '8px', justifyContent: 'space-between', width: '100%' }} >
                    <div   >
                        <IonLabel>start : </IonLabel>
                        <IonDatetimeButton datetime="startDatetime"></IonDatetimeButton>

                    </div>
                    <IonButton onClick={() => export_session_in_range()} size='default' fill='clear' color={'success'}  >
                        export
                    </IonButton>
                </div>
            </IonItem>
            <IonItem >
                <div style={{ padding: '8px' }} >
                    <IonLabel>end : </IonLabel>
                    <IonDatetimeButton datetime="endDatetime"></IonDatetimeButton>
                </div>
            </IonItem>
            <IonContent>
                {displaySessions}
            </IonContent>
            <IonModal keepContentsMounted={true}>
                <IonDatetime
                    id="startDatetime"
                    presentation='date'
                    onIonChange={(e) => { setRange({ ...range, start: String(e.detail?.value) }) }}
                ></IonDatetime>
            </IonModal>
            <IonModal keepContentsMounted={true}>
                <IonDatetime
                    id="endDatetime"
                    presentation='date'
                    onIonChange={(e) => { setRange({ ...range, end: String(e.detail?.value) }) }}
                ></IonDatetime>
            </IonModal>


            {selectedSessionId != undefined && viewSessionModalOpened == true ? <ViewSession

                session_id={selectedSessionId}

                isOpen={viewSessionModalOpened}

                close={setViewSetSessionModalOpened}


            /> : null}

            <IonToast isOpen={toast} onDidDismiss={() => { setToast(false) }} message={Capacitor.getPlatform() === 'web' ? "Downloading..." : "file saved on Downloads"} duration={5000}></IonToast>
            {ConfirmationAlert}
        </IonModal>
    )
}

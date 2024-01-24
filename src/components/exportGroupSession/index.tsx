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
    export_session: (session: SessionData) => Promise<void>
    export_session_in_range: () => Promise<void>
}




export default function ExportSessionGroupModal({export_session,export_session_in_range, group_id, sessionsData, close, isOpen, range, setRange }: props) {


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

           
            {ConfirmationAlert}
        </IonModal>
    )
}

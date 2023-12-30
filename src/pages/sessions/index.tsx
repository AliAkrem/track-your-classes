import { IonButtons, IonChip, IonContent, IonDatetime, IonDatetimeButton, IonFab, IonFabButton, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonMenuButton, IonModal, IonPage, IonTitle, IonToolbar } from '@ionic/react'
import { add, calendar, closeCircle } from 'ionicons/icons'
import { GroupSQL, SQLClass, Students, useGlobalContext } from '../../context/globalContext'
import { useState } from 'react'
import { CreateSession } from '../../components/createSession'
import Calendar from '../../components/calendar'
import SessionsList from '../../components/sessionsList'


export type ClassGroup = {

    group: GroupSQL
    class: SQLClass


}


export const Session = () => {

    const { year } = useGlobalContext()


    const [openCreateSessionModal, setOpenCreateSessionModal] = useState(false)




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




                <Calendar />
                <SessionsList />

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

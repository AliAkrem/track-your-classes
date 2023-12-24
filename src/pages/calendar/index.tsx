import { IonButtons, IonChip, IonContent, IonDatetime, IonHeader, IonIcon, IonLabel, IonMenuButton, IonPage, IonTitle, IonToolbar } from '@ionic/react'
import { calendar } from 'ionicons/icons'
import { useGlobalContext } from '../../context/globalContext'



export const Calender = () => {

    const {counter, year} = useGlobalContext()

    return (

        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonMenuButton />
                    </IonButtons>
                    <IonTitle size="small" >
                        {counter}
                        <IonChip color={"success"} >
                            <IonIcon icon={calendar}></IonIcon>
                            <IonLabel>{String(year)}</IonLabel>
                        </IonChip>
                    </IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen >
                <IonDatetime size='cover' presentation='date'  ></IonDatetime>


            </IonContent>
        </IonPage>

    )
}

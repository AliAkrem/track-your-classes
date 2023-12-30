import { IonButton, IonChip, IonIcon, IonItem, IonLabel } from "@ionic/react";
import { close, closeCircle, create, ellipsisVertical } from "ionicons/icons";

export default function SessionsList() {
    return (
        <>
            <IonItem >
                <IonLabel style={{ display: 'flex', alignItems: 'center' }} >
                    <IonChip style={{ width: '100%' }} >

                        <div style={{ display: 'flex',   justifyContent: 'space-between' }} >
                            <IonLabel className="ion-text-wrap" >
                                GL RSD M2 group 2 
                                <IonChip><IonLabel>12:23</IonLabel></IonChip>
                            </IonLabel>


                            <IonChip color={'success'}>
                                <IonLabel></IonLabel>
                                <IonIcon icon={ellipsisVertical} />
                                <IonLabel></IonLabel>
                            </IonChip>

                        </div>

                    </IonChip>

                </IonLabel>
            </IonItem>
            <IonItem>
                <IonLabel style={{ display: 'flex', alignItems: 'center' }} >
                    <IonChip style={{ width: '100%' }} >

                        <div style={{ display: 'flex', justifyContent: 'space-between' }} >
                            <IonLabel className="ion-text-wrap" >
                                GL RSD M2 group 2 
                                <IonChip><IonLabel>12:23</IonLabel></IonChip>
                            </IonLabel>


                            <IonChip color={'success'}>
                                <IonLabel></IonLabel>
                                <IonIcon icon={ellipsisVertical} />
                                <IonLabel></IonLabel>
                            </IonChip>

                        </div>

                    </IonChip>
                </IonLabel>
            </IonItem>
            <IonItem>
                <IonLabel style={{ display: 'flex', alignItems: 'center' }} >
                    <IonChip style={{ width: '100%' }} >

                        <div style={{ display: 'flex', justifyContent: 'space-between' }} >
                            <IonLabel className="ion-text-wrap" >
                                GL RSD M2 group 2 
                                <IonChip><IonLabel>12:23</IonLabel></IonChip>
                            </IonLabel>


                            <IonChip color={'success'}>
                                <IonLabel></IonLabel>
                                <IonIcon icon={ellipsisVertical} />
                                <IonLabel></IonLabel>
                            </IonChip>

                        </div>

                    </IonChip>
                </IonLabel>
            </IonItem>
            <IonItem>
                <IonLabel style={{ display: 'flex', alignItems: 'center' }} >
                    <IonChip style={{ width: '100%' }} >

                        <div style={{ display: 'flex', justifyContent: 'space-between' }} >
                            <IonLabel className="ion-text-wrap" >
                                GL RSD M2 group 2 
                                <IonChip><IonLabel>12:23</IonLabel></IonChip>
                            </IonLabel>


                            <IonChip color={'success'}>
                                <IonLabel></IonLabel>
                                <IonIcon icon={ellipsisVertical} />
                                <IonLabel></IonLabel>
                            </IonChip>

                        </div>

                    </IonChip>
                </IonLabel>
            </IonItem >
        </>
    )
}


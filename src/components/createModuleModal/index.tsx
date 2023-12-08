import React, { useState, useRef } from 'react';
import {
    IonButtons,
    IonButton,
    IonModal,
    IonHeader,
    IonContent,
    IonToolbar,
    IonTitle,
    IonPage,
    IonItem,
    IonInput,
    IonLabel,
    IonIcon,
    IonFabButton,
    IonSelect,
    IonSelectOption,
} from '@ionic/react';
import { OverlayEventDetail } from '@ionic/core/components';
import { add, addCircleOutline, addCircleSharp, addOutline, addSharp, logoIonic } from 'ionicons/icons';
import useSQLiteDB from '../../composables/useSQLiteDB';
import { SQLiteDBConnection } from '@capacitor-community/sqlite';
import { SQLModule } from '../../pages/classes';

type createModuleModalProps = {
    label: string
    setModules: React.Dispatch<React.SetStateAction<SQLModule[] | undefined>>

}


export default function CreateModuleModal({ label, setModules }: createModuleModalProps) {

    const { performSQLAction, initialized } = useSQLiteDB();

    const modal = useRef<HTMLIonModalElement>(null);
    const module_name = useRef<HTMLIonInputElement>(null);
    const module_name_abv = useRef<HTMLIonInputElement>(null);



    function confirm() {

        if (String(module_name.current?.value) !== "" && String(module_name_abv.current?.value) !== "") {
            modal.current?.dismiss(module_name.current?.value, 'confirm');
            createModule(module_name.current?.value as string, module_name_abv.current?.value as string)
        }

    }

    function onWillDismiss(ev: CustomEvent<OverlayEventDetail>) {
        if (ev.detail.role === 'confirm') {

        }
    }



    // created by  benhabara bilal 
    const createModule = async (moduleName: string, moduleNameAbv: string) => {
        try {
            performSQLAction(async (db: SQLiteDBConnection | undefined) => {
                await db?.query(`INSERT INTO module(module_name, module_name_abv) VALUES (?, ?)`, [moduleName, moduleNameAbv]);

                const respSelect = await db?.query(`SELECT * FROM module`);
                setModules(respSelect?.values);
            });

        } catch (error) {
            alert((error as Error).message);
        }
    };

 



    return (
        <>
            <IonLabel id="open-modal"   >
                <IonButton size='small' fill='outline' >
                    {label}{"   "}<IonIcon icon={addCircleOutline}></IonIcon>
                </IonButton>
            </IonLabel>

            <IonModal ref={modal} trigger="open-modal" onWillDismiss={(ev) => onWillDismiss(ev)}>
                <IonHeader>
                    <IonToolbar>
                        <IonButtons slot="start">
                            <IonButton onClick={() => modal.current?.dismiss()}>Cancel</IonButton>
                        </IonButtons>
                        <IonTitle>{label}</IonTitle>
                        <IonButtons slot="end">
                            <IonButton strong={true} onClick={() => confirm()}>
                                Confirm
                            </IonButton>
                        </IonButtons>
                    </IonToolbar>
                </IonHeader>
                <IonContent className="ion-padding">

                    <IonItem >
                        <IonInput

                            label="name"
                            labelPlacement="start"
                            ref={module_name}
                            type="text"
                            required
                        />
                    </IonItem>
                    <IonItem>
                        <IonInput
                            label="abbreviated name"
                            labelPlacement="start"
                            ref={module_name_abv}
                            type="text"
                            required

                        />
                    </IonItem>


                </IonContent>
            </IonModal>
        </>
    );
}


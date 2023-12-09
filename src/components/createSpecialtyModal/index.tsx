import React, { useState, useRef } from 'react';
import {
    IonButtons,
    IonButton,
    IonModal,
    IonHeader,
    IonContent,
    IonToolbar,
    IonTitle,
    IonItem,
    IonInput,
    IonLabel,
    IonIcon,
    IonSelect,
    IonSelectOption,
} from '@ionic/react';
import { OverlayEventDetail } from '@ionic/core/components';
import { add, addCircleOutline, logoIonic } from 'ionicons/icons';
import useSQLiteDB from '../../composables/useSQLiteDB';
import { SQLiteDBConnection } from '@capacitor-community/sqlite';
import { SpecialtiesSQL } from '../../pages/classes';

type CreateSpecialtyModalProps = {
    label: string
    setSpecialties: React.Dispatch<React.SetStateAction<SpecialtiesSQL[] | undefined>>
}


export default function CreateSpecialtyModal({ label, setSpecialties }: CreateSpecialtyModalProps) {

    const { performSQLAction, initialized } = useSQLiteDB()
    const modal = useRef<HTMLIonModalElement>(null);
    const specialty_name = useRef<HTMLIonInputElement>(null);
    const specialty_name_abv = useRef<HTMLIonInputElement>(null);
    const specialty_level = useRef<HTMLIonSelectElement | null>(null);
    const specialty_collage_year = useRef<HTMLIonInputElement>(null);




    const INSERT_SPECIALTY = async (
        specialty_name: string,
        specialty_name_abv: string,
        specialty_level: string,
        collage_year: string
    ) => {
        try {
            await performSQLAction(async (db: SQLiteDBConnection | undefined) => {
                await db?.query('INSERT INTO specialty(specialty_name, specialty_name_abv, specialty_level, collage_year) VALUES(?, ?, ?, ?)',
                    [specialty_name, specialty_name_abv, specialty_level, collage_year]
                );

                const res = await db?.query('SELECT * FROM specialty');

                setSpecialties(res?.values)

            });
        } catch (error) {
            console.error(error);
        }
    };


    function confirm() {

        modal.current?.dismiss(specialty_name.current?.value, 'confirm');


        // Define function to insert specialty
        if (specialty_name.current?.value !== "" &&
            specialty_name_abv.current?.value !== "" &&
            specialty_level.current?.value !== "" &&
            specialty_collage_year.current?.value !== "") {

            INSERT_SPECIALTY(String(specialty_name.current?.value), String(specialty_name_abv.current?.value), String(specialty_level.current?.value), String(specialty_collage_year.current?.value))

        }


    }

    function onWillDismiss(ev: CustomEvent<OverlayEventDetail>) {
        if (ev.detail.role === 'confirm') { }
    }


    return (
        <>

            <IonLabel    >
                <IonButton id="open-create-specialty-modal"  size='small' fill='outline' >
                    {label}{"   "}<IonIcon icon={addCircleOutline}></IonIcon>
                </IonButton>
            </IonLabel>


            <IonModal ref={modal} trigger="open-create-specialty-modal" onWillDismiss={(ev) => onWillDismiss(ev)}>
                <IonHeader>
                    <IonToolbar>
                        <IonButtons slot="start">
                            <IonButton size='small' onClick={() => modal.current?.dismiss()}>Cancel</IonButton>
                        </IonButtons>
                        <IonTitle size='small' >create new specialty</IonTitle>
                        <IonButtons slot="end">
                            <IonButton size='small' strong={true} onClick={() => confirm()}>
                                Confirm
                            </IonButton>
                        </IonButtons>
                    </IonToolbar>
                </IonHeader>
                <IonContent className="ion-padding">
                    <IonItem>
                        <IonInput
                            label="name"
                            labelPlacement="start"
                            ref={specialty_name}
                            type="text"
                        />
                    </IonItem>
                    <IonItem>
                        <IonInput
                            label="abbreviated name"
                            labelPlacement="start"
                            ref={specialty_name_abv}
                            type="text"
                        />
                    </IonItem>
                    <IonItem>
                        <IonLabel>
                            select level
                        </IonLabel>
                        <IonItem>

                            <IonSelect
                                ref={specialty_level}
                                aria-label="specialty"
                                interface="popover"
                                placeholder="Select level"
                            >
                                <IonSelectOption value="M">Master</IonSelectOption>
                                <IonSelectOption value="L">License</IonSelectOption>
                            </IonSelect>

                        </IonItem>
                    </IonItem>
                    <IonItem>
                        <IonInput
                            label="College Year"
                            labelPlacement="start"
                            ref={specialty_collage_year}
                            type="text"
                            maxlength={1}
                            onIonChange={(e) => {
                                const inputValue = e.detail.value;

                                const numericInput = String(inputValue).replace(/[^0-5]/g, '');

                                if (specialty_collage_year.current)
                                    specialty_collage_year.current.value = numericInput;
                            }}
                        />

                    </IonItem>

                </IonContent>
            </IonModal>
        </>
    );
}


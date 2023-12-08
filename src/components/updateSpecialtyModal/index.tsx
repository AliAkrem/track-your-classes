import React, { useState, useRef, useEffect } from 'react';
import {
    IonButtons,
    IonButton,
    IonModal,
    IonHeader,
    IonContent,
    IonToolbar,
    IonTitle,
    // IonPage,
    IonItem,
    IonInput,
    IonLabel,
    IonIcon,
    IonSelect,
    IonSelectOption,
    // IonFabButton,
    // IonSelect,
    // IonSelectOption,
} from '@ionic/react';
import { OverlayEventDetail } from '@ionic/core/components';

import useSQLiteDB from '../../composables/useSQLiteDB';
import { SQLiteDBConnection } from '@capacitor-community/sqlite';
import { SpecialtiesSQL } from '../../pages/classes';

type updateModuleModal = {
    label: string
    setSpecialties: React.Dispatch<React.SetStateAction<SpecialtiesSQL[] | undefined>>
    specialty: SpecialtiesSQL

}


export default function UpdateSpecialtyModal({ label, setSpecialties, specialty }: updateModuleModal) {

    const { performSQLAction, initialized } = useSQLiteDB();

    const modal = useRef<HTMLIonModalElement>(null);
    const specialty_name = useRef<HTMLIonInputElement>(null);
    const specialty_name_abv = useRef<HTMLIonInputElement>(null);
    const specialty_level = useRef<HTMLIonSelectElement | null>(null);
    const specialty_collage_year = useRef<HTMLIonInputElement>(null);




    function confirm() {


        if (String(specialty_name.current?.value) !== "" &&
            String(specialty_name_abv.current?.value) !== "" &&
            String(specialty_level.current?.value) !== "" &&
            String(specialty_collage_year.current?.value) !== ""

        ) {

            modal.current?.dismiss(specialty_name.current?.value, 'confirm');

            UPDATE_SPECIALTY(
                specialty.specialty_id,
                String(specialty_name.current?.value),
                String(specialty_name_abv.current?.value),
                String(specialty_level.current?.value),
                String(specialty_collage_year.current?.value)
            )

        }
    }

    function onWillDismiss(ev: CustomEvent<OverlayEventDetail>) {
        if (ev.detail.role === 'confirm') {

        }
    }



    const UPDATE_SPECIALTY = async (
        specialty_id: number,
        specialty_name: string | undefined,
        specialty_name_abv: string | undefined,
        specialty_level: string | undefined,
        collage_year: string | undefined
    ) => {
        try {
            await performSQLAction(async (db: SQLiteDBConnection | undefined) => {
                const updateValues: (string | number)[] = [];
                let updateStatement = 'UPDATE specialty SET ';
                if (specialty_name) {
                    updateStatement += 'specialty_name = ?, ';
                    updateValues.push(specialty_name);
                }
                if (specialty_name_abv) {
                    updateStatement += 'specialty_name_abv = ?, ';
                    updateValues.push(specialty_name_abv);
                }
                if (specialty_level) {
                    updateStatement += 'specialty_level = ?, ';
                    updateValues.push(specialty_level);
                }
                if (collage_year) {
                    updateStatement += 'collage_year = ? ';
                    updateValues.push(collage_year);
                }

                // Remove trailing comma if any updates were made
                updateStatement = updateStatement.slice(0, -1);

                await db?.query(updateStatement + 'WHERE specialty_id = ?', [...updateValues, specialty_id]);

                const res = await db?.query('SELECT * FROM specialty');

                setSpecialties(res?.values)

            });
        } catch (error) {
            console.error(error);
        }
    };




    return (
        <>
            <IonModal ref={modal} trigger={"open-update-module-modal" + specialty.specialty_id} onWillDismiss={(ev) => onWillDismiss(ev)}>
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

                    <IonItem>
                        <IonInput
                            label="name"
                            labelPlacement="start"
                            ref={specialty_name}
                            type="text"
                            value={specialty.specialty_name}
                            required
                        />
                    </IonItem>
                    <IonItem>
                        <IonInput
                            required
                            label="abbreviated name"
                            labelPlacement="start"
                            ref={specialty_name_abv}
                            type="text"
                            value={specialty.specialty_name_abv}
                        />
                    </IonItem>

                    <IonItem>

                        <IonSelect
                            ref={specialty_level}
                            aria-label="specialty"
                            interface="popover"
                            placeholder="Select level"
                            value={specialty.specialty_level}
                        >
                            <IonSelectOption value="M">Master</IonSelectOption>
                            <IonSelectOption value="L">License</IonSelectOption>
                        </IonSelect>


                    </IonItem>
                    <IonItem>
                        <IonInput
                            label="College Year"
                            labelPlacement="start"
                            ref={specialty_collage_year}
                            type="text"
                            maxlength={1}
                            value={specialty.collage_year}
                            onIonChange={(e) => {
                                const inputValue = e.detail.value;

                                const numericInput = String(inputValue).replace(/[^0-5]/g, '');

                                if (specialty_collage_year.current)
                                    specialty_collage_year.current.value = numericInput;
                            }}
                        />

                    </IonItem>




                </IonContent>
            </IonModal >
        </>
    );
}


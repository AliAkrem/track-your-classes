import React, { useRef } from 'react'
import { SQLModule, SpecialtiesSQL, useGlobalContext } from '../../context/globalContext';
import { IonButton, IonButtons, IonContent, IonHeader, IonItem, IonList, IonModal, IonTitle, IonToolbar } from '@ionic/react';
import ModuleSelect from '../module_select';
import SpecialtiesSelect from "../specialty_select"
import useSQLiteDB from '../../composables/useSQLiteDB';
import { SQLiteDBConnection } from '@capacitor-community/sqlite';
import { nanoid } from 'nanoid';




export function CreateClassModal({ isOpen, close }: { isOpen: boolean, close: React.Dispatch<React.SetStateAction<boolean>> }) {

    const create_class_modal = useRef<HTMLIonModalElement | null>(null)


    const { setSelectedModule, setSelectedSpecialties, selectedModule, selectedSpecialties, setYear, year, setRevalidate } = useGlobalContext()

    const { performSQLAction } = useSQLiteDB()

    const INSERT_NEW_CLASS = async (specialty_id: number, module_id: number) => {

        try {
            await performSQLAction(async (db: SQLiteDBConnection | undefined) => {

                // const respSELECTED_YEAR = await db?.query(` SELECT selected_year_id FROM keys LIMIT 1  `)


                // console.log(respSELECTED_YEAR?.values)
                // if (respSELECTED_YEAR?.values) {
                //     setYear(Number(respSELECTED_YEAR?.values[0].selected_year_id))
                //     console.log(Number(respSELECTED_YEAR?.values[0].selected_year_id))
                // }


                await db?.query(
                    "INSERT INTO class(module_id, specialty_id, scholar_year_id) VALUES (?, ?, (SELECT selected_year_id FROM keys ORDER BY selected_year_id LIMIT 1))",
                    [module_id, specialty_id]
                );

             





            });

            setRevalidate(Math.random)

        } catch (error) {
            alert((error as Error).message);
        }
    };


    const onSubmit = () => {
        if (selectedModule.length > 0 && selectedSpecialties.length > 0) {
            INSERT_NEW_CLASS(Number(selectedModule[0]), Number(selectedSpecialties[0]))
        }

        setSelectedSpecialties([])
        setSelectedModule([])

    }


    return (

        <IonModal ref={create_class_modal} isOpen={isOpen} >
            <IonHeader>
                <IonToolbar>
                    <IonTitle >create new class</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={() => { create_class_modal?.current?.dismiss(); close(false) }}>Close</IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonList >
                    <ModuleSelect />
                    <SpecialtiesSelect />
                    <IonList inset>
                        <IonItem >
                            <IonButton disabled={selectedModule.length == 0 || selectedSpecialties.length == 0} onClick={() => { onSubmit(); create_class_modal?.current?.dismiss(); close(false) }} slot="end" fill="outline" size="default" >
                                submit
                            </IonButton>
                        </IonItem>
                    </IonList>

                </IonList>
            </IonContent>
        </IonModal>

    )
}


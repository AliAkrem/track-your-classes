import React, { useRef } from 'react'
import { SQLClass, SQLModule, SpecialtiesSQL, useGlobalContext } from '../../context/globalContext';
import { IonButton, IonButtons, IonContent, IonHeader, IonItem, IonList, IonModal, IonTitle, IonToolbar } from '@ionic/react';
import ModuleSelect from '../module_select';
import SpecialtiesSelect from "../specialty_select"
import useSQLiteDB from '../../composables/useSQLiteDB';
import { SQLiteDBConnection } from '@capacitor-community/sqlite';




type CreateClassModalProps = {
  isOpen: boolean;
  close: React.Dispatch<React.SetStateAction<boolean>>;
};

export const CreateClassModal: React.FC<CreateClassModalProps> = ({ isOpen, close }) => {


    const create_class_modal = useRef<HTMLIonModalElement | null>(null)


    const { selectedModule, selectedSpecialties,setSelectedModule, setSelectedSpecialties, setRevalidate, year } = useGlobalContext()

    const { performSQLAction } = useSQLiteDB()

    const INSERT_NEW_CLASS = async (specialty_id: number, module_id: number) => {

        try {
            await performSQLAction(async (db: SQLiteDBConnection | undefined) => {
                await db?.query(
                    "INSERT INTO class(module_id, specialty_id, scholar_year_id) VALUES (?, ?, ?)",
                    [module_id, specialty_id, year]
                );

                    setRevalidate(Math.random)

            });





            // setRevalidate(Math.random)

        } catch (error) {
            alert((error as Error).message);
            setRevalidate(Math.random)

            // setRevalidate(Math.random)
        }
    };


    const createClass = async (ev: any) => {

        if (selectedModule.length > 0 && selectedSpecialties.length > 0) {
            await INSERT_NEW_CLASS(Number(selectedModule[0]), Number(selectedSpecialties[0]))
        }

        create_class_modal?.current?.dismiss();

        close(false)
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
                            <IonButton onClick={createClass} slot="end" fill="outline" size="default" >
                                submit {Number(selectedModule[0]) + " " + Number(selectedSpecialties[0]) + " " + year}
                            </IonButton>
                        </IonItem>
                    </IonList>

                </IonList>
            </IonContent>
        </IonModal>

    )
}


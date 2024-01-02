import React, { useEffect, useRef, useState } from 'react'
import { SQLClass, useGlobalContext } from '../../context/globalContext';
import { IonButton, IonButtons, IonContent, IonDatetime, IonHeader, IonInput, IonItem, IonLabel, IonList, IonModal, IonSelect, IonSelectOption, IonTitle, IonToolbar } from '@ionic/react';

import useSQLiteDB from '../../composables/useSQLiteDB';
import { SQLiteDBConnection } from '@capacitor-community/sqlite';
import { add } from 'ionicons/icons';




type Props = {
    isOpen: boolean;
    close: React.Dispatch<React.SetStateAction<boolean>>;
    classe: SQLClass
    setSelectedClass: React.Dispatch<React.SetStateAction<SQLClass | undefined>>
};


const levels = [
    {
        value: 'M', level: 'Master', years: 2
    },
    {
        value: 'L', level: 'License', years: 3
    },
    {
        value: 'E', level: 'Engineering', years: 4
    }
]




export default function UpdateClass({ isOpen, close, classe, setSelectedClass }: Props) {


    // credentials of class 

    const module_name = useRef<HTMLIonInputElement>(null);
    const specialty_name = useRef<HTMLIonInputElement>(null);
    const specialty_level = useRef<HTMLIonSelectElement | null>(null);
    const specialty_level_year = useRef<HTMLIonSelectElement>(null);
    const collage_year = useRef<HTMLIonInputElement>(null);


    //  end credentials of class 

    const create_class_modal = useRef<HTMLIonModalElement | null>(null)


    const { setRevalidate, year, setYear } = useGlobalContext()

    const { performSQLAction } = useSQLiteDB()

    const UPDATE_CLASS = async (module_name: string, specialty_name: string, specialty_level: string, level_year: number, collage_year: string) => {

        try {
            performSQLAction(async (db: SQLiteDBConnection | undefined) => {
                await db?.query(
                    `UPDATE class SET 
                
                 module_name = ? ,  
                 specialty_name = ? ,
                 specialty_level = ? , 
                 level_year = ? ,
                 collage_year = ? 
                 
                WHERE class_id = ? 
                ;`,
                    [module_name, specialty_name, specialty_level, level_year, collage_year, classe.class_id]
                );


                await db?.query(`
                UPDATE Keys SET selected_year = ? WHERE selected_year = ? ;
                `, [collage_year, year])
                setYear(collage_year)



                setRevalidate(Math.random)

                setRevalidate(Math.random)
            });

            // setRevalidate(Math.random)

        } catch (error) {
            alert((error as Error).message);
            setRevalidate(Math.random)

            // setRevalidate(Math.random)
        }
    };




    const updateClass = async (ev: any) => {



        if (
            module_name.current?.value &&
            specialty_name.current?.value &&
            specialty_level.current?.value &&
            specialty_level_year.current?.value &&
            collage_year.current?.value
        ) {

            console.log(
                module_name.current?.value,
                specialty_name.current?.value,
                specialty_level.current?.value,
                specialty_level_year.current?.value,
                collage_year.current?.value

            )

            UPDATE_CLASS(
                String(module_name.current?.value),
                String(specialty_name.current?.value),
                String(specialty_level.current?.value),
                Number(specialty_level_year.current?.value),
                String(collage_year.current?.value),
            )

        }


        // console.log(
        //     specialty_level.current?.value,
        //     specialty_level_year.current?.value,
        //     )


        // create_class_modal?.current?.dismiss();

        close(false)
        setSelectedClass(undefined)

    }







    const [class_module, setClass_module] = useState(classe.module_name)
    const [class_specialty, setClass_specialty] = useState(classe.specialty_name)

    const [selectedLevel, setSelectedLevel] = useState(classe.specialty_level);
    const [level_year, setLevel_year] = useState(classe.level_year);

    const [class_collage_year, setClass_collage_year] = useState(classe.collage_year)



    const [touched, setTouched] = useState(0)

    const handleLevelChange = (event: CustomEvent) => {
        setSelectedLevel(String(event.detail.value));
    };


    const handleLoadValues = (ev: CustomEvent) => {

        if (selectedLevel) {
            const selectedLevelObj = levels.find(item => item.value === selectedLevel);
            if (selectedLevelObj && specialty_level_year.current) {
                specialty_level_year.current.innerHTML = Array.from(
                    { length: selectedLevelObj.years },
                    (_, index) => `<ion-select-option key=${index + 1} value=${index + 1}>${index + 1}</ion-select-option>`
                ).join('');


            }
        }
    }


    useEffect(() => {
        // Update years options when selectedLevel changes
        if (selectedLevel) {
            const selectedLevelObj = levels.find(item => item.value === selectedLevel);


            if (selectedLevelObj && specialty_level_year.current) {
                specialty_level_year.current.innerHTML = Array.from(
                    { length: selectedLevelObj.years },
                    (_, index) => `<ion-select-option key=${index + 1} value=${index + 1}>${index + 1}</ion-select-option>`
                ).join('');
                setLevel_year(selectedLevelObj.years)



            }
        }
    }, [selectedLevel]);








    return (

        <IonModal ref={create_class_modal} trigger={'update-class-modal' + classe.class_id}
            isOpen={isOpen}

            onIonModalDidDismiss={()=>{setSelectedClass(undefined); create_class_modal?.current?.dismiss(); close(false) }}
        >
            <IonHeader>
                <IonToolbar>
                    <IonTitle >update class {classe.module_name}  {classe.specialty_name}/ {classe.specialty_level} / {classe.level_year} </IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={() => { setSelectedClass(undefined); create_class_modal?.current?.dismiss(); close(false) }}>Close</IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonList >
                    <IonItem >
                        <IonInput

                            label="Class"
                            labelPlacement="start"
                            placeholder='class name'
                            ref={module_name}
                            value={class_module}
                            onIonChange={(ev) => { setClass_module(String(ev.target.value)); }}
                            type="text"
                            required
                        />
                    </IonItem>

                    <IonItem>
                        <IonInput
                            label="Specialty"
                            placeholder='specialty name'
                            labelPlacement="start"
                            ref={specialty_name}

                            value={class_specialty}

                            onIonChange={(ev) => { setClass_specialty(String(ev.target.value)); }}
                            type="text"
                        />
                    </IonItem>

                    <IonItem slot='start'  >
                        <IonSelect

                            ref={specialty_level}
                            value={selectedLevel}
                            onIonChange={handleLevelChange}

                            interface="popover"
                            placeholder="Select level"
                        >
                            {levels.map(item => (
                                <IonSelectOption key={item.value} value={item.value}>
                                    {item.level}
                                </IonSelectOption>
                            ))}

                        </IonSelect>
                        <IonSelect
                            ref={specialty_level_year}
                            interface="popover"
                            placeholder={`${level_year}`}
                            onIonFocus={handleLoadValues}
                            value={level_year}

                            onIonChange={(ev) => { setLevel_year(Number(ev.detail.value)); }}
                        >
                        </IonSelect>



                    </IonItem>
                    <IonItem  >
                        <IonInput
                            label="Collage Year"
                            labelPlacement="start"
                            placeholder='yyyy/yyyy'
                            ref={collage_year}
                            type="text"

                            value={class_collage_year}

                            onIonChange={(ev) => { setClass_collage_year(String(ev.target.value)); }}

                        />

                    </IonItem>



                    {/* </IonContent> */}
                    <IonList inset>
                        <IonItem >
                            <IonButton onClick={updateClass} slot="end" size="default" >
                                update
                            </IonButton>
                        </IonItem>
                    </IonList>

                </IonList>
            </IonContent>
        </IonModal >

    )
}


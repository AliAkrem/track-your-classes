import React, { useEffect, useRef, useState } from 'react'
import { useGlobalContext } from '../../context/globalContext';
import { IonButton, IonButtons, IonContent, IonHeader, IonInput, IonItem,  IonList, IonModal,  IonSelect, IonSelectOption, IonTitle, IonToolbar } from '@ionic/react';

import useSQLiteDB from '../../composables/useSQLiteDB';
import { SQLiteDBConnection } from '@capacitor-community/sqlite';




type CreateClassModalProps = {
    isOpen: boolean;
    close: React.Dispatch<React.SetStateAction<boolean>>;
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




export default function CreateClassModal({ isOpen, close }: CreateClassModalProps) {


    const { performSQLAction  } = useSQLiteDB()

    const { setRevalidate, year, setYear } = useGlobalContext()

    // credentials of class 

    const [module_name, set_module_name] = useState<string>('')
    const [specialty_name, set_specialty_name] = useState('')
    const [specialty_level_year, set_specialty_level_year] = useState('')
    // const [collage_year, set_collage_year] = useState()

    const [selectedLevel, setSelectedLevel] = useState<string>('');

    // const specialty_level = useRef<HTMLIonSelectElement | null>(null);


    const specialty_level_year_ref = useRef<HTMLIonSelectElement>(null);


    const [collage_year_input_state, set_collage_year_input_state] = useState(year)

    //  end credentials of class 

    const create_class_modal = useRef<HTMLIonModalElement | null>(null)




    const insert_new_class = async (module_name: string, specialty_name: string, specialty_level: string, level_year: number, collage_year: string) => {

        try {
            await performSQLAction(async (db: SQLiteDBConnection | undefined) => {


                await db?.query(`INSERT INTO class(module_name, specialty_name, specialty_level, level_year, collage_year) VALUES (?, ?, ?, ?, ?);`,
                    [module_name, specialty_name, specialty_level, level_year, collage_year], true
                ).then(async () => {
                    await db?.query(`
                    UPDATE Keys SET selected_year = ? WHERE selected_year = ? ;
                    `, [collage_year, year]).then(() => {
                        setRevalidate(Math.random)
                        setYear(collage_year)
                        close(false)
                    })

                });


            })

        } catch (error) {
            alert((error as Error).message);
            console.log('error')
            setRevalidate(Math.random)
        }
    };


    const createClass = () => {




        if (
            module_name &&
            specialty_name &&
            selectedLevel &&
            specialty_level_year &&
            collage_year_input_state
        ) {

            insert_new_class(
                module_name,
                specialty_name,
                selectedLevel,
                Number(specialty_level_year),
                collage_year_input_state
            ).then(() => {
                console.log('executed ')
            })



        }



    }







    const handleLevelChange = (event: CustomEvent) => {
        setSelectedLevel(String(event.detail.value));
    };


    useEffect(() => {
        // Update years options when selectedLevel changes
        if (selectedLevel) {
            const selectedLevelObj = levels.find(item => item.value === selectedLevel);


            if (selectedLevelObj && specialty_level_year_ref.current) {
                specialty_level_year_ref.current.innerHTML = Array.from(
                    { length: selectedLevelObj.years },
                    (_, index) => `<ion-select-option key=${index + 1} value=${index + 1}>${index + 1}</ion-select-option>`
                ).join('');
            }
        }


    }, [selectedLevel]);




    const handleYearScholarChanged = (ev: any) => {

        let value = ev.target?.value;

        // Allow only numeric characters
        value = value.replace(/[^0-9]/g, '');

        // Ensure only 4 digits are entered
        if (value.length > 4) {
            value = value.slice(0, 4);
        }

        // Add "/" after the 4th character
        if (value.length == 4) {
            value += '/';
            // Append the next year
            value += (parseInt(value.slice(0, 4)) + 1).toString();
        }

        set_collage_year_input_state(value);
    };



    return (
        <IonModal ref={create_class_modal}
            isOpen={isOpen}
            trigger="create-class-modal"
            onIonModalDidDismiss={()=>{close(false)}}
        >
            <IonHeader>
                <IonToolbar>
                    <IonTitle >create new class</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={() => { create_class_modal?.current?.dismiss(); close(false) }}>Close</IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonList class='ion-padding' >

                    <IonInput

                        label="Class"
                        labelPlacement="start"
                        placeholder='class name'

                        value={module_name}
                        onIonChange={(ev: CustomEvent) => { set_module_name(ev.detail.value) }}
                        type="text"
                        required
                    />


                    <IonInput
                        label="Specialty"
                        placeholder='specialty name'
                        labelPlacement="start"
                        value={specialty_name}
                        onIonChange={(ev: CustomEvent) => { set_specialty_name(ev.detail.value) }}
                        type="text"
                    />


                    <div style={{ display: 'flex' }} >

                        <IonSelect

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
                            ref={specialty_level_year_ref}
                            interface="popover"
                            placeholder="Year"
                            value={specialty_level_year}
                            onIonChange={(ev: CustomEvent) => { set_specialty_level_year(ev.detail.value) }}
                        >
                        </IonSelect>

                    </div>

                    <IonInput
                        label="Collage Year"
                        labelPlacement="start"
                        placeholder='yyyy/yyyy'
                        // ref={collage_year}
                        maxlength={4}
                        value={collage_year_input_state}
                        onIonChange={handleYearScholarChanged}
                        type="text"
                    />

                    {/* </IonContent> */}
                    <IonList inset>
                        <IonItem >
                            <IonButton onClick={createClass} slot="end" size="default" >
                                create
                            </IonButton>
                        </IonItem>
                    </IonList>

                </IonList>
            </IonContent>
        </IonModal >
    )
}


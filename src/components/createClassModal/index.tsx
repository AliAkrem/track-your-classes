import React, { useEffect, useRef, useState } from 'react'
import { useGlobalContext } from '../../context/globalContext';
import { IonButton, IonButtons, IonContent, IonHeader, IonInput, IonItem, IonLabel, IonList, IonModal, IonSelect, IonSelectOption, IonTitle, IonToolbar } from '@ionic/react';

import useSQLiteDB from '../../composables/useSQLiteDB';
import { SQLiteDBConnection } from '@capacitor-community/sqlite';
import { add } from 'ionicons/icons';




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




export const CreateClassModal: React.FC<CreateClassModalProps> = ({ isOpen, close }) => {

    const { setRevalidate, year, setYear } = useGlobalContext()

    // credentials of class 

    const module_name = useRef<HTMLIonInputElement>(null);
    const specialty_name = useRef<HTMLIonInputElement>(null);
    const specialty_level = useRef<HTMLIonSelectElement | null>(null);
    const specialty_level_year = useRef<HTMLIonSelectElement>(null);

    const [selectedLevel, setSelectedLevel] = useState<string | undefined>(undefined);


    const collage_year = useRef<HTMLIonInputElement>(null);


    const [collage_year_input_state, set_collage_year_input_state] = useState(year)

    //  end credentials of class 

    const create_class_modal = useRef<HTMLIonModalElement | null>(null)



    const { performSQLAction } = useSQLiteDB()

    const INSERT_NEW_CLASS = async (module_name: string, specialty_name: string, specialty_level: string, level_year: number, collage_year: string) => {

        try {
            performSQLAction(async (db: SQLiteDBConnection | undefined) => {
                await db?.query(
                    `INSERT INTO class
                (
                 module_name ,
                 specialty_name ,
                 specialty_level , 
                 level_year,
                 collage_year
                 )
                
                VALUES (?, ?, ?, ?, ?) ;`,
                    [module_name, specialty_name, specialty_level, level_year, collage_year]
                );

                await db?.query(`
                UPDATE Keys SET selected_year = ? WHERE selected_year = ? ;
                `, [collage_year, year])
                setYear(collage_year)





                close(false)
                setSelectedLevel(undefined)
                setRevalidate(Math.random)


            });

            // setRevalidate(Math.random)

        } catch (error) {
            alert((error as Error).message);
            setRevalidate(Math.random)
        }
    };


    const createClass = async (ev: any) => {



        if (
            module_name.current?.value !== "" &&
            specialty_name.current?.value !== "" &&
            specialty_level.current?.value !== "" &&
            specialty_level_year.current?.value !== "" &&
            collage_year.current?.value !== ""
        ) {


            INSERT_NEW_CLASS(
                String(module_name.current?.value),
                String(specialty_name.current?.value),
                String(specialty_level.current?.value),
                Number(specialty_level_year.current?.value),
                String(collage_year.current?.value),
            )

            console.log(module_name.current?.value,
                specialty_name.current?.value,
                specialty_level.current?.value,
                specialty_level_year.current?.value,
                collage_year.current?.value)



        }


        // console.log(
        //     specialty_level.current?.value,
        //     specialty_level_year.current?.value,
        //     )


        // create_class_modal?.current?.dismiss();



    }





    const handleLevelChange = (event: CustomEvent) => {
        setSelectedLevel(String(event.detail.value));
    };


    useEffect(() => {
        // Update years options when selectedLevel changes
        if (selectedLevel) {
            const selectedLevelObj = levels.find(item => item.value === selectedLevel);

            // if (specialty_level_year.current) {
            //     specialty_level_year.current.value = undefined
            // }

            if (selectedLevelObj && specialty_level_year.current) {
                specialty_level_year.current.innerHTML = Array.from(
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
                <IonList inset>

                    <IonInput

                        label="Class"
                        labelPlacement="start"
                        placeholder='class name'
                        ref={module_name}
                        type="text"
                        required
                    />


                    <IonInput
                        label="Specialty"
                        placeholder='specialty name'
                        labelPlacement="start"
                        ref={specialty_name}
                        type="text"
                    />


                    <div  style={{ display : 'flex'   }} >

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
                            placeholder="Year"
                        ></IonSelect>

                    </div>

                        <IonInput
                            label="Collage Year"
                            labelPlacement="start"
                            placeholder='yyyy/yyyy'
                            ref={collage_year}
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


import React, { useRef, useState } from 'react'
import { useGlobalContext } from '../../context/globalContext';
import { IonButton, IonButtons, IonContent, IonHeader, IonInput, IonItem, IonList, IonModal,  IonTitle, IonToolbar } from '@ionic/react';
import useSQLiteDB from '../../composables/useSQLiteDB';
import { SQLiteDBConnection } from '@capacitor-community/sqlite';




/*

    imports 
    
    function control de field 

    interface 



*/ 







type Props = {
    isOpen: boolean;
    close: React.Dispatch<React.SetStateAction<boolean>>;
    group_id: number | undefined
    student_code: number
    setRevalidateGroup: React.Dispatch<React.SetStateAction<number>>
};






export const CreateStudentModal: React.FC<Props> = ({ isOpen, close, group_id, student_code, setRevalidateGroup }) => {


    

    // credentials of class 


    
    // id's
    const first_name = useRef<HTMLIonInputElement>(null);
    const last_name = useRef<HTMLIonInputElement>(null);







    // const student_code = useRef<HTMLIonInputElement>(null);



    //  end credentials of class 

    
    const create_student_modal = useRef<HTMLIonModalElement | null>(null)

    const { setRevalidate } = useGlobalContext()

    const { performSQLAction } = useSQLiteDB()

    const INSERT_NEW_STUDENT = async (first_name: string, last_name: string, code: number, group_id: number) => {


        try {
            performSQLAction(async (db: SQLiteDBConnection | undefined) => {

                await db?.query(
                    `INSERT INTO student (student_code , first_name , last_name ) VALUES (?, ?, ?) ;`,
                    [code, first_name, last_name]
                ); 

                
                const inserted_students = await db?.query(
                    `SELECT student_id  FROM student WHERE student_code = ? AND first_name = ? AND  = ?`,
                    [code, first_name, last_name]

                );  // extract latest inserted student 


                    

                if (inserted_students?.values && inserted_students?.values.length > 0) {
                    await db?.query(

                        `INSERT INTO group_student (group_id, student_id)  VALUES ( ? , ? )`,

                        [group_id, inserted_students.values[0].student_id]
                    );



                    setRevalidateGroup(Math.random()) // revalidate interface fetch students  

                }

                setRevalidate(Math.random)
            });

            // setRevalidate(Math.random)

        } catch (error) {
            alert((error as Error).message +  ' error insert student');
            setRevalidate(Math.random)

            // setRevalidate(Math.random)
        }
    };




    const [isTouched, setIsTouched] = useState(false);

    const [isTouchedLastName, setIsTouchedLastName] = useState(false);

    const [isValidFirstName, setIsValidFirstName] = useState<boolean | undefined>(false);


    const [isValidLastName, setIsValidLastName] = useState<boolean | undefined>(false);



    



    // return boolean 
    const validateName = (s: string) => {


        // regix  
        

        return s.match(
            /^[a-zA-Z\s]+$/
        ); 



    };



    const validateFirstName = (ev: Event) => {
        const value = (ev.target as HTMLInputElement).value;

        setIsValidFirstName(undefined);

        if (value === '') setIsValidFirstName(false);

        // validateName(value) !== null ? setIsValidFirstName(true) : setIsValidFirstName(false);

        if(validateName(value) !== null) { 

            setIsValidFirstName(true)


        }else { 

            setIsValidFirstName(false)

        }



    };

    const validateLastName = (ev: Event) => {



        const value = (ev.target as HTMLInputElement).value; // extract value of input



        setIsValidLastName(undefined);




        if (value === '' ) {

            setIsValidLastName(false)

            return;
        };


        validateName(value) !== null ? setIsValidLastName(true) : setIsValidLastName(false);

    };




    const markTouched = () => {
        setIsTouched(true);
    };






    // group -> insert student 
            // -> 19 code = 20  
            // -> group_id = 1  


    const createStudent = async (ev: any) => {

        if (!(isValidFirstName && isValidLastName)) {
            setIsTouched(!isValidFirstName!)
            setIsTouchedLastName(!isValidLastName!)

            // do nothing 

        } else {


            //?  first_name.current?.value extract the value of the filed  
            // ? String () casting  

            await INSERT_NEW_STUDENT(String(first_name.current?.value), String(last_name.current?.value), 

            student_code, group_id!)



            create_student_modal?.current?.dismiss(); // fermer formular 
            close(false)



        }

    }






    return (

        <IonModal ref={create_student_modal} isOpen={isOpen} 
            onIonModalDidDismiss={() => close(false)}
        >   
            <IonHeader>
                <IonToolbar>
                    <IonTitle >Add student</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={() => { create_student_modal?.current?.dismiss(); close(false) }}>Close</IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent  >

                <IonList className='ion-padding' >


                    <IonInput 

                        className={`${  isValidFirstName && 'ion-valid'} ${isValidFirstName === false && 'ion-invalid'} ${isTouched && 'ion-touched'}`}


                        label="First Name"
                        labelPlacement="start"
                        type="text"


                        // id 
                        ref={first_name}



                        required
                        // onChange  
                        onIonInput={(event) => validateFirstName(event)}

                        onIonBlur={() => markTouched()}


                        helperText="enter the first name"

                        errorText="Invalid name"

                    />


                    <IonInput
                        className={`${isValidLastName && 'ion-valid'} ${isValidLastName === false && 'ion-invalid'} ${isTouchedLastName && 'ion-touched'}`}


                        label="Last Name"

                        labelPlacement="start"



                        ref={last_name}



                        type="text"

                        required


                        onIonInput={(event) => validateLastName(event)}

                        helperText="enter the last name"
                        onIonBlur={() => (setIsTouchedLastName(true))}
                        errorText="Invalid name"
                    />

                    <IonList inset>

                        <IonItem >

                                {/* submit button */}

                            <IonButton onClick={createStudent} slot="end" size="default" >
                                create
                            </IonButton>


                        </IonItem>
                    </IonList>


                </IonList>
            </IonContent>
        </IonModal >

    )
}


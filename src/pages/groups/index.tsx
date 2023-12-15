import {
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonContent,
    IonItem,
    IonLabel,

} from "@ionic/react";
import React, { useEffect, useState } from "react";
import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import useSQLiteDB from "../../composables/useSQLiteDB";
import useConfirmationAlert from "../../composables/useConfirmationAlert";
import { useParams } from "react-router";
import { Students } from "../classes";







export const Group: React.FC = () => {



    const { performSQLAction, initialized } = useSQLiteDB();


    const { group } = useParams<{ group: string; }>();

    const { showConfirmationAlert, ConfirmationAlert } = useConfirmationAlert();




    const [list_student, setList_student] = useState<Students[]>()

    // const params = useParams<{id : string } >();

    useEffect(() => {

        const loadAll = async () => {
            await SELECT_STUDENTS_IN_GROUP(Number(group));

        }

        loadAll()


    }, [initialized]);


    const SELECT_STUDENTS_IN_GROUP = async (group_id: number) => {
        try {
            performSQLAction(async (db: SQLiteDBConnection | undefined) => {
                const respSelect = await db?.query(`
              SELECT
                student.student_id,
                student.student_code,
                student.first_name,
                student.last_name
              FROM Groupp
              JOIN group_student ON Groupp.group_id = group_student.group_id
              JOIN student ON group_student.student_id = student.student_id
              WHERE Groupp.group_id = ${group_id};
            `);

                const studentsInGroup = respSelect?.values?.map((row: any) => ({
                    student_id: row.student_id,
                    student_code: row.student_code,
                    first_name: row.first_name,
                    last_name: row.last_name,
                }));

                // Use the studentsInGroup array as needed
                console.log(studentsInGroup);

                setList_student(studentsInGroup)

            });
        } catch (error) {
            alert((error as Error).message);
        }
    };



    const DisplayListStudent = list_student?.map((student) => {

        return (<IonItem  >

            {student.first_name} {" "} {student.last_name}


        </IonItem>)

    })



    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>
                        Group
                    </IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent fullscreen className="ion-padding">
                <IonItem>
                    <IonLabel>
                        <IonTitle size="large" >
                            students
                        </IonTitle>
                    </IonLabel>

                </IonItem>
                {DisplayListStudent}


            </IonContent>
        </IonPage>
    );
};



import { SQLiteDBConnection } from '@capacitor-community/sqlite'
import { IonItem, IonLabel, IonRadio, IonRadioGroup } from '@ionic/react'
import React, { useCallback, useEffect, useState } from 'react'
import useSQLiteDB from '../../composables/useSQLiteDB'
import { Students } from '../../context/globalContext'

import './studentListPresence.css'

type Props = {
    group_id: number,
    student_list: [] | Students[]
    attendanceResult: [] | AttendanceResult[]
    setAttendanceResult: React.Dispatch<React.SetStateAction<[] | AttendanceResult[]>>
}



export type AttendanceResult = {

    student: Students,
    state: 'P' | 'Ab' | undefined


}



export default function StudentListPresence({ group_id , attendanceResult, setAttendanceResult}: Props) {




    const { performSQLAction, initialized } = useSQLiteDB()

    const [list_student, setList_student] = useState<Students[] | []>([])

    const [revalidateGroup, setRevalidateGroup] = useState(0)


    useEffect(() => {


        if (list_student?.length == 0) {
            setRevalidateGroup(Math.random())
            console.log('called')
        }
        if (group_id != undefined)
            SELECT_STUDENTS_IN_GROUP(group_id);



    }, [group_id, revalidateGroup]);




    const SELECT_STUDENTS_IN_GROUP = (group_id: number) => {
        try {
            performSQLAction(async (db: SQLiteDBConnection | undefined) => {
                await db?.query(`
              SELECT
                student.student_id,
                student.student_code,
                student.first_name,
                student.last_name,
                Groupp.group_id,
                Groupp.group_number , 
                Groupp.group_type
              FROM Groupp
              JOIN group_student ON Groupp.group_id = group_student.group_id
              JOIN student ON group_student.student_id = student.student_id
              WHERE Groupp.group_id = ${group_id};
            `).then(res => {

                    if (res?.values) {
                        const studentsInGroup = res?.values?.map((row: any) => ({
                            student_id: row.student_id,
                            student_code: row.student_code,
                            first_name: row.first_name,
                            last_name: row.last_name,
                        }));

                        // setGroupInfo({group_id : res?.values.})

                        // Use the studentsInGroup array as needed


                        setList_student(studentsInGroup)
                    }
                })




            });
        } catch (error) {

            alert((error as Error).message + ' error fetch student');
        }
    };


    // const [attendanceResult, setAttendanceResult] = useState<AttendanceResult[] | []>([])






    useEffect(() => {
        const initialAttendance: AttendanceResult[] = list_student.map((student) => ({
            student: student,
            state: undefined, // You can set a default state here
        }));
        setAttendanceResult(initialAttendance);
    }, [list_student]);


    const handleAttendanceChange = (e: CustomEvent, studentId: number, newState: 'P' | 'Ab') => {
        // Update the state in the attendanceResult array
        e.preventDefault();
        setAttendanceResult((prevAttendance) =>
            prevAttendance.map((ar) =>
                ar.student.student_id === studentId ? { ...ar, state: newState } : ar
            )
        );
    };




    const StudentList = attendanceResult ? attendanceResult?.map((({ student, state }, idx) => {


        return (
            <IonItem key={student.student_id}>
                <IonLabel class="ion-text-wrap" >
                    <h2 >{idx + 1} - {(student.first_name).toLowerCase()} {" "} {(student.last_name).toLowerCase()}</h2>
                </IonLabel>
                <IonRadioGroup

                    style={{ display: 'flex', gap: '20px', marginLeft: '8px', padding: '10px' }}
                    onIonChange={(e) => handleAttendanceChange(e, student.student_id, e.detail.value)}

                    value={state}

                >
                    <IonRadio color={'success'} labelPlacement='start' value="P">P</IonRadio>
                    <IonRadio color={'danger'} labelPlacement='start' value="Ab">Ab</IonRadio>
                </IonRadioGroup>
            </IonItem>
        )


    })) : null



    return (
        <div>
            <div>{StudentList}</div>
        </div>
    )
}

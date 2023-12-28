import { SQLiteDBConnection } from '@capacitor-community/sqlite'
import { IonApp, IonAvatar, IonIcon, IonItem, IonLabel } from '@ionic/react'
import { person } from 'ionicons/icons'
import { nanoid } from 'nanoid'
import React, { useEffect, useState } from 'react'
import useSQLiteDB from '../../composables/useSQLiteDB'
import { Students } from '../../context/globalContext'



type Props = {
    group_id: number,
    student_list: [] | Students[]

}

export default function StudentListPresence({ group_id, student_list }: Props) {




    const { performSQLAction } = useSQLiteDB()









    const StudentList = student_list ? student_list?.map((student =>

        <IonItem key={nanoid()}  >
            <IonAvatar slot="start">
                <IonIcon size="large" icon={person} ></IonIcon>
            </IonAvatar>
            <IonLabel class="ion-text-wrap" >
                <h2 >{student.student_code} - {(student.first_name).toLowerCase()} {" "} {(student.last_name).toLowerCase()}</h2>
            </IonLabel>
        </IonItem>


    )) : null



    return (
        <div>
            <div>{StudentList}</div>
            <div>hello</div>
        </div>
    )
}

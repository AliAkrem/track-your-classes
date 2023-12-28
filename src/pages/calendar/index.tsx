import { IonButton, IonButtons, IonChip, IonContent, IonDatetime, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonMenuButton, IonPage, IonTitle, IonToolbar } from '@ionic/react'
import { add, calendar, closeCircle, remove } from 'ionicons/icons'
import { GroupSQL, SQLClass, Students, useGlobalContext } from '../../context/globalContext'
import { useEffect, useRef, useState } from 'react'
import ClassesListModal from '../../components/classesListModal'
import StudentListPresence from '../../components/studentListPresence'
import { SQLiteDBConnection } from '@capacitor-community/sqlite'
import useSQLiteDB from '../../composables/useSQLiteDB'


export type ClassGroup = {

    group: GroupSQL
    class: SQLClass


}


export const Calender = () => {

    const { counter, year } = useGlobalContext()
    const { performSQLAction, initialized } = useSQLiteDB()

    const dateSession = useRef<HTMLIonDatetimeElement>(null)

    const [date_Session, setDate_Session] = useState("")


    console.log(date_Session)

    useEffect(() => {

        const currentDate = new Date();
        const formattedDate = currentDate.toISOString().slice(0, 19).replace("T", " ");

        console.log(dateSession ? dateSession?.current?.value : null)


        setDate_Session(formattedDate)


    }, [])



    const [selectedClassGroup, setSelectedClassGroup] = useState<ClassGroup | null>(null)

    const [selectedGroupId, setSelectedGroupId] = useState<number>(selectedClassGroup ? selectedClassGroup.group.group_id : -1)


    const [isSelectedGroupId, setIsSelectedGroupId] = useState<boolean>(true)



    console.log(selectedClassGroup)



    const [OpenSelectClassGroupModal, setOpenSelectClassGroupModal] = useState(false)


    const [student_list, setStudent_list] = useState<Students[] | []>([])

    const SELECT_STUDENTS_IN_GROUP = async (group_id: number) => {
        try {
            await performSQLAction(async (db: SQLiteDBConnection | undefined) => {
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


                        setStudent_list(studentsInGroup)
                    }
                })




            });
        } catch (error) {

            alert((error as Error).message + ' error fetch student');
        }
    };





    useEffect(() => {
        if (selectedClassGroup && initialized)
            SELECT_STUDENTS_IN_GROUP(selectedClassGroup?.group.group_id)



    }, [selectedClassGroup, initialized])





    return (

        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonMenuButton />
                    </IonButtons>
                    <IonTitle size="small" >
                        <IonChip color={"success"} >
                            <IonIcon icon={calendar}></IonIcon>
                            <IonLabel>{String(year)}</IonLabel>
                        </IonChip>
                    </IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen >





                <IonList>
                    <IonItem  >


                        {selectedClassGroup ?
                            <IonLabel  >
                                <IonChip color={'success'}  >
                                    {selectedClassGroup.class.module_name}{" "}
                                    {selectedClassGroup.class.specialty_name}{" "}
                                    {selectedClassGroup.class.specialty_level}
                                    {selectedClassGroup.class.level_year}{" "}

                                    GROUP {" "}
                                    {selectedClassGroup.group.group_number}{" "}
                                    {selectedClassGroup.group.group_type}
                                    <IonIcon onClick={() => { console.log('delete clicked'); setSelectedClassGroup(null) }} icon={closeCircle}></IonIcon>

                                </IonChip  >
                            </IonLabel> :
                            <>
                                <IonLabel>
                                    create new session
                                </IonLabel>
                                <IonButton
                                    size='large'
                                    fill='default'
                                    id="open-modal-classesList"

                                    onClick={() => setOpenSelectClassGroupModal(true)}

                                >
                                    <IonIcon color='success' icon={add} >
                                    </IonIcon>
                                </IonButton>
                            </>
                        }




                    </IonItem>
                </IonList>
                <IonDatetime ref={dateSession} onIonChange={(e: CustomEvent) => { setDate_Session(e.detail.value) }} size='cover' presentation='date-time'  ></IonDatetime>

                <ClassesListModal setSelectedClassGroup={setSelectedClassGroup} isOpen={OpenSelectClassGroupModal} close={setOpenSelectClassGroupModal} />


                {isSelectedGroupId == true && selectedClassGroup && selectedClassGroup.group.group_id ? <StudentListPresence

                    student_list={student_list}
                    group_id={selectedClassGroup.group.group_id} />
                    : null}




            </IonContent>
        </IonPage>

    )
}

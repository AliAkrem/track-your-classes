import { IonButton, IonButtons, IonChip, IonContent, IonDatetime, IonDatetimeButton, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonMenuButton, IonModal, IonPage, IonTitle, IonToolbar } from '@ionic/react'
import { add, arrowBack, calendar, closeCircle } from 'ionicons/icons'
import { GroupSQL, SQLClass, Students, useGlobalContext } from '../../context/globalContext'
import { useRef, useState } from 'react'
import ClassesListModal from '../classesListModal'
import StudentListPresence, { AttendanceResult } from '../../components/studentListPresence'
import useConfirmationAlert from '../../composables/useConfirmationAlert'


export type ClassGroup = {

    group: GroupSQL
    class: SQLClass


}



type Props = {

    isOpen: boolean
    close: React.Dispatch<React.SetStateAction<boolean>>

}



export const CreateSession = ({ isOpen, close }: Props) => {

    const { year } = useGlobalContext()

    const dateSession = useRef<HTMLIonDatetimeElement>(null)

    const [date_Session, setDate_Session] = useState(() => {

        const currentDate = new Date();
        return currentDate.toISOString().slice(0, 19).replace("T", " ");

    })




    const [selectedClassGroup, setSelectedClassGroup] = useState<ClassGroup | null>(null)


    const [isSelectedGroupId, setIsSelectedGroupId] = useState<boolean>(true)


    const [OpenSelectClassGroupModal, setOpenSelectClassGroupModal] = useState(false)


    const [student_list, setStudent_list] = useState<Students[] | []>([])



    const { ConfirmationAlert, showConfirmationAlert } = useConfirmationAlert()


    const handleRemoveGroup = () => {

        showConfirmationAlert("are you sure you want to cancel session!", () => {
            setSelectedClassGroup(null)
        })

    }


    const [attendanceResult, setAttendanceResult] = useState<AttendanceResult[] | []>([])

    // const [date, setdate] = useState(second)

    const disabledSave = () => {
        if (attendanceResult.length == 0) return true

        return attendanceResult.some((attendance) => attendance.state === undefined);
    }





    const onSubmit = () => {

        if (attendanceResult.some((attendance) => attendance.state === undefined) || attendanceResult.length == 0) {
            return
        }

        console.log(attendanceResult)
        console.log(date_Session)


        alert('session saved successfully')



    }





    return (

        <IonModal isOpen={isOpen}   >
            <IonHeader>
                <IonToolbar>
                    <IonButton onClick={() => close(false)} size='default' fill='clear' slot="start"   >

                        <IonIcon icon={arrowBack} ></IonIcon>

                    </IonButton>
                    <IonTitle size="small" >
                        create new session
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
                                    <IonIcon color='danger' onClick={handleRemoveGroup} icon={closeCircle}></IonIcon>
                                </IonChip  >
                            </IonLabel> :
                            <>
                                <IonLabel>
                                    select group
                                </IonLabel>
                                <IonButton
                                    size='default'
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

                    <IonItem>
                        <IonDatetimeButton datetime="datetime"></IonDatetimeButton>

                        <IonButton
                            style={{ width: '24%' }}
                            disabled={disabledSave()}
                            color={'success'}
                            size='default'
                            slot='end'
                            onClick={() => { onSubmit() }}
                        >Save</IonButton>

                    </IonItem>


                </IonList>



                <IonModal keepContentsMounted={true}>
                    <IonDatetime
                        id="datetime"
                        ref={dateSession}
                        onIonChange={() => { setDate_Session(String(dateSession.current?.value)) }}

                    ></IonDatetime>
                </IonModal>

                <ClassesListModal setSelectedClassGroup={setSelectedClassGroup} isOpen={OpenSelectClassGroupModal} close={setOpenSelectClassGroupModal} />


                {isSelectedGroupId == true && selectedClassGroup && selectedClassGroup.group.group_id ? <StudentListPresence

                    attendanceResult={attendanceResult}

                    setAttendanceResult={setAttendanceResult}

                    student_list={student_list}

                    group_id={selectedClassGroup.group.group_id} />
                    : null}


                {ConfirmationAlert}

            </IonContent>
        </IonModal>

    )
}

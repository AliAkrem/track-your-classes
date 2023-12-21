import { IonButton, IonButtons, IonContent, IonHeader, IonInput, IonItem, IonModal, IonSelect, IonSelectOption, IonText, IonTitle, IonToolbar } from '@ionic/react';
import React, { useRef, useState } from 'react'
import DragDropFile from '../dropExcelFile';
import { Students, useGlobalContext } from '../../context/globalContext';
import { nanoid } from 'nanoid';
import useSQLiteDB from '../../composables/useSQLiteDB';
import { SQLiteDBConnection } from '@capacitor-community/sqlite';

type Props = {
  isOpen: boolean
  setToClose: React.Dispatch<React.SetStateAction<boolean>>
  selectedClassIDToAddGroup: number
  setSelectedClassIDToAddGroup: React.Dispatch<React.SetStateAction<number>>
}


export default function CreateGroupModal({ isOpen, setToClose, selectedClassIDToAddGroup, setSelectedClassIDToAddGroup }: Props) {


  // const [modalCreateGroupOpened, setModalCreateGroupOpened] = useState(false)


  const { setRevalidate } = useGlobalContext()

  const create_class_modal_create_group = useRef<HTMLIonModalElement | null>(null)

  const [student_list, setStudent_list] = useState<Students[] | []>([])


  const type_of_group = useRef<HTMLIonSelectElement | null>(null);
  const group_number = useRef<HTMLIonInputElement>(null);

  const { performSQLAction } = useSQLiteDB()

  const CREATE_GROUP = async (group_number: number, group_type: string, student_list: Students[]) => {


    console.log({ group_number, group_type, student_list })




    try {
      // tayeb insert  student
      await performSQLAction(async (db: SQLiteDBConnection | undefined) => {
        // Assuming there is a 'class_group' table with columns: class_id, group_id, year
        await db?.query(`INSERT INTO Groupp( group_type, group_number, class_id) VALUES ( ?, ?, ?)`, [group_type, group_number, selectedClassIDToAddGroup]);

        const resGroup_id: any = await db?.query(`SELECT group_id as id FROM Groupp WHERE group_id IN (SELECT max(group_id) FROM Groupp) AND class_id = ? ;`, [selectedClassIDToAddGroup]);

        const group_id = resGroup_id?.values[0]?.id

        await Promise.all(student_list.map(async (student) => {
          await db?.query(`INSERT OR IGNORE INTO student( first_name, last_name, student_code) VALUES (?, ?, ?)`, [student.first_name, student.last_name, student.student_code]);
          const resStudent_id: any = await db?.query(`SELECT student_id as id FROM student WHERE  student_code = ? `, [student.student_code]);
          const student_id = resStudent_id?.values[0]?.id
          await db?.query(`INSERT OR IGNORE INTO group_student( group_id, student_id) VALUES (?, ?)`, [group_id, student_id]);

        }))
      });

      setRevalidate(Math.random());

      setToClose(false);
      setSelectedClassIDToAddGroup(-1);
      setStudent_list([])


    } catch (error) {
      alert((error as Error).message);



    } 
  };




  const onCreateGroup = async () => {
    if (type_of_group.current?.value !== "" && group_number.current?.value !== "" && student_list.length > 0) {
      // first we should create the group 

      let group_number_formed = Number(group_number.current?.value)
      let type_of_group_formed = String(type_of_group.current?.value)

      await CREATE_GROUP(group_number_formed, type_of_group_formed, student_list).then(() => {


      })



        ;

    }


  }




  return (
    <IonModal ref={create_class_modal_create_group} isOpen={isOpen}     >
      <IonHeader>
        <IonToolbar>
          <IonTitle >create new group</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => { create_class_modal_create_group?.current?.dismiss(); setSelectedClassIDToAddGroup(-1); setToClose(false) }}>Close</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen  >
        <IonItem className="Ion-padding"   >
          <DragDropFile setStudent_list={setStudent_list} />
        </IonItem    >

        <IonItem className="Ion-padding" >
          <IonSelect

            ref={type_of_group}
            // ref={specialty_level}
            aria-label="type of group"
            interface="popover"
            placeholder="type of group"
          >
            <IonSelectOption value="TD">TD</IonSelectOption>
            <IonSelectOption value="TP">TP</IonSelectOption>
          </IonSelect>
        </IonItem>
        <IonItem className="Ion-padding"   >

          <IonInput
            label="group number"
            labelPlacement="start"
            ref={group_number}
            type="text"
            maxlength={1}
            onIonChange={(e) => {
              const inputValue = e.detail.value;

              const numericInput = String(inputValue).replace(/[^0-5]/g, '');

              if (group_number.current)
                group_number.current.value = numericInput;
            }}
          />

        </IonItem>

        {student_list ? student_list?.map((student =>

          <IonItem key={student.student_code + student.first_name}>
            <IonText key={nanoid()} >{student.first_name} / {student.last_name} / {student.student_code} </IonText>
          </IonItem>
        )) : null
        }

        <IonItem >
          <IonButton onClick={() => {

            onCreateGroup();


          }}
            slot="start" fill="outline" size="default" >
            submit
          </IonButton>
        </IonItem>
      </IonContent>
    </IonModal>
  )
}

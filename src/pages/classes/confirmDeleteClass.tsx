import { SQLiteDBConnection } from '@capacitor-community/sqlite';
import { IonAlert } from '@ionic/react';
import React from 'react'
import useSQLiteDB from '../../composables/useSQLiteDB';
import { useGlobalContext } from '../../context/globalContext'


type Props = {
  isOpen: boolean;
  close: React.Dispatch<React.SetStateAction<boolean>>;
  message: string
  selectedClass_id: number 
};


export default function ConfirmDeleteClass({ isOpen, close, message, selectedClass_id }: Props) {

  const { performSQLAction } = useSQLiteDB()

  const { setRevalidate } = useGlobalContext()

  const DELETE_CLASS = async (classId: number) => {

    console.log('delete class called ', classId)

    try {
      await performSQLAction(async (db: SQLiteDBConnection | undefined) => {

        await db?.query(`DELETE FROM class WHERE class_id = ?`, [classId], true)
          .then(() => {
            setRevalidate(Math.random)
          });

      })
    } catch (error) {
      alert((error as Error).message);
    }
  };

  return (
    <IonAlert
      isOpen={isOpen}
      trigger="delete-class"
      message={message}
      buttons={[
        {
          text: "Cancel",
          role: "cancel",
          handler: () => close(false),
        },
        {
          text: "Confirm",
          handler : ()=>{
            DELETE_CLASS(selectedClass_id)
            close(false);
          }
        },
      ]}
    ></IonAlert>
  )
}


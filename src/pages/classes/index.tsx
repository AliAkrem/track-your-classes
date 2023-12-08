import {
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonContent,
  IonButton,
  IonButtons,
  IonMenuButton,
  IonList,
  IonModal,
  IonFabButton,
  IonIcon,
  IonFab,
  IonFabList,
} from "@ionic/react";
import React, { useEffect, useRef, useState } from "react";
import "./classes.css";
import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import useSQLiteDB from "../../composables/useSQLiteDB";
import useConfirmationAlert from "../../composables/useConfirmationAlert";
import ModuleSelect from "../../components/module_select";
import SpecialtySelect from "../../components/specialty_select";
import { add, chevronDownSharp, } from "ionicons/icons";


export interface SpecialtiesSQL {
  specialty_id: number,
  specialty_name: string,
  specialty_name_abv: string,
  specialty_level: string,
  collage_year: number
}


export type SQLModule = {
  module_id: number;
  module_name: string;
  module_name_abv: string;
};



export const Classes: React.FC = () => {
  const [editItem, setEditItem] = useState<any>();
  const [inputName, setInputName] = useState("");
  const [modules, setModules] = useState<Array<SQLModule>>();
  const [specialties, setSpecialties] = useState<Array<SpecialtiesSQL>>()




  // hook for sqlite db
  const { performSQLAction, initialized } = useSQLiteDB();

  // hook for confirmation dialog
  const { showConfirmationAlert, ConfirmationAlert } = useConfirmationAlert();




  useEffect(() => {
    loadData()
  }, [initialized]);

  /**
   * do a select of the database
   */

  const loadData = async () => {
    try {
      // query db
      performSQLAction(async (db: SQLiteDBConnection | undefined) => {
        const respSelect = await db?.query(`SELECT * FROM module`);
        setModules(respSelect?.values);

        const respSelectSpecialties = await db?.query(`SELECT * FROM specialty `);

        setSpecialties(respSelectSpecialties?.values);

      });
    } catch (error) {
      alert((error as Error).message);
      
    }
  };


 

  /**
   * do a select of the database
   */







  const updateItem = async () => {
    try {
      // add test record to db
      performSQLAction(
        async (db: SQLiteDBConnection | undefined) => {
          await db?.query(`UPDATE test2 SET name=? WHERE id=?`, [
            inputName,
            editItem?.id,
          ]);

          // update ui
          const respSelect = await db?.query(`SELECT * FROM test2;`);
          setModules(respSelect?.values);
        },
        async () => {
          setInputName("");
          setEditItem(undefined);
        }
      );
    } catch (error) {
      alert((error as Error).message);
    }
  };





  const addItem = async () => {
    try {
      // add test record to db
      performSQLAction(
        async (db: SQLiteDBConnection | undefined) => {
          await db?.query(`INSERT INTO test2 (id,name) values (?,?);`, [
            Date.now(),
            inputName,
          ]);

          // update ui
          const respSelect = await db?.query(`SELECT * FROM test2;`);
          setModules(respSelect?.values);
        },
        async () => {
          setInputName("");
        }
      );
    } catch (error) {
      alert((error as Error).message);
    }
  };





  const confirmDelete = (itemId: number) => {
    showConfirmationAlert("Are You Sure You Want To Delete This Item?", () => {
      deleteItem(itemId);
    });
  };



  const deleteItem = async (itemId: number) => {
    try {
      // add test record to db
      performSQLAction(
        async (db: SQLiteDBConnection | undefined) => {
          await db?.query(`DELETE FROM test2 WHERE id=?;`, [itemId]);

          // update ui
          const respSelect = await db?.query(`SELECT * FROM test2;`);
          setModules(respSelect?.values);
        },
        async () => {
          setInputName("");
        }
      );
    } catch (error) {
      alert((error as Error).message);
    }
  };

  const doEditItem = (item: SQLModule | undefined) => {
    if (item) {
      setEditItem(item);
      setInputName(item.module_name);
    } else {
      setEditItem(undefined);
      setInputName("");
    }
  };

  const create_class_modal = useRef<HTMLIonModalElement | null>(null)




  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>

          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Manage Classes</IonTitle>
        </IonToolbar>

      </IonHeader>



      <IonContent fullscreen className="ion-padding">

        <IonFab slot="fixed" vertical="top" horizontal="end" edge={true}>
          <IonFabButton>
            <IonIcon icon={chevronDownSharp}></IonIcon>
          </IonFabButton>
          <IonFabList side="bottom">
            <IonFabButton id="open-create-class" >
              <IonIcon icon={add}></IonIcon>
            </IonFabButton>
          </IonFabList>
        </IonFab>
        <IonModal ref={create_class_modal} trigger="open-create-class" >

          <IonHeader>
            <IonToolbar>
              <IonTitle>create new class</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => create_class_modal?.current?.dismiss()}>Close</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <IonList inset>

              {modules ? <ModuleSelect modules={modules} setModules={setModules} /> : null}
              {specialties ?   <SpecialtySelect  specialties={specialties}  setSpecialties={setSpecialties}    /> : null }

            </IonList>
          </IonContent>
          {/* {ConfirmationAlert} */}
        </IonModal>
      </IonContent>
    </IonPage>
  );
};


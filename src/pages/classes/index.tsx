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
  IonItem,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonAccordionGroup,
  IonAccordion,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonActionSheet,
  IonInput,
} from "@ionic/react";
import React, { useEffect, useRef, useState } from "react";
import "./classes.css";
import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import useSQLiteDB from "../../composables/useSQLiteDB";
import useConfirmationAlert from "../../composables/useConfirmationAlert";
import ModuleSelect from "../../components/module_select";
import SpecialtySelect from "../../components/specialty_select";
import { add, addCircleOutline, chevronDownSharp, ellipsisVertical, trash, } from "ionicons/icons";
import { OverlayEventDetail } from "@ionic/react/dist/types/components/react-component-lib/interfaces";
import { nanoid } from "nanoid";
import DragDropFile from "../../components/dropExcelFile";


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



export type SQLClass = {
  class_id: number
  specialty: SpecialtiesSQL
  module: SQLModule

}


const classes: SQLClass[] = [{

  class_id: 1,
  module: {
    module_id: 1,
    module_name: "software engineering",
    module_name_abv: "GL"
  },
  specialty: {
    specialty_name: 'network and distributed systems',
    specialty_name_abv: "RSD",
    specialty_level: "M",
    collage_year: 1,
    specialty_id: 1
  }

},
{
  class_id: 2,
  module: {
    module_id: 2,
    module_name: "distributed systems",
    module_name_abv: "DS"
  },
  specialty: {
    specialty_name: 'network and distributed systems',
    specialty_name_abv: "RSD",
    specialty_level: "M",
    collage_year: 1,
    specialty_id: 1
  }
}



]






export const Classes: React.FC = () => {
  const [editItem, setEditItem] = useState<any>();
  const [inputName, setInputName] = useState("");
  const [modules, setModules] = useState<Array<SQLModule>>();
  const [specialties, setSpecialties] = useState<Array<SpecialtiesSQL>>()


  const [selectedModule, setSelectedModule] = useState<string[]>([]);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);



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
      setModules([])
      setSpecialties([])

    }
  };




  /**
   * do a select of the database
   */







  // const updateItem = async () => {
  //   try {
  //     // add test record to db
  //     performSQLAction(
  //       async (db: SQLiteDBConnection | undefined) => {
  //         await db?.query(`UPDATE test2 SET name=? WHERE id=?`, [
  //           inputName,
  //           editItem?.id,
  //         ]);

  //         // update ui
  //         const respSelect = await db?.query(`SELECT * FROM test2;`);
  //         setModules(respSelect?.values);
  //       },
  //       async () => {
  //         setInputName("");
  //         setEditItem(undefined);
  //       }
  //     );
  //   } catch (error) {
  //     alert((error as Error).message);
  //   }
  // };
  // const addItem = async () => {
  //   try {
  //     // add test record to db
  //     performSQLAction(
  //       async (db: SQLiteDBConnection | undefined) => {
  //         await db?.query(`INSERT INTO test2 (id,name) values (?,?);`, [
  //           Date.now(),
  //           inputName,
  //         ]);

  //         // update ui
  //         const respSelect = await db?.query(`SELECT * FROM test2;`);
  //         setModules(respSelect?.values);
  //       },
  //       async () => {
  //         setInputName("");
  //       }
  //     );
  //   } catch (error) {
  //     alert((error as Error).message);
  //   }
  // };
  // const confirmDelete = (itemId: number) => {
  //   showConfirmationAlert("Are You Sure You Want To Delete This Item?", () => {
  //     deleteItem(itemId);
  //   });
  // };
  // const deleteItem = async (itemId: number) => {
  //   try {
  //     // add test record to db
  //     performSQLAction(
  //       async (db: SQLiteDBConnection | undefined) => {
  //         await db?.query(`DELETE FROM test2 WHERE id=?;`, [itemId]);

  //         // update ui
  //         const respSelect = await db?.query(`SELECT * FROM test2;`);
  //         setModules(respSelect?.values);
  //       },
  //       async () => {
  //         setInputName("");
  //       }
  //     );
  //   } catch (error) {
  //     alert((error as Error).message);
  //   }
  // };
  // const doEditItem = (item: SQLModule | undefined) => {
  //   if (item) {
  //     setEditItem(item);
  //     setInputName(item.module_name);
  //   } else {
  //     setEditItem(undefined);
  //     setInputName("");
  //   }
  // };




  const create_class_modal = useRef<HTMLIonModalElement | null>(null)
  const create_class_modal_create_group = useRef<HTMLIonModalElement | null>(null)

  const [modalCreateGroupOpened, setModalCreateGroupOpened] = useState(false)




  const onSubmit = () => {

    console.log({ selectedModule, selectedSpecialties })


    if (selectedModule.length > 0 && selectedSpecialties.length > 0) {

      selectedSpecialties.map((s) => {

        selectedModule.map((m) => {

          // INSERT_NEW_CLASS(m, s)

        })

      })

    }




  }


  const ActionResult = (result: OverlayEventDetail, classPayload: { class_id: number, module_id: number, specialty_id: number }) => {




    if (result.data?.action === "delete") {

      showConfirmationAlert("Are You Sure You Want To Delete this class? the information related to this class will deleted also! ", () => {
        console.log('delete class logic here', { classPayload })
      })

    };


    if (result.data?.action === "create-group") {

      setModalCreateGroupOpened(true)
      console.log('create new group in this class ', classPayload)
    }





  }


  const ListClasses = classes.map((classe) => {
    return (

      <div key={nanoid()}  >
        <IonAccordion toggleIconSlot="start" value={classe.module.module_id + "" + classe.specialty.specialty_id}>
          <IonItem slot="header" color="light">
            <IonLabel> {classe.module.module_name_abv + " / " + classe.specialty.specialty_name_abv} </IonLabel>
            <IonButton fill="clear" id={"open-action-sheet" + classe.module.module_id + "" + classe.specialty.specialty_id} >
              <IonIcon onClick={() => { console.log('clicked') }} size="small" icon={ellipsisVertical}></IonIcon>
            </IonButton>

          </IonItem>

          <IonItem slot="content">
            group 1
          </IonItem>

        </IonAccordion>
        <IonActionSheet
          trigger={"open-action-sheet" + classe.module.module_id + "" + classe.specialty.specialty_id}
          header="Actions"
          buttons={[
            {
              text: 'Delete',
              role: 'destructive',
              data: {
                action: 'delete',
              },
            },
            {

              text: 'create new group',
              role: 'create',
              data: {
                action: 'create-group',
              },
            },
          ]}
          onDidDismiss={({ detail }) => ActionResult(detail, { class_id: classe.class_id, module_id: classe.module.module_id, specialty_id: classe.specialty.specialty_id })}
        ></IonActionSheet>
      </div>
    )
  })




  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>

          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle size="small" >Manage Classes</IonTitle>
        </IonToolbar>

      </IonHeader>



      <IonContent fullscreen >

        <IonFab id="open-create-class" slot="fixed" vertical="bottom" horizontal="end">
          <IonFabButton>
            <IonIcon icon={add}></IonIcon>
          </IonFabButton>
        </IonFab>
        <IonAccordionGroup>

          {ListClasses}
        </IonAccordionGroup>





        <IonModal ref={create_class_modal_create_group} isOpen={modalCreateGroupOpened}   >
          <IonHeader>
            <IonToolbar>
              <IonTitle >create new group</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => { create_class_modal_create_group?.current?.dismiss(); setModalCreateGroupOpened(false) }}>Close</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent fullscreen  >
            <IonItem  className="Ion-padding"   >
            {/* <center  > */}
              <DragDropFile />
            {/* </center> */}
            </IonItem>
          </IonContent>
        </IonModal>


        <IonModal ref={create_class_modal} trigger="open-create-class" >
          <IonHeader>
            <IonToolbar>
              <IonTitle >create new class</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => create_class_modal?.current?.dismiss()}>Close</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <IonList >

              {modules ? <ModuleSelect selectedModule={selectedModule} setSelectedModule={setSelectedModule} modules={modules} setModules={setModules} /> : null}
              {specialties ? <SpecialtySelect selectedSpecialties={selectedSpecialties} setSelectedSpecialties={setSelectedSpecialties} specialties={specialties} setSpecialties={setSpecialties} /> : null}

              <IonList inset>
                <IonItem >
                  <IonButton disabled={selectedModule.length == 0 || selectedSpecialties.length == 0} onClick={() => onSubmit()} slot="end" fill="outline" size="default" >
                    submit
                  </IonButton>
                </IonItem>
              </IonList>

            </IonList>
          </IonContent>
        </IonModal>
        {ConfirmationAlert}

      </IonContent >
    </IonPage >
  );
};


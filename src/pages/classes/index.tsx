import {
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonContent,
  IonButton,
  IonButtons,
  IonMenuButton,
  IonFabButton,
  IonIcon,
  IonFab,
  IonItem,
  IonAccordionGroup,
  IonAccordion,
  IonLabel,
  IonActionSheet,
  RefresherEventDetail,
  IonRefresher,
  IonRefresherContent,
  IonCard,
  IonCardContent,
  useIonViewWillEnter,

} from "@ionic/react";
import React, { useEffect, useRef, useState } from "react";
import "./classes.css";
import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import useSQLiteDB from "../../composables/useSQLiteDB";
import useConfirmationAlert from "../../composables/useConfirmationAlert";
import { add, arrowRedo, ellipsisVertical, list, } from "ionicons/icons";
import { OverlayEventDetail } from "@ionic/react/dist/types/components/react-component-lib/interfaces";
import {  SQLClass, useGlobalContext } from "../../context/globalContext";
import { CreateClassModal } from "../../components/createClassModal";
import CreateGroupModal from "../../components/createGroupModal";
import { nanoid } from "nanoid";








export const Classes: React.FC = () => {

  const { 
    year,
    setRevalidate,
    isLoading,
    counter, 
    selectedModule, 
    selectedSpecialties,
    revalidate
  } = useGlobalContext()



  const [openedCreateClassModel, setopenedCreateClassModel] = useState(false)

  const [modalCreateGroupOpened, setModalCreateGroupOpened] = useState(false)

  const classesGroupRef = useRef<HTMLIonAccordionGroupElement | null>(null)

  const [selectedClassIDToAddGroup, setSelectedClassIDToAddGroup] = useState(-1)





  // hook for sqlite db
  const { performSQLAction, initialized } = useSQLiteDB();

  // hook for confirmation dialogperformSQLAction
  const { showConfirmationAlert, ConfirmationAlert } = useConfirmationAlert();



  const DELETE_CLASS = async (classId: number) => {

    try {
      await performSQLAction(async (db: SQLiteDBConnection | undefined) => {

        await db?.query(`DELETE FROM class WHERE class_id = ? `, [classId]);

        setRevalidate(Math.random)

      });
    } catch (error) {
      alert((error as Error).message);

    }
  };


  // related to display classes list
  const ActionResult = (result: OverlayEventDetail, classPayload: { class_id: number, module_id: number, specialty_id: number }) => {

    if (result.data?.action === "delete") {

      showConfirmationAlert("Are You Sure You Want To Delete this class? the information related to this class will deleted also! ", () => {
        DELETE_CLASS(classPayload?.class_id)

      })

    };


    if (result.data?.action === "create-group") {

      setModalCreateGroupOpened(true)
      setSelectedClassIDToAddGroup(classPayload.class_id)

    }



  }


  const [classesList, setclassesList] = useState<Array<SQLClass> | []>([])





  useEffect(() => {

    LOAD_CLASSES()
    // LOAD_CLASSES()

  }, [revalidate, initialized ])
  

  const LOAD_CLASSES = async () => {

    try {
        await performSQLAction(async (db: SQLiteDBConnection | undefined) => {
  
            const respSelectClasses = await db?.query(`
            SELECT 
             class.class_id,
             specialty.specialty_id,
              specialty.specialty_name,
               specialty.specialty_name_abv,
                specialty.specialty_level, specialty.collage_year,
                 module.module_id,
                  module.module_name,
                   module.module_name_abv,
                    Groupp.group_id,
                     Groupp.group_number, 
                     Groupp.group_type FROM class 
                      JOIN specialty ON class.specialty_id = specialty.specialty_id JOIN module ON class.module_id = module.module_id
                       LEFT JOIN Groupp ON class.class_id = Groupp.class_id
                        WHERE class.scholar_year_id = ? ; `, [year]);

            const classesWithGroups = respSelectClasses?.values?.reduce((result: any, row: any) => {
                const classInfo = result[row.class_id] || {
                    class_id: row.class_id,
                    specialty: {
                        specialty_id: row.specialty_id,
                        specialty_name: row.specialty_name,
                        specialty_name_abv: row.specialty_name_abv,
                        specialty_level: row.specialty_level,
                        collage_year: row.collage_year,
                    },
                    module: {
                        module_id: row.module_id,
                        module_name: row.module_name,
                        module_name_abv: row.module_name_abv,
                    },
                    groups: [],
                };

                if (row.group_id) {
                    const groupInfo = {
                        group_id: row.group_id,
                        group_number: row.group_number,
                        group_type: row.group_type,
                    };

                    classInfo.groups.push(groupInfo);
                }

                result[row.class_id] = classInfo;
                return result;
            }, {});


                const classes_formatted  = Object.values(classesWithGroups);
                setclassesList(classes_formatted as SQLClass[]);


                // setListClasses(classes_formatted as  SQLClass[]);

        });





        // setRevalidate(Math.random)

    } catch (error) {
        alert((error as Error).message);
        // setRevalidate(Math.random)
    }
};

  




  const ListClasses = classesList?.map((classe) => {


    const trigger = nanoid()




    return (

      <div key={nanoid()}  >
        <IonAccordion toggleIconSlot="start" value={nanoid()} >
          <IonItem slot="header" color="light">
            <IonLabel> {classe.module.module_name_abv + " / " + classe.specialty.specialty_name_abv + " / " + classe.specialty.specialty_level + classe.specialty.collage_year}</IonLabel>
            <IonButton fill="clear" id={trigger} >
              <IonIcon size="small" icon={ellipsisVertical}></IonIcon>
            </IonButton>
          </IonItem>

          {classe.groups?.map(group => {
            return (<IonItem slot="content" key={group.group_id}   >
              <IonLabel>
                group {group.group_number} /{group.group_type}
              </IonLabel>
              <IonButton fill="clear" href={`/classes/${group.group_id}`} size="large" >
                <IonIcon size="small" icon={arrowRedo}></IonIcon>
              </IonButton>
            </IonItem>)
          })
          }


        </IonAccordion>
        <IonActionSheet
          trigger={trigger}
          header={classe.module.module_name_abv + " / " + classe.specialty.specialty_name_abv + " / " + classe.specialty.specialty_level + classe.specialty.collage_year}
          buttons={[
            {
              text: 'Delete',
              role: 'delete',
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







  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    setTimeout(() => {
      // Any calls to load data go here
      event.detail.complete();
    }, 2000);

    setRevalidate(Math.random());

  }



  if (isLoading) return null;


  return (


    <IonPage  >
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle size="small" >Manage Classes {String(year)}  counter : {counter}  </IonTitle>

        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen >


        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>


        <IonFab slot="fixed" vertical="bottom" horizontal="end">
          <IonFabButton onClick={() => { setopenedCreateClassModel(true) }}  >
            <IonIcon icon={add}></IonIcon>
          </IonFabButton>
        </IonFab>





        {
          classesList?.length > 0   ?
            <IonAccordionGroup ref={classesGroupRef} multiple={false} >
              {ListClasses}
            </IonAccordionGroup> :
            <div style={{ display: 'flex', alignItems: 'center', height: "80vh", justifyContent: 'center' }}  >
              <IonCard >
                <IonCardContent  >no classes here yet!. Click (+) to add one </IonCardContent>
              </IonCard>
            </div>

        }
        <pre>
          {JSON.stringify(classesList, null, 2)}
          {JSON.stringify(selectedModule, null, 2)}
          {JSON.stringify(selectedSpecialties, null, 2)}

          
        </pre>






        <CreateGroupModal selectedClassIDToAddGroup={selectedClassIDToAddGroup} setSelectedClassIDToAddGroup={setSelectedClassIDToAddGroup} isOpen={modalCreateGroupOpened} setToClose={setModalCreateGroupOpened} />

        <CreateClassModal isOpen={openedCreateClassModel} close={setopenedCreateClassModel} />


        {ConfirmationAlert}

      </IonContent >
    </IonPage >
  );
};


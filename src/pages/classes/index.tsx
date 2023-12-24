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
  IonText,
  IonChip,

} from "@ionic/react";
import React, { useEffect, useRef, useState } from "react";
import "./classes.css";
import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import useSQLiteDB from "../../composables/useSQLiteDB";
import useConfirmationAlert from "../../composables/useConfirmationAlert";
import { add, calendar, create, ellipsisVertical,  trash, } from "ionicons/icons";
import { OverlayEventDetail } from "@ionic/react/dist/types/components/react-component-lib/interfaces";
import { SQLClass, useGlobalContext } from "../../context/globalContext";
import { CreateClassModal } from "../../components/createClassModal";
import CreateGroupModal from "../../components/createGroupModal";
import { nanoid } from "nanoid";
import { Group } from "../groups";
import { UpdateClass } from "../../components/updateClassModal";



export const Classes: React.FC = () => {

  const {
    year,
    setRevalidate,
    isLoading,
    counter,

    revalidate
  } = useGlobalContext()



  const [openedCreateClassModel, setopenedCreateClassModel] = useState(false)

  const [modalCreateGroupOpened, setModalCreateGroupOpened] = useState(false)

  const [modalUpdateClassOpened, setModalUpdateClassOpened] = useState(false)




  const classesGroupRef = useRef<HTMLIonAccordionGroupElement | null>(null)

  const [selectedClassIDToAddGroup, setSelectedClassIDToAddGroup] = useState(-1)
  const [selectedClass, setSelectedClass] = useState<SQLClass | undefined>()





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
  const ActionResult = (result: OverlayEventDetail, classPayload: { classe: SQLClass }) => {

    if (result.data?.action === "delete") {

      showConfirmationAlert("Are You Sure You Want To Delete this class? the information related to this class will deleted also! ", () => {
        DELETE_CLASS(classPayload?.classe.class_id)

      })

    };


    if (result.data?.action === "create-group") {

      setModalCreateGroupOpened(true)
      setSelectedClassIDToAddGroup(classPayload.classe.class_id)

    }

    if (result.data?.action === "edit-class") {

      setModalUpdateClassOpened(true)
      setSelectedClass(classPayload.classe)

    }



  }


  const [classesList, setClassesList] = useState<Array<SQLClass> | []>([])





  useEffect(() => {
    if (initialized) {
      LOAD_CLASSES()
    }
  }, [revalidate, initialized])




  const LOAD_CLASSES = async () => {

    try {
      await performSQLAction(async (db: SQLiteDBConnection | undefined) => {
        console.log(year)
        const respSelectClasses = await db?.query(`
            SELECT 
              class.class_id, 
              class.module_name,
              class.specialty_name,
              class.specialty_level, 
              class.level_year,
              class.collage_year,
              Groupp.group_id,
              Groupp.group_number, 
              Groupp.group_type 
            FROM class 

              LEFT JOIN Groupp ON class.class_id = Groupp.class_id

            WHERE class.collage_year = ? 
              `, [year]);

        const classesWithGroups = respSelectClasses?.values?.reduce((result: any, row: any) => {
          const classInfo = result[row.class_id] || {
            class_id: row.class_id,

            specialty_name: row.specialty_name,
            specialty_level: row.specialty_level,
            level_year: row.level_year,
            collage_year: row.collage_year,

            module_name: row.module_name,

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




        const classes_formatted = Object.values(classesWithGroups);
        setClassesList(classes_formatted as SQLClass[]);


        // setListClasses(classes_formatted as  SQLClass[]);

      });





      // setRevalidate(Math.random)

    } catch (error) {
      alert((error as Error).message);
      // setRevalidate(Math.random)
    }
  };



  const [selectedGroup, setSelectedGroup] = useState<number | undefined>()



  const ListClasses = classesList?.map((classe) => {
    const trigger = nanoid()
    return (

      <div key={nanoid()}  >
        <IonAccordion toggleIconSlot="start" value={nanoid()}  >
          <IonItem slot="header" color="light">
            <IonLabel class="ion-text-wrap" > {classe.module_name + " / " + classe.specialty_name + " / " + classe.specialty_level + classe.level_year}</IonLabel>
            <IonButton fill="clear" id={trigger} >
              <IonIcon size="small" icon={ellipsisVertical}></IonIcon>
            </IonButton>
          </IonItem>

          {classe.groups?.map(group => {
            return (<IonItem slot="content" key={group.group_id}   >
              <IonText style={{ cursor: 'pointer' }} onClick={() => { setSelectedGroup(group.group_id) }} color={'primary'} >

                group {group.group_number} / {group.group_type}

              </IonText>

            </IonItem>)
          })
          }


        </IonAccordion>
        <IonActionSheet
          trigger={trigger}
          header={classe.module_name + " / " + classe.specialty_name + " / " + classe.specialty_level + classe.level_year}
          buttons={[
            {

              icon: create,
              text: 'edit',
              role: 'edit-class',
              data: {
                action: 'edit-class',
              },
            },
            {
              icon: add,
              text: 'create new group',
              role: 'create',
              data: {
                action: 'create-group',
              },
            },

            {
              icon: trash,
              text: 'Delete',
              role: 'delete',
              data: {
                action: 'delete',
              },
            },
          ]}
          onDidDismiss={({ detail }) => ActionResult(detail, { classe: classe })}
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
          <IonTitle size="small" >
            {counter}
            <IonChip color={"success"} >
              <IonIcon icon={calendar}></IonIcon>
              <IonLabel>{String(year)}</IonLabel>
            </IonChip>

          </IonTitle>



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
          classesList?.length > 0 ?
            <IonAccordionGroup ref={classesGroupRef} multiple={false} >
              {ListClasses}
            </IonAccordionGroup> :
            <div style={{ display: 'flex', alignItems: 'center', height: "80vh", justifyContent: 'center' }}  >
              <IonCard >
                <IonCardContent  >no classes here yet!. Click (+) to add one </IonCardContent>
              </IonCard>
            </div>

        }



        <CreateGroupModal selectedClassIDToAddGroup={selectedClassIDToAddGroup} setSelectedClassIDToAddGroup={setSelectedClassIDToAddGroup} isOpen={modalCreateGroupOpened} setToClose={setModalCreateGroupOpened} />

        <CreateClassModal isOpen={openedCreateClassModel} close={setopenedCreateClassModel} />


        {selectedClass && <UpdateClass isOpen={modalUpdateClassOpened} classe={selectedClass}  setSelectedClass={setSelectedClass} close={setModalUpdateClassOpened}  />}



        <Group group_id={selectedGroup} setSelectedGroup={setSelectedGroup} />

        {ConfirmationAlert}

      </IonContent >
    </IonPage >
  );
};


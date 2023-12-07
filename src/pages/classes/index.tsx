import {
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonContent,
    IonItem,
    IonInput,
    IonButton,
    IonLabel,
    IonButtons,
    IonMenuButton,
  } from "@ionic/react";
  import React, { useEffect, useState } from "react";
  import "./classes.css";
  import { SQLiteDBConnection } from "@capacitor-community/sqlite";
  import useSQLiteDB from "../../composables/useSQLiteDB";
  import useConfirmationAlert from "../../composables/useConfirmationAlert";
  import { useParams } from "react-router";
  
  
  
  
  
  type SQLItem = {
    id: number;
    name: string;
  };
  
  
  
  export  const Classes: React.FC = () => {
    const [editItem, setEditItem] = useState<any>();
    const [inputName, setInputName] = useState("");
    const [items, setItems] = useState<Array<SQLItem>>();
  
    // hook for sqlite db
    const { performSQLAction, initialized } = useSQLiteDB();
  
    // hook for confirmation dialog
    const { showConfirmationAlert, ConfirmationAlert } = useConfirmationAlert();
  
    useEffect(() => {
      loadData();
    }, [initialized]);
  
  
    
    /**
     * do a select of the database
     */
  
    const loadData = async () => {
      try {
        // query db
        performSQLAction(async (db: SQLiteDBConnection | undefined) => {
          const respSelect = await db?.query(`SELECT * FROM test2`);
          setItems(respSelect?.values);
        });
      } catch (error) {
        alert((error as Error).message);
        setItems([]);
      }
    };
    
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
            setItems(respSelect?.values);
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
            setItems(respSelect?.values);
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
            setItems(respSelect?.values);
          },
          async () => {
            setInputName("");
          }
        );
      } catch (error) {
        alert((error as Error).message);
      }
    };
  
    const doEditItem = (item: SQLItem | undefined) => {
      if (item) {
        setEditItem(item);
        setInputName(item.name);
      } else {
        setEditItem(undefined);
        setInputName("");
      }
    };
  
    const { name } = useParams<{ name: string; }>();
  
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
        
            <IonButtons slot="start">
              <IonMenuButton />
            </IonButtons>
            <IonTitle>{name}</IonTitle>
        
          </IonToolbar>
        </IonHeader>
  
  
        <IonContent fullscreen className="ion-padding">
          {editItem ? (
            <IonItem>
              <IonInput
                type="text"
                value={inputName}
                onIonInput={(e) => setInputName(e.target.value as string)}
              ></IonInput>
              <IonButton onClick={() => doEditItem(undefined)}>CANCEL</IonButton>
              <IonButton onClick={updateItem}>UPDATE</IonButton>
            </IonItem>
          ) : (
            <IonItem>
              <IonInput
                type="text"
                value={inputName}
                onIonInput={(e) => setInputName(e.target.value as string)}
              ></IonInput>
              <IonButton slot="end" onClick={addItem} disabled={inputName.trim() === ""}>
                ADD
              </IonButton>
            </IonItem>
          )}
  
          <h3>THE SQLITE DATA</h3>
  
          {items?.map((item) => (
            <IonItem key={item?.id}>
              <IonLabel className="ion-text-wrap">{item.name}</IonLabel>
              <IonButton onClick={() => doEditItem(item)}>EDIT</IonButton>
              <IonButton onClick={() => confirmDelete(item.id)}>DELETE</IonButton>
            </IonItem>
          ))}
  
          {ConfirmationAlert}
        </IonContent>
      </IonPage>
    );
  };
  
  
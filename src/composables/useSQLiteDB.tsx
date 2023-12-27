import { useEffect, useRef, useState } from "react";

import {
  SQLiteDBConnection,
  SQLiteConnection,
  CapacitorSQLite,
} from "@capacitor-community/sqlite";
import { isPlatform } from "@ionic/react";
import { Capacitor } from "@capacitor/core";


const useSQLiteDB = () => {

  const db = useRef<SQLiteDBConnection>();
  const sqlite = useRef<SQLiteConnection>();


  const [initialized, setInitialized] = useState<boolean>(false);

  useEffect(() => {



    initializeDB().then(async () => {
      await initializeTables();
      setInitialized(true);
    });

  }, []);

  const initializeDB = async () => {
    if (sqlite.current) return;

    sqlite.current = new SQLiteConnection(CapacitorSQLite);

    const ret = await sqlite.current.checkConnectionsConsistency();

    const isConn = (await sqlite.current.isConnection("db_vite", false)).result;

    if (ret.result && isConn) {

      db.current = await sqlite.current.retrieveConnection("db_vite", false);

    } else {

      db.current = await sqlite.current.createConnection(
        "db_vite",
        false,
        "no-encryption",
        1,
        false
      );


    }
  };



  const performSQLAction = async (
    action: (db: SQLiteDBConnection | undefined) => Promise<void>,
    cleanup?: () => Promise<void>
  ) => {
    try {
      await db.current?.open().
        then(async () => await action(db.current))

    } catch (error) {
      alert((error as Error).message);
    } finally {
      try {
        const platform = Capacitor.getPlatform();
        if (platform === 'web')
          (await db.current?.isDBOpen())?.result && (await db.current?.close());


        cleanup && (await cleanup());
      } catch {



      }
    }
  };


  /**
   * here is where you cna check and update table
   * structure
   */

  const initializeTables = async () => {


    const createClassTable = ` CREATE TABLE IF NOT EXISTS class( class_id INTEGER PRIMARY KEY NOT NULL,  module_name varchar(30) NOT NULL, specialty_name VARCHAR(30) NOT NULL , specialty_level VARCHAR(1) CHECK (specialty_level IN ('L', 'M', 'E')), level_year INTEGER, collage_year VARCHAR(9) NOT NULL CHECK(collage_year LIKE '____/____') );`


    const createStudentGroupTable = `CREATE TABLE IF NOT EXISTS  group_student (group_id INTEGER,student_id  INTEGER,FOREIGN KEY (group_id) REFERENCES Groupp(group_id) ON DELETE  CASCADE ,FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE  CASCADE,UNIQUE (group_id, student_id)); `;


    const createStudentTable = `CREATE TABLE IF NOT EXISTS student( student_id INTEGER PRIMARY KEY NOT NULL, student_code varchar(30) NOT NULL, first_name varchar(30) NOT NULL , last_name varchar(30) NOT NULL );
    `


    const keyValue = `CREATE TABLE IF NOT EXISTS keys ( selected_year VARCHAR(9) NOT NULL UNIQUE CHECK(selected_year LIKE '____/____')); `


    const createGroupTable = `CREATE TABLE IF NOT EXISTS Groupp(group_id INTEGER PRIMARY KEY NOT NULL , class_id INTEGER NOT NULL,group_type VARCHAR(2) CHECK (group_type IN ('TD', 'TP')), group_number  INTEGER NOT NULL,FOREIGN KEY (class_id) REFERENCES class(class_id) ON DELETE NO ACTION,UNIQUE (class_id, group_number, group_type ) );`;





    await performSQLAction(async (db: SQLiteDBConnection | undefined) => {

      await db?.execute(createClassTable); // CLASS 

      await db?.execute(createStudentTable); // STUDENT

      await db?.execute(keyValue);


      await db?.execute(createGroupTable); // GROUP 

      await db?.execute(createStudentGroupTable); // ASSIGN STUDENT TO CLASSES




    });
  };


  return { performSQLAction, initialized, initializeDB };
};

export default useSQLiteDB;

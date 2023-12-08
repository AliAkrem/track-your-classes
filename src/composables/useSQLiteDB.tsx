import { useEffect, useRef, useState } from "react";
import {
  SQLiteDBConnection,
  SQLiteConnection,
  CapacitorSQLite,
} from "@capacitor-community/sqlite";

const useSQLiteDB = () => {


  const db = useRef<SQLiteDBConnection>();
  const sqlite = useRef<SQLiteConnection>();



  const [initialized, setInitialized] = useState<boolean>(false);

  useEffect(() => {
    const initializeDB = async () => {
      if (sqlite.current) return;

      sqlite.current = new SQLiteConnection(CapacitorSQLite);
      const ret = await sqlite.current.checkConnectionsConsistency();
      const isConn = (await sqlite.current.isConnection("db_vite", false))
        .result;

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

    initializeDB().then(async () => {
      await initializeTables();
      setInitialized(true);
    });
  }, []);



  const performSQLAction = async (
    action: (db: SQLiteDBConnection | undefined) => Promise<void>,
    cleanup?: () => Promise<void>
  ) => {
    try {
      await db.current?.open();
      await action(db.current);
    } catch (error) {
      alert((error as Error).message);
    } finally {
      try {
        (await db.current?.isDBOpen())?.result && (await db.current?.close());
        cleanup && (await cleanup());
      } catch { }
    }
  };

  /**
   * here is where you cna check and update table
   * structure
   */

  const initializeTables = async () => {
    performSQLAction(async (db: SQLiteDBConnection | undefined) => {
      const queryCreateTable = `
      CREATE TABLE IF NOT EXISTS module( module_id INTEGER PRIMARY KEY NOT NULL,
         module_name  varchar(30) NOT NULL UNIQUE,
        module_name_abv  varchar(10) NOT NULL UNIQUE  ) ; 
    `;
      const createSpecialtyTable = `CREATE TABLE IF NOT EXISTS specialty(
        specialty_id INTEGER PRIMARY KEY NOT NULL,
        specialty_name VARCHAR(30) NOT NULL UNIQUE,
        specialty_name_abv VARCHAR(10) NOT NULL UNIQUE,
        specialty_level VARCHAR(1) CHECK (specialty_level IN ('L', 'M')),
        collage_year INTEGER
    );`

      const respCT = await db?.execute(queryCreateTable);
      const respCTT = await db?.execute(createSpecialtyTable);
      console.log(`res: ${JSON.stringify(respCT)}`);
      console.log(`res: ${JSON.stringify(respCTT)}`);
    });
  };

  return { performSQLAction, initialized };
};

export default useSQLiteDB;

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import useSQLiteDB from "../composables/useSQLiteDB";
import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import { read } from "xlsx";

// define the types ----------------------------------------

export type Students = {
    student_code: string
    first_name: string;
    last_name: string;
}
export type GroupSQL = {
    group_id: number
    group_number: number,
    group_type: "TP" | 'TD'
}
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
    groups?: GroupSQL[]

}

export type SQLYearScholar = {
    scholar_year_id: number,
    year: string
}

// END define the types ----------------------------------------


// Global state --------------------------------

export interface GlobalState {
    modules: SQLModule[] | [];
    setModules: React.Dispatch<React.SetStateAction<SQLModule[] | []>>
    specialties: SpecialtiesSQL[] | [];
    setSpecialties: React.Dispatch<React.SetStateAction<[] | SpecialtiesSQL[]>>
    selectedModule: string[]
    setSelectedModule: React.Dispatch<React.SetStateAction<string[]>>
    selectedSpecialties: string[]
    setSelectedSpecialties: React.Dispatch<React.SetStateAction<string[]>>
    year: Number
    setYear: React.Dispatch<React.SetStateAction<Number>>
    years: [] | SQLYearScholar[]
    setYears: React.Dispatch<React.SetStateAction<[] | SQLYearScholar[]>>
    revalidate: number
    setRevalidate: React.Dispatch<React.SetStateAction<number>>
    isLoading: boolean
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>


    counter: number
    setCounter: React.Dispatch<React.SetStateAction<number>>
}
// END  Global state --------------------------------




export const GlobalContext = createContext<GlobalState | undefined>(undefined);



export const GlobalContextProvider = ({ children }: { children: React.ReactNode }) => {

    const { initialized, performSQLAction } = useSQLiteDB()

    const [modules, setModules] = useState<Array<SQLModule> | []>([]);
    const [specialties, setSpecialties] = useState<Array<SpecialtiesSQL> | []>([])

    const [selectedModule, setSelectedModule] = useState<string[]>([]);
    const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);


    const [year, setYear] = useState<Number>(1)
    const [years, setYears] = useState<SQLYearScholar[] | []>([])


    const [revalidate, setRevalidate] = useState(0)

    const [isLoading, setIsLoading] = useState(true)


    const [counter, setCounter] = useState(0)


    const loadData = async () => {
        try {
            await performSQLAction(async (db: SQLiteDBConnection | undefined) => {

                const respSelect = await db?.query(`SELECT * FROM module`);
                setModules(respSelect?.values as SQLModule[]);

                const respSelectSpecialties = await db?.query(`SELECT * FROM specialty`);

                setSpecialties(respSelectSpecialties?.values as SpecialtiesSQL[]);



                await db?.query(`INSERT OR IGNORE INTO scholar_year (year) VALUES ('2023/2024')`); // insert year

                const resp = await db?.query(`SELECT * FROM scholar_year`)
                setYears(resp?.values as SQLYearScholar[])



                let respSELECTED_YEAR = await db?.query(`SELECT selected_year_id FROM keys`)

                if (!respSELECTED_YEAR?.values) {

                    // IF THERE ARE NO SELECTED_YEAR YET GET THE LATEST YEAR 
                    const respLATEST_YEAR_ID = await db?.query(`
                SELECT scholar_year_id FROM scholar_year WHERE year IN 
                (SELECT MAX(year) FROM scholar_year );
                `)

                    if (respLATEST_YEAR_ID?.values && respLATEST_YEAR_ID?.values[0].scholar_year_id) {


                        await db?.query(`
                            INSERT OR IGNORE INTO keys (selected_year_id) values (?) ;

                    `, [respLATEST_YEAR_ID?.values[0]?.scholar_year_id])


                        setYear(respLATEST_YEAR_ID?.values[0].selected_year_id)


                    }

                } else {
                    setYear(respSELECTED_YEAR?.values[0].selected_year_id)
                }



                setCounter(7)





            });


            setIsLoading(false)



        } catch (error) {
            setIsLoading(false)
            alert((error as Error).message);
        }
    };


    useEffect(() => {
        console.log('this should be the first')
        if (initialized) {
            loadData()
            loadData()
        }
    }, [initialized, revalidate])


    const value = {
        modules, setModules,
        specialties, setSpecialties,
        selectedModule, setSelectedModule,
        selectedSpecialties, setSelectedSpecialties,
        year, setYear,
        years, setYears,
        revalidate, setRevalidate,
        isLoading, setIsLoading,
        counter, setCounter
    };


    return <GlobalContext.Provider value={value}>{children} </GlobalContext.Provider>;

}

export const useGlobalContext = (): GlobalState => {
    const context = useContext(GlobalContext);
    if (context === undefined) {
        alert("Global context is undefined")
        throw new Error("Global context is undefined");
    }
    return context;
};


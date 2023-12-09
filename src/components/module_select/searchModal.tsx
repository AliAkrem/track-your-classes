import React, { useEffect, useState } from 'react';
import {
    IonButton,
    IonButtons,
    IonCheckbox,
    IonContent,
    IonHeader,
    IonItem,
    IonList,
    IonTitle,
    IonSearchbar,
    IonToolbar,
    IonSelect,
    IonLabel,
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
    IonIcon,
} from '@ionic/react';
import type { CheckboxCustomEvent } from '@ionic/react';
// import CreateSpecialtyModal from '../createSpecialtyModal';
import CreateModuleModal from '../createModuleModal';
import { SQLModule } from '../../pages/classes';
import { SQLiteDBConnection } from '@capacitor-community/sqlite';
import useSQLiteDB from '../../composables/useSQLiteDB';
import useConfirmationAlert from '../../composables/useConfirmationAlert';
import { create, trash } from 'ionicons/icons';
import UpdateModuleModal from '../updateModuleModal';
// import type { Item } from './types';

export interface Module {
    module_id: number;
    module_name: string;
    module_name_abv: string;

}
interface TypeaheadProps {
    modules: Module[];
    selectedItems: string[];
    title?: string;
    onSelectionCancel?: () => void;
    onSelectionChange?: (items: string[]) => void;
    // setList:React.Dispatch<React.SetStateAction<Module[]>>
    setModules: React.Dispatch<React.SetStateAction<SQLModule[] | undefined>>
}

function AppTypeahead(props: TypeaheadProps) {


    const { initialized, performSQLAction } = useSQLiteDB()

    const { showConfirmationAlert, ConfirmationAlert } = useConfirmationAlert();

    const [filteredItems, setFilteredItems] = useState<Module[]>([...props.modules]);


    const [workingSelectedValues, setWorkingSelectedValues] = useState<string[]>([...props.selectedItems]);



    const deleteModule = async (moduleId: number) => {
        try {
            performSQLAction(async (db: SQLiteDBConnection | undefined) => {
                await db?.query(`DELETE FROM module WHERE module_id = ?`, [Number(moduleId)]);

                const respSelect = await db?.query(`SELECT * FROM module`);
                props.setModules(respSelect?.values);
            });
        } catch (error) {
            alert((error as Error).message);
        }
    };


    const confirmDelete = (module_id: number) => {
        showConfirmationAlert("Are You Sure You Want To Delete This Item?", () => {
            deleteModule(module_id);
        });
    };





    const isChecked = (value: string) => {
        return workingSelectedValues.find((item) => item === value) !== undefined;
    };

    const cancelChanges = () => {
        const { onSelectionCancel } = props;
        if (onSelectionCancel !== undefined) {
            onSelectionCancel();
        }
    };

    const confirmChanges = () => {



        console.log(workingSelectedValues)

        const { onSelectionChange } = props;
        if (onSelectionChange !== undefined) {
            onSelectionChange(workingSelectedValues);
        }
    };

    const [searchValue, SetSearchValue] = useState<string>()

    const searchbarInput = (ev: any) => {


        filterList(ev.target.value);
        SetSearchValue(ev.target.value)

    };

    /**
     * Update the rendered view with
     * the provided search query. If no
     * query is provided, all data
     * will be rendered.
     */
    const filterList = (searchQuery: string | null | undefined) => {
        /**
         * If no search query is defined,
         * return all options.
         */
        if (searchQuery === undefined || searchQuery === null) {
            setFilteredItems([...props.modules]);
        } else {
            /**
             * Otherwise, normalize the search
             * query and check to see which items
             * contain the search query as a substring.
             */
            const normalizedQuery = searchQuery.toLowerCase();
            setFilteredItems(
                props.modules.filter((item) => {

                    const normalizedModule = item.module_name.toLowerCase();
                    const normalizedAbv = item.module_name_abv.toLowerCase();
                    return normalizedModule.includes(normalizedQuery) || normalizedAbv.includes(normalizedQuery);
                })
            );
        }
    };

    const checkboxChange = (ev: CheckboxCustomEvent) => {
        const { checked, value } = ev.detail;

        if (checked) {
            setWorkingSelectedValues([String(value)]);
        } else {
            setWorkingSelectedValues(workingSelectedValues.filter((item) => item !== value));
        }
    };


    let items = filteredItems.length > 0 ? filteredItems.map((item) => (
        <IonItemSliding key={item.module_id} >
            <IonItem >
                <IonCheckbox value={item.module_id} checked={isChecked(String(item.module_id))} onIonChange={checkboxChange}>
                    {item.module_name} / {item.module_name_abv}
                </IonCheckbox>
                <UpdateModuleModal setModules={props.setModules} label='module' module={item} />
            </IonItem>
            <IonItemOptions side="start"     >
                <IonItemOption onClick={() => confirmDelete(item.module_id)} color="danger">
                    <IonIcon slot="icon-only" icon={trash}>
                    </IonIcon>
                </IonItemOption>
                <IonItemOption  >
                    <IonIcon slot="icon-only" id={"open-update-module-modal" + item.module_id} icon={create}>
                    </IonIcon>
                </IonItemOption>
            </IonItemOptions>
        </IonItemSliding>
    )) : <IonItem >
        <IonLabel>
            module not found
        </IonLabel>
    </IonItem>



    useEffect(() => {
        filterList('');
    }, [props.modules])



    return (
        <>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonButton onClick={cancelChanges}>Cancel</IonButton>
                    </IonButtons>
                    <IonTitle>{props.title}</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={confirmChanges}>Done</IonButton>
                    </IonButtons>
                </IonToolbar>
                <IonToolbar>
                    <IonSearchbar onIonInput={searchbarInput}></IonSearchbar>
                    <IonItem > <CreateModuleModal setModules={props.setModules} label={"create new module "} /></IonItem>
                </IonToolbar>
            </IonHeader>

            <IonContent   color="light" >
                <IonList id="modal-list" inset={true}>
                    {items}
                </IonList>
            </IonContent>

            {ConfirmationAlert}
        </>
    );
}
export default AppTypeahead;
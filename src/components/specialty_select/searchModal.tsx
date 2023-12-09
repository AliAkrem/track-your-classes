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
import CreateSpecialtyModal from '../createSpecialtyModal';
import { create, trash } from 'ionicons/icons';
import { SpecialtiesSQL } from '../../pages/classes';
import useSQLiteDB from '../../composables/useSQLiteDB';
import { SQLiteDBConnection } from '@capacitor-community/sqlite';
import useConfirmationAlert from '../../composables/useConfirmationAlert';
import UpdateSpecialtyModal from '../updateSpecialtyModal';
// import type { Item } from './types';


interface TypeaheadProps {
    specialties: SpecialtiesSQL[];
    selectedItems: string[];
    title?: string;
    onSelectionCancel?: () => void;
    onSelectionChange?: (items: string[]) => void;
    setSpecialties: React.Dispatch<React.SetStateAction<SpecialtiesSQL[] | undefined>>

}

function AppTypeahead(props: TypeaheadProps) {
    const [filteredItems, setFilteredItems] = useState<SpecialtiesSQL[]>([...props.specialties]);
    const [workingSelectedValues, setWorkingSelectedValues] = useState<string[]>([...props.selectedItems]);

    const {  performSQLAction } = useSQLiteDB()
    const { ConfirmationAlert, showConfirmationAlert } = useConfirmationAlert()


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
            setFilteredItems([...props.specialties]);
        } else {
            /**
             * Otherwise, normalize the search
             * query and check to see which items
             * contain the search query as a substring.
             */
            const normalizedQuery = searchQuery.toLowerCase();
            setFilteredItems(
                props.specialties.filter((specialty) => {
                    return specialty.specialty_name.toLowerCase().includes(normalizedQuery);
                })
            );
        }
    };

    const checkboxChange = (ev: CheckboxCustomEvent) => {
        const { checked, value } = ev.detail;

        if (checked) {
            setWorkingSelectedValues([...workingSelectedValues, String(value)]);

           

        } else {
            setWorkingSelectedValues(workingSelectedValues.filter((item) => item !== String(value)));
        }
    };


    



    // Define function to delete specialty
    const DELETE_SPECIALTY = async (specialty_id: number) => {
        try {
            await performSQLAction(async (db: SQLiteDBConnection | undefined) => {
                await db?.query('DELETE FROM specialty WHERE specialty_id = ?', [specialty_id]);

                const res = await db?.query('SELECT * FROM specialty');

                props.setSpecialties(res?.values)

            });
        } catch (error) {
            console.error(error);
        }
    };



    const confirmDelete = (specialty_id: number) => {
        showConfirmationAlert("Are You Sure You Want To Delete This specialty?", () => {
            DELETE_SPECIALTY(specialty_id)
        });
    };




    useEffect(() => {
        filterList('');
    }, [props.specialties])






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
                    <IonItem > <CreateSpecialtyModal setSpecialties={props.setSpecialties}  label={"create new specialty"} /></IonItem>
                </IonToolbar>
            </IonHeader>

            <IonContent color="light" >

                <IonList id="modal-list" inset={true}>
                    {filteredItems.length > 0 ? filteredItems.map((item) => (
                        <IonItemSliding key={item.specialty_id} >
                            <IonItem >
                                <IonCheckbox value={item.specialty_id} checked={isChecked(String(item.specialty_id))} onIonChange={checkboxChange}>
                                {item.specialty_name_abv} / {item.specialty_level} {item.collage_year}
                                </IonCheckbox>

                                <UpdateSpecialtyModal setSpecialties={props.setSpecialties}   label='specialty' specialty={item} />

                            </IonItem>
                            <IonItemOptions side="start" >
                                <IonItemOption color="danger" >
                                    <IonIcon onClick={() => { confirmDelete(item.specialty_id) }} slot="icon-only" icon={trash}>
                                    </IonIcon>
                                </IonItemOption>
                                <IonItemOption  >
                                    <IonIcon slot="icon-only" id={"open-update-module-modal" + item.specialty_id} icon={create}>
                                    </IonIcon>
                                </IonItemOption>
                            </IonItemOptions>
                            {ConfirmationAlert}
                        </IonItemSliding>

                    )) : <IonItem>
                        <IonLabel>
                            specialty not found
                        </IonLabel>
                    </IonItem>


                    }
                </IonList>
            </IonContent>
        </>
    );
}
export default AppTypeahead;
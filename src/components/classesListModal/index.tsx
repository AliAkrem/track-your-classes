import { IonAccordion, IonAccordionGroup, IonActionSheet, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonModal, IonText, IonTitle, IonToolbar } from '@ionic/react'
import { ellipsisVertical } from 'ionicons/icons'
import { nanoid } from 'nanoid'
import React, { useEffect, useRef, useState } from 'react'
import { useGlobalContext } from '../../context/globalContext'
import { ClassGroup } from 'src/pages/calendar'



type Props = {
    isOpen: boolean
    close: React.Dispatch<React.SetStateAction<boolean>>
    setSelectedClassGroup: React.Dispatch<React.SetStateAction<ClassGroup | null>>
}

export default function ClassesListModal({ isOpen, close, setSelectedClassGroup }: Props) {


    const { classesList } = useGlobalContext()
    const modal = useRef<HTMLIonModalElement | null>(null)

    const page = useRef(null);



    const [presentingElement, setPresentingElement] = useState<HTMLElement | null>(null);

    useEffect(() => {
        setPresentingElement(page.current);
    }, []);




    const ListClasses = classesList?.map((classe) => {
        const trigger = nanoid()


        return (
            <div key={nanoid()}  >
                <IonAccordion toggleIconSlot="start" value={nanoid()}  >
                    <IonItem slot="header" color="light">
                        <IonLabel class="ion-text-wrap" > {classe.module_name + " / " + classe.specialty_name + " / " + classe.specialty_level + classe.level_year}</IonLabel>
                    </IonItem>

                    {classe.groups?.map(group => {
                        return (<IonItem slot="content" key={group.group_id}   >
                            <IonText

                                style={{ cursor: 'pointer' }} color={'primary'}

                                onClick={() => {

                                    setSelectedClassGroup({
                                        group: group,
                                        class: classe
                                    });
                                    modal.current?.dismiss()
                                    close(false)
                                }}

                            >
                                group {group.group_number} / {group.group_type}
                            </IonText>

                        </IonItem>)
                    })
                    }

                </IonAccordion>
            </div>
        )
    })




    return (
        <>
            <IonModal ref={modal}
                isOpen={isOpen}
                trigger="open-modal-classesList"
                presentingElement={presentingElement!} >
                <IonHeader>
                    <IonToolbar>
                        <IonTitle>Select Class</IonTitle>
                        <IonButtons slot="end">
                            <IonButton onClick={() => modal.current?.dismiss()}>Close</IonButton>
                        </IonButtons>
                    </IonToolbar>
                </IonHeader>
                <IonContent className="ion-padding">
                    <IonList>
                        <IonAccordionGroup multiple={false} >
                            {ListClasses}
                        </IonAccordionGroup  >

                    </IonList>
                </IonContent>
            </IonModal>
        </>
    )
}

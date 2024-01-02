import { IonAccordion, IonAccordionGroup,  IonButton, IonButtons, IonCard, IonCardContent, IonContent, IonHeader,  IonItem, IonLabel, IonList, IonModal, IonText, IonTitle, IonToolbar } from '@ionic/react'
import { nanoid } from 'nanoid'
import React, { useEffect, useRef, useState } from 'react'
import { useGlobalContext } from '../../context/globalContext'


import { ClassGroup } from '../../pages/sessions'



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
                            <IonButton onClick={() => {modal.current?.dismiss() ;   close(false)  }}>Close</IonButton>
                        </IonButtons>
                    </IonToolbar>
                </IonHeader>
                <IonContent className="ion-padding">
                    <IonList>


                        {classesList.length > 0 ? <IonAccordionGroup multiple={false} >
                            {ListClasses}
                        </IonAccordionGroup  > :

                            <div style={{ display: 'flex', alignItems: 'center', height: "80vh", justifyContent: 'center' }}  >
                                <IonCard >
                                    <IonCardContent  >no classes here yet!. Click (+) to add one </IonCardContent>
                                </IonCard>
                            </div>}

                    </IonList>
                </IonContent>
            </IonModal>
        </>
    )
}

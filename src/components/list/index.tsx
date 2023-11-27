import React from 'react';
import { IonIcon, IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonLabel, IonList } from '@ionic/react';
import { archive, heart, trash } from 'ionicons/icons';



const list = [ 
    {name : 'RSD'},
    {name : 'ISI'},
    {name : 'SITWEB'},
]




export default function List() {


    const items = list.map(item => {
        return (
            <IonItemSliding>
            <IonItemOptions side="start">
              <IonItemOption color="success">
                <IonIcon slot="icon-only" icon={archive}></IonIcon>
              </IonItemOption>
            </IonItemOptions>
    
            <IonItem>
              <IonLabel>{item.name}</IonLabel>
            </IonItem>
    
            <IonItemOptions side="end">
              <IonItemOption>
                <IonIcon slot="icon-only" icon={heart}></IonIcon>
              </IonItemOption>
              <IonItemOption color="danger">
                <IonIcon slot="icon-only" icon={trash}></IonIcon>
              </IonItemOption>
            </IonItemOptions>
          </IonItemSliding>
        )
    } )

  return (
    <IonList>
     {items}

    </IonList>
  );
}
import React, { useRef, useState } from 'react';
import { IonContent, IonItem, IonLabel, IonList, IonModal, IonPage } from '@ionic/react';
import AppTypeahead from './searchModal';
import { useGlobalContext } from '../../context/globalContext';
;





export default function ModuleSelect() {



  const {modules, setModules, selectedModule, setSelectedModule} = useGlobalContext()

  const [selectedText, setSelectedText] = useState<string>('not selected yet');


 

  



  const modal = useRef<HTMLIonModalElement>(null);

  const formatData = (data: string[]) => {
    if (data.length === 1) {
      const moduleText = modules.find((module) => String(module.module_id) === data[0])!;
      return moduleText.module_name_abv
    }

    return ``;
  };




  const moduleSelectionChanged = (selectedValue: string[]) => {
    setSelectedModule(selectedValue);
    setSelectedText(formatData(selectedValue));
    modal.current?.dismiss();
  };



  return (
    <>
      {/* <IonContent color="light"> */}
      <IonList inset>
        <IonItem button={true} detail={false} id="select-module">
          <IonLabel>module</IonLabel>
          <div slot="end" >
            {selectedText}
          </div>
        </IonItem>
      </IonList>
      {/* </IonContent> */}

      <IonModal trigger="select-module" ref={modal}>
        <AppTypeahead
          title="module"
          // modules={modules}
          selectedItems={selectedModule}
          onSelectionCancel={() => modal.current?.dismiss()}
          onSelectionChange={moduleSelectionChanged}
        

          // setModules={setModules}

        />
      </IonModal>
    </>
  );
}

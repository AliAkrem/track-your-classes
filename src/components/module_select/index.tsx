import React, { useRef, useState } from 'react';
import { IonContent, IonItem, IonLabel, IonList, IonModal, IonPage } from '@ionic/react';
import AppTypeahead from './searchModal';
import { SQLModule } from '../../pages/classes';
;

export interface Module {
  module_id: number;
  module_name: string;
  module_name_abv: string;

}

type ModuleSelectProps = { 
  modules : Module[], 
  setModules: React.Dispatch<React.SetStateAction<SQLModule[] | undefined>>
  

  setSelectedModule: React.Dispatch<React.SetStateAction<string[]>>

  selectedModule: string[]
}





export default function ModuleSelect({modules, setModules, selectedModule, setSelectedModule} : ModuleSelectProps) {



  const [selectedText, setSelectedText] = useState<string>('not selected yet');


 

  



  const modal = useRef<HTMLIonModalElement>(null);

  const formatData = (data: string[]) => {
    if (data.length === 1) {
      const moduleText = modules.find((module) => String(module.module_id) === data[0])!;
      return moduleText.module_name_abv;
    }

    return `not selected yet`;
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
          <div slot="end" id="selected-module">
            {selectedText}
          </div>
        </IonItem>
      </IonList>
      {/* </IonContent> */}

      <IonModal trigger="select-module" ref={modal}>
        <AppTypeahead
          title="module"
          modules={modules}
          selectedItems={selectedModule}
          onSelectionCancel={() => modal.current?.dismiss()}
          onSelectionChange={moduleSelectionChanged}
        

          setModules={setModules}

        />
      </IonModal>
    </>
  );
}

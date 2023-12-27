import { useState } from 'react';
import {
    IonButton,
    IonContent,
    IonHeader,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonPage,
    IonTitle,
    IonToolbar,
    useIonToast,
    useIonLoading,
    IonIcon,
    IonButtons,
    IonMenuButton,
} from '@ionic/react';

import { supabase } from '../../../supabaseClient'
import { logoGoogle } from 'ionicons/icons';



export function LoginPage() {


    

    const [email, setEmail] = useState('');

    const [showLoading, hideLoading] = useIonLoading();
    const [showToast] = useIonToast();


    const handleLogin = async () => {
        console.log()
        // e.preventDefault();
        await showLoading();
        try {
            (await supabase.auth.signInWithOAuth({ provider: 'google'}));
            await showToast({ message: 'loading ...' });
        } catch (e: any) {
            await showToast({ message: e.error_description || e.message, duration: 5000 });
        } finally {
            await hideLoading();
        }
    };


    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonMenuButton />
                    </IonButtons>
                    <IonTitle>Login</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent>
                <div className="ion-padding">
                    <h1>Login with your Google Account</h1>
                    <p>So you can store your Data in the Cloud for Free</p>
                </div >

                <div className="ion-margin" style={{ border: "1px solid" }} >
                    <IonButton className='ion-text-wrap' onSubmit={handleLogin} style={{ display: 'flex', justifyContent: "space-between", alignItem: "center", gap: '16px' }} fill='default' onClick={handleLogin}>
                        <IonLabel  >Sign in with Google</IonLabel>
                        <IonIcon size='large' style={{ marginLeft: "10px" }} icon={logoGoogle} />
                    </IonButton>
                </div>

            </IonContent>
        </IonPage>
    );
}
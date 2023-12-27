import React from 'react'
import {
    IonButton,
    IonContent,
    IonHeader,
    IonInput,
    IonItem,
    IonLabel,
    IonPage,
    IonTitle,
    IonToolbar,
    useIonLoading,
    useIonToast,
    useIonRouter,
    IonAvatar
} from '@ionic/react';
import { useEffect, useState } from 'react';
import { supabase } from '../../../supabaseClient';
import { Session } from '@supabase/supabase-js';
import { AccountPage } from './account';
import { LoginPage } from './loginPage';





export default function Auth() {
    const [showLoading, hideLoading] = useIonLoading();

    const [session, setSession] = useState<Session | null>(null);

    useEffect(() => {
        getProfile();
    }, []);

    const getProfile = async () => {



        try {

            let s = (await supabase.auth.getSession()).data.session

            setSession(s)

            


      

            await hideLoading();

        } catch (error: any) {
            // showToast({ message: error.message, duration: 5000 });
        } finally {
            await hideLoading();
        }
    };




    if(session?.user) return <AccountPage />
    else { 
        return <LoginPage/>
    }


}


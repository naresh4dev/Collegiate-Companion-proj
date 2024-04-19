const {auth, db} = require('./connections/firebaseCon');
const {signInWithEmailAndPassword, createUserWithEmailAndPassword} = require('firebase/auth');
const { get,ref,set,child, update } = require('firebase/database');
const { v4: uuidv4 } = require('uuid');

exports.loginQuery = async (email, password) => {
    try {
        const result = await signInWithEmailAndPassword(auth,email, password);
        
        if(result) {
            const dbRef = ref(db);
            const snapshot = await get(child(dbRef,`users/${result.user.uid}`));
            if(snapshot.exists()) {
                return {auth : true, response : snapshot.val()}
            } else {
                return {auth : false}
            }
           
        } else {
            return {auth : false}
        }
    } catch (err) {

        console.error("Error in Signin : ", err);
        return {auth : false}
    }
}

exports.signUpQuery = async (email,password, userData) => {
    try {
        const result = await createUserWithEmailAndPassword(auth,email, password);
        
        if(result) {
            const dbRef = ref(db);
            await set(child(dbRef,`users/${result.user.uid}`),{...userData, email});

            return {auth : true, response : result}
        } else {
            console.log("User creation failed");
            return {auth : false}
        }
    } catch (err) {

        console.error("Error in Signin : ", err);
        return {auth : false}
    }
}

exports.addEvent = async (eventDetails) =>{
    try {
        const Id = uuidv4();
        const eventDbRef = ref(db, `events`);
        await set(child(eventDbRef,`/${Id}`), eventDetails);
        return true
    } catch (err) {
        console.log("Error in adding event",err);
        return false
    }
}

exports.getEvents = async () => {
    try {
        const eventDbRef = ref(db, `events`);
        const results = await get(eventDbRef);
        if(results.exists()) {
            const eventsList = results.val();
            const  eventsArray = Object.entries(eventsList).map(([key,value])=>({...value, "key": key}));
            const enrolledArrayListWithEvents = eventsArray.map(event=> {
                let attendees = event.attendees ? event.attendees.split(",") : []
                return ({ ...event , attendees} )
            })
            return enrolledArrayListWithEvents
        } else {
            return false
        }
    } catch (err) {
        console.log("Error in getting events",err);
        return false
    }

}

exports.getOneEvent = async (ID)=>{
    try {
        const eventDbRef = ref(db, `events`);
        const results = await get(child(eventDbRef, `/${ID}`));
        return results.exists() ? results.val() : null
    } catch (err) {
        console.log("Error in getting events",err);
        return false
    }
}

exports.getUser = async (id) =>{
    try {
        const dbRef = ref(db);
        const snapshot = await get(child(dbRef,`users/${id}`));
        return snapshot.exists() ? snapshot.val() : null
    } catch (err) {
        return false
    }
}

exports.enrollEvent = async(ID,email)=>{
    try {
        const eventDbRef = ref(db, `events`);
        const results = await get(child(eventDbRef, `/${ID}`));
        if(results.exists()) {
            const eventDetail = results.val();
            let attendees = eventDetail.attendees ? eventDetail.attendees.split(",") : [];
            attendees.push(email);
            let updatedEvent = {
                ...eventDetail, 
                attendees: attendees.toLocaleString()
            }
            await update(ref(db,`events/${ID}`), updatedEvent);
            return true
        } else {
            return false
        }
    } catch (err) {
        console.log("Error in getting events",err);
        return false
    }
}
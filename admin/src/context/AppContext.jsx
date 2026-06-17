import { createContext } from "react";

export const AppContext = createContext();

const AppContextProvider = (props) => {

    const calucalteAge = (dob) => {
        const today = new Date()
        const birthDate = new Date(dob)
        let age = today.getFullYear() - birthDate.getFullYear()

        return age
    }
    const courrency = '$'
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ]
    const slotDateFormate = (slotDate) => {
        const dateArray = slotDate.split('_')
        return dateArray[0] + " " + months[Number(dateArray[1] - 1)] + " " + dateArray[2]
    }
    const value = {
        // Add any shared state or functions here
        calucalteAge
        , slotDateFormate,
        courrency
    };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};

export default AppContextProvider;

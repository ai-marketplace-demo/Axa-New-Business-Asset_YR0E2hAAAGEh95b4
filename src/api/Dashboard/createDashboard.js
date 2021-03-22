import { gql } from "apollo-boost";

const createDashboard=({environmentUri ,input})=>{
    return {
        variables:{
            input  : input
        },
        mutation :gql`mutation CreateDashboard(
            $input:NewDashboardInput,
        ){
            createDashboard(input:$input){
                dashboardUri
                name
                label
                created
            }
        }`
    }
}


export default createDashboard;

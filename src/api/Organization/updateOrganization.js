import { gql } from "apollo-boost";

const updateOrganization=({organizationUri,input})=>{
    return {
        variables:{
            organizationUri ,
            input  : input
        },
        mutation :gql`mutation UpdateOrg($organizationUri:String,$input:ModifyOrganizationInput){
            updateOrganization(organizationUri:$organizationUri,input:$input){
                organizationUri
                label
                created
            }
        }`
    }
}


export default updateOrganization;

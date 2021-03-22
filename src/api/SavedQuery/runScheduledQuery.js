import { gql } from "apollo-boost";

const runScheduledQuery = (scheduledQueryUri)=>{
    return {
        variables:{
            scheduledQueryUri:scheduledQueryUri
        },
        mutation :gql`
            mutation RunScheduledQuery(
                $scheduledQueryUri:String!){
                runScheduledQuery(
                    scheduledQueryUri:$scheduledQueryUri 
                )
            }
        `
    }
}


export default runScheduledQuery ;

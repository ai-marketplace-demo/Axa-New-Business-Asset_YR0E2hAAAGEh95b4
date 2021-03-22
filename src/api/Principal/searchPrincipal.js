import { gql } from "apollo-boost";

const searchPrincipal=({filter})=>{
    return {
        variables:{
            filter: filter
        },
        query :gql`query SearchPrincipal($filter:PrincipalFilter){
            searchPrincipal(filter:$filter){
                count
                page
                pages
                hasNext
                hasPrevious
                nodes{
                    principalType
                    principalName
                    principalId                    
                }

            }
        }`
    }
}


export default searchPrincipal

import { gql } from "apollo-boost";

const removeDatasetToProject=({ projectUri, datasetUri})=>{
    return {
        variables:{projectUri,datasetUri},
        mutation :gql`mutation RemoveDatasetFromProject(
            $projectUri:String,
            $datasetUri:String,
        ){
            removeDatasetFromProject(
                projectUri:$projectUri,
                datasetUri:$datasetUri
            )
        }`
    }
}


export default removeDatasetToProject;

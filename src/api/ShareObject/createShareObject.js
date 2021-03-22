import { gql } from "apollo-boost";

const createShareObject=({datasetUri, itemUri, itemType,input})=>{
    console.log("rcv",input);
    return {
        variables:{
            datasetUri:datasetUri,
            input  : input,
            itemUri : itemUri,
            itemType:itemType
        },
        mutation :gql`mutation CreateShareObject(
            $datasetUri:String!,
            $itemType:String,
            $itemUri:String,
            $input:NewShareObjectInput){
            createShareObject(
                datasetUri:$datasetUri,
                itemType:$itemType,
                itemUri:$itemUri,
                input:$input){
                shareUri
                created
            }
        }`
    }
}


export default createShareObject;

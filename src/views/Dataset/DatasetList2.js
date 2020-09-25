import React, {useState,useEffect} from "react";
import {Container,Spinner,Table, Row, Col, ListGroupItem, ListGroup} from "react-bootstrap";
import Tile from "../../components/Tile/Tile";
import MainActionButton from "../../components/MainActionButton/MainButton";
import * as Icon from "react-bootstrap-icons";
import DatasetListItem from "./DatasetListItem2";
import {Link,useLocation,useParams,useHistory} from "react-router-dom";
import styled from "styled-components";
import {toast} from "react-toastify";
import useClient from "../../api/client";
import listDatasets from "../../api/Dataset/listDatasets";


const Styled=styled.div`
height:100vh;
`


const DatasetList = (props)=>{
    let client = useClient();
    let [datasets, setDatasets] = useState({
        count:0,
        nodes:[],
        page:1,
        pageSize:5,
        hasNext:false,
        hasPrevious:false,
        pages:0
    });
    let [ready, setReady] = useState(false);
    let [search, setSearch] = useState("");
    let [sortCriterias, setSortCriterias] = useState({label : 'asc', created: 'asc'});


    const fetchItems=async ()=>{
        const response = await client
            .query(listDatasets({
                filter:{
                    term:search,
                    roles:['BusinessOwner','DataSteward','Creator','Admin'],
                    page:datasets.page,
                    pageSize: datasets.pageSize
                }
            }))
        if (!response.errors){
            setDatasets(response.data.listDatasets);
        }else {
            toast.error(`Could not retrieve datasets, received ${response.errors[0].message}`)
        }
    }

    const handleInputChange=(e)=>setSearch(e.target.value);


    const handleKeyDown=async (e)=>{
        if (e.key === 'Enter') {
            await fetchItems();
        }
    }

    const nextPage=()=>{
        if (datasets.hasNext){
            setDatasets({...datasets, page:datasets.page+1})
        }
    }
    const previouPage =()=>{
        if (datasets.hasPrevious){
            setDatasets({...datasets, page:datasets.page-1})
        }
    }

    useEffect(()=>{
        if (client){
            client
                .query(listDatasets({
                    filter:{
                        term:search,
                        //roles:["Admin","Owner","ReadWrite"],
                        roles:['BusinessOwner','DataSteward','Creator','Admin'],
                        page:datasets.page,
                        pageSize: datasets.pageSize
                    }
                }))
                .then((res)=>{
                    console.log(res);
                    setDatasets(res.data.listDatasets);
                    setReady(true);
                })
                .catch((err)=>{
                    console.log("!",err);
                })

        }
    },[client, datasets.page]);

    return <Styled>
        <Container className={""}>
            <Row>
                <Col xs={8}>
                    <h3> <Icon.Folder/> My Datasets </h3>
                </Col>

                <Col xs={1} className={`mt-2`}>
                    <MainActionButton>
                        <Link to={"/newdataset"}>
                                Create
                        </Link>
                    </MainActionButton>
                </Col>
            </Row>
            <Row className={"mt-3"}>
                <Col xs={12}>
                    <Row>
                        <Col xs={7}>
                            <Row className={`mt-2`}>
                                <Col xs={4}><i>Found {datasets.count} results</i></Col>
                                <Col className={`pt-1 text-right`} xs={2}><Icon.ChevronLeft onClick={previouPage}/></Col>
                                <Col className={` text-center`} xs={4}>Page {datasets.page}/{datasets.pages}</Col>
                                <Col className={`pt-1 text-left`} xs={2}><Icon.ChevronRight onClick={nextPage}/></Col>
                            </Row>
                        </Col>
                    </Row>
                </Col>
                <Col xs={12}>
                    <input className={"form-control"} name={'search'} value={search} onKeyDown={handleKeyDown} onChange={handleInputChange} placeholder={"search your datasets"} style={{width:'100%'}}/>
                </Col>


            </Row>
            <Row className={"mt-4"}>
                {
                    (!ready)?(
                        <Col>
                        <Spinner variant={"primary"} animation="border" role="status">
                            <span className="sr-only">Loading...</span>
                        </Spinner>
                        </Col>
                    ):(
                        <Col className={`bg-white`} xs={`11`}>
                            <Row>
                            {
                                datasets.nodes.map((dataset)=>{
                                    return <Col xs={6}><DatasetListItem  key={dataset.datasetUri} dataset={dataset}/></Col>

                                })
                            }
                            </Row>
                        </Col>
                    )
                }
            </Row>

        </Container>
    </Styled>

}


export default DatasetList;

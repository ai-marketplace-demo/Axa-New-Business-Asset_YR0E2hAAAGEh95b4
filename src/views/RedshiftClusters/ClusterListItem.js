import React ,{useState, useEffect} from "react";
import {Row, Col, Badge, Spinner, Button, Modal} from "react-bootstrap";
import * as Icon from "react-bootstrap-icons";
import {
    faSyncAlt, faGlobeEurope, faNetworkWired, faPlayCircle, faPauseCircle,
    faTrashAlt, faLockOpen, faIdCard, faHome, faCloud, faUserCog, faFolderPlus, faKey
} from "@fortawesome/free-solid-svg-icons";
import { faAws } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styled from "styled-components";
import dayjs from "dayjs"
import relativeTime from 'dayjs/plugin/relativeTime';
import useClient from "../../api/client";
import {Else, If, Then} from "react-if";
import {CopyToClipboard} from "react-copy-to-clipboard";
import {toast} from "react-toastify";
import getCluster from "../../api/RedshiftCluster/getCluster";
import pauseRedshiftCluster from  "../../api/RedshiftCluster/pauseCluster";
import resumeRedshiftCluster from  "../../api/RedshiftCluster/resumeCluster";
import deleteRedshiftCluster from  "../../api/RedshiftCluster/deleteCluster";
import getClusterConsoleAccess from "../../api/RedshiftCluster/getClusterConsoleAccess";
import SpanZoomer from "../../components/Zoomer/SpanZoomer";
import {Link, useHistory} from "react-router-dom";
import * as FiIcon from "react-icons/fi";
import ActionCard from "../../components/Card/ActionCard";
dayjs.extend(relativeTime);

const Styled=styled.div`
transition: transform 0.3s ease-in-out;
&:hover{
  transform: translateY(-5px);
  box-shadow: 0px 3px 2px lightgrey;
}
height:17.5rem;
margin-top: 7px;
padding: 1em;
border : 1px solid gainsboro;
border-radius: 8px;

a{
  color :black;
  outline: 0;
}
a:hover, a:link, a:visited{
  text-decoration:none;
  color :black;
}
}
`;
const CardAction=styled.div`
transition: transform 0.2s ease-in-out;
&:hover{
   transform: translateY(-3px);
  }
`;
const TruncatedSpan=styled.span`
white-space:nowrap;
overflow:hidden;
text-overflow:ellipsis;
`;




const RedshiftClusterListItem = (props)=> {
    const client = useClient();
    let [consoleUrl, setConsoleUrl] = useState();
    let history = useHistory();
    let [isLoadingConsoleUrl, setIsLoadingConsoleUrl] = useState(false);
    const [isLoadingCluster, setIsLoadingCluster] = useState(false);
    const [isStartingCluster, setIsStartingCluster] = useState(false);
    const [isStoppingCluster, setIsStoppingCluster] = useState(false);
    const [isDeletingCluster, setIsDeletingCluster] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const copy = (field) => {
        toast(`Copied ${field} to clipboard`, {hideProgressBar: true});
    };
    const [cluster, setCluster] = useState(props.cluster);
    const getRedshiftCluster = async () => {
        setIsLoadingCluster(true);
        const response = await client.query(getCluster(cluster.clusterUri));
        if (!response.errors) {
            setCluster(response.data.getRedshiftCluster);
            toast(`Reloaded cluster ${cluster.name} data from account ${cluster.AwsAccountId}`);
        } else {
            toast.error(`Could not retrieve Cluster, ${response.errors[0].message}`, {hideProgressBar: true})
        }
        setIsLoadingCluster(false);
    };

    const startCluster = async () => {
        setIsStartingCluster(true);
        const response = await client.mutate(resumeRedshiftCluster(cluster.clusterUri));
        if (response.errors) {
            toast.error(`Could not Resume Cluster, ${response.errors[0].message}`, {hideProgressBar: true})
        } else {
            toast(`Resuming Cluster ${cluster.name}`);
        }
        setIsStartingCluster(false);
    };

    const stopCluster = async () => {
        setIsStoppingCluster(true);
        const response = await client.mutate(pauseRedshiftCluster(cluster.clusterUri));
        if (response.errors) {
            toast.error(`Could not Pause Cluster, ${response.errors[0].message}`, {hideProgressBar: true})
        } else {
            toast(`Pausing Cluster ${cluster.name}`);
        }
        setIsStoppingCluster(false);
    };

    const deleteCluster = async () => {
        setIsDeletingCluster(true);
        const response = await client.mutate(deleteRedshiftCluster(cluster.clusterUri));
        if (response.errors) {
            toast.error(`Could not Delete cluster, ${response.errors[0].message}`, {hideProgressBar: true})
        } else {
            toast(`Deleting Cluster ${cluster.name}`);
            props.reloadClusters();
        }
        setIsDeletingCluster(false);
    };

    const generateRedirectUrl = async () => {
        setIsLoadingConsoleUrl(true);
        const response = await client.query(getClusterConsoleAccess(cluster.clusterUri));

        if (!response.errors) {
            window.open(response.data.getRedshiftClusterConsoleAccess, '_blank');
        } else {
            toast(`Could not retrieve URL , received ${response.errors[0].message}`)
        }
        setIsLoadingConsoleUrl(false);
    };
    const goToClusterCreds = () => {
        history.push(`/redshiftcluster/${cluster.clusterUri}/redshiftcreds`);
    };
    const goToClusterDatasets = () => {
        history.push(`/redshiftcluster/${cluster.clusterUri}/datasets`);
    };
    const statusColor = (status) => {
        let color = 'primary';
        switch (status) {
            case 'available':
                color = 'success';
                break;
            case 'paused':
            case'NOTFOUND':
            case'stopping':
            case'stopped':
                color = 'danger';
                break;
            case 'resuming':
            case 'pausing':
            case 'modifying':
                color = 'warning';
                break;
            default:
                color = 'primary';
        }
        return color;
    };

    const openDeleteModal = () => {
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
    };

    useEffect(() => {
    }, [client, props.cluster]);

    const Body = (cluster) => {
        return <div className={`mt-3`}>
            <Row>
                <Col xs={2}>
                    <Icon.PersonCheck size={18}/>
                </Col>
                <Col xs={8}>
                    <Badge pill className={`text-white bg-primary`}>
                        Creator
                    </Badge>
                </Col>
            </Row>
            <Row>
                <Col xs={2}>
                    <Icon.House size={18}/>
                </Col>
                <Col xs={8}>
                    <Link className={`text-primary`} to={`/organization/${cluster.organization.organizationUri}`}>
                        <small>{cluster.organization.name}</small>
                    </Link>
                </Col>
            </Row>
            <Row>
                <Col xs={2}>
                    <Icon.Cloud size={18}/>
                </Col>
                <Col xs={8}>
                    <Link className={`text-primary`} to={`/playground/${cluster.environment.environmentUri}`}>
                        <small>{cluster.environment.name}({cluster.AwsAccountId})</small>
                    </Link>
                </Col>
            </Row>
            <Row>
                <Col xs={2}>
                    <Icon.Map size={18}/>
                </Col>
                <Col xs={8}>
                    <small>{cluster.region}</small>
                </Col>
            </Row>
            <Row>
                <Col xs={2}>
                    <Icon.ToggleOn size={18}/>
                </Col>
                <Col xs={10}>
                    <CardAction
                        //type="button"
                        onClick={getRedshiftCluster}>
                        <If condition={isLoadingCluster}>
                            <Then>
                            <span style={{ marginRight: '1px', marginTop: '.5rem!important'}}>
                                <Spinner size={`sm`} variant={`primary`} animation={`grow`}/>
                            </span>
                            </Then>
                        </If>
                        <Badge pill variant={`info`} className={`text-uppercase`}> {cluster.status}</Badge>
                    </CardAction>
                </Col>
            </Row>
            <Row>
                <Col xs={2} className={'mt-1'}>
                    <FontAwesomeIcon icon={faNetworkWired}/>
                </Col>
                <Col xs={8}>
                    <small>{!cluster.endpoint ?  ' -' : cluster.endpoint}</small>
                </Col>
                <Col xs={2}>
                    {(cluster.endpoint &&
                        <SpanZoomer>
                            <CopyToClipboard text={`${cluster.endpoint}`}>
                                <Icon.Clipboard onClick={()=>{copy('Endpoint')}} className={'mt-2'}/>
                            </CopyToClipboard>
                        </SpanZoomer>
                    )}
                </Col>
            </Row>
        </div>;

    };
    const Header = (cluster) => {
        return <Row>
            <Col xs={8}>
                <Link to={`/redshiftcluster/${cluster.clusterUri}`}>
                    <b className={"text-capitalize"}>{cluster.label}</b>
                </Link>
            </Col>
            <If condition={cluster.imported}>
                <Then>
                    <Col xs={3}>
                        <CardAction
                            type="button"
                            onClick={getRedshiftCluster}>
                            <If condition={isLoadingCluster}>
                                <Then>
                                    <Spinner size={`sm`} variant={`primary`} animation={`grow`}/>
                                </Then>
                            </If>
                            <Badge pill variant={'primary'} className={`text-uppercase`}>Imported</Badge>
                        </CardAction>
                    </Col>
                </Then>
            </If>
        </Row>
    };
    const Actions = (cluster) => {
        return <div>
            <Row className={`mt-2`}>
                <Col xs={12}>
                    <Row>
                        <Col xs={1}/>
                        <Col xs={5}>
                            <div style={{ fontSize: '0.5rem' }} className={`btn btn-outline-secondary rounded-pill btn-sm`}
                                 onClick={()=>generateRedirectUrl()}>
                                <If condition={isLoadingConsoleUrl}>
                                    <Then>
                                        <Spinner size={`sm`} variant={`primary`} animation={`grow`}/>
                                    </Then>
                                </If>
                                <b><FontAwesomeIcon icon={faAws}/> Console</b>
                            </div>
                        </Col>
                        <Col xs={5}>
                            <div style={{ fontSize: '0.5rem' }} className={`btn btn-success rounded-pill btn-sm`}
                                 onClick={goToClusterDatasets}>
                                <b><FontAwesomeIcon icon={faFolderPlus}/> Datasets</b>
                            </div>
                        </Col>
                        <Col xs={1}/>
                    </Row>
                </Col>
            </Row>
            <Row className={`mt-2`}>
                <Col xs={12}>
                    <Row>
                        <Col xs={1}/>
                        <Col xs={5}>
                            <div style={{ fontSize: '0.5rem' }} className={`btn btn-dark rounded-pill btn-sm`}
                                 onClick={()=>goToClusterCreds()}>
                                <b><FontAwesomeIcon icon={faKey}/> Credentials</b>
                            </div>
                        </Col>
                        <Col xs={5}>
                            <div style={{ fontSize: '0.5rem' }} className={`btn btn-outline-danger rounded-pill btn-sm`}
                                 onClick={openDeleteModal}>
                                <If condition={isDeletingCluster}>
                                    <Then>
                                        <Spinner size={`sm`} variant={`primary`} animation={`grow`}/>
                                    </Then>
                                </If>
                                <b><FontAwesomeIcon icon={faTrashAlt}/> Delete</b>
                            </div>
                        </Col>
                        <Col xs={1}/>
                    </Row>
                </Col>
            </Row>
            <Modal show={showDeleteModal} onHide={closeDeleteModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Delete Redshift Cluster</Modal.Title>
                </Modal.Header>
                <Modal.Body>Confirm Amazon Redshift cluster <b><i>{cluster.label}</i></b> deletion ?</Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-secondary" className={'rounded-pill'} onClick={closeDeleteModal}>
                        Close
                    </Button>
                    <Button variant="outline-danger" className={'rounded-pill'} onClick={deleteCluster}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    };
    const icon = <FiIcon.FiBox size={22}/>;
    const actions = <Actions {...cluster}/>;
    const body=<Body {...cluster}/>;
    const header = <Header  {...cluster}/>;
    return <ActionCard
        icon={icon}
        label={cluster.label}
        owner={cluster.owner}
        created={cluster.created}
        description={cluster.description}
        body={body}
        header={header}
        actions={actions}
        tags={cluster.tags || []}
    />
};

export default RedshiftClusterListItem;


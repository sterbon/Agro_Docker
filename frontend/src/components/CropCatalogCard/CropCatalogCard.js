import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Image } from 'semantic-ui-react';
import './CropCatalogCard.css';

class CropCatalogCard extends Component {
    render() {
        const { cropName, details } = this.props;

        return (
            <div className="cardContainer">
                <Card>
                    <Image src={details.cropImage} wrapped ui={false}/>
                    <Card.Content>
                        <Card.Header>{ cropName }</Card.Header>
                        <div className="cardContent">
                            <p>Sellers: 3</p>
                            <p >Updated: 11 March 2020</p>
                        </div>
                        <div className="viewProductBtnContainer">
                            <Link to={{ pathname: '/product', state: { cropName, details } }}>    
                                <div className='viewProductBtn'> 
                                    View Crop Details
                                </div>
                            </Link>
                        </div>
                    </Card.Content>
                </Card>
            </div>

            // <div className="cardContainer">
            //     <div className="card">
            //         <div className="cardImageContainer">
            //             <div className="cardImage">
            //                 <img src={details.cropImage} />
            //             </div>
            //         </div>
            //         <div className="cardContentContainer">
            //             <div className="cardContent">
            //                 <h3>{cropName}</h3>
            //             </div>
            //         </div>
            //         <div className="cardViewProductContainer">
            //             <div className="cardViewProduct">
            //                 <p>View Product</p>
            //             </div>
            //         </div>
            //     </div>
            // </div>
        );
    }
}

export default CropCatalogCard;
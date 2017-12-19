// @flow
import React from 'react';
import Dialog, {
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
  } from 'material-ui/Dialog';
import Card, { CardActions, CardContent } from 'material-ui/Card';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import TextField from 'material-ui/TextField';
import IndividualView from 'components/IndividualView';
import Loader from 'react-loader';

import Ontology from 'lib/Ontology';
import RDFProperty from 'lib/RDFProperty';
import Individual from 'lib/Individual';

function validatePropertyValue(property: RDFProperty, individual: Individual): boolean {
    let isValid = false;
    for (let resourceType of individual.types) {
        if (property.ranges.indexOf(resourceType) !== -1) {
            isValid = true;
            break;
        }
    }
    return isValid;
}

type Props = {
    isDialog: boolean,
    individual?: Individual,
    property?: RDFProperty,
    addedProperty?: () => void,
    selectedResource?: (resource: Individual) => void,
    findResource: (search: string) => void,
    cancel: () => void,
    findingResourceId?: string,
    findingResource?: Individual,
    findingResourceError?: string,
    ontology: Ontology
}

export default class ResourceSelector extends React.Component<Props> {
    _textfield = null;
    _isValid = false ;
    
    selectedResource() {
        if (this.props.findingResource && this.props.individual && this.props.property) {
            const individual = this.props.individual;
            const property = this.props.property;
            individual.addProperty(property.IRI, this.props.findingResource);

            if (this.props.addedProperty) {
                this.props.addedProperty();
            }
        } else if (this.props.selectedResource && this.props.findingResource) {
            this.props.selectedResource(this.props.findingResource);
        }
        
      
    }

    findResource() {
        if (this._textfield) {
            const searchTerm = this._textfield.value;
            if (searchTerm) {
                this.props.findResource(searchTerm.toUpperCase());
            }
        }
    }

    handleChange(e)
    {
//        console.log("change")
       this._isValid = false ;
    }
    
    handleKeypress(e)
    {
//        console.log("keypress")
       
       if (e.key === 'Enter') 
       {
          if(!this._isValid) { this.findResource(); }
          else { this.selectedResource(); }
       }
      
    }
    
    render() {
        let message;
        let isValid;
        if (this.props.findingResourceId) {
            if (this.props.findingResource) {
                isValid = true;
                if (this.props.individual && this.props.property) {
                    isValid = validatePropertyValue(this.props.property, this.props.findingResource);
                }
                this._isValid = isValid 
                
                message = <div>
                    <Typography>Found:</Typography>
                    <IndividualView
                        onClick={this.selectedResource.bind(this)}
                        individual={this.props.findingResource}
                        isEditable={false}
                        isExpanded={false}
                        isExpandable={false}
                        nested={true}
                        level={0}
                        showLabel={true}
                        ontology={this.props.ontology}
                    />
                    {!isValid &&
                        <p>Error: this resource is not valid for this property.</p>
                    }   
                </div>
            } else if (this.props.findingResourceError) {
                message = <Typography>Error loading resource: {this.props.findingResourceError}</Typography>
            } else {
                message = <Loader loaded={false} />
            }
        }

        let view = <Card>
            <CardContent>
                <Typography type="headline" component="h2">
                    Select a resource
                </Typography>
                <TextField 
                    autoFocus
                    label="Resource ID"
                    id="resourceID"
                    type="text"
                    inputRef={(searchInput) => this._textfield = searchInput}
                    onKeyPress={this.handleKeypress.bind(this)}            
                    onChange={this.handleChange.bind(this)}                    
                />
                <Button  onClick={this.findResource.bind(this)}>
                    Search
                </Button>
            </CardContent>
            
            {this.props.findingResourceId &&
                <CardContent>
                    {message}
                </CardContent>
            }

            <CardActions>
                {this.props.isDialog &&
                    <Button onClick={this.props.cancel}>
                        Cancel
                    </Button>
                }
                {isValid &&
                    <Button onClick={this.selectedResource.bind(this)}>
                        Select
                    </Button>
                }
            </CardActions>
        </Card>

        if (this.props.isDialog) {
            view = <Dialog open={true}>{view}</Dialog>
        }

        return(
            view
        );

        /*
        return(
            <div>
                <p>ResourceSelector!</p>
                <Dialog open={this.props.isOpen}>
                    <DialogTitle>Select a resource</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Please enter the ID of the resource you would like to use.
                        </DialogContentText>
                        <TextField 
                            autoFocus
                            label="Resource ID"
                            id="resourceID"
                            type="text"
                            inputRef={(searchInput) => this._textfield = searchInput}
                        />
                        <Button onClick={this.findResource.bind(this)}>
                            Search
                        </Button>
                    </DialogContent>

                    {this.props.findingResourceId &&
                        <DialogContent>
                            {message}
                        </DialogContent>
                    }
                    
                    <DialogActions>
                        <Button onClick={this.props.cancel}>
                            Cancel
                        </Button>
                        {isValid &&
                            <Button onClick={this.selectedResource.bind(this)}>
                                Select
                            </Button>
                        }
                    </DialogActions>
                </Dialog>
            </div>
        );
        */
    }
}
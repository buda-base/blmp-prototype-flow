import React from 'react';
import Dialog, {
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
  } from 'material-ui/Dialog';
import Button from 'material-ui/Button';
import TextField from 'material-ui/TextField';
import IndividualView from 'components/IndividualView';
import Loader from 'react-loader';

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
    isOpen: boolean,
    individual: Individual,
    property: RDFProperty,
    addedProperty: () => void,
    findResource: (search: string) => void,
    cancel: () => void,
    findingResourceId?: string,
    findingResource?: Individual,
    findingResourceError?: string,
    ontology: Ontology
}

export default class ResourceSelector extends React.Component<Props> {
    _textfield = null;

    selectedResource() {
        if (this.props.findingResource) {
            const individual = this.props.individual;
            const property = this.props.property;
            individual.addProperty(property.IRI, this.props.findingResource);
        }

        this.props.addedProperty();
    }

    findResource() {
        const searchTerm = this._textfield.value;
        this.props.findResource(searchTerm);
    }

    render() {
        let message;
        let isValid;
        if (this.props.findingResourceId) {
            if (this.props.findingResource) {
                isValid = validatePropertyValue(this.props.property, this.props.findingResource);
                message = <div>
                    <DialogContentText>Found:</DialogContentText>
                    <IndividualView
                        individual={this.props.findingResource}
                        isEditable={false}
                        isExpanded={false}
                        isExpandable={false}
                        nested={true}
                        level={0}
                        ontology={this.props.ontology}
                        onIndividualUpdated={() => null}
                        onAddResource={() => null}
                    />
                    {!isValid &&
                        <p>Error: this resource is not valid for this property.</p>
                    }   
                </div>
            } else if (this.props.findingResourceError) {
                message = <DialogContentText>Error loading resource: {this.props.findingResourceError}</DialogContentText>
            } else {
                message = <Loader loaded={false} />
            }
        }

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
    }
}
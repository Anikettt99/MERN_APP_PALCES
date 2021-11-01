import React, { useEffect, useState, useContext } from "react";
import { useParams, useHistory } from "react-router-dom";

import Button from "../../shared/components/FormElements/Button";
import Input from "../../shared/components/FormElements/Input";
import {
  VALIDATOR_REQUIRE,
  VALIDATOR_MINLENGTH,
} from "../../shared/util/Validator";
import { useForm } from "../../shared/hooks/form-hook";
import "./PlaceForm.css";
import { useHttpClient } from "../../shared/hooks/http-hook";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import { AuthContext } from "../../shared/context/auth-context";

const UpdatePlace = () => {
  const auth = useContext(AuthContext);
  const { clearError, error, isLoading, sendRequest } = useHttpClient();
  const [loadedPlace, setloadedPlace] = useState();
  const placeId = useParams().placeId;
  const history = useHistory();

  const [formState, inputHandler, setFormData] = useForm(
    {
      title: {
        value: " ",
        isValid: false,
      },
      description: {
        value: " ",
        isValid: false,
      },
    },
    false
  );

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const responsedata = await sendRequest(
          process.env.REACT_APP_BACKEND_URL+ `/places/${placeId}`
        );
        setloadedPlace(responsedata.place);
        setFormData(
          {
            title: {
              value: responsedata.place.title,
              isValid: true,
            },
            description: {
              value: responsedata.place.description,
              isValid: true,
            },
          },
          true
        );
      } catch (err) {}
    };
    fetchPlaces();
  }, [sendRequest, placeId, setFormData]); // all are external dependcy so we have to add here

  /* we are using useEffect to prevent infinite loop as whenever this setFormData
    call it will call the reducer in our custom hook which change the state of this 
    component and this will get re render and then it will again call setformdata and 
    this loop will go no indefinitely
 */
  /*   useEffect(() => {
    if (identifiedPlace) {
      setFormData(
        {
          title: {
            value: identifiedPlace.title,
            isValid: true,
          },
          description: {
            value: identifiedPlace.description,
            isValid: true,
          },
        },
        true
      );
    }
    setIsLoading(false);
  }, [setFormData, identifiedPlace]); // identifiedPlace will never change and setFormData will never change bcoz its wrap in useCallback in out custom hook */

  const placeUpdateSubmitHandler = async (event) => {
    event.preventDefault();
    // console.log(formState.inputs);
    try {
      await sendRequest(
        process.env.REACT_APP_BACKEND_URL+`/places/${placeId}`,
        "PATCH",
        JSON.stringify({
          title: formState.inputs.title.value,
          description: formState.inputs.description.value,
        }),
        {
          "Content-Type": "application/json",
          Authorization: "Bearer " + auth.token,
        }
      );
      history.push("/" + auth.userId + "/places");
    } catch (err) {}
  };

  if (isLoading) {
    return (
      <div className="center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!loadedPlace && !error) {
    return (
      <div className="center">
        <h2>Could not find place!</h2>
      </div>
    );
  }

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      {!isLoading && loadedPlace && (
        <form className="place-form" onSubmit={placeUpdateSubmitHandler}>
          <Input
            id="title"
            element="input"
            type="text"
            label="Title"
            validators={[VALIDATOR_REQUIRE()]}
            errorText="Please enter a valid title"
            onInput={inputHandler}
            // initalValue={formState.inputs.title.value} // formstate mai input or isvalid hai and input mai title hai
            initalValue={loadedPlace.title}
            //initalValid={formState.inputs.title.isValid}
            initalValid={true}
          ></Input>
          <Input
            id="description"
            element="textarea"
            label="Description"
            validators={[VALIDATOR_MINLENGTH(5)]}
            errorText="Please enter a valid description (min. 5 character)."
            onInput={inputHandler}
            /*initalValue={formState.inputs.description.value}
          initalValid={formState.inputs.description.isValid}*/
            initalValue={loadedPlace.description}
            initalValid={true}
          />
          <Button type="submit" disabled={!formState.isValid}>
            UPDATE PLACE
          </Button>
        </form>
      )}
    </React.Fragment>
  );
};

export default UpdatePlace;

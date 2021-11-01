import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import { useHttpClient } from "../../shared/hooks/http-hook";
import PlaceList from "../components/PlaceList";

const UserPlaces = () => {
  const [loadedPlaces, setLoadedPlaces] = useState();
  const { clearError, error, isLoading, sendRequest } = useHttpClient();
  const userId = useParams().userId;
  /*
  we are using use effect so that we only send request
  when this component render not when this component
  re render
  */
  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const responsedata = await sendRequest(
          process.env.REACT_APP_BACKEND_URL+`/places/user/${userId}`
        );
        setLoadedPlaces(responsedata.places);
      } catch (err) {}
    };
    fetchPlaces();
  }, [sendRequest, userId]);
  /*
    this sendrequest is wrapped under useCallback so
    it will never re created and this function(in useEffect)
    will only render once when this component is mounted
    and we are using sendrequest as a dependency coz
    we are using external func (sendrequest) here
   */

  const placeDeletedhandler = (deletedPlaceId) => {
    setLoadedPlaces((prevPlaces) =>
      prevPlaces.filter((place) => place.id !== deletedPlaceId)
    );
  };

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading && (
        <div className="center">
          <LoadingSpinner />
        </div>
      )}
      {!isLoading && loadedPlaces && (
        <PlaceList items={loadedPlaces} onDeletePlace={placeDeletedhandler} />
      )}
    </React.Fragment>
  );
};

export default UserPlaces;

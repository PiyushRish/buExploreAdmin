import { createContext, useState } from "react";

export const PlaceContext = createContext();

export function PlaceProvider({ children }) {
  const [clickedPlace,setClickedPlace] = useState(null);

  const setClickedPlaceHandler = (place) => {
    setClickedPlace(place);
  };

  return (
    <PlaceContext.Provider value={{ clickedPlace, setClickedPlaceHandler }}>
      {children}
    </PlaceContext.Provider>
  );
}

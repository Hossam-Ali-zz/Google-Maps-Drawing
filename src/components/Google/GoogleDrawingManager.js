import React, { useState, useEffect } from "react";
import { compose, withProps } from "recompose";
import { withScriptjs, withGoogleMap, GoogleMap } from "react-google-maps";
import { DrawingManager } from "react-google-maps/lib/components/drawing/DrawingManager";
import styles from "./styles.module.scss";

const GoogleDrawingManager = compose(
  withProps({
    googleMapURL: `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAP_KEY}&v=3.exp&libraries=geometry,drawing,places`,
    loadingElement: <div id="1" style={{ height: `100%` }} />,
    containerElement: <div id="2" style={{ height: `400px` }} />,
    mapElement: <div id="3" style={{ height: `100%` }} />,
  }),
  withScriptjs,
  withGoogleMap
)(() => {
  const [mapOverlay, setMapOverlay] = useState([]);
  const [selectedShape, setSelectedShape] = useState(null);
  const [allOverLays, setAllOverLays] = useState([]);
  const [selectedColor, setSelectedColor] = useState("#1E90FF");
  const colors = ["#1E90FF", "#FF1493", "#32CD32", "#FF8C00", "#4B0082"];

  useEffect(() => {
    console.log("useEffect", selectedShape);
  }, [selectedShape]);

  const clearSelection = () => {
    console.log("clearSelection", selectedShape);
    if (selectedShape) {
      if (!selectedShape.marker) {
        console.log("Asdadasd");
        selectedShape.setEditable(false);
      }
      setSelectedShape(null);
    }
  };

  const setSelection = (shape) => {
    console.log("setSelection", shape, selectedShape);
    clearSelection();
    if (!shape.marker) {
      shape.setEditable(true);
    }
    console.log("setSelection", shape, selectedShape);
    setSelectedShape(shape);
  };

  const deleteSelectedShape = () => {
    console.log("deleteSelectedShape", selectedShape);
    if (selectedShape) {
      selectedShape.setMap(null);
      const newShaped = mapOverlay.filter(
        (shape) => shape.sum !== selectedShape.sum
      );
      setMapOverlay(newShaped);
    }
  };

  const deleteAllShapes = () => {
    allOverLays.forEach((shape) => shape.setMap(null));
    setAllOverLays([]);
    setMapOverlay([]);
  };

  const updatePolygonShape = (overlay) => {
    const positionDetails = [];
    let sum = 0;
    overlay
      .getPath()
      .getArray()
      .forEach((position) => {
        sum += position.lat() + position.lng();
        positionDetails.push({
          lat: position.lat(),
          lng: position.lng(),
        });
      });
    setMapOverlay([
      ...mapOverlay,
      {
        polygon: positionDetails,
        overlay,
        sum,
      },
    ]);
    return sum;
  };

  const updatePolylineShape = (overlay) => {
    const positionDetails = [];
    let sum = 0;
    overlay
      .getPath()
      .getArray()
      .forEach((position) => {
        sum += position.lat() + position.lng();
        positionDetails.push({
          lat: position.lat(),
          lng: position.lng(),
        });
      });
    setMapOverlay([
      ...mapOverlay,
      {
        polyline: positionDetails,
        overlay,
        sum,
      },
    ]);
    return sum;
  };

  const updateCircleShape = (overlay) => {
    const center = overlay.getBounds().getCenter();
    const radius = overlay.getRadius();
    const sum = center.lat() + center.lng() + radius;
    setMapOverlay([
      ...mapOverlay,
      {
        overlay,
        sum,
        circle: [
          {
            lat: center.lat(),
            lng: center.lng(),
          },
          {
            radius,
          },
        ],
      },
    ]);
    return sum;
  };

  const updateMarkerShape = (overlay) => {
    const sum = overlay.getPosition().lat() + overlay.getPosition().lng();
    setMapOverlay([
      ...mapOverlay,
      {
        sum,
        overlay,
        marker: [
          {
            lat: overlay.getPosition().lat(),
            lng: overlay.getPosition().lng(),
          },
        ],
      },
    ]);
    return sum;
  };

  const updateRectangleShape = (overlay) => {
    const bounds = overlay.getBounds();
    const start = bounds.getNorthEast();
    const end = bounds.getSouthWest();
    const sum = start.lat() + start.lng() + end.lat() + end.lng();
    setMapOverlay([
      ...mapOverlay,
      {
        overlay,
        sum,
        rectangle: [
          {
            lat: start.lat(),
            lng: start.lng(),
          },
          {
            lat: end.lat(),
            lng: end.lng(),
          },
        ],
      },
    ]);
    return sum;
  };

  const handleOnOverlayComplete = (e) => {
    const { overlay, type } = e;
    setAllOverLays([...allOverLays, overlay]);
    const newShape = overlay;
    newShape[type] = type;

    let sum = 0;
    if (type === "polygon") {
      sum = updatePolygonShape(overlay);
    } else if (type === "circle") {
      sum = updateCircleShape(overlay);
    } else if (type === "marker") {
      sum = updateMarkerShape(overlay);
    } else if (type === "rectangle") {
      sum = updateRectangleShape(overlay);
    } else if (type === "polyline") {
      sum = updatePolylineShape(overlay);
    }
    newShape.sum = sum;
    window.google.maps.event.addListener(newShape, "click", () => {
      setSelection(newShape);
      if (type === "polygon") {
        window.google.maps.event.addListener(
          newShape.getPath(),
          "set_at",
          () => {
            sum = updatePolygonShape(overlay);
            newShape.sum = sum;
          }
        );
        window.google.maps.event.addListener(
          newShape.getPath(),
          "remove_at",
          () => {
            sum = updatePolygonShape(overlay);
            newShape.sum = sum;
          }
        );
        window.google.maps.event.addListener(
          newShape.getPath(),
          "insert_at",
          () => {
            sum = updatePolygonShape(overlay);
            newShape.sum = sum;
          }
        );
      } else if (type === "polyline") {
        window.google.maps.event.addListener(
          newShape.getPath(),
          "set_at",
          () => {
            sum = updatePolylineShape(overlay);
            newShape.sum = sum;
          }
        );
        window.google.maps.event.addListener(
          newShape.getPath(),
          "insert_at",
          () => {
            sum = updatePolylineShape(overlay);
            newShape.sum = sum;
          }
        );
        window.google.maps.event.addListener(
          newShape.getPath(),
          "remove_at",
          () => {
            sum = updatePolylineShape(overlay);
            newShape.sum = sum;
          }
        );
      } else if (type === "circle") {
        window.google.maps.event.addListener(newShape, "center_changed", () => {
          sum = updateCircleShape(overlay);
          newShape.sum = sum;
        });
        window.google.maps.event.addListener(newShape, "radius_changed", () => {
          sum = updateCircleShape(overlay);
          newShape.sum = sum;
        });
      } else if (type === "rectangle") {
        window.google.maps.event.addListener(newShape, "bounds_changed", () => {
          sum = updateRectangleShape(overlay);
          newShape.sum = sum;
        });
      }
    });
    // setSelection(newShape);
  };

  return (
    <GoogleMap
      defaultZoom={3}
      onClick={clearSelection}
      defaultCenter={new window.google.maps.LatLng(0, 180)}
    >
      <DrawingManager
        onOverlayComplete={(e) => handleOnOverlayComplete(e)}
        defaultOptions={{
          drawingControl: true,
          drawingControlOptions: {
            position: window.google.maps.ControlPosition.RIGHT_TOP,
            drawingModes: [
              "marker",
              "circle",
              "polygon",
              "rectangle",
              "polyline",
            ],
          },
          polylineOptions: {
            fillColor: selectedColor,
          },
          circleOptions: {
            fillColor: selectedColor,
            fillOpacity: 0.5,
            strokeWeight: 3,
            zIndex: 1,
          },
          polygonOptions: {
            fillColor: selectedColor,
          },
          rectangleOptions: {
            fillColor: selectedColor,
          },
        }}
      />
      <div className={styles.mapControlContainer}>
        <button
          style={{ float: "left" }}
          type="button"
          onClick={() => deleteSelectedShape()}
        >
          Delete Selected Shape
        </button>
        <button
          style={{ float: "left" }}
          type="button"
          onClick={() => deleteAllShapes()}
        >
          Delete All Shapes
        </button>
        <div>
          {colors.map((color, index) => (
            <span
              key={index}
              className={styles.colorButton}
              onClick={() => setSelectedColor(color)}
              style={{
                backgroundColor: color,
                border:
                  color === selectedColor
                    ? "2px solid rgb(119, 136, 153)"
                    : "2px solid rgb(255, 255, 255)",
              }}
            />
          ))}
        </div>
      </div>
      {console.log("map", mapOverlay)}
    </GoogleMap>
  );
});

export default GoogleDrawingManager;

import React, { Component } from "react";
import { compose, withProps } from "recompose";
import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  Circle,
} from "react-google-maps";
import { DrawingManager } from "react-google-maps/lib/components/drawing/DrawingManager";
import { v4 as uuidv4 } from "uuid";
import styles from "./styles.module.scss";

class GoogleDrawingManager extends Component {
  state = {
    mapOverlay: [],
    selectedShape: null,
    allOverLays: [],
    selectedColor: "#1E90FF",
    preShaped: [],
    selectedId: null,
  };

  componentDidMount() {
    const { preShaped } = this.state;
    this.setState({
      preShaped: [
        ...preShaped,
        {
          type: "circle",
          center: { lat: -18.142, lng: 178.431 },
          radius: 1000000,
          color: "#FF8C00",
          editable: false,
          id: uuidv4(),
          visible: true,
        },
      ],
    });
  }

  clearSelection = () => {
    const { selectedShape } = this.state;
    if (selectedShape) {
      if (!selectedShape.marker) {
        selectedShape.setEditable(false);
      }
      this.setState({
        selectedShape: null,
      });
    }
  };

  setSelection = (shape) => {
    this.clearSelection();
    if (!shape.marker) {
      shape.setEditable(true);
    }
    this.setState({
      selectedShape: shape,
    });
  };

  deleteSelectedShape = () => {
    const { selectedShape, mapOverlay, preShaped, selectedId } = this.state;
    if (selectedShape) {
      selectedShape.setMap(null);
      const newShaped = mapOverlay.filter(
        (shape) => shape.id !== selectedShape.id
      );
      this.setState({
        mapOverlay: newShaped,
      });
    } else if (preShaped.length > 0) {
      const index = preShaped.findIndex((sh) => sh.id === selectedId);
      if (preShaped[index].editable) {
        this.setState(({ preShaped }) => ({
          preShaped: [
            ...preShaped.slice(0, index),
            {
              ...preShaped[index],
              visible: false,
            },
            ...preShaped.slice(index + 1),
          ],
        }));
      }
    }
  };

  deleteAllShapes = () => {
    const { allOverLays } = this.state;
    allOverLays.forEach((shape) => shape.setMap(null));
    this.setState({
      allOverLays: [],
      mapOverlay: [],
      preShaped: [],
    });
  };

  updatePolygonShape = (overlay, isEdit, id) => {
    const positionDetails = [];
    const { mapOverlay, selectedShape, selectedColor } = this.state;
    overlay
      .getPath()
      .getArray()
      .forEach((position) => {
        positionDetails.push({
          lat: position.lat(),
          lng: position.lng(),
        });
      });
    if (isEdit) {
      const index = mapOverlay.findIndex(
        (item) => item.id === selectedShape.id
      );
      this.setState(({ mapOverlay }) => ({
        mapOverlay: [
          ...mapOverlay.slice(0, index),
          {
            ...mapOverlay[index],
            polygon: positionDetails,
            overlay,
          },
          ...mapOverlay.slice(index + 1),
        ],
      }));
    } else {
      this.setState({
        mapOverlay: [
          ...mapOverlay,
          { polygon: positionDetails, overlay, id, selectedColor },
        ],
      });
    }
  };

  updatePolylineShape = (overlay, isEdit, id) => {
    const positionDetails = [];
    const { mapOverlay, selectedShape, selectedColor } = this.state;
    overlay
      .getPath()
      .getArray()
      .forEach((position) => {
        positionDetails.push({
          lat: position.lat(),
          lng: position.lng(),
        });
      });
    if (isEdit) {
      const index = mapOverlay.findIndex(
        (item) => item.id === selectedShape.id
      );
      this.setState(({ mapOverlay }) => ({
        mapOverlay: [
          ...mapOverlay.slice(0, index),
          {
            ...mapOverlay[index],
            polyline: positionDetails,
            overlay,
          },
          ...mapOverlay.slice(index + 1),
        ],
      }));
    } else {
      this.setState({
        mapOverlay: [
          ...mapOverlay,
          {
            polyline: positionDetails,
            overlay,
            id,
            selectedColor,
          },
        ],
      });
    }
  };

  updateCircleShape = (overlay, isEdit, id) => {
    const center = overlay.getBounds().getCenter();
    const radius = overlay.getRadius();
    const { mapOverlay, selectedShape, selectedColor } = this.state;
    if (isEdit) {
      const index = mapOverlay.findIndex(
        (item) => item.id === selectedShape.id
      );
      this.setState(({ mapOverlay }) => ({
        mapOverlay: [
          ...mapOverlay.slice(0, index),
          {
            ...mapOverlay[index],
            circle: [
              {
                lat: center.lat(),
                lng: center.lng(),
              },
              {
                radius,
              },
            ],
            overlay,
          },
          ...mapOverlay.slice(index + 1),
        ],
      }));
    } else {
      this.setState({
        mapOverlay: [
          ...mapOverlay,
          {
            circle: [
              {
                lat: center.lat(),
                lng: center.lng(),
              },
              {
                radius,
              },
            ],
            overlay,
            id,
            selectedColor,
          },
        ],
      });
    }
  };

  updateMarkerShape = (overlay, isEdit, id) => {
    const { mapOverlay, selectedShape } = this.state;
    if (isEdit) {
      const index = mapOverlay.findIndex(
        (item) => item.id === selectedShape.id
      );
      this.setState(({ mapOverlay }) => ({
        mapOverlay: [
          ...mapOverlay.slice(0, index),
          {
            ...mapOverlay[index],
            overlay,
            marker: [
              {
                lat: overlay.getPosition().lat(),
                lng: overlay.getPosition().lng(),
              },
            ],
          },
          ...mapOverlay.slice(index + 1),
        ],
      }));
    } else {
      this.setState({
        mapOverlay: [
          ...mapOverlay,
          {
            id,
            overlay,
            marker: [
              {
                lat: overlay.getPosition().lat(),
                lng: overlay.getPosition().lng(),
              },
            ],
          },
        ],
      });
    }
  };

  updateRectangleShape = (overlay, isEdit, id) => {
    const bounds = overlay.getBounds();
    const start = bounds.getNorthEast();
    const end = bounds.getSouthWest();
    const { mapOverlay, selectedShape, selectedColor } = this.state;
    if (isEdit) {
      const index = mapOverlay.findIndex(
        (item) => item.id === selectedShape.id
      );
      this.setState(({ mapOverlay }) => ({
        mapOverlay: [
          ...mapOverlay.slice(0, index),
          {
            ...mapOverlay[index],
            overlay,
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
          ...mapOverlay.slice(index + 1),
        ],
      }));
    } else {
      this.setState({
        mapOverlay: [
          ...mapOverlay,
          {
            overlay,
            id,
            selectedColor,
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
        ],
      });
    }
  };

  handleOnOverlayComplete = (e) => {
    const { overlay, type } = e;
    const { allOverLays } = this.state;
    const id = uuidv4();
    this.setState({
      allOverLays: [...allOverLays, overlay],
    });
    const newShape = overlay;
    newShape[type] = type;
    if (type === "polygon") {
      this.updatePolygonShape(overlay, false, id);
    } else if (type === "circle") {
      this.updateCircleShape(overlay, false, id);
    } else if (type === "marker") {
      this.updateMarkerShape(overlay, false, id);
    } else if (type === "rectangle") {
      this.updateRectangleShape(overlay, false, id);
    } else if (type === "polyline") {
      this.updatePolylineShape(overlay, false, id);
    }
    newShape.id = id;
    window.google.maps.event.addListener(newShape, "click", () => {
      this.setSelection(newShape);
      if (type === "polygon") {
        window.google.maps.event.addListener(
          newShape.getPath(),
          "set_at",
          () => {
            this.updatePolygonShape(overlay, true, id);
          }
        );
        window.google.maps.event.addListener(
          newShape.getPath(),
          "remove_at",
          () => {
            this.updatePolygonShape(overlay, true, id);
          }
        );
        window.google.maps.event.addListener(
          newShape.getPath(),
          "insert_at",
          () => {
            this.updatePolygonShape(overlay, true, id);
          }
        );
      } else if (type === "polyline") {
        window.google.maps.event.addListener(
          newShape.getPath(),
          "set_at",
          () => {
            this.updatePolylineShape(overlay, true, id);
          }
        );
        window.google.maps.event.addListener(
          newShape.getPath(),
          "insert_at",
          () => {
            this.updatePolylineShape(overlay, true, id);
          }
        );
        window.google.maps.event.addListener(
          newShape.getPath(),
          "remove_at",
          () => {
            this.updatePolylineShape(overlay, true, id);
          }
        );
      } else if (type === "circle") {
        window.google.maps.event.addListener(newShape, "center_changed", () => {
          this.updateCircleShape(overlay, true, id);
        });
        window.google.maps.event.addListener(newShape, "radius_changed", () => {
          this.updateCircleShape(overlay, true, id);
        });
      } else if (type === "rectangle") {
        window.google.maps.event.addListener(newShape, "bounds_changed", () => {
          this.updateRectangleShape(overlay, true, id);
        });
      }
    });
  };

  updateRadius = () => {
    const updatedRadius = this.map.getRadius();
    this.updateCircleState(false, updatedRadius);
  };

  updateCenter = () => {
    const center = this.map.getBounds().getCenter();
    this.updateCircleState(true, center);
  };

  handleCircleClicked = (item) => {
    const { preShaped } = this.state;
    const index = preShaped.findIndex((sh) => sh.id === item.id);
    this.setState(({ preShaped }) => ({
      preShaped: [
        ...preShaped.slice(0, index),
        {
          ...preShaped[index],
          editable: !preShaped[index].editable,
        },
        ...preShaped.slice(index + 1),
      ],
      selectedId: item.id,
    }));
  };

  updateCircleState(isCenter, value) {
    const { selectedId, preShaped } = this.state;
    const index = preShaped.findIndex((sh) => sh.id === selectedId);
    this.setState(({ preShaped }) => ({
      preShaped: [
        ...preShaped.slice(0, index),
        {
          ...preShaped[index],
          ...(isCenter
            ? { center: { lat: value.lat(), lng: value.lng() } }
            : { radius: value }),
        },
        ...preShaped.slice(index + 1),
      ],
    }));
  }

  mapMounted(ref) {
    this.map = ref;
  }

  render() {
    const colors = ["#1E90FF", "#FF1493", "#32CD32", "#FF8C00", "#4B0082"];
    const { selectedColor, mapOverlay, preShaped, selectedId } = this.state;
    return (
      <GoogleMap
        defaultZoom={3}
        onClick={this.clearSelection}
        defaultCenter={new window.google.maps.LatLng(0, 180)}
      >
        <DrawingManager
          onOverlayComplete={(e) => this.handleOnOverlayComplete(e)}
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
        {preShaped.map((item, index) => {
          if (item.type === "circle") {
            return (
              <Circle
                ref={this.mapMounted.bind(this)}
                key={index}
                radius={item.radius}
                center={item.center}
                options={{
                  fillColor: item.color,
                  editable: item.editable,
                  visible: item.visible,
                }}
                onRadiusChanged={() => this.updateRadius()}
                onCenterChanged={() => this.updateCenter()}
                onClick={() => this.handleCircleClicked(item)}
              />
            );
          }
          return null;
        })}
        <div className={styles.mapControlContainer}>
          <button
            style={{ float: "left" }}
            type="button"
            onClick={() => this.deleteSelectedShape(selectedId)}
          >
            Delete Selected Shape
          </button>
          <button
            style={{ float: "left" }}
            type="button"
            onClick={() => this.deleteAllShapes()}
          >
            Delete All Shapes
          </button>
          <div>
            {colors.map((color, index) => (
              <span
                key={index}
                className={styles.colorButton}
                onClick={() => this.setState({ selectedColor: color })}
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
        {console.log("map", mapOverlay, preShaped)}
      </GoogleMap>
    );
  }
}
export default compose(
  withProps({
    googleMapURL: `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAP_KEY}&v=3.exp&libraries=geometry,drawing,places`,
    loadingElement: <div id="1" style={{ height: `100%` }} />,
    containerElement: <div id="2" style={{ height: `400px` }} />,
    mapElement: <div id="3" style={{ height: `100%` }} />,
  }),
  withScriptjs,
  withGoogleMap
)(GoogleDrawingManager);

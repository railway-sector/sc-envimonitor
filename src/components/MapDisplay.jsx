import { useEffect, useState } from "react";
import "../index.css";
import "../App.css";
import "@arcgis/map-components/dist/components/arcgis-scene";
import "@arcgis/map-components/components/arcgis-scene";
import "@arcgis/map-components/components/arcgis-zoom";
import "@arcgis/map-components/components/arcgis-legend";
import "@arcgis/map-components/components/arcgis-basemap-gallery";
import "@arcgis/map-components/components/arcgis-layer-list";
import {
  alignmentGroupLayer,
  monitorPointLayer,
  stationLayer,
} from "../layers";

function MapDisplay() {
  const [sceneView, setSceneView] = useState();
  const arcgisScene = document.querySelector("arcgis-scene");
  // zoomToLayer(prowLayer, arcgisScene);

  useEffect(() => {
    if (sceneView) {
      arcgisScene.map.add(alignmentGroupLayer);
      arcgisScene.map.add(stationLayer);
      arcgisScene.map.add(monitorPointLayer);
    }
  });

  return (
    <arcgis-scene
      // item-id="5ba14f5a7db34710897da0ce2d46d55f"
      basemap="dark-gray-vector"
      ground="world-elevation"
      viewingMode="local"
      zoom="13"
      center="120.5793, 15.18"
      onarcgisViewReadyChange={(event) => {
        setSceneView(event.target);
      }}
    >
      {/* <arcgis-zoom position="top-right"></arcgis-zoom> */}
    </arcgis-scene>
  );
}

export default MapDisplay;

import { useEffect, useRef, useState } from "react";
import { monitorPointLayer } from "../layers";
import FeatureFilter from "@arcgis/core/layers/support/FeatureFilter";
import Query from "@arcgis/core/rest/support/Query";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import am5themes_Responsive from "@amcharts/amcharts5/themes/Responsive";

import "../App.css";
import {
  generateChartData,
  generateTotalNumber,
  thousands_separators,
} from "../Query";
import { ArcgisScene } from "@arcgis/map-components/dist/components/arcgis-scene";
import { CalciteLabel, CalcitePanel } from "@esri/calcite-components-react";
import "@esri/calcite-components/dist/components/calcite-label";
import "@esri/calcite-components/dist/components/calcite-panel";

// Dispose function
function maybeDisposeRoot(divId: any) {
  am5.array.each(am5.registry.rootElements, function (root) {
    if (root.dom.id === divId) {
      root.dispose();
    }
  });
}

const Chart = () => {
  const arcgisScene = document.querySelector("arcgis-scene") as ArcgisScene;
  const legendRef = useRef<unknown | any | undefined>({});
  const chartRef = useRef<unknown | any | undefined>({});
  const [chartData, setChartData] = useState([]);
  const [totalNumber, setTotalNumber] = useState([]);

  const chartID = "monitoring-bar";

  useEffect(() => {
    generateChartData().then((response: any) => {
      setChartData(response);
    });

    generateTotalNumber().then((response: any) => {
      setTotalNumber(response);
    });
  }, []);

  // type
  const types = [
    {
      category: "Noise",
      value: 1,
    },
    {
      category: "Vibration",
      value: 2,
    },
    {
      category: "Air Quality",
      value: 3,
    },
    {
      category: "Soil Water",
      value: 4,
    },
    {
      category: "Groundwater",
      value: 5,
    },
    {
      category: "Surface Water",
      value: 6,
    },
  ];

  // Define parameters
  const marginTop = 0;
  const marginLeft = 0;
  const marginRight = 0;
  const marginBottom = 0;
  const paddingTop = 10;
  const paddingLeft = 5;
  const paddingRight = 5;
  const paddingBottom = 0;

  const xAxisNumberFormat = "#'%'";
  const seriesBulletLabelFontSize = "1vw";

  // axis label
  const yAxisLabelFontSize = "0.8vw";
  const xAxisLabelFontSize = "0.8vw";
  const legendFontSize = "0.8vw";

  // 1.1. Point
  const chartIconWidth = 35;
  const chartIconHeight = 35;
  const chartIconPositionX = -21;
  const chartPaddingRightIconLabel = 45;

  const chartSeriesFillColorComp = "#ff0000";
  const chartSeriesFillColorIncomp = "#000000";
  const chartBorderLineColor = "#00c5ff";
  const chartBorderLineWidth = 0.4;

  useEffect(() => {
    maybeDisposeRoot(chartID);

    var root = am5.Root.new(chartID);
    root.container.children.clear();
    root._logo?.dispose();

    // Set themesf
    // https://www.amcharts.com/docs/v5/concepts/themes/
    root.setThemes([
      am5themes_Animated.new(root),
      am5themes_Responsive.new(root),
    ]);

    var chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        layout: root.verticalLayout,
        marginTop: marginTop,
        marginLeft: marginLeft,
        marginRight: marginRight,
        marginBottom: marginBottom,
        paddingTop: paddingTop,
        paddingLeft: paddingLeft,
        paddingRight: paddingRight,
        paddingBottom: paddingBottom,
        scale: 1,
        height: am5.percent(100),
      })
    );
    chartRef.current = chart;

    var yRenderer = am5xy.AxisRendererY.new(root, {
      inversed: true,
    });
    var yAxis = chart.yAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: "category",
        renderer: yRenderer,
        bullet: function (root, axis, dataItem: any) {
          return am5xy.AxisBullet.new(root, {
            location: 0.5,
            sprite: am5.Picture.new(root, {
              width: chartIconWidth,
              height: chartIconHeight,
              centerY: am5.p50,
              centerX: am5.p50,
              x: chartIconPositionX,
              src: dataItem.dataContext.icon,
            }),
          });
        },
        tooltip: am5.Tooltip.new(root, {}),
      })
    );

    yRenderer.labels.template.setAll({
      paddingRight: chartPaddingRightIconLabel,
    });

    yRenderer.grid.template.setAll({
      location: 1,
    });

    // Label properties Y axis
    yAxis.get("renderer").labels.template.setAll({
      oversizedBehavior: "wrap",
      textAlign: "center",
      fill: am5.color("#ffffff"),
      //maxWidth: 150,
      fontSize: yAxisLabelFontSize,
    });
    yAxis.data.setAll(chartData);

    var xAxis = chart.xAxes.push(
      am5xy.ValueAxis.new(root, {
        min: 0,
        max: 100,
        strictMinMax: true,
        numberFormat: xAxisNumberFormat,
        calculateTotals: true,
        renderer: am5xy.AxisRendererX.new(root, {
          strokeOpacity: 0,
          strokeWidth: 1,
          stroke: am5.color("#ffffff"),
        }),
      })
    );

    xAxis.get("renderer").labels.template.setAll({
      //oversizedBehavior: "wrap",
      textAlign: "center",
      fill: am5.color("#ffffff"),
      //maxWidth: 150,
      fontSize: xAxisLabelFontSize,
    });

    var legend = chart.children.push(
      am5.Legend.new(root, {
        centerX: am5.p50,
        centerY: am5.percent(50),
        x: am5.percent(60),
        y: am5.percent(97),
        marginTop: 20,
      })
    );
    legendRef.current = legend;

    legend.labels.template.setAll({
      oversizedBehavior: "truncate",
      fill: am5.color("#ffffff"),
      fontSize: legendFontSize,
      scale: 1.2,
      //textDecoration: "underline"
      //width: am5.percent(200),
      //fontWeight: '300',
    });

    function makeSeries(name: any, fieldName: any) {
      var series = chart.series.push(
        am5xy.ColumnSeries.new(root, {
          name: name,
          stacked: true,
          xAxis: xAxis,
          yAxis: yAxis,
          baseAxis: yAxis,
          valueXField: fieldName,
          valueXShow: "valueXTotalPercent",
          categoryYField: "category",
          fill:
            fieldName === "normal"
              ? am5.color(chartSeriesFillColorIncomp)
              : am5.color(chartSeriesFillColorComp),
          stroke: am5.color(chartBorderLineColor),
        })
      );

      series.columns.template.setAll({
        tooltipText: "{name}: {valueX}", // "{categoryY}: {valueX}",
        tooltipY: am5.percent(90),
        //fill: am5.color("#ffffff")
        // 100% transparent for incomplete
        fillOpacity: fieldName === "normal" ? 0 : 1,
        strokeWidth: chartBorderLineWidth,
        //strokeOpacity: 0,
      });
      series.data.setAll(chartData);

      series.appear();

      series.bullets.push(function () {
        return am5.Bullet.new(root, {
          sprite: am5.Label.new(root, {
            text:
              fieldName === 0 ? "" : "{valueXTotalPercent.formatNumber('#.')}%", //"{valueX}",
            fill: root.interfaceColors.get("alternativeText"),
            opacity: fieldName === "normal" ? 0 : 1,
            fontSize: seriesBulletLabelFontSize,
            centerY: am5.p50,
            centerX: am5.p50,
            populateText: true,
          }),
        });
      });

      // Click event
      series.columns.template.events.on("click", (ev) => {
        const selected: any = ev.target.dataItem?.dataContext;
        const categorySelect: string = selected.category;
        const find = types.find((emp: any) => emp.category === categorySelect);
        const typeSelect = find?.value;

        const selectedStatus: number | null = fieldName === "normal" ? 2 : 3;
        // eslint-disable-next-line no-useless-concat
        const sqlExpression =
          "Type = " + typeSelect + " AND " + "Status = " + selectedStatus;
        console.log(typeSelect, "; ", selectedStatus);

        // Define Query
        var query = monitorPointLayer.createQuery();

        //let arrLviews: any = [];
        let highlightSelect: any;
        arcgisScene?.whenLayerView(monitorPointLayer).then((layerView: any) => {
          //arrLviews.push(layerView);
          monitorPointLayer.queryFeatures(query).then((results: any) => {
            if (results.features.length === 0) {
            } else {
              const lengths = results.features;
              const rows = lengths.length;

              let objID = [];
              for (var i = 0; i < rows; i++) {
                var obj = results.features[i].attributes.OBJECTID;
                objID.push(obj);
              }

              var queryExt = new Query({
                objectIds: objID,
              });

              monitorPointLayer.queryExtent(queryExt).then((result: any) => {
                if (result.extent) {
                  arcgisScene?.goTo(result.extent);
                }
              });

              if (highlightSelect) {
                highlightSelect.remove();
              }
              highlightSelect = layerView.highlight(objID);

              arcgisScene?.view.on("click", () => {
                layerView.filter = new FeatureFilter({
                  where: undefined,
                });
                highlightSelect.remove();
              });
            }
          });
          layerView.filter = new FeatureFilter({
            where: sqlExpression,
          });

          // For initial state, we need to add this
          arcgisScene?.view.on("click", () => {
            layerView.filter = new FeatureFilter({
              where: undefined,
            });
            highlightSelect !== undefined
              ? highlightSelect.remove()
              : console.log("");
          });
        });
      });
      legend.data.push(series);
    }
    makeSeries("Exceeded", "exceed");
    makeSeries("Normal", "normal");
    chart.appear(1000, 100);

    return () => {
      root.dispose();
    };
  });

  return (
    <>
      <CalcitePanel
        slot="panel-end"
        scale="s"
        style={{
          width: "35vw",
          padding: "0 1rem",
          borderStyle: "solid",
          borderRightWidth: 3.5,
          borderLeftWidth: 3.5,
          borderBottomWidth: 4.5,
          borderColor: "#555555",
        }}
      >
        <CalciteLabel>TOTAL EXCEEDED</CalciteLabel>

        <div style={{ display: "flex" }}>
          <div className="totalExceedNumber">
            {thousands_separators(totalNumber[1])}
            <div className="totalNumber">
              ({thousands_separators(totalNumber[0])})
            </div>
          </div>
          <img
            src={
              totalNumber[1] > 0
                ? "https://EijiGorilla.github.io/Symbols/3D_Web_Style/Warning_Symbol.svg"
                : "https://EijiGorilla.github.io/Symbols/DemolishComplete_v2.png"
            }
            alt="Warning Logo"
            height={"45%"}
            width={"20%"}
            style={{
              marginTop: "14px",
              marginLeft: "auto",
              marginRight: "30px",
            }}
          />
        </div>

        <div
          id={chartID}
          style={{
            width: "22vw",
            height: "65vh",
            backgroundColor: "rgb(0,0,0,0)",
            color: "white",
            marginRight: "10px",
            marginTop: "15px",
          }}
        ></div>
      </CalcitePanel>
    </>
  );
};

export default Chart;

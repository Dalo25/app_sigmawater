/*
Template Name: Minia - Admin & Dashboard Template
Author: Themesbrand
Website: https://themesbrand.com/
Contact: themesbrand@gmail.com
File: Dashboard Init Js File
*/

// get colors array from the string
function getChartColorsArray(chartId) {
    var colors = $(chartId).attr('data-colors');
    var colors = JSON.parse(colors);
    return colors.map(function(value){
        var newValue = value.replace(' ', '');
        if(newValue.indexOf('--') != -1) {
            var color = getComputedStyle(document.documentElement).getPropertyValue(newValue);
            if(color) return color;
        } else {
            return newValue;
        }
    })
}

//  MINI CHART

// mini-1

let valoresNv = []
const datosNv = []
const yearNv = new Date().getFullYear()
valoresNv = $('#datosJson_flnumVentas_admin').val();
datosNv.unshift({x:yearNv, y:0})
if (valoresNv) {
    datosNv.shift()
    valoresNv = JSON.parse(valoresNv);
    valoresNv.forEach(vl => {
        const temp = vl.numVentas
        datosNv.push({ x:"Hasta: "+vl.fecha, y:temp})
    })
}
datosNv.length == 1 ? datosNv.unshift({x:yearNv, y:0}) : true;
// var minichart1Colors = getChartColorsArray("#mini-chart1");
var options = {
    series: [{
        data: datosNv,
    }],
    chart: {
        type: 'line',
        height: 50,
        sparkline: {
            enabled: true
        }
    },
    colors: ["#5156be"],
    stroke: {
        curve: 'smooth',
        width: 2,
    },
    tooltip: {
        fixed: {
            enabled: false
        },
        x: {
            show: false
        },
        y: {
            title: {
                formatter: function (seriesName) {
                    return ''
                }
            }
        },
        marker: {
            show: false
        }
    }
};

var chart = new ApexCharts(document.querySelector("#mini-chart1"), options);
chart.render();

// mini-2

let valoresVd = []
const datosVd = []
const yearVd = new Date().getFullYear()
valoresVd = $('#datosJson_vdAgregados_Admin').val();
datosVd.unshift({x:yearVd, y:0})
if (valoresVd) {
    datosVd.shift()
    valoresVd = JSON.parse(valoresVd);
    valoresVd.forEach(vl => {
        const temp = vl.numVendedores
        datosVd.push({ x:"Hasta: "+vl.fecha, y:temp})
    })
}
datosVd.length == 1 ? datosVd.unshift({x:yearVd, y:0}) : true;
// var minichart2Colors = getChartColorsArray("#mini-chart2");
var options = {
    series: [{
        data: datosVd
    }],
    chart: {
        type: 'line',
        height: 50,
        sparkline: {
            enabled: true
        }
    },
    colors: ["#5156be"],
    stroke: {
        curve: 'smooth',
        width: 2,
    },
    tooltip: {
        fixed: {
            enabled: false
        },
        x: {
            show: false
        },
        y: {
            title: {
                formatter: function (seriesName) {
                    return ''
                }
            }
        },
        marker: {
            show: false
        }
    }
};

var chart = new ApexCharts(document.querySelector("#mini-chart2"), options);
chart.render();

// mini-3

let valores = []
const datos = []
const year = new Date().getFullYear()
valores = $('#datosJson_clAgregados_Admin').val();
datos.unshift({x:year, y:0})
if (valores) {
    datos.shift()
    valores = JSON.parse(valores);
    valores.forEach(vl => {
        const temp = vl.numClientes
        datos.push({ x:"Hasta: "+vl.fecha, y:temp})
    })
}
datos.length == 1 ? datos.unshift({x:year, y:0}) : true;
// var minichart3Colors = getChartColorsArray("#mini-chart3");
var options = {
    series: [{
        data: datos
    }],
    chart: {
        type: 'line',
        height: 50,
        sparkline: {
            enabled: true
        }
    },
    colors: ["#5156be"],
    stroke: {
        curve: 'smooth',
        width: 2,
    },
    tooltip: {
        fixed: {
            enabled: false
        },
        x: {
            show: false
        },
        y: {
            title: {
                formatter: function (seriesName) {
                    return ''
                }
            }
        },
        marker: {
            show: false
        }
    }
};

var chart = new ApexCharts(document.querySelector("#mini-chart3"), options);
chart.render();

// mini-4
// var minichart4Colors = getChartColorsArray("#mini-chart4");
// var options = {
//     series: [{
//         data: [12, 14, 2, 47, 42, 15, 47, 75, 65, 19, 14, 2, 47, 42, 15, ]
//     }],
//     chart: {
//         type: 'line',
//         height: 50,
//         sparkline: {
//             enabled: true
//         }
//     },
//     colors: minichart4Colors,
//     stroke: {
//         curve: 'smooth',
//         width: 2,
//     },
//     tooltip: {
//         fixed: {
//             enabled: false
//         },
//         x: {
//             show: false
//         },
//         y: {
//             title: {
//                 formatter: function (seriesName) {
//                     return ''
//                 }
//             }
//         },
//         marker: {
//             show: false
//         }
//     }
// };

// var chart = new ApexCharts(document.querySelector("#mini-chart4"), options);
// chart.render();

// 
// Wallet Balance
//
// var piechartColors = getChartColorsArray("#wallet-balance");
// var options = {
//     series: [35, 70, 15],
//     chart: {
//         width: 227,
//         height: 227,
//         type: 'pie',
//     },
//     labels: ['Ethereum', 'Bitcoin', 'Litecoin'],
//     colors: piechartColors,
//     stroke: {
//         width: 0,
//     },
//     legend: {
//         show: false
//     },
//     responsive: [{
//         breakpoint: 480,
//         options: {
//             chart: {
//                 width: 200
//             },
//         }
//     }]
// };

// var chart = new ApexCharts(document.querySelector("#wallet-balance"), options);
// chart.render();

//
// Invested Overview
//

// var radialchartColors = getChartColorsArray("#invested-overview");
// var options = {
//     chart: {
//         height: 270,
//         type: 'radialBar',
//         offsetY: -10
//     },
//     plotOptions: {
//         radialBar: {
//             startAngle: -130,
//             endAngle: 130,
//             dataLabels: {
//                 name: {
//                     show: false
//                 },
//                 value: {
//                     offsetY: 10,
//                     fontSize: '18px',
//                     color: undefined,
//                     formatter: function (val) {
//                         return val + "%";
//                     }
//                 }
//             }
//         }
//     },
//     colors: [radialchartColors[0]],
//     fill: {
//         type: 'gradient',
//         gradient: {
//             shade: 'dark',
//             type: 'horizontal',
//             gradientToColors: [radialchartColors[1]],
//             shadeIntensity: 0.15,
//             inverseColors: false,
//             opacityFrom: 1,
//             opacityTo: 1,
//             stops: [20, 60]
//         },
//     },
//     stroke: {
//         dashArray: 4,
//     },
//     legend: {
//         show: false
//     },
//     series: [80],
//     labels: ['Series A'],
// }

// var chart = new ApexCharts(
//     document.querySelector("#invested-overview"),
//     options
// );

// chart.render();

//
// Market Overview
//

let valoreshg = []  // => Valores historial ganancias
const datosY = []  // => Datos para la barras de la grafica
const datosX = [] // => Datos para el eje X (los meses)
const datosI = []// => Datos para el eje -X (comsiones pagadas)
valoreshg = $('#datosJson_historialG_adm').val();
if (valoreshg) {
    valoreshg = JSON.parse(valoreshg);
    console.log(valoreshg)
    valoreshg.forEach(g => {
       datosY.push(g.gananciasEmpresa)
       datosX.push(g.mes)
       datosI.push(g.comisionEmpresa)
    })

}

// var barchartColors = getChartColorsArray("#market-overview");
var options = {
    series: [{
        name: 'Ganancias',
        data: datosY 
    }, 
    {
        name: 'Comsiones',
        data: datosI
    }
],
    chart: {
        type: 'bar',
        height: 400,
        stacked: true,
        toolbar: {
            show: false
        },
    },
    plotOptions: {
        bar: {
            columnWidth: '8%',
        },
    },
    colors: ["#812082", "#50368c"],
    fill: {
        opacity: 1
    },
    dataLabels: {
        enabled: false,
    },
    legend: {
        show: false,
    },
    yaxis: {
        labels: {
            formatter: function (y) {
                return y.toFixed(1) + "";
            }
        }
    },
    xaxis: {
        categories: datosX,
        labels: {
            rotate: -90
        }
    }
};

var chart = new ApexCharts(document.querySelector("#market-overview"), options);
chart.render();

// MAp

var vectormapColors = getChartColorsArray("#sales-by-locations");
$('#sales-by-locations').vectorMap({
    map: 'world_mill_en',
    normalizeFunction: 'polynomial',
    hoverOpacity: 0.7,
    hoverColor: false,
    regionStyle: {
        initial: {
            fill: '#e9e9ef'
        }
    },
    markerStyle: {
        initial: {
            r: 9,
            'fill': vectormapColors,
            'fill-opacity': 0.9,
            'stroke': '#fff',
            'stroke-width': 7,
            'stroke-opacity': 0.4
        },

        hover: {
            'stroke': '#fff',
            'fill-opacity': 1,
            'stroke-width': 1.5
        }
    },
    backgroundColor: 'transparent',
    markers: [{
        latLng: [41.90, 12.45],
        name: 'USA'
    }, {
        latLng: [12.05, -61.75],
        name: 'Russia'
    }, {
        latLng: [1.3, 103.8],
        name: 'Australia'
    }]
});
$(document).ready(function () {

});

var IATA_PAIR = [];
var CSV_DATA = [];
var PRICE_ALERT = 600;

function changeDate(parent) {
    let form = $('.' + parent);
    let date = $('input[name=flight_date]', form).val();

    switch (parent) {
        case 'flight1':
            {
                $('input[name=flight_date]', '.flight2').attr('min', date);
                $('input[name=flight_date]', '.flight3').attr('min', date);
            }
            break;
        case 'flight2':
            {
                $('input[name=flight_date]', '.flight1').attr('max', date);
                $('input[name=flight_date]', '.flight3').attr('min', date);
            }
            break;
        case 'flight3':
            {
                $('input[name=flight_date]', '.flight1').attr('max', date);
                $('input[name=flight_date]', '.flight2').attr('max', date);
            }
            break;
        default:
            break;
    }
}

function changeDateIncrement(parent) {
    let form = $('.' + parent);
    let date = $('input[name=flight_date]', form).val();

    console.log(parent);
    console.log(form);
    if (date == '') {
        alert('Please set date at first!');
        $('input[name=data_increment]', form).prop('checked', false);;
        return;
    }

    let checked = $('input[name=data_increment]', form).prop('checked');
    let new_date = new Date(date);

    if (checked) {
        new_date.setDate(new_date.getDate() + 1);
    } else {
        new_date.setDate(new_date.getDate() - 1);
    }

    new_date = formatDate(new_date);
    $('input[name=flight_date]', form).val(new_date);
}

function changeRandomDate(parent) {
    let form = $('.' + parent);
    let rStart = new Date(2022, 0, 1);
    let rEnd = new Date(2024, 12, 31);

    let new_date = new Date(rStart.getTime() + Math.random() * (rEnd.getTime() - rStart.getTime()));
    new_date = formatDate(new_date);
    $('input[name=flight_date]', form).val(new_date);
}

function changeIATAReverse(parent) {
    let form = $('.' + parent);
    let fromIATA = $('input[name=from_iata]', form).val();
    let toIATA = $('input[name=to_iata]', form).val();

    $('input[name=from_iata]', form).val(toIATA);
    $('input[name=to_iata]', form).val(fromIATA);
}

function importIATA(parent, el) {

    let form = $('.' + parent);
    const reader = new FileReader()
    reader.onload = () => {
        let result = formatCSV(reader.result);
        CSV_DATA[parent] = result;
        $('input[name=from_iata]', form).val(result[0].from);
        $('input[name=to_iata]', form).val(result[0].to);
    }
    reader.readAsBinaryString(el.files[0])
}

function formatDate(objectDate) {
    let day = objectDate.getDate();
    let month = objectDate.getMonth() + 1;
    let year = objectDate.getFullYear();

    if (day < 10) {
        day = '0' + day;
    }

    if (month < 10) {
        month = `0${month}`;
    }

    let date = `${year}-${month}-${day}`;
    return date
}

function formatCSV(data) {

    let result = [];
    let temp = data.split('\n');
    temp.forEach(item => {
        let obj = {};
        let row = item.split(',');
        obj.from = row[0].trim();
        obj.to = row[1].split('\r')[0].trim();
        result.push(obj);
    });

    return result;
}

function combineIATAPairs() {

    var array1 = CSV_DATA.flight1;
    var array2 = CSV_DATA.flight2;
    var array3 = CSV_DATA.flight3;
    if (!CSV_DATA.flight3) {
        array3 = CSV_DATA.flight2;
    }

    // var array1 = ['A', 'B'];
    // var array2 = ['M', 'N'];
    // var array3 = ['X', 'Y'];

    let results = [];

    for (let i = 0; i < array1.length; i++) {
        for (let j = 0; j < array2.length; j++) {
            for (let k = 0; k < array3.length; k++) {
                let temp = [];
                temp.push(array1[i]);
                temp.push(array2[j]);
                temp.push(array3[k]);
                results.push(temp);
            }
        }
    }

    IATA_PAIR = results;
}

function getQueryLegs(dates, data) {

    let legs = [];

    for (let i = 0; i < 3; i++) {
        let item = data[i];
        let date = dates[i];
        let leg = {};
        leg.originPlaceId = {};
        leg.destinationPlaceId = {};
        leg.date = {};

        leg.originPlaceId.iata = item.from;
        leg.destinationPlaceId.iata = item.to;
        leg.date.year = date.split('-')[0];
        leg.date.month = (parseInt(date.split('-')[1])).toString();
        leg.date.day = (parseInt(date.split('-')[2])).toString();
        legs.push(leg);
    }

    return legs;
}

function start() {

    let flight1Date = $('input[name=flight_date]', '.flight1').val();
    let flight2Date = $('input[name=flight_date]', '.flight2').val();
    let flight3Date = $('input[name=flight_date]', '.flight3').val();

    if (!flight1Date || !flight2Date || !flight3Date) {
        alert("Please set flight date.");
        return;
    }

    if (!CSV_DATA.flight1 || !CSV_DATA.flight1.length || !CSV_DATA.flight2 || !CSV_DATA.flight2.length) {
        alert("Please import IATA Data.");
        return;
    }

    combineIATAPairs();
    // console.log(IATA_PAIR);
    // return;
    PRICE_ALERT = $('#priceAlert').val();
    if (!PRICE_ALERT) {
        alert("Please set price alert!");
        return;
    }

    let param = new Object();
    let query = {};
    query.market = "UK";
    query.locale = "en-GB";
    query.currency = "GBP";

    let dates = [];
    dates.push(flight1Date);
    dates.push(flight2Date);
    dates.push(flight3Date);

    // let temp = [
    //     {from : "BER", to : "BCN"},
    //     {from : "MAD", to : "SKG"},
    //     {from : "SKG", to : "IST"},
    // ]
    // let temp = [
    //     {from : $('input[name=from_iata]', '.flight1').val(), to : $('input[name=to_iata]', '.flight1').val()},
    //     {from : $('input[name=from_iata]', '.flight2').val(), to : $('input[name=to_iata]', '.flight2').val()},
    //     {from : $('input[name=from_iata]', '.flight3').val(), to : $('input[name=to_iata]', '.flight3').val()},
    // ]
    // query.queryLegs = getQueryLegs(dates, temp);

    query.adults = $('#adultNumber').val();
    if (query.adults == 0) {
        alert("Please set Adult number. Should be number between 1 with 8.");
        return;
    }

    if (($('#child').val()).trim() != '') {
        // alert('Please set child ages. Split comma');
        let childrenAgesTemp = $('#child').val().split(',');
        let childrenAges = [];
        childrenAgesTemp.forEach(item => {
            childrenAges.push(item.trim());
        });
        query.childrenAges = childrenAges;
    } else {
        query.childrenAges = [];
    }


    query.cabinClass = $('#cabinClass').val();
    if (query.cabinClass == 0) {
        alert('Please select Cabin Class!');
        return;
    }

    query.excludedAgentsIds = [];
    query.excludedCarriersIds = [];
    query.includedAgentsIds = [];
    query.includedCarriersIds = [];
    query.nearbyAirports = false;
    query.includeSustainabilityData = false;

    console.log('ALL Combination =>', IATA_PAIR);
    
    // let queryLegs = getQueryLegs(dates, IATA_PAIR[0]);
    // query.queryLegs = queryLegs;
    // param.query = query;
    // getFlightResult(param);
 
    IATA_PAIR.forEach(item => {
        query.queryLegs = {};
        console.log('One Pair => ' ,item);
        let queryLegs = getQueryLegs(dates, item);
    
        let strPair = '['+JSON.stringify(item[0])+', '+JSON.stringify(item[1])+', '+JSON.stringify(item[2])+']';
        // console.log(queryLegs);
        query.queryLegs = queryLegs;
        param.query = query;
        // console.log(param);
        getFlightResult(param, strPair);
    });
}

function start1() {
    let param = {
        "query": {
            "market": "UK",
            "locale": "en-GB",
            "currency": "GBP",
            "queryLegs": [
                {
                    "originPlaceId": {
                        "iata": "BER"
                    },
                    "destinationPlaceId": {
                        "iata": "BCN"
                    },
                    "date": {
                        "year": "2023",
                        "month": "6",
                        "day": "2"
                    }
                },
                {
                    "originPlaceId": {
                        "iata": "MAD"
                    },
                    "destinationPlaceId": {
                        "iata": "SKG"
                    },
                    "date": {
                        "year": "2023",
                        "month": "6",
                        "day": "2"
                    }
                },
                {
                    "originPlaceId": {
                        "iata": "SKG"
                    },
                    "destinationPlaceId": {
                        "iata": "IST"
                    },
                    "date": {
                        "year": "2023",
                        "month": "6",
                        "day": "2"
                    }
                },
            ],
            "adults": 1,
            "childrenAges": [],
            "cabinClass": "CABIN_CLASS_ECONOMY",
            "excludedAgentsIds": [],
            "excludedCarriersIds": [],
            "includedAgentsIds": [],
            "includedCarriersIds": [],
            "includeSustainabilityData": false,
            "nearbyAirports": false
        }
    };

    getFlightResult(param);
}

function getFlightResult(param, strPair){
    var proxy = 'https://cors-anywhere.herokuapp.com/';
    let url = 'https://partners.api.skyscanner.net/apiservices/v3/flights/live/search/create';

    $.ajax({
        type: 'POST',
        // url: url,
        url: proxy + url,
        data: JSON.stringify(param),
        beforeSend: function (xhr) {
            xhr.setRequestHeader('content-type', 'application/json');
            xhr.setRequestHeader('x-api-key', 'fl687154418168043982723635787130');
        }
    }).done(function (data) {
        // console.log(data);

        url = `https://partners.api.skyscanner.net/apiservices/v3/flights/live/search/poll/${data.sessionToken}`;
        $.ajax({
            type: 'POST',
            // url: url,
            url: proxy + url,
            beforeSend: function (xhr) {
                xhr.setRequestHeader('content-type', 'application/json');
                xhr.setRequestHeader('x-api-key', 'fl687154418168043982723635787130');
            }
        }).done(function (data) {
            console.log(data);
            getCheapestValue(data, strPair);
        });
    });
}

function getCheapestValue(data, strPair) {
    let prices = [];
    data.content.sortingOptions.cheapest.forEach(item => {
        let itineraryId = item.itineraryId;
        let row = {};
        row.itineraryId = itineraryId;
        row.data = data.content.results.itineraries[itineraryId].pricingOptions;
        prices.push(row);
    });

    console.log(prices);
    $('.alerts').append('<hr>');
    $('#priceAlertDiv').html('');
    let html = '<div id="priceAlertDiv">';

    let fitCount = 0;
    prices.forEach(row => {
        let amount = Math.ceil(row.data[0].price.amount / 1000);
        if(amount < PRICE_ALERT){
            fitCount++;
            // console.log(row);
            // let html = '';
            if(row.data.length == 1){
                html += '<div class="alert alert-success" role="alert"><span>'+amount+'GBP. There is '+row.data.length+' deal. </span>';
            } else {
                html += '<div class="alert alert-success" role="alert"><span>'+amount+'GBP. There are '+row.data.length+' deals. </span>';
            }

            row.data.forEach(temp => {
                html += '<a href="'+temp.items[0].deepLink+'"> Detail ... </a>';
            });

            html += '</div>';
            // $('#priceAlertDiv').append(html);
        }
    });
    html += '</div>';
    $('.alerts').append('<div class="col m-2">Pair : '+strPair+'. All result count is <span>'+prices.length+'</span>. Fit result count is <span>'+fitCount+'</span></div>');
    $('.alerts').append(html);

    // $('#res_cnt').text(prices.length);
    // $('#fit_cnt').text(fitCount);
}
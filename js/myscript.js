$(document).ready(function () {

});

var PRICE_ALERT = 600;

var IATA_PAIR = [];
var DATE_PAIR = {
    flight1 : [],
    flight2 : [],
    flight3 : [],
}

var CSV_DATA = [];
var USED_DATE = [];
var USED_IATA = [];

var IATA_REVERSE = {
    flight1: false,
    flight2: false,
    flight3: false,
};

var IATA_RANDOM = {
    flight1: false,
    flight2: false,
    flight3: false,
};

var DATE_RANDOM = {
    flight1: false,
    flight2: false,
    flight3: false,
};

var CHECKING_OPTION = 0;

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
    let checked = $('input[name=date_random]', form).prop('checked');
    DATE_RANDOM[parent] = checked;
    // let form = $('.' + parent);
    // let rStart = new Date(2022, 0, 1);
    // let rEnd = new Date(2024, 12, 31);

    // let new_date = new Date(rStart.getTime() + Math.random() * (rEnd.getTime() - rStart.getTime()));
    // new_date = formatDate(new_date);
    // $('input[name=flight_date]', form).val(new_date);
}

function changeRandomPair(parent) {
    let form = $('.' + parent);
    let checked = $('input[name=iata_random]', form).prop('checked');
    IATA_RANDOM[parent] = checked;
}

function changeIATAReverse(parent) {
    let form = $('.' + parent);
    let checked = $('input[name=search_pair]', form).prop('checked');
    IATA_REVERSE[parent] = checked;
}

function importIATA(parent, el) {
    let form = $('.' + parent);
    const reader = new FileReader()
    reader.onload = () => {
        let result = formatCSV(reader.result, 'iata');
        CSV_DATA[parent] = result;
        $('input[name=from_iata]', form).val(result[0].from);
        $('input[name=to_iata]', form).val(result[0].to);
    }
    reader.readAsBinaryString(el.files[0])
}

function importDates(parent, el) {
    let form = $('.' + parent);
    const reader = new FileReader()
    reader.onload = () => {
        let result = formatCSV(reader.result, 'date');
        DATE_PAIR[parent] = result;
        $('input[name=flight_date]', form).val(result[0]);
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

function formatCSV(data, key) {
    let result = [];
    let temp = data.split('\n');
    switch (key) {
        case 'iata':
            temp.forEach(item => {
                let obj = {};
                let row = item.split(',');
                obj.from = row[0].trim();
                obj.to = row[1].split('\r')[0].trim();
                result.push(obj);
            });
            return result;
        case 'date':
            temp.forEach(item => {
                let row = (item.split('\r')[0]).trim();
                result.push(row);
            });
        
            return result;
        default:
            break;
    }
}

function combineIATAPairs() {
    
    var array1 = CSV_DATA.flight1;
    var array2 = CSV_DATA.flight2;
    var array3 = CSV_DATA.flight3;

    if (!CSV_DATA.flight3) {
        array3 = CSV_DATA.flight2;
    }

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

function combineDatePairs(d1,d2,d3) {
    d1 = [d1];
    d2 = [d2];
    d3 = [d3];
    var array1 = DATE_PAIR['flight1'].length > 0 ? DATE_PAIR['flight1'] : d1;
    var array2 = DATE_PAIR['flight2'].length > 0 ? DATE_PAIR['flight2'] : d2;
    var array3 = DATE_PAIR['flight3'].length > 0 ? DATE_PAIR['flight3'] : d3;

    let results = [];

    for (let i = 0; i < array1.length; i++) {
        for (let j = 0; j < array2.length; j++) {
            for (let k = 0; k < array3.length; k++) {
                let temp = [];
                if(array1[i] <= array2[j] && array2[j] <= array3[k]){
                    temp.push(array1[i]);
                    temp.push(array2[j]);
                    temp.push(array3[k]);
                    results.push(temp);
                }
            }
        }
    }

    return results;
}

function setIATAReverse() {
    for (let i = 1; i < 4; i++) {
        let b_Reverse = IATA_REVERSE['flight'+i];
        if(b_Reverse){
            let data = CSV_DATA['flight'+i];
            data.forEach(item => {
                CSV_DATA['flight'+i].push({from: item.to, to: item.from});
            });
        }
    }
}

function setIATARandom() {
    for (let i = 1; i < 4; i++) {
        let b_Random = IATA_RANDOM['flight'+i];
        if(b_Random){
            let temp = []
            let data = CSV_DATA['flight'+i];
            data.forEach(item => {
                temp.push(item.from);
                temp.push(item.to);
            });
            CSV_DATA['flight'+i] = makePairs(temp);
        }
    }
}

function makePairs(data){
    let result = [];
    for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < data.length; j++) {
            let temp = {from: data[i], to: data[j]};
            const filtered = result.filter(item =>item.from == data[i] && item.to == data[j]);
            if((data[i] != data[j]) && filtered.length == 0){
                result.push(temp);
            }
        }
    }

    return result;
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

function getRandomDate(parent) {
    let data = DATE_PAIR[parent];
    if(data.length == USED_DATE.length) return false;

    let rand = Math.floor((Math.random() * data.length));
    if(USED_DATE.includes(data[rand])){
       getRandomDate(parent); 
    } else {
        USED_DATE.push(data[rand]);
        return data[rand];
    }
}

function getRandomPair(parent) {

    let data = CSV_DATA[parent];
    if(data.length == USED_IATA.length) return false;

    let rand = Math.floor((Math.random() * data.length));
    if(USED_IATA.includes(data[rand])){
        getRandomPair(parent); 
    } else {
        USED_IATA.push(data[rand]);
        return data[rand];
    }
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

    setIATAReverse();
    setIATARandom();
    combineIATAPairs();
    PRICE_ALERT = $('#priceAlert').val();
    if (!PRICE_ALERT) {
        alert("Please set price alert!");
        return;
    }

    let query = {};
    query.market = "UK";
    query.locale = "en-GB";
    query.currency = "GBP";

    let dates = combineDatePairs(flight1Date, flight2Date, flight3Date);
    console.log(dates); return;
    if(dates.length == 0){
        alert("Please set date again, query legs date should be ascending order.");
    }

    query.adults = $('#adultNumber').val();
    if (query.adults == 0) {
        alert("Please set Adult number. Should be number between 1 with 8.");
        return;
    }

    if (($('#child').val()).trim() != '') {
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

    CHECKING_OPTION = $('#checkStatus').val();
    let restart_min = $('#restart_min').val();
    if(CHECKING_OPTION == 3 && restart_min == 0){
        alert('Please set minute to restart.');
        return;
    }

    query.excludedAgentsIds = [];
    query.excludedCarriersIds = [];
    query.includedAgentsIds = [];
    query.includedCarriersIds = [];
    query.nearbyAirports = false;
    query.includeSustainabilityData = false;

    console.log('ALL Combination =>', IATA_PAIR);

    $('.alerts').html('');
    
    $('input').attr('disabled', true);
    $('#startBtn').attr('disabled', true);

    apiCalls(dates, query);

    // IATA_PAIR.forEach(item => {
    //     query.queryLegs = {};
    //     console.log('One Pair => ' ,item);
    //     let queryLegs = getQueryLegs(dates, item);
    
    //     let strPair = '['+JSON.stringify(item[0])+', '+JSON.stringify(item[1])+', '+JSON.stringify(item[2])+']';
    //     // console.log(queryLegs);
    //     query.queryLegs = queryLegs;
    //     param.query = query;
    //     // console.log(param);
    //     getFlightResult(param, strPair);
    // });

    if(CHECKING_OPTION == 3){
        setTimeout(() => {
            $('.alerts').html('');
            apiCalls(dates, query);
            CHECKING_OPTION = 1;
        }, restart_min * 60 * 1000);
    }
}

async function apiCalls(dates, query) {
    const waitForMs = (ms) => new Promise((resolve, reject) => setTimeout(() => resolve(), ms));

    (async () => {
        // number of concurrent requests in one batch
        const batchSize = 1;
        // request counter
        let curReq = 0;
        // as long as there are items in the list continue to form batches
        while (curReq < IATA_PAIR.length) {
            let param = {};
            // a batch is either limited by the batch size or it is smaller than the batch size when there are less items required
            const end = IATA_PAIR.length < curReq + batchSize ? IATA_PAIR.length : curReq + batchSize;
            // we know the number of concurrent request so reserve memory for this
            const concurrentReq = new Array(batchSize);
            // issue one request for each item in the batch
            for (let index = curReq; index < end; index++) {
                let item = IATA_PAIR[index];
                query.queryLegs = {};
                console.log('One Pair => ', item);

                dates.forEach(date => {
                    let queryLegs = getQueryLegs(date, item);
    
                    let strPair = '[' + JSON.stringify(item[0]) + ', ' + JSON.stringify(item[1]) + ', ' + JSON.stringify(item[2]) + ']';
                    query.queryLegs = queryLegs;
                    param.query = query;
                    concurrentReq.push(getFlightResult(param, strPair))
                    console.log(`sending request ${curReq}...`)
                    curReq++;
                });
            }
            // wait until all promises are done or one promise is rejected
            await Promise.all(concurrentReq);
            console.log(`requests ${curReq - batchSize}-${curReq} done.`)
            if (curReq + 1 < IATA_PAIR.length) {
                // after requests have returned wait for one second
                console.log(`[${new Date().toISOString()}] Waiting a second before sending next requests...`)
                await waitForMs(3000);
                console.log(`[${new Date().toISOString()}] At least one second has gone.`)
            }

        }
        
        if(CHECKING_OPTION == 2){
            $('.alerts').html('');
            apiCalls(dates, query);
            CHECKING_OPTION = 1;
        } else {
            $('input').attr('disabled', false);
            $('#startBtn').attr('disabled', false);
        }
    })();
}

function getFlightResult(param, strPair) {
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
    // $('#priceAlertDiv').html('');
    let html = '<div id="priceAlertDiv">';

    let fitCount = 0;
    prices.forEach(row => {
        let amount = Math.ceil(row.data[0].price.amount / 1000);
        if (amount < PRICE_ALERT) {
            fitCount++;
            if (row.data.length == 1) {
                html += '<div class="alert alert-success" role="alert"><span>' + amount + 'GBP. There is ' + row.data.length + ' deal. </span>';
            } else {
                html += '<div class="alert alert-success" role="alert"><span>' + amount + 'GBP. There are ' + row.data.length + ' deals. </span>';
            }

            row.data.forEach(temp => {
                html += '<a href="' + temp.items[0].deepLink + '"> Detail ... </a>';
            });

            html += '</div>';
        }
    });
    html += '</div>';
    $('.alerts').append('<div class="col m-2">Pair : ' + strPair + '. All result count is <span>' + prices.length + '</span>. Fit result count is <span>' + fitCount + '</span></div>');
    $('.alerts').append(html);
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

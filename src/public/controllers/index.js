$.get('http://localhost:8080/api/parser?method=ll1&input=dd', function(responseText) {
    console.log(JSON.parse(responseText));
});

function handleSubmit() {
    let typeSelect = $('#typeSelect').val()
    let grammar = $('#grammar').val()
    let testInput = $('#testInput').val()
    let req = {
        method: typeSelect,
        grammar: grammar,
        input: testInput
    }
    // $.post( 'http://localhost:8080/api/parser', {data: JSON.stringify(req)}, function(data) {
    //         console.log(data)
    //     },
    //     'json' // I expect a JSON response
    // );

    $.ajax({
        url: 'http://localhost:8080/api/parser',
        type: 'post',
        dataType: 'json',
        data: JSON.stringify(req),
        contentType: "application/json; charset=utf-8",
        success: function(data) {
            generateTables(data)
        }
    });
}


function generateTables(obj){
    $('#TheFParse').empty().removeClass('success-table').removeClass('error-table')
    $('#parseTable').empty()
    $('#result').empty().removeClass('alert-success').removeClass('alert-danger')
    let copy = obj
    if(obj.data.states.header['0'] !== 'NonTerminal') {
        $('#parseTable').append('<thead class="thead-dark">' + '<tr>' + '<th>#</th>' +
        obj.data.states.header.map(header => '<th>'+ header +'</th>') +
        '</tr>' + '</thead>')
    } else {
        $('#parseTable').append('<thead class="thead-dark">' + '<tr>' +
            obj.data.states.header.map(header => '<th>'+ header +'</th>') +
            '</tr>' + '</thead>')
    }
    obj.data.states.rows.map((row, i) => {
        $('#parseTable').append('<tr>' +
            obj.data.states.rows[i].map(rw => '<td>'+ rw +'</td>') +
            '</tr>')
    })

    if(copy.data['parse-table']) {
        parseThis(copy)
        scrollToAnchor('#result')
    } else {
        scrollToAnchor('#parseTable')
    }
}

function parseThis(copy) {
    $('#TheFParse').append('<thead class="thead-dark">' + '<tr>' +
        copy.data['parse-table'].header.map(header => '<th>'+ header +'</th>') +
        '</tr>' + '</thead>')
    copy.data['parse-table'].rows.map((row, i) => {
        $('#TheFParse').append('<thead class="thead-dark">' + '<tr>' +
            copy.data['parse-table'].rows[i].map(rw => '<td>'+ rw +'</td>') +
            '</tr>' + '</thead>')
    })
    if(copy.data['parse-table'].accepted) {
        $('#result').append('ACCEPTED by the table below').addClass('alert-success')
        $('#TheFParse').addClass('success-table')
    } else {
        $('#result').append('NOT ACCEPTED :(').addClass('alert-danger')
        $('#TheFParse').addClass('error-table')
    }
}

function scrollToAnchor(aid){
    var aTag = $(aid);
    $('html,body').animate({scrollTop: aTag.offset().top},'slow');
}

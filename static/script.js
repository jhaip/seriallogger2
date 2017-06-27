var currentSelectionDetails;
var currentLog;

function addOverviewSignal(svg, data) {
    var margin = {top: 10, right: 10, bottom: 10, left: 10},
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom,
        g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var parseTime = d3.timeParse("%d-%b-%y");

    var x = d3.scaleTime()
        .rangeRound([0, width])
        .domain([
            moment("2017-06-11T18:42:24", moment.ISO_8601).toDate(),
            moment().toDate(),
        ]);

    g.append("g")
        .attr("transform", "translate(0," + 10 + ")")
        .call(d3.axisBottom(x))
        .select(".domain")
        .remove();

    console.log(data);

    g.selectAll(".mark")
        .data(data)
        .enter().append("circle")
            .attr("class", "mark")
            .attr("cx", function(d) {
                console.log(d.timestamp);
                var t = moment(d.timestamp, moment.ISO_8601).toDate();
                console.log(t);
                console.log(x(t));
                return x(t);
            })
            .attr("cy", 0)
            .attr("r", 5)
            .attr("fill", "steelblue")
            .on("click", d => {
                detailView("Serial Log "+d.filename, d.timestamp, d.filename);
            });
}

function detailView(title, timestamp, logFilename) {
    $(".selected-view__title").text(title);
    var timestampText = moment(timestamp, moment.ISO_8601).format("dddd, MMMM Do YYYY, h:mm:ss a");
    $(".selected-view__timestamp").text(timestampText);
    $(".selected-view__annotation-list").empty();
    $(".selected-view__new-annotation-selection").empty();
    $(".selected-view__data").empty();
    currentLog = logFilename;
    $.get("/api/logs/"+logFilename).done(function(d) {
        console.log(d);
        console.log(d.split("\n"));
        var lines = d.split("\n");
        for (var i = 0; i < lines.length; i+=1) {
            var $newRow = $("<pre></pre>").addClass("row").text(lines[i]).data("rn", i);
            $(".selected-view__data").append($newRow);
        }
    });
    $.get("/api/annotations?log="+encodeURIComponent(logFilename)).done(function(d) {
        console.log(d);
    });
}

$(".selected-view__data-add-annotation").click(function() {
    currentSelectionDetails = markSelection();
    clearTextSelection();
    $(".selected-view__new-annotation-input-container").show();
    $(".selected-view__new-annotation-input").focus();
});

$(".selected-view__data-save-annotation").click(function() {
    console.log("save")
    console.log(currentSelectionDetails);
    var data = {
        "annotation": $(".selected-view__new-annotation-input").val(),
        "end_char": currentSelectionDetails.end.character,
        "end_line": currentSelectionDetails.end.row,
        "log": currentLog,
        "start_char": currentSelectionDetails.start.character,
        "start_line": currentSelectionDetails.start.row,
        "timestamp": moment().toISOString(),
        "value": ""
    };
    console.log(data);
    jQuery.ajax({
        type: "POST",
        url: "/api/annotations",
        data: JSON.stringify(data),
        dataType: "json",
        contentType: "application/json"
    }).done(function() {
        console.log("success saving annotation");
    }).fail(function(e) {
        console.error(e);
    })

    $(".selected-view__new-annotation-input-container").hide();
    $(".selected-view__new-annotation-input").val("");
});

$(".selected-view__data-cancel-add-annotation").click(function() {
    $(".selected-view__new-annotation-input-container").hide();
    $(".selected-view__new-annotation-input").val("");
    unmark(currentSelectionDetails.id);
});

function clearTextSelection() {
    // via https://stackoverflow.com/questions/3169786/clear-text-selection-with-javascript
    if (window.getSelection) {
      if (window.getSelection().empty) {  // Chrome
        window.getSelection().empty();
      } else if (window.getSelection().removeAllRanges) {  // Firefox
        window.getSelection().removeAllRanges();
      }
    } else if (document.selection) {  // IE?
      document.selection.empty();
    }
}

function guidGenerator() {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

function unmark(id) {
    $(".selected-text--"+id).each(function() {
        $(this).contents().unwrap();
    });
}

function markSelection() {
    var s = window.getSelection().getRangeAt(0);
    var specialStartChar = "\u2600";
    var specialEndChar = "\u2601";
    var startOffset = s.startOffset;
    var startOffsetParent = $(s.startContainer.parentElement);
    var endOffset = s.endOffset;
    var endOffsetParent = $(s.endContainer.parentElement);

    var rangeCopy, markerEl;
    rangeCopy = s.cloneRange();
    rangeCopy.collapse(true);  // collapse to start
    markerEl = document.createElement("span");
    markerEl.appendChild( document.createTextNode(specialStartChar) );
    rangeCopy.insertNode(markerEl);

    rangeCopy = s.cloneRange();
    rangeCopy.collapse(false);  // collapse to end
    markerEl = document.createElement("span");
    markerEl.appendChild( document.createTextNode(specialEndChar) );
    rangeCopy.insertNode(markerEl);

    var startRow = $(s.startContainer.parentElement).closest(".row");
    var endRow = $(s.endContainer.parentElement).closest(".row");
    var startRowNumber = startRow.data("rn");
    var endRowNumber = endRow.data("rn");
    var id = guidGenerator();

    var selectionDetails = {
        "start": {
            "row": startRowNumber,
            "character": startRow[0].innerText.indexOf(specialStartChar)
        },
        "end": {
            "row": endRowNumber,
            "character": endRow[0].innerText.replace(specialStartChar, "").indexOf(specialEndChar)-1
        },
        "id": id
    };

    var classString = "selected-text selected-text--"+id;
    if (startRow.is(endRow)) {
        startRow.html(startRow.html()
                              .replace("<span>"+specialStartChar+"</span>", "<span class='"+classString+"'>")
                              .replace("<span>"+specialEndChar+"</span>", "</span>"));
    } else {
        var currentRow = startRow.next(".row");
        startRow.html(startRow.html().replace("<span>"+specialStartChar+"</span>", "<span class='"+classString+"'>")+"</span>");
        while (!currentRow.is(endRow) && currentRow.length > 0) {
            currentRow.wrapInner("<span class='"+classString+"'></span >");
            currentRow = currentRow.next(".row");
        }
        endRow.html("<span class='"+classString+"'>"+endRow.html().replace("<span>"+specialEndChar+"</span>", "</span>"));
    }
    return selectionDetails;
}

d3.json("/api/logs", function(data) {
  addOverviewSignal(d3.select(".signals-overview__signal--code svg"), data.results);
  addOverviewSignal(d3.select(".signals-overview__signal--serial-logs svg"), data.results);
});

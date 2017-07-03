var currentSelectionDetails;
var currentDataPoint;

function addOverviewSignal(svg, data) {
    var margin = {top: 10, right: 10, bottom: 10, left: 10},
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom,
        g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var parseTime = d3.timeParse("%d-%b-%y");

    var x = d3.scaleTime()
        .rangeRound([0, width])
        .domain(d3.extent(data, function(d) {
            var t = moment(d.timestamp, moment.ISO_8601).toDate();
            return t;
        }));
        // .domain([
        //     moment("2017-06-11T18:42:24", moment.ISO_8601).toDate(),
        //     moment().toDate(),
        // ]);

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
                detailView("Log from source "+d.source, d.timestamp, d.id, d.value);
            });
}

function detailViewNew(source, range) {
    console.log("detailViewNew");
    $(".selected-view__title").text("Detail view on "+source);
    var timestampText0 = moment(range[0]).format("dddd, MMMM Do YYYY, h:mm:ss a");
    var timestampText1 = moment(range[1]).format("dddd, MMMM Do YYYY, h:mm:ss a");
    $(".selected-view__timestamp").text(timestampText0 + " - " + timestampText1);
    $(".selected-view__annotation-list").empty();
    $(".selected-view__new-annotation-selection").empty();
    $(".selected-view__data").empty();
    // stupid thing with js dates by default having the users timezone
    var startString = moment(range[0]).utc().add(moment(range[0]).utcOffset(), 'm').toISOString();
    var stopString = moment(range[1]).utc().add(moment(range[1]).utcOffset(), 'm').toISOString();
    var baseURL = "/api/data";
    if (source === "annotations") {
        baseURL = "/api/annotations";
        startString = moment(range[0]).toISOString();
        stopString = moment(range[1]).toISOString();
    }
    $.get(baseURL
        + "?source=" + encodeURIComponent(source)
        + "&start=" + startString
        + "&stop=" + stopString
    ).done(function(d) {
        console.log(d);
        var rn = 0;
        d.results.forEach(function(rawDataValue, i) {
            var dataValue;
            if (source === "serial" ||
                source === "view") {
                dataValue = rawDataValue.value;
            } else if (source === "annotations") {
                dataValue = rawDataValue.annotation;
            }
            var lines = dataValue.split(/\r\n/);
            for (var i = 0; i < lines.length; i+=1) {
                var subline = lines[i].split(/\n/);
                for (var y = 0; y < subline.length; y+=1) {
                    var $newRow = $("<pre></pre>").addClass("row").text(subline[y]).data("rn", rn);
                    $(".selected-view__data").append($newRow);
                    rn += 1;
                }
            }
        });
    });

    saveView(source, range);
}

function saveView(selectedSource, selectedRange) {
    var viewDescription = {
        "selectedSource": selectedSource,
        "selectedRange": selectedRange
    };
    console.log(viewDescription);
    console.log(JSON.stringify(viewDescription));
    jQuery.ajax({
        type: "POST",
        url: "/api/data",
        data: JSON.stringify({
            "source": "view",
            "value": JSON.stringify(viewDescription),
            "type": "View"
        }),
        dataType: "json",
        contentType: "application/json"
    }).done(function() {
        console.log("success saving view");
    }).fail(function(e) {
        console.error(e);
    });
}

function detailView(title, timestamp, dataId, dataValue) {
    $(".selected-view__title").text(title);
    var timestampText = moment(timestamp, moment.ISO_8601).format("dddd, MMMM Do YYYY, h:mm:ss a");
    $(".selected-view__timestamp").text(timestampText);
    $(".selected-view__annotation-list").empty();
    $(".selected-view__new-annotation-selection").empty();
    $(".selected-view__data").empty();
    currentDataPoint = dataId;
    console.log(dataValue.split(/\r\n/));
    var lines = dataValue.split(/\r\n/);
    var rn = 0;
    for (var i = 0; i < lines.length; i+=1) {
        var subline = lines[i].split(/\n/);
        for (var y = 0; y < subline.length; y+=1) {
            var $newRow = $("<pre></pre>").addClass("row").text(subline[y]).data("rn", rn);
            $(".selected-view__data").append($newRow);
            rn += 1;
        }
    }
    $.get("/api/annotations?data_id="+encodeURIComponent(dataId)).done(function(d) {
        console.log(d);
        for (var i=0; i<d.results.length; i+=1) {
            var a = d.results[i];
            console.log(a);
            mark({
                "start": {
                    "row": a.start_line,
                    "character": a.start_char
                },
                "end": {
                    "row": a.end_line,
                    "character": a.end_char
                },
                "id": a.id
            });
        }
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
        "data_id": currentDataPoint,
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
    });

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

function mark(selectionDetails) {
    var specialStartChar = "\u2600";
    var specialEndChar = "\u2601";
    var id = selectionDetails.id;
    var startRow = $('.row').filter(function() {
        return $(this).data("rn") === selectionDetails.start.row;
    }).first();
    var endRow = $('.row').filter(function() {
        return $(this).data("rn") === selectionDetails.end.row;
    }).first();

    // TODO: currently only works for non overlapping annotations!
    var newStartRowHMTL = [startRow.text().slice(0, selectionDetails.start.character), specialStartChar, startRow.text().slice(selectionDetails.start.character)].join('');
    startRow.text(newStartRowHMTL);
    var newEndRowHMTL = [endRow.text().slice(0, selectionDetails.end.character+1), specialEndChar, endRow.text().slice(selectionDetails.end.character+1)].join('');
    endRow.text(newEndRowHMTL);

    var classString = "selected-text selected-text--"+id;
    if (startRow.is(endRow)) {
        startRow.html(startRow.html()
                              .replace(specialStartChar, "<span class='"+classString+"'>")
                              .replace(specialEndChar, "</span>"));
    } else {
        var currentRow = startRow.next(".row");
        startRow.html(startRow.html().replace(specialStartChar, "<span class='"+classString+"'>")+"</span>");
        while (!currentRow.is(endRow) && currentRow.length > 0) {
            currentRow.wrapInner("<span class='"+classString+"'></span >");
            currentRow = currentRow.next(".row");
        }
        endRow.html("<span class='"+classString+"'>"+endRow.html().replace(specialEndChar, "</span>"));
    }
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

var that = this;

function showSerialDataTimeline() {
    d3.json("/api/data?source=serial", function(data) {
      var view_serialLogs = createTimeline(".signals-overview__signal--serial-logs",
                     "900",
                     [moment("2017-06-11T18:42:24", moment.ISO_8601).toDate(), moment().toDate()],
                     data.results);
      view_serialLogs.addSignalListener("detailDomain", _.debounce(function(name, details) {
        console.log(details);
        if (details) {
            detailViewNew("serial", details);
        }
    }, 500));
    //   setTimeout(function() {
    //     console.log("polling");
    //     showData();
    //   }, 5000);
    });
}
function showAnnotationDataTimeline() {
    d3.json("/api/annotations", function(data) {
      var view_annotations = createTimeline(".signals-overview__signal--annotations",
                     "900",
                     [moment("2017-06-11T18:42:24", moment.ISO_8601).toDate(), moment().toDate()],
                     data.results);
      view_annotations.addSignalListener("detailDomain", _.debounce(function(name, details) {
        console.log(details);
        if (details) {
            detailViewNew("annotations", details);
        }
      }, 500));
    });
}

function showViewDataTimeline() {
    d3.json("/api/data?source=view", function(data) {
      var view_view = createTimeline(".signals-overview__signal--view",
                     "900",
                     [moment("2017-06-11T18:42:24", moment.ISO_8601).toDate(), moment().toDate()],
                     data.results);
      view_view.addSignalListener("detailDomain", _.debounce(function(name, details) {
        console.log(details);
        if (details) {
            detailViewNew("view", details);
        }
      }, 500));
    });
}

function showData() {
    showSerialDataTimeline();
    showAnnotationDataTimeline();
    showViewDataTimeline();
}
showData();


function createTimeline(elSelector, width, domain, data) {
    var spec = $.extend(true, {}, vegaSpec__DotTimeline);
    spec["width"] = width;
    spec["signals"][1]["update"] = width;
    // spec["scales"][0]["domain"] = [domain[0], domain[1]];
    console.log(data);
    spec["data"][0]["values"] = JSON.parse(JSON.stringify(data));
    // console.log(this.spec);
    var view = new vega.View(vega.parse(spec), {
        loader: vega.loader({baseURL: 'https://vega.github.io/vega/'}),
        logLevel: vega.Warn,
        renderer: 'canvas'
    }).initialize(elSelector).hover().run();
    return view;
}

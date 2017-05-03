/* jshint esversion: 6 */

var currentHash = location.hash.slice(1) | 0;
console.log(currentHash);

// last two args are optional
function ayncArray(a, fn, c, cx) {
  cx = cx || window;
  c = c || 100;
  var index = 0;

  function doChunk() {
    var cnt = c;
    while (cnt-- && index < a.length) {
      fn.call(cx, a[index], index, a);
      ++index;
    }
    if (index < a.length) {
      setTimeout(doChunk, 1);
    }
  }
  doChunk();
}


var chunks = function(array, size) {
  var results = [];
  while (array.length) {
    results.push(array.splice(0, size));
  }
  return results;
};

Handlebars.registerHelper("parse_data", function(input, typeAction) {
  var num = parseFloat(input);
  if (isNaN(num)) {
    return "No info";
  } else if (typeAction == "decimal") {
    return (num * 100).toFixed(0) + "%";
  } else if (typeAction == "money") {
    return "$" + num;
  } else if (typeAction == "annual-cost") {
    return ((num / 80000) * 100) + "%";
  } else if (typeAction == "salary-after") {
    return ((num / 80000) * 100) + "%";
  }
});


var template;
$.ajax({
  url: './templates/card.hbs',
  success: function(data) {
    var source = data;
    template = Handlebars.compile(data);
  }
});

d3.csv(" ../data.csv", function(data) {
  var maxAnnualCostPublic = _.max(data, function(d) {
    return parseFloat(d.NPT4_PUB);
  });
  var maxAnnualCostPrivate = _.max(data, function(d) {
    return parseFloat(d.NPT4_PRIV);
  });
  var maxAnnualCost = Math.max(maxAnnualCostPublic.NPT4_PUB, maxAnnualCostPrivate.NPT4_PRIV);


  //sort alphabetically
  data = _.sortBy(data, function(d) {
    return d.INSTNM.toLowerCase();
  });

  //split into pages
  var pages = chunks(data, 25);

  //Create pagination
  pages.forEach(function(p, i) {
    $("#inner-paginate").append('<div class="page-button" data-num=' + i + '>' + (+i + 1) + '</div>');
  });

  //Create click handler for pagination
  $("#inner-paginate").on("click", ".page-button", function(e) {
    $("#cards").html("");

    location.hash = $(this).data("num");

    pages[$(this).data("num")].forEach(function(d) {
      $("#cards").append(template({
        "d": d
      }));
    });
  });

  $(".page-button")[currentHash].click();

});
